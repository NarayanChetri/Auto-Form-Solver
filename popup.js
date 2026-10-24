const browserAPI = typeof browser !== "undefined" ? browser : chrome;

// Storage helper functions
async function getStoredApiKey() {
  try {
    if (typeof browser !== "undefined" && browser.storage?.local) {
      const data = await browser.storage.local.get("geminiApiKey");
      return data?.geminiApiKey?.trim() || null;
    }
    return new Promise((resolve) => {
      chrome.storage.local.get(["geminiApiKey"], (res) => {
        resolve(res?.geminiApiKey?.trim() || null);
      });
    });
  } catch (err) {
    console.error("Storage get error:", err);
    return null;
  }
}

async function setStoredApiKey(key) {
  try {
    if (typeof browser !== "undefined" && browser.storage?.local) {
      await browser.storage.local.set({ geminiApiKey: key });
      return;
    }
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ geminiApiKey: key }, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve();
      });
    });
  } catch (err) {
    console.error("Storage set error:", err);
    throw err;
  }
}

async function removeStoredApiKey() {
  try {
    if (typeof browser !== "undefined" && browser.storage?.local) {
      await browser.storage.local.remove("geminiApiKey");
      return;
    }
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(["geminiApiKey"], () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve();
      });
    });
  } catch (err) {
    console.error("Storage remove error:", err);
    throw err;
  }
}

