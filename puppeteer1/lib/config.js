function readBooleanEnv(name, fallback) {
  const value = process.env[name];
  if (value == null || value === "") {
    return fallback;
  }

  return value !== "false";
}

function readNumberEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

export const erpConfig = {
  host: process.env.HOST || "127.0.0.1",
  port: readNumberEnv("PORT", 4100),
  loginUrl:
    process.env.ERP_LOGIN_URL ||
    "https://svguica.svguerp.in/studentinfosys/studentportal/studinfo_studlogin.aspx",
  attendanceLinkSelector:
    process.env.ERP_ATTENDANCE_LINK_SELECTOR || 'a[href*="studinfo_attendance"]',
  attendanceLinkText: (process.env.ERP_ATTENDANCE_LINK_TEXT || "attendance").toLowerCase(),
  attendanceUrlTemplate: process.env.ERP_ATTENDANCE_URL_TEMPLATE || "",
  loginSelectors: {
    classId: process.env.ERP_CLASS_ID_SELECTOR || 'input[name="ctl00$MainContent$TextBox1"]',
    studentId:
      process.env.ERP_STUDENT_ID_SELECTOR || 'input[name="ctl00$MainContent$TextBox2"]',
    password:
      process.env.ERP_PASSWORD_SELECTOR || 'input[name="ctl00$MainContent$TextBox3"]',
    submit:
      process.env.ERP_LOGIN_BUTTON_SELECTOR || 'input[name="ctl00$MainContent$Button1"]',
  },
  showButtonSelector:
    process.env.ERP_SHOW_BUTTON_SELECTOR || 'input[name="ctl00$MainContent$Button2"]',
  attendanceTableSelector:
    process.env.ERP_ATTENDANCE_TABLE_SELECTOR || "#MainContent_GridView2",
  navigationTimeoutMs: readNumberEnv("ERP_NAVIGATION_TIMEOUT_MS", 20000),
  headless: readBooleanEnv("PUPPETEER_HEADLESS", true),
};

export function buildAttendanceUrl(credentials) {
  if (!erpConfig.attendanceUrlTemplate) {
    return null;
  }

  return erpConfig.attendanceUrlTemplate
    .replace(/\{classId\}/g, encodeURIComponent(credentials.classId))
    .replace(/\{studentId\}/g, encodeURIComponent(credentials.studentId));
}
