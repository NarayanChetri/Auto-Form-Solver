const browserAPI = typeof browser !== "undefined" ? browser : chrome;

browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "solveForm") {
    solveAllQuestionsBatch().then(sendResponse);
    return true;
  }
});

function clickOptionElement(el) {
  if (!el) return;
  const isChecked = el.getAttribute('aria-checked') === 'true';
  if (!isChecked) {
    el.click();
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));

    const childInput = el.querySelector('input');
    if (childInput && !childInput.checked) {
      childInput.click();
    }
  }
}

// Group options by vertical Y coordinate
function groupOptionsByY(options) {
  const rows = [];
  const threshold = 12; // vertical tolerance in px
  options.forEach(opt => {
    const rect = opt.getBoundingClientRect();
    const existing = rows.find(r => Math.abs(r.top - rect.top) < threshold);
    if (existing) {
      existing.items.push(opt);
    } else {
      rows.push({ top: rect.top, items: [opt] });
    }
  });
  rows.sort((a, b) => a.top - b.top);
  rows.forEach(r => {
    r.items.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
  });
  return rows.map(r => r.items);
}

// Extract row label from row container or its buttons
function extractRowLabel(rowEl, rowButtons, rowIdx) {
  if (rowEl) {
    const rowHeader = rowEl.querySelector('[role="rowheader"]');
    if (rowHeader && rowHeader.innerText.trim()) {
      return rowHeader.innerText.trim();
    }
    const ariaLabel = rowEl.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) {
      return ariaLabel.trim();
    }
    const labelledBy = rowEl.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelTarget = document.getElementById(labelledBy);
      if (labelTarget && labelTarget.innerText.trim()) {
        return labelTarget.innerText.trim();
      }
    }
    // Inspect child text before choice options
    if (rowEl.children && rowEl.children.length > 0) {
      for (let child of rowEl.children) {
        if (child.querySelectorAll('[role="radio"], [role="checkbox"]').length === 0 && child.innerText.trim()) {
          return child.innerText.trim();
        }
      }
    }
  }

  // Inspect first button's aria-label (e.g. "Euler's number, 2.718")
  if (rowButtons && rowButtons.length > 0) {
    const firstAria = rowButtons[0].getAttribute('aria-label');
    if (firstAria) {
      const parts = firstAria.split(/[,–-]/);
      if (parts.length > 1 && parts[0].trim()) {
        return parts[0].trim();
      }
    }
  }

  return `Row ${rowIdx + 1}`;
}

async function solveAllQuestionsBatch() {
  // Completely remove any existing visible hint badges from previous runs
  document.querySelectorAll('.stealth-hint, .stealth-hint-row').forEach(el => el.remove());

  const items = document.querySelectorAll('div[role="listitem"]');
  let questionsData = [];
  let formElements = [];

  items.forEach((item, itemIndex) => {
    const heading = item.querySelector('[role="heading"]');
    if (!heading) return;

    const mainQuestionText = heading.innerText.trim();
    const allOptions = Array.from(item.querySelectorAll('[role="radio"], [role="checkbox"]'));
    const textInputEl = item.querySelector('input[type="text"], textarea');

    // Detect if this listitem is a Grid (Multiple Choice Grid or Checkbox Grid)
    const radiogroups = Array.from(item.querySelectorAll('[role="radiogroup"]'));
    const rowRoles = Array.from(item.querySelectorAll('[role="row"]')).filter(r => {
      return r.querySelectorAll('[role="radio"], [role="checkbox"]').length > 0;
    });
    const rowHeaders = Array.from(item.querySelectorAll('[role="rowheader"]'));
    const columnHeaders = Array.from(item.querySelectorAll('[role="columnheader"]'))
      .map(c => c.innerText.trim())
      .filter(Boolean);

    // Group options geometrically as fallback
    const yBuckets = allOptions.length >= 4 ? groupOptionsByY(allOptions) : [];

    const isGrid = (
      radiogroups.length > 1 ||
      rowRoles.length > 1 ||
      rowHeaders.length > 0 ||
      columnHeaders.length > 0 ||
      (yBuckets.length > 1 && yBuckets[0].length > 1)
    );

    if (isGrid && allOptions.length > 0) {
      // Determine rows
      let rowsOfButtons = [];
      let rowContainers = [];

      if (radiogroups.length > 1) {
        radiogroups.forEach(rg => {
          const btns = Array.from(rg.querySelectorAll('[role="radio"], [role="checkbox"]'));
          if (btns.length > 0) {
            rowsOfButtons.push(btns);
            rowContainers.push(rg);
          }
        });
      } else if (rowRoles.length > 1) {
        rowRoles.forEach(rr => {
          const btns = Array.from(rr.querySelectorAll('[role="radio"], [role="checkbox"]'));
          if (btns.length > 0) {
            rowsOfButtons.push(btns);
            rowContainers.push(rr);
          }
        });
      } else if (yBuckets.length > 1) {
        rowsOfButtons = yBuckets;
        rowContainers = yBuckets.map(b => b[0]?.parentElement || item);
      }

      // If columnHeaders wasn't found via role="columnheader", attempt extraction
      let colLabels = [...columnHeaders];
      if (colLabels.length === 0 && rowsOfButtons.length > 0) {
        const firstRowBtns = rowsOfButtons[0];
        colLabels = firstRowBtns.map(btn => {
          return btn.getAttribute('data-value') || btn.innerText.trim() || "";
        }).filter(Boolean);
      }

      // Process each row in the grid independently
      rowsOfButtons.forEach((buttonsInRow, rowIdx) => {
        const rowContainer = rowContainers[rowIdx] || null;
        const rowLabel = extractRowLabel(rowContainer, buttonsInRow, rowIdx);
        const isCheckbox = buttonsInRow.some(b => b.getAttribute('role') === 'checkbox');
        const qType = isCheckbox ? "checkbox" : "radio";

        let optionsList = [];
        if (colLabels.length === buttonsInRow.length && colLabels.every(Boolean)) {
          optionsList = [...colLabels];
        } else {
          optionsList = buttonsInRow.map((btn, colIdx) => {
            let val = btn.getAttribute('data-value') || "";
            if (!val && colLabels[colIdx]) val = colLabels[colIdx];
            if (!val && btn.getAttribute('aria-label')) {
              let aria = btn.getAttribute('aria-label').trim();
              if (rowLabel && aria.toLowerCase().includes(rowLabel.toLowerCase())) {
                aria = aria.replace(new RegExp(rowLabel, "gi"), "").replace(/^[,\s-]+|[,\s-]+$/g, "");
              }
              val = aria;
            }
            if (!val) val = btn.innerText.trim();
            return val.trim();
          }).filter(Boolean);
        }

        const qId = `${itemIndex}_${rowIdx}`;
        const questionPrompt = `${mainQuestionText} -> [Row: ${rowLabel}]`;

        questionsData.push({
          id: qId,
          question: questionPrompt,
          type: qType,
          options: optionsList
        });

        formElements.push({
          id: qId,
          type: qType,
          optionsEl: buttonsInRow,
          colHeaders: optionsList,
          isGrid: true
        });
      });

    } else {
      // Standard Question (Radio, Checkbox, Text input)
      let qType = "";
      let optionsList = [];

      if (allOptions.length > 0) {
        qType = item.querySelector('[role="checkbox"]') ? "checkbox" : "radio";
        optionsList = allOptions.map(el => {
          let text = el.getAttribute('data-value') || el.getAttribute('aria-label') || el.innerText || "";
          return text.trim();
        }).filter(Boolean);
      } else if (textInputEl) {
        qType = "text";
      } else {
        return;
      }

      const qId = `${itemIndex}`;
      questionsData.push({ id: qId, question: mainQuestionText, type: qType, options: optionsList });
      formElements.push({
        id: qId,
        type: qType,
        optionsEl: allOptions,
        textInputEl,
        isGrid: false
      });
    }
  });

  if (questionsData.length === 0) {
    return { success: false, error: "No valid questions found on page." };
  }

  const prompt = `You are an expert test solver.
CRITICAL RULES:
- "radio": return a SINGLE exact string chosen from the options list.
- "checkbox": return an ARRAY of exact strings chosen from the options list. NEVER return an empty array [].
- "text": return a short, accurate answer.
- For grid questions marked with "-> [Row: ...]": choose the exact column option for that specific row.

Questions Data:
${JSON.stringify(questionsData, null, 2)}

RETURN YOUR ANSWERS AS A STRICT JSON ARRAY matching each question's exact "id":
[
  { "id": "0_0", "answer": "Option 1" },
  { "id": "0_1", "answer": "Option 2" }
]`;

  try {
    const response = await browserAPI.runtime.sendMessage({ action: "askGeminiBatch", prompt: prompt });
    if (!response) {
      return { success: false, error: "No response received from background script." };
    }
    if (response.error) {
      return { success: false, error: response.error };
    }

    const answers = JSON.parse(response.answerJson);
    let successfullyProcessedCount = 0;

    answers.forEach(ans => {
      const targetData = formElements.find(f => String(f.id) === String(ans.id));
      if (!targetData || !ans.answer) return;
      if (Array.isArray(ans.answer) && ans.answer.length === 0) return;

      // Notice: ALL visible stealth hints below questions are COMPLETELY removed as requested!

      if (targetData.type === "radio" || targetData.type === "checkbox") {
        let answersToClick = Array.isArray(ans.answer) ? ans.answer : 
                             (typeof ans.answer === 'string' && targetData.type === 'checkbox' && ans.answer.includes(',')) 
                             ? ans.answer.split(',') : [ans.answer];

        answersToClick.forEach(answerText => {
          if (!answerText) return;
          const cleanAnswer = String(answerText).toLowerCase().trim().replace(/\s+/g, " ");

          const targetBtn = Array.from(targetData.optionsEl).find((el, colIdx) => {
            const val = (el.getAttribute('data-value') || el.getAttribute('aria-label') || el.innerText || "").toLowerCase().trim().replace(/\s+/g, " ");
            if (val === cleanAnswer || val.includes(cleanAnswer) || cleanAnswer.includes(val)) return true;

            if (targetData.colHeaders && targetData.colHeaders[colIdx]) {
              const colName = String(targetData.colHeaders[colIdx]).toLowerCase().trim().replace(/\s+/g, " ");
              if (colName === cleanAnswer || colName.includes(cleanAnswer) || cleanAnswer.includes(colName)) return true;
            }
            return false;
          });

          if (targetBtn) {
            clickOptionElement(targetBtn);
          }
        });

      } else if (targetData.type === "text" && targetData.textInputEl) {
        const input = targetData.textInputEl;
        input.focus();
        input.value = ans.answer;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.blur();
      }

      successfullyProcessedCount++;
    });

    return { success: true, count: successfullyProcessedCount };

  } catch (err) {
    return { success: false, error: err.message || "Failed to process form questions." };
  }
}
