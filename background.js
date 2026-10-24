const browserAPI = typeof browser !== "undefined" ? browser : chrome;

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
    console.error("Background storage read error:", err);
    return null;
  }
}

browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "askGeminiBatch") {
    console.log("Background: Received request from content script.");

    (async () => {
      try {
        const apiKey = await getStoredApiKey();
        if (!apiKey) {
          sendResponse({
            error: "Gemini API key is not configured. Please open the extension popup to set your API key."
          });
          return;
        }

        const payload = {
          contents: [{ parts: [{ text: message.prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        };

        const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
        let lastError = null;

        for (let model of models) {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              console.log(`Background: Trying ${model} (Attempt ${attempt}/3)...`);
              
              const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
              });

              const data = await response.json();

              if (response.ok && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                sendResponse({ answerJson: data.candidates[0].content.parts[0].text });
                return;
              }

              if (data.error) {
                lastError = data.error.message || "API Error";
                // If the key is specifically invalid or unauthorized, fail immediately so user knows to fix it
                if (data.error.status === "INVALID_ARGUMENT" || data.error.message?.includes("API key not valid") || data.error.code === 400) {
                  sendResponse({ error: "Invalid API key: " + (data.error.message || "Please check your key in the popup.") });
                  return;
                }
                if (data.error.code === 503 || data.error.code === 429) {
                  const waitTime = attempt * 1500;
                  await new Promise(resolve => setTimeout(resolve, waitTime));
                  continue; 
                }
              }

              break; // Try next fallback model
            } catch (fetchErr) {
              lastError = fetchErr.message;
              if (attempt === 3) break;
            }
          }
        }

        sendResponse({ error: lastError || "All available Gemini models are currently overloaded. Please try again in a moment." });

      } catch (globalErr) {
        sendResponse({ error: globalErr.toString() });
      }
    })();
    
    return true; 
  }
});
