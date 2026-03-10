import { getBrowser } from "./browser.js";
import { extractAttendanceFromDom } from "./attendanceParser.js";
import { buildAttendanceUrl, erpConfig } from "./config.js";
import { WorkerError } from "./errors.js";

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function isJavascriptHref(value) {
  return normalizeText(value).toLowerCase().startsWith("javascript:");
}

function shouldAbortRequest(request) {
  return ["image", "stylesheet", "font", "media"].includes(request.resourceType());
}

export class SvguErpScraper {
  constructor(credentials) {
    this.credentials = credentials;
    this.browser = null;
    this.browserContext = null;
    this.page = null;
  }

  async init() {
    this.browser = await getBrowser();
    this.browserContext = await this.browser.createBrowserContext();
    this.page = await this.browserContext.newPage();
    this.page.setDefaultTimeout(erpConfig.navigationTimeoutMs);
    await this.page.setViewport({ width: 1366, height: 900 });
    await this.page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    );
    await this.page.setRequestInterception(true);
    this.page.on("request", (request) => {
      if (shouldAbortRequest(request)) {
        void request.abort();
        return;
      }

      void request.continue();
    });
  }

  async close() {
    if (this.browserContext) {
      await this.browserContext.close();
    }
  }

  async clearAndType(selector, value) {
    await this.page.waitForSelector(selector, { timeout: erpConfig.navigationTimeoutMs });
    await this.page.locator(selector).fill(value);
  }

  async login() {
    await this.page.goto(erpConfig.loginUrl, {
      waitUntil: "domcontentloaded",
      timeout: erpConfig.navigationTimeoutMs,
    });

    await this.clearAndType(erpConfig.loginSelectors.classId, this.credentials.classId);
    await this.clearAndType(erpConfig.loginSelectors.studentId, this.credentials.studentId);
    await this.clearAndType(erpConfig.loginSelectors.password, this.credentials.password);

    await Promise.allSettled([
      this.page.waitForNavigation({
        waitUntil: "domcontentloaded",
        timeout: erpConfig.navigationTimeoutMs,
      }),
      this.page.click(erpConfig.loginSelectors.submit),
    ]);

    await this.page.waitForNetworkIdle({ timeout: 3000 }).catch(() => null);

    const stillOnLoginForm = await this.page.$(erpConfig.loginSelectors.submit);
    const pageText = normalizeText(
      await this.page.evaluate(() => document.body.innerText).catch(() => ""),
    ).toLowerCase();

    if (stillOnLoginForm && this.page.url().includes("studlogin")) {
      throw new WorkerError("ERP credentials were rejected.", "ERP_AUTH_FAILED", 401);
    }

    if (pageText.includes("invalid") || pageText.includes("wrong password")) {
      throw new WorkerError("ERP credentials were rejected.", "ERP_AUTH_FAILED", 401);
    }

    return {
      authenticated: true,
      student: {
        classId: this.credentials.classId,
        studentId: this.credentials.studentId,
        name: null,
      },
    };
  }

  async findAttendanceLinkMeta() {
    return await this.page.evaluate(
      (selector, linkText) => {
        function toMeta(link) {
          if (!(link instanceof HTMLAnchorElement)) {
            return null;
          }

          return {
            id: link.id || null,
            href: link.getAttribute("href") || "",
            absoluteHref: link.href || "",
            text: String(link.textContent || "").trim(),
          };
        }

        const preferredLink = selector ? document.querySelector(selector) : null;
        const links = Array.from(document.querySelectorAll("a[href]"));
        const candidates = preferredLink
          ? [preferredLink, ...links.filter((link) => link !== preferredLink)]
          : links;

        const target = candidates.find((link) => {
          const hrefAttr = String(link.getAttribute("href") || "").toLowerCase();
          const href = String(link.href || "").toLowerCase();
          const text = String(link.textContent || "").toLowerCase();
          return (
            hrefAttr.includes("studinfo_attendance") ||
            href.includes("studinfo_attendance") ||
            text.includes(linkText)
          );
        });

        return toMeta(target);
      },
      erpConfig.attendanceLinkSelector,
      erpConfig.attendanceLinkText,
    );
  }

  async clickAttendanceLink(targetId) {
    await Promise.allSettled([
      this.page.waitForNavigation({
        waitUntil: "domcontentloaded",
        timeout: erpConfig.navigationTimeoutMs,
      }),
      this.page.evaluate(
        (selector, linkText, id) => {
          const preferredLink = selector ? document.querySelector(selector) : null;
          const links = Array.from(document.querySelectorAll("a[href]"));
          const target =
            (id ? document.getElementById(id) : null) ||
            preferredLink ||
            links.find((link) => {
              const hrefAttr = String(link.getAttribute("href") || "").toLowerCase();
              const href = String(link.href || "").toLowerCase();
              const text = String(link.textContent || "").toLowerCase();
              return (
                hrefAttr.includes("studinfo_attendance") ||
                href.includes("studinfo_attendance") ||
                text.includes(linkText)
              );
            });

          if (!(target instanceof HTMLElement)) {
            throw new Error("Attendance link not found on ERP page.");
          }

          target.click();
        },
        erpConfig.attendanceLinkSelector,
        erpConfig.attendanceLinkText,
        targetId,
      ),
    ]);

    await this.page.waitForNetworkIdle({ timeout: 3000 }).catch(() => null);
  }

  async openAttendancePage() {
    const linkMeta = await this.findAttendanceLinkMeta();
    const fallbackUrl = buildAttendanceUrl(this.credentials);

    if (linkMeta) {
      const href = linkMeta.href || linkMeta.absoluteHref;

      if (isJavascriptHref(href)) {
        await this.clickAttendanceLink(linkMeta.id);
        return;
      }

      const targetUrl = linkMeta.absoluteHref || href;
      await this.page.goto(targetUrl, {
        waitUntil: "domcontentloaded",
        timeout: erpConfig.navigationTimeoutMs,
      });
      return;
    }

    if (!fallbackUrl) {
      throw new WorkerError(
        "Could not locate the ERP attendance page. Configure ERP_ATTENDANCE_URL_TEMPLATE or ERP_ATTENDANCE_LINK_SELECTOR.",
        "ERP_ATTENDANCE_NAVIGATION_FAILED",
        500,
      );
    }

    await this.page.goto(fallbackUrl, {
      waitUntil: "domcontentloaded",
      timeout: erpConfig.navigationTimeoutMs,
    });
  }

  async maybeClickShow() {
    const showButton = await this.page.$(erpConfig.showButtonSelector);
    if (!showButton) {
      return;
    }

    await Promise.allSettled([
      this.page.waitForNavigation({
        waitUntil: "domcontentloaded",
        timeout: erpConfig.navigationTimeoutMs,
      }),
      showButton.click(),
    ]);
  }

  async getAttendance() {
    await this.login();
    await this.openAttendancePage();
    await this.maybeClickShow();
    await this.page.waitForSelector(erpConfig.attendanceTableSelector, {
      timeout: erpConfig.navigationTimeoutMs,
    });

    const parsed = await this.page.evaluate(
      extractAttendanceFromDom,
      this.credentials.studentId,
      erpConfig.attendanceTableSelector,
    );

    if (!parsed || !parsed.subjects?.length) {
      throw new WorkerError(
        "Attendance data could not be parsed from the ERP page.",
        "ERP_ATTENDANCE_PARSE_FAILED",
        500,
      );
    }

    return {
      student: {
        classId: this.credentials.classId,
        studentId: this.credentials.studentId,
        name: parsed.student.name,
      },
      overall: parsed.overall,
      subjects: parsed.subjects,
      fetchedAt: new Date().toISOString(),
      source: "erp-live",
    };
  }
}