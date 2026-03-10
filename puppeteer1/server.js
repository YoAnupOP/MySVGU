import http from "node:http";

import { erpConfig } from "./lib/config.js";
import { WorkerError } from "./lib/errors.js";
import { SvguErpScraper } from "./lib/scraper.js";

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  return await new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new WorkerError("Request body too large.", "PAYLOAD_TOO_LARGE", 413));
      }
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new WorkerError("Invalid JSON payload.", "INVALID_JSON", 400));
      }
    });

    request.on("error", (error) => reject(error));
  });
}

function validateCredentials(payload) {
  if (
    !payload ||
    typeof payload.classId !== "string" ||
    typeof payload.studentId !== "string" ||
    typeof payload.password !== "string"
  ) {
    throw new WorkerError(
      "Credentials must include classId, studentId, and password.",
      "INVALID_CREDENTIALS_PAYLOAD",
      400,
    );
  }

  return {
    classId: payload.classId.trim(),
    studentId: payload.studentId.trim(),
    password: payload.password,
  };
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "127.0.0.1"}`);

  try {
    if (request.method === "GET" && url.pathname === "/health") {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method !== "POST") {
      throw new WorkerError("Method not allowed.", "METHOD_NOT_ALLOWED", 405);
    }

    const payload = await readJsonBody(request);
    const credentials = validateCredentials(payload);
    const scraper = new SvguErpScraper(credentials);

    await scraper.init();

    try {
      if (url.pathname === "/auth/verify") {
        const verification = await scraper.login();
        sendJson(response, 200, verification);
        return;
      }

      if (url.pathname === "/attendance") {
        const attendance = await scraper.getAttendance();
        sendJson(response, 200, attendance);
        return;
      }

      throw new WorkerError("Route not found.", "NOT_FOUND", 404);
    } finally {
      await scraper.close();
    }
  } catch (error) {
    if (error instanceof WorkerError) {
      sendJson(response, error.status, {
        error: error.message,
        code: error.code,
      });
      return;
    }

    console.error("ERP worker error:", error);
    sendJson(response, 500, {
      error: "Unexpected worker failure.",
      code: "INTERNAL_ERROR",
    });
  }
});

server.listen(erpConfig.port, erpConfig.host, () => {
  console.log(`ERP worker listening on http://${erpConfig.host}:${erpConfig.port}`);
});
