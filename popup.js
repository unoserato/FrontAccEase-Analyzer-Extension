const API_BASE_URL = "http://127.0.0.1:8000";

const themeToggleBtn = document.getElementById("theme-toggle");
const themeText = document.getElementById("theme-text");
const loader = document.getElementById("loader");
const loaderText = document.getElementById("loader-text");
const results = document.getElementById("results-html");
const scanCodeInput = document.getElementById("scan-code-input");
const scanButtons = document.querySelectorAll("[data-scan-type]");

const savedTheme = localStorage.getItem("aria_theme") || "dark";
if (savedTheme === "light") {
  document.body.classList.add("light-mode");
  themeText.textContent = "Dark";
}

themeToggleBtn.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light-mode");
  themeText.textContent = isLightMode ? "Dark" : "Light";
  localStorage.setItem("aria_theme", isLightMode ? "light" : "dark");
});

scanButtons.forEach((button) => button.addEventListener("click", () => startScan(button.dataset.scanType)));

async function startScan(scanType) {
  const scanCode = scanCodeInput.value.trim();
  if (!/^\d{6}$/.test(scanCode)) {
    results.textContent = "Enter the 6-digit scan code shown in FrontAccEase before starting a scan.";
    scanCodeInput.focus();
    return;
  }

  setScanning(true);
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url) throw new Error("No active webpage is available to scan.");
    loaderText.textContent = "Collecting page HTML and CSS…";
    const injectionResults = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: extractPageData });
    const pageData = injectionResults[0]?.result;
    if (!pageData) throw new Error("Unable to collect page data.");
    loaderText.textContent = scanType === "llm" ? "Running AI accessibility analysis…" : "Running fast accessibility analysis…";
    const response = await sendScanRequest(scanType, {
      html: combinePageHtmlAndCss(pageData.html, pageData.css),
      code: scanCode,
      url: tab.url,
    });
    showResult(scanType, scanCode, response);
  } catch (error) {
    results.textContent = `Scan failed: ${error.message}\n\nUse this extension on a regular webpage, not a browser-internal or Web Store page.`;
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
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof body === "string" ? body : body?.detail || body?.message || JSON.stringify(body);
    throw new Error(`Backend returned ${response.status}: ${message}`);
  }
  return body;
}

function showResult(scanType, scanCode, response) {
  const label = scanType === "llm" ? "LLM scan" : "Fast scan";
  const status = typeof response === "object" && response?.status ? `\nStatus: ${response.status}` : "";
  results.textContent = `${label} submitted\nScan code: ${scanCode}${status}\n\nReturn to FrontAccEase to view the report.`;
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
    try { for (const rule of sheet.cssRules) css += `${rule.cssText}\n`; } catch { /* Cross-origin stylesheet. */ }
  }
  return { html, css };
}
