# ✦ AI Form Solver 🤖

> **Pura 20 mein 20.** > An intelligent, stealthy browser extension that automatically analyzes and solves Google Forms using the power of Google's Gemini AI.

![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![AI Powered](https://img.shields.io/badge/AI-Gemini_Flash-orange.svg)
![Platform](https://img.shields.io/badge/platform-Chrome_%7C_Edge_%7C_Firefox_%7C_Android-success.svg)

---

## ✨ Features

* **🧠 Advanced AI Integration:** Utilizes the latest Gemini Flash models (`gemini-3.5-flash`, `gemini-2.5-flash`) to accurately answer form questions.
* **🥷 Stealth Mode Injections:** Injects answers as faint, low-opacity "watermarks" on the screen, keeping things discreet.
* **⚡ Silent Auto-Filling:** Clicks radio buttons and checkboxes programmatically without triggering obvious browser focus rings (green outlines).
* **📝 Comprehensive Support:** Handles `Radio` buttons, `Checkbox` arrays (multiple correct answers), and short `Text` input fields.
* **📱 Cross-Platform:** Works seamlessly on Desktop (Chrome, Edge, Firefox Nightly) and Mobile devices (Android via Kiwi Browser or Firefox Nightly).

---

## 🚀 Installation Guide

Because this extension isn't in the official web stores yet, you'll need to install it manually. Choose your platform below:

### 🌐 Google Chrome (Desktop)
1. Download the extension source code folder (extract the `.zip` if it's zipped).
2. Open Google Chrome and type `chrome://extensions/` in the URL bar.
3. In the top right corner, toggle **Developer mode** to **ON**.
4. Click the **Load unpacked** button that appears in the top left.
5. Select the extracted folder containing the `manifest.json` file.
6. *Done!* Pin the extension to your toolbar for easy access.

### 🌊 Microsoft Edge (Desktop)
1. Download and extract the extension source code folder.
2. Open Microsoft Edge and type `edge://extensions/` in the URL bar.
3. In the left sidebar, turn on **Developer mode**.
4. Click the **Load unpacked** button.
5. Select the extracted folder containing the `manifest.json` file.
6. *Done!* The extension icon (✦) will appear in your toolbar.

### 📱 Firefox Nightly (Android)
*Note: Firefox for Android requires the packed `.xpi` file.*
1. Download the `.xpi` file to your Android device's storage.
2. Open Firefox Nightly and tap the three-dot menu (⋮), then select **Settings**.
3. Scroll down and tap **About Firefox Nightly**.
4. Tap the Firefox logo at the top **5 times** in quick succession. A toast notification will say "Debug menu enabled."
5. Go back to the main **Settings** page.
6. Scroll down to the Advanced section and tap **Install Extension from File**.
7. Locate and select the `.xpi` file from your device. Tap **Add** to confirm.

---

## 🕹️ How to Use

1. Navigate to any active **Google Form** (`docs.google.com/forms/...`).
2. Click the **✦ Form Solver** icon in your browser toolbar (or from the menu on mobile).
3. Click the **Auto-Solve Form** button in the popup panel.
4. Wait a few seconds while the UI says "Analyzing Form...".
5. Watch the magic happen! The extension will silently select the correct options, type out text answers, and inject stealth hints for you to review.
6. Review the answers and click Submit on the form.

---

## ⚠️ Important Notes & Security

* **API Quota:** The extension uses a shared Gemini API Key. If you receive an error saying the models are overloaded, simply wait a moment and try again. 
* **Security:** If you intend to share this codebase publicly (like on GitHub), **DO NOT** leave your personal Google Gemini API key hardcoded in `background.js`. Replace it with instructions for users to add their own keys to prevent quota theft.
* **Disclaimer:** This tool is intended for educational, testing, and automation purposes. Please use it responsibly and in accordance with your institution's academic integrity policies.