function maskApiKey(key) {
  if (!key || key.length < 10) return "••••••••••••";
  const start = key.slice(0, 6);
  const end = key.slice(-4);
  return `${start}${"•".repeat(16)}${end}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  // Elements
  const statusPill = document.getElementById("statusPill");
  const statusPillText = document.getElementById("statusPillText");
  const getApiKeyLink = document.getElementById("getApiKeyLink");
  
  const keyInputSection = document.getElementById("keyInputSection");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const toggleVisibilityBtn = document.getElementById("toggleVisibilityBtn");
  const eyeIcon = document.getElementById("eyeIcon");
  const saveKeyBtn = document.getElementById("saveKeyBtn");
  const keyFeedback = document.getElementById("keyFeedback");

  const keyConfiguredSection = document.getElementById("keyConfiguredSection");
  const maskedKeyDisplay = document.getElementById("maskedKeyDisplay");
  const requestClearBtn = document.getElementById("requestClearBtn");

  const clearWarningCard = document.getElementById("clearWarningCard");
  const cancelClearBtn = document.getElementById("cancelClearBtn");
  const confirmClearBtn = document.getElementById("confirmClearBtn");

  const solveBtn = document.getElementById("solveBtn");
  const btnSpinner = document.getElementById("btnSpinner");
  const btnSparkle = document.getElementById("btnSparkle");
  const btnText = document.getElementById("btnText");

  const statusPanel = document.getElementById("statusPanel");
  const statusIcon = document.getElementById("statusIcon");
  const statusText = document.getElementById("statusText");

  // Icon SVGs
  const eyeOpenSvg = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
  const eyeClosedSvg = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
  
  const iconSuccessSvg = `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>`;
  const iconErrorSvg = `<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>`;
  const iconLoadingSvg = `<circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="30 10"/>`;

  function setStatus(type, message) {
    if (!type) {
      statusPanel.className = "status-panel hidden";
      return;
    }
    statusPanel.className = `status-panel ${type}`;
    statusText.innerText = message;
    if (type === "loading") {
      statusIcon.innerHTML = iconLoadingSvg;
    } else if (type === "success") {
      statusIcon.innerHTML = iconSuccessSvg;
    } else if (type === "error") {
      statusIcon.innerHTML = iconErrorSvg;
    }
  }

  // Update UI according to whether key is configured
  function updateKeyUI(apiKey) {
    if (apiKey) {
      statusPill.className = "status-pill ready";
      statusPillText.innerText = "Ready";
      maskedKeyDisplay.innerText = maskApiKey(apiKey);
      keyConfiguredSection.classList.remove("hidden");
      keyInputSection.classList.add("hidden");
      clearWarningCard.classList.add("hidden");
      solveBtn.disabled = false;
      solveBtn.title = "Click to analyze and solve the active Google Form";
    } else {
      statusPill.className = "status-pill needs-key";
      statusPillText.innerText = "No Key";
      keyConfiguredSection.classList.add("hidden");
      keyInputSection.classList.remove("hidden");
      clearWarningCard.classList.add("hidden");
      apiKeyInput.value = "";
      solveBtn.disabled = true;
      solveBtn.title = "Please enter and save your Gemini API key first";
    }
  }

  // Initial load
  const existingKey = await getStoredApiKey();
  updateKeyUI(existingKey);

  // Link to Google AI Studio
  getApiKeyLink.addEventListener("click", (e) => {
    e.preventDefault();
    browserAPI.tabs.create({ url: "https://aistudio.google.com/app/apikey" });
  });

  // Toggle API Key password visibility
  toggleVisibilityBtn.addEventListener("click", () => {
    const isPassword = apiKeyInput.type === "password";
    apiKeyInput.type = isPassword ? "text" : "password";
    eyeIcon.innerHTML = isPassword ? eyeClosedSvg : eyeOpenSvg;
  });

  // Save Key
  saveKeyBtn.addEventListener("click", async () => {
    keyFeedback.className = "feedback-msg";
    const key = apiKeyInput.value.trim();

    if (!key) {
      keyFeedback.innerText = "Please enter an API key.";
      keyFeedback.className = "feedback-msg error";
      return;
    }

    if (key.length < 15) {
      keyFeedback.innerText = "Key is too short to be a valid Gemini API key.";
      keyFeedback.className = "feedback-msg error";
      return;
    }

    try {
      await setStoredApiKey(key);
      updateKeyUI(key);
      setStatus("success", "API key saved successfully!");
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      keyFeedback.innerText = "Failed to save key to storage.";
      keyFeedback.className = "feedback-msg error";
    }
  });

  // Clear Key - Step 1: Show Warning Card
  requestClearBtn.addEventListener("click", () => {
    clearWarningCard.classList.remove("hidden");
  });

  // Clear Key - Step 2: Cancel
  cancelClearBtn.addEventListener("click", () => {
    clearWarningCard.classList.add("hidden");
  });

  // Clear Key - Step 3: Confirm Clear
  confirmClearBtn.addEventListener("click", async () => {
    try {
      await removeStoredApiKey();
      updateKeyUI(null);
      setStatus("error", "API key removed. Auto-solve is disabled.");
      setTimeout(() => setStatus(null), 3500);
    } catch (err) {
      setStatus("error", "Could not remove key from device storage.");
    }
  });

  // Auto-Solve Form Click Handler
  solveBtn.addEventListener("click", async () => {
    const currentKey = await getStoredApiKey();
    if (!currentKey) {
      setStatus("error", "Please save a Gemini API key above first.");
      return;
    }

    solveBtn.disabled = true;
    btnSpinner.style.display = "block";
    btnSparkle.style.display = "none";
    btnText.innerText = "Solving Form...";
    setStatus("loading", "Detecting questions on page...");

    try {
      const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0) {
        throw new Error("No active browser tab found.");
      }

      const activeTab = tabs[0];
      if (!activeTab.url || !activeTab.url.includes("docs.google.com/forms")) {
        throw new Error("Please open and switch to a Google Form tab first.");
      }

      setStatus("loading", "Reading questions & querying Gemini AI...");
      const response = await browserAPI.tabs.sendMessage(activeTab.id, { action: "solveForm" });
      
      if (response && response.success) {
        btnText.innerText = "Success!";
        setStatus("success", `Filled ${response.count} question(s) successfully!`);
      } else if (response && response.error) {
        throw new Error(response.error);
      } else {
        throw new Error("No supported questions found on this form.");
      }

    } catch (err) {
      btnText.innerText = "Failed";
      const message = err.message || String(err);
      const isConnectionErr = message.includes("Could not establish connection") || message.includes("Receiving end does not exist");
      
      setStatus("error", isConnectionErr 
        ? "Please refresh the Google Form page, then try again."
        : message
      );
    } finally {
      btnSpinner.style.display = "none";
      btnSparkle.style.display = "block";
      setTimeout(() => {
        solveBtn.disabled = false;
        btnText.innerText = "Auto-Solve Form";
      }, 3500);
    }
  });
});
