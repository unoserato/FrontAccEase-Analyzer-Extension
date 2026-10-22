# FrontAccEase Web Extension

The **FrontAccEase Web Extension** is a browser-based accessibility auditing tool designed to help IT students evaluate web pages for potential accessibility issues. It integrates with the FrontAccEase learning platform and supports on-device scanning using WebLLM browser models.

The extension helps learners identify potential web accessibility issues while studying the principles of **POUR: Perceivable, Operable, Understandable, and Robust**.

## Features

- **Web Accessibility Scanning:** Analyze target web pages for potential accessibility issues.
- **WebLLM Integration:** Run supported language models directly in the browser for on-device analysis.
- **Pairing Code Authentication:** Connect the extension to an authenticated FrontAccEase session using a one-time pairing code.
- **Model Selection:** Choose an available browser-based language model before scanning.
- **Multi-Browser Support:** Designed for compatible browsers, including Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, and Opera.
- **Learning Platform Integration:** Connect accessibility testing with the FrontAccEase learning environment.

## Getting Started

### 1. Download the Extension

Download the extension ZIP file from the official FrontAccEase GitHub repository.

Extract the ZIP file into a folder on your computer. Keep the extracted files together because the browser loads the extension from this folder.


### 2. Install the Extension

The extension can be installed using your browser's developer or unpacked-extension functionality.

#### Google Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the extracted FrontAccEase extension folder.
5. Confirm that the extension appears in your installed extensions.

#### Microsoft Edge

1. Open `edge://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the extracted extension folder.

#### Mozilla Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Select **This Firefox**.
3. Click **Load Temporary Add-on**.
4. Select the extension's `manifest.json` file.

Temporary Firefox installations may need to be repeated after restarting the browser.

#### Brave and Opera

1. Open the browser's extension management page.
2. Enable developer options.
3. Select the option to load an unpacked extension, if supported by your extension build.
4. Select the extracted extension folder.

> **Note:** Browser compatibility depends on the extension's manifest version, APIs, permissions, and implementation.

### 3. Generate a Pairing Code

1. Open the FrontAccEase web application.
2. Navigate to the **Analyzer** page.
3. Generate a pairing code.
4. Copy the generated code.

The pairing code connects the extension to your FrontAccEase session and is valid for **one scan**. Generate a new code for subsequent scans when required.

### 4. Authenticate the Extension

1. Open the FrontAccEase extension from your browser toolbar.
2. Enter or paste the pairing code.
3. Submit the code to authenticate the extension.
4. Wait for confirmation before proceeding.

Ensure that the FrontAccEase application and extension can communicate with the configured backend.

### 5. Select a WebLLM Model

Choose an available WebLLM browser model in the extension.

WebLLM enables supported language models to run locally in the browser, subject to model compatibility and available system resources.

The initial model load may take time because the browser may need to download model files. Performance depends on your device, browser, available memory, and selected model.

### 6. Scan a Web Page

1. Navigate to the web page you want to evaluate.
2. Open the FrontAccEase extension.
3. Confirm that your pairing code has been authenticated.
4. Select your preferred WebLLM model.
5. Start the accessibility scan.
6. Review the resulting accessibility findings.

Use the findings to identify areas that may require further investigation or improvement.

## FrontAccEase Platform

The extension works alongside the FrontAccEase web application.

## Troubleshooting

### The Pairing Code Is Rejected

- Confirm that you generated the code from the correct FrontAccEase account.
- Check whether the code has already been used.
- Generate a new code and try again.
- Verify that the extension can reach the configured backend.

### The Extension Cannot Connect to FrontAccEase

- Confirm that the frontend and backend services are running.
- Verify the configured API base URL.
- Check browser permissions and network access.
- Inspect the browser developer console and extension service worker logs for errors.

### The WebLLM Model Does Not Load

- Check your internet connection for the initial model download.
- Ensure the browser supports the required WebGPU or other capabilities used by your selected model.
- Check available memory and GPU resources.
- Try another supported model if loading or performance issues persist.

### The Scan Fails

- Generate a fresh pairing code if the previous code has already been consumed.
- Confirm that the target page is accessible.
- Check the extension's permissions and content-script behavior.
- Inspect extension logs and backend responses for diagnostic information.

## Security and Privacy

- Treat pairing codes as temporary authentication credentials.
- Do not share pairing codes with other users.
- On-device inference can reduce the need to send page content to an external language-model provider. However, it does not automatically guarantee that all scanned content remains local. Review the extension's network requests and backend implementation to determine what information is transmitted.
- Only install extension builds from trusted sources.

## Project Context

FrontAccEase is an accessibility learning and assessment platform intended to help IT students understand and apply web accessibility principles.

The web extension complements the platform by allowing learners to evaluate web pages and investigate potential accessibility problems in practice.


**FrontAccEase Web Extension**

*Learn accessibility. Evaluate the web. Build more inclusive experiences.*
