// Background service worker for Cyberbullying Detector Chrome Extension (Manifest V3)

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Cyberbullying Detector extension installed');
  
  // Set default settings
  chrome.storage.local.set({
    apiBaseUrl: 'http://localhost:8000',
    autoAnalyze: false
  }).catch(err => {
    console.error('Failed to set default settings:', err);
  });
  
  // Create context menu for analyzing selected text
  chrome.contextMenus.create({
    id: 'analyzeSelection',
    title: 'Analyze for Cyberbullying',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyzeSelection' && info.selectionText) {
    // Store selected text
    chrome.storage.local.set({ 
      selectedText: info.selectionText,
      timestamp: Date.now()
    }).catch(err => {
      console.error('Failed to store selected text:', err);
    });
    console.log('Context menu: Text selected:', info.selectionText.substring(0, 50) + '...');
    // Note: popup won't open programmatically in Manifest V3, user needs to click extension icon
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle API health check from popup
  if (request.action === 'checkApiHealth') {
    fetch('http://localhost:8000/health')
      .then(response => response.json())
      .then(data => {
        sendResponse({ success: true, data: data });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Required for async response
  }
  
  // Handle text analysis request from popup
  if (request.action === 'analyzeText') {
    fetch('http://localhost:8000/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: request.text })
    })
    .then(response => response.json())
    .then(data => {
      sendResponse({ success: true, data: data });
    })
    .catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Required for async response
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This won't work in Manifest V3, popup is defined in manifest
  // The popup will automatically open when icon is clicked
});

// Clean up old storage data periodically
chrome.alarms.create('cleanupStorage', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanupStorage') {
    chrome.storage.local.get(['selectedText']).then((result) => {
      if (result.selectedText) {
        // Clear old selected text after 5 minutes
        chrome.storage.local.remove(['selectedText']);
      }
    });
  }
});