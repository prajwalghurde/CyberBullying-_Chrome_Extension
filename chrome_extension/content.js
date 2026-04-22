let selectedText = '';

function handleTextSelection() {
  const selection = window.getSelection();
  selectedText = selection.toString().trim();
  if (selectedText.length > 0) {
    chrome.storage.local.set({
      selectedText: selectedText,
      timestamp: Date.now()
    }).catch(err => {
      console.error('Failed to save selected text:', err);
    });
    chrome.runtime.sendMessage({
      action: 'textSelected',
      text: selectedText
    }).catch(err => {
      console.debug('Popup not open, text saved to storage');
    });
    console.log('Text selected and saved:', selectedText.substring(0, 50) + (selectedText.length > 50 ? '...' : ''));
  }
}

// Detect text selection on mouse up (after selecting text)
document.addEventListener('mouseup', function () {
  setTimeout(handleTextSelection, 50);
});

// Detect text selection on keyboard selection (Shift + Arrow keys)
document.addEventListener('keyup', function (event) {
  if (event.shiftKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
    setTimeout(handleTextSelection, 50);
  }
});

// Detect text selection on double click
document.addEventListener('dblclick', function () {
  setTimeout(handleTextSelection, 50);
});

// Detect text selection on single click (if there's already selected text)
document.addEventListener('click', function () {
  setTimeout(handleTextSelection, 50);
});

// Detect text selection on copy
document.addEventListener('copy', function () {
  setTimeout(handleTextSelection, 10);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    const selection = window.getSelection();
    sendResponse({
      selectedText: selection.toString().trim(),
      timestamp: Date.now()
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCurrentSelection') {
    const selection = window.getSelection();
    const currentText = selection.toString().trim();
    sendResponse({
      selectedText: currentText,
      timestamp: Date.now()
    });
  }
});