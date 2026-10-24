# ✦ AI Form Solver 🤖

> **Pura 20 mein 20.**  
> An intelligent, stealthy browser extension that automatically analyzes and solves Google Forms using Google's Gemini AI.

![Version](https://img.shields.io/badge/version-5.0-blue.svg)
![Manifest](https://img.shields.io/badge/manifest-v3-purple.svg)
![AI Powered](https://img.shields.io/badge/AI-Gemini_Flash-orange.svg)
![Platform](https://img.shields.io/badge/platform-Chrome_%7C_Edge_%7C_Firefox_%7C_Android-success.svg)

---

## ✨ Features

* **🧠 Multi-Model Gemini Integration:** Dynamically uses Google's Gemini Flash models (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`) with automatic quota fallbacks.
* **🔑 Secure On-Device API Key Management:** Save your Gemini API key locally inside the extension with password visibility toggles, direct [Google AI Studio](https://aistudio.google.com/app/apikey) shortcut, and a safety confirmation warning before clearing.
* **📊 Matrix & Grid Question Solving:** Full support for complex Google Forms **Multiple Choice Grids** and **Checkbox Grids** with multi-row coordinate detection.
* **🥷 100% Stealth Execution:** Solves questions silently without leaving visible hint watermarks or focus rings on the form.
* **📝 Comprehensive Form Support:** Seamlessly handles `Radio` single-choice, `Checkbox` arrays (multiple correct answers), matrix grids, and `Text` / `Paragraph` inputs.
* **🦊 Native Firefox & Chrome MV3 Support:** Built for both Chromium browsers and Mozilla Firefox with proper background script handling.

---

## 🚀 Installation Guide

### 🌐 Google Chrome & Microsoft Edge (Desktop)
1. Clone or download this repository.
2. Open your browser's extension management page:
   * **Chrome:** `chrome://extensions/`
   * **Edge:** `edge://extensions/`
3. In the top-right corner, toggle **Developer mode** to **ON**.
4. Click **Load unpacked** in the top toolbar.
5. Select the folder containing `manifest.json`.
6. Pin the extension (✦) to your toolbar.

### 🦊 Mozilla Firefox (Desktop)
1. Open Firefox and type `about:debugging#/runtime/this-firefox` in the address bar.
2. Click **Load Temporary Add-on...**.
3. Select `manifest.json` or `extension.xpi`.
4. Pin the extension to your toolbar.

### 📱 Firefox Nightly (Android)
1. Download the `extension.xpi` file to your Android device.
2. Open **Firefox Nightly** and tap the three-dot menu (**⋮**) > **Settings**.
3. Scroll down and tap **About Firefox Nightly**.
4. Tap the Firefox logo **5 times** rapidly until the *"Debug menu enabled"* toast appears.
5. Return to the main **Settings** menu, scroll to the **Advanced** section, and tap **Install Extension from File**.
6. Select `extension.xpi` and tap **Add** to confirm.

---

## 🕹️ How to Use

1. Click the **✦ Form Solver** icon in your toolbar.
2. Paste your Gemini API key (or click **"Get Key ↗"** to get a free key from Google AI Studio) and click **Save Key**.
3. Navigate to any active **Google Form** (`docs.google.com/forms/...`).
4. Click **Auto-Solve Form** in the popup panel.
5. The extension will read the questions, query Gemini, and automatically fill in all answers, including matrix grid questions.
6. Review your answers and submit!

---

## ⚠️ Notes & Security

* **API Keys:** Your API key is stored locally in your browser (`storage.local`) and is never sent to any third-party servers—only directly to Google's official Gemini API endpoint.
* **Disclaimer:** This tool is created for educational, research, and automation purposes. Please use it responsibly and in compliance with your institution's academic integrity policies.
