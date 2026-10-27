const API_BASE_URL = "https://frontaccease-backend.onrender.com";

const themeToggleBtn = document.getElementById("theme-toggle");
const loader = document.getElementById("loader");
const loaderText = document.getElementById("loader-text");
const resultsWrapper = document.getElementById("results-wrapper");
const resultsTitle = document.getElementById("results-title");
const results = document.getElementById("results-html");
const scanCodeInput = document.getElementById("scan-code-input");
const scanButtons = document.querySelectorAll("[data-scan-type]");

const savedTheme = localStorage.getItem("aria_theme") || "dark";
if (savedTheme === "light") {
  document.body.classList.add("light-mode");
  themeToggleBtn.setAttribute("aria-label", "Switch to dark theme");
  themeToggleBtn.title = "Switch to dark theme";
}

themeToggleBtn.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light-mode");
  themeToggleBtn.setAttribute(
    "aria-label",
    isLightMode ? "Switch to dark theme" : "Switch to light theme",
  );
  themeToggleBtn.title = isLightMode
    ? "Switch to dark theme"
    : "Switch to light theme";
  localStorage.setItem("aria_theme", isLightMode ? "light" : "dark");
});

scanButtons.forEach((button) =>
  button.addEventListener("click", () => startScan(button.dataset.scanType)),
);

async function startScan(scanType) {
  const scanCode = scanCodeInput.value.trim();
  if (!/^\d{6}$/.test(scanCode)) {
    showError(
      "Scan code required",
      "Enter the six-digit numeric scan code shown in FrontAccEase.",
    );
    scanCodeInput.focus();
    return;
  }

  setScanning(true);
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id || !tab.url)
      throw new Error("No active webpage is available to scan.");
    loaderText.textContent = "Collecting page HTML and CSS…";
    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageData,
    });
    const pageData = injectionResults[0]?.result;
    if (!pageData) throw new Error("Unable to collect page data.");
    loaderText.textContent =
      scanType === "llm"
        ? "Running AI accessibility analysis…"
        : "Running fast accessibility analysis…";
    const response = await sendScanRequest(scanType, {
      html: combinePageHtmlAndCss(pageData.html, pageData.css),
      code: scanCode,
      url: tab.url,
    });
    showResult(scanType, scanCode, response);
  } catch (error) {
    showError("Scan could not start", getDisplayMessage(error));
  } finally {
    setScanning(false);
  }
}

function combinePageHtmlAndCss(html, css) {
  const safeCss = css.replaceAll("</style", "<\\/style");
  const embeddedCss = `<style data-frontaccease-collected-css>\n${safeCss}\n</style>`;
  return html.includes("</head>")
    ? html.replace("</head>", `${embeddedCss}</head>`)
    : `${embeddedCss}${html}`;
}

async function sendScanRequest(scanType, payload) {
  const endpoint =
    scanType === "llm" ? "/accessibility/llm-scan" : "/accessibility/fast";
  console.log("FrontAccEase scan request", {
    endpoint: `${API_BASE_URL}${endpoint}`,
    payload,
  });
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();
  if (!response.ok) {
    throw new BackendRequestError(response.status, getResponseDetail(body));
  }
  return body;
}

function showResult(scanType, scanCode, response) {
  const label = scanType === "llm" ? "LLM scan" : "Fast scan";
  const status =
    typeof response === "object" && response?.status
      ? `\nStatus: ${response.status}`
      : "";
  setResult(
    "success",
    "Scan submitted",
    `${label} submitted\nScan code: ${scanCode}${status}\n\nReturn to FrontAccEase to view the report.`,
  );
}

class BackendRequestError extends Error {
  constructor(status, detail) {
    super(detail);
    this.name = "BackendRequestError";
    this.status = status;
    this.detail = detail;
  }
}

function getResponseDetail(body) {
  if (typeof body === "string") return body;
  if (typeof body?.detail === "string") return body.detail;
  if (Array.isArray(body?.detail)) {
    return body.detail
      .map((issue) => issue?.msg || JSON.stringify(issue))
      .join(" ");
  }
  if (typeof body?.message === "string") return body.message;
  return "The server could not process this scan.";
}

function getDisplayMessage(error) {
  if (error instanceof BackendRequestError) {
    return `Server response (${error.status}): ${error.detail}`;
  }
  return error?.message || "Something interrupted the scan before it reached the server.";
}

function showError(title, message) {
  setResult("error", title, message);
}

function setResult(state, title, message) {
  resultsWrapper.dataset.state = state;
  resultsTitle.textContent = title;
  results.textContent = message;
}

function setScanning(isScanning) {
  scanButtons.forEach((button) => (button.disabled = isScanning));
  scanCodeInput.disabled = isScanning;
  loader.classList.toggle("active", isScanning);
}

function extractPageData() {
  const html = document.documentElement.outerHTML;
  let css = "";
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) css += `${rule.cssText}\n`;
    } catch {
      /* Cross-origin stylesheet. */
    }
  }
  return { html, css };
}
