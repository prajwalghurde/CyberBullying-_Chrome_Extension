const API_BASE_URL = 'http://localhost:8000';
const textInput = document.getElementById('textInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const testApiBtn = document.getElementById('testApiBtn');
const resultDiv = document.getElementById('result');
const resultTitle = document.getElementById('resultTitle');
const severityBadge = document.getElementById('severityBadge');
const confidenceBar = document.getElementById('confidenceBar');
const confidenceText = document.getElementById('confidenceText');
const suggestionBox = document.getElementById('suggestion-box');
const suggestionText = document.getElementById('suggestion-text');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const successDiv = document.getElementById('success');
const explanationBox = document.getElementById('explanation-box');
const explanationList = document.getElementById('explanation-list');

// Info page elements
const analyzeTab = document.getElementById('analyzeTab');
const infoTab = document.getElementById('infoTab');
const analyzePage = document.getElementById('analyzePage');
const infoPage = document.getElementById('infoPage');
const backToAnalyzeBtn = document.getElementById('backToAnalyzeBtn');

// Theme toggle elements
const themeToggle = document.getElementById('themeToggle');
const sunIcon = themeToggle.querySelector('.sun-icon');
const moonIcon = themeToggle.querySelector('.moon-icon');

document.addEventListener('DOMContentLoaded', async () => {
  // Load theme preference
  loadTheme();
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'getCurrentSelection' })
      .then((response) => {
        if (response && response.selectedText && response.selectedText.length > 0) {
          textInput.value = response.selectedText;
          textInput.focus();
          textInput.select();
          console.log('Loaded current selection:', response.selectedText.substring(0, 50) + (response.selectedText.length > 50 ? '...' : ''));
          showSuccess('✅ Text loaded from page!');
          setTimeout(() => hideMessages(), 2000);
        } else {
          loadFromStorage();
        }
      })
      .catch(() => {
        loadFromStorage();
      });
  } catch (error) {
    console.error('Error loading text:', error);
    loadFromStorage();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'textSelected' && request.text) {
    if (document.visibilityState === 'visible') {
      textInput.value = request.text;
      textInput.focus();
      textInput.select();
      console.log('Real-time update:', request.text.substring(0, 50) + (request.text.length > 50 ? '...' : ''));
      showSuccess('✅ Text updated from page!');
      setTimeout(() => hideMessages(), 2000);
    }
  }
});

async function loadFromStorage() {
  try {
    const result = await chrome.storage.local.get(['selectedText', 'timestamp']);
    if (result.selectedText) {
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      if (!result.timestamp || result.timestamp > fiveMinutesAgo) {
        textInput.value = result.selectedText;
        textInput.focus();
        textInput.select();
        console.log('Loaded stored selection:', result.selectedText.substring(0, 50) + '...');
      }
      await chrome.storage.local.remove(['selectedText', 'timestamp']);
    }
  } catch (error) {
    console.error('Error loading from storage:', error);
  }
}

analyzeBtn.addEventListener('click', async () => {
  const text = textInput.value.trim();
  if (!text) {
    showError('Please enter or select some text to analyze.');
    return;
  }
  await analyzeText(text);
});

testApiBtn.addEventListener('click', async () => {
  await testApiConnection();
});

textInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    analyzeBtn.click();
  }
});

async function analyzeText(text) {
  showLoading(true);
  hideResult();
  hideMessages();
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: text })
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    showResult(data.label, data.confidence, data.explanation, data.severity, data.suggestion);
  } catch (error) {
    console.error('Analysis error:', error);
    showError(`Failed to analyze text: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

async function testApiConnection() {
  showLoading(true);
  hideResult();
  hideMessages();
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`API not responding: ${response.status}`);
    }
    const data = await response.json();
    if (data.status === 'healthy' && data.model_loaded) {
      showSuccess('✅ API connection successful! Model is loaded and ready.');
    } else {
      showError('⚠️ API is running but model may not be loaded properly.');
    }
  } catch (error) {
    console.error('API test error:', error);
    showError(`❌ Failed to connect to API: ${error.message}. Make sure the FastAPI server is running on localhost:8000`);
  } finally {
    showLoading(false);
  }
}

function showResult(label, confidence, explanation, severity, suggestion) {
  // Update result title
  resultTitle.textContent = label;
  
  // Update severity badge
  if (severity) {
    severityBadge.textContent = severity;
    severityBadge.className = 'severity-badge';
    severityBadge.classList.add(severity.toLowerCase());
    severityBadge.style.display = 'inline-block';
  } else {
    severityBadge.style.display = 'none';
  }
  
  // Update confidence bar
  const confidencePercent = Math.round(confidence * 100);
  confidenceBar.style.width = '0%';
  
  // Trigger animation after a small delay
  setTimeout(() => {
    confidenceBar.style.width = confidencePercent + '%';
    confidenceBar.textContent = confidencePercent + '%';
    
    // Set color based on label
    confidenceBar.className = 'confidence-bar';
    if (label.toLowerCase() === 'bullying') {
      confidenceBar.classList.add('bullying');
    } else {
      confidenceBar.classList.add('non_bullying');
    }
  }, 100);
  
  confidenceText.textContent = `Confidence: ${(confidence * 100).toFixed(2)}%`;
  
  // Update result div styling
  resultDiv.className = 'result';
  if (label.toLowerCase() === 'bullying') {
    resultDiv.classList.add('bullying');
  } else {
    resultDiv.classList.add('non_bullying');
  }
  resultDiv.style.display = 'block';
  
  // Update suggestion box
  if (suggestion && suggestion.trim()) {
    suggestionText.textContent = suggestion;
    suggestionBox.style.display = 'block';
  } else {
    suggestionBox.style.display = 'none';
  }
  
  // Update explanation box
  if (explanation && explanation.length > 0) {
    explanationList.innerHTML = '';
    explanation.forEach(word => {
      const li = document.createElement('li');
      li.textContent = word;
      explanationList.appendChild(li);
    });
    explanationBox.style.display = 'block';
  } else {
    explanationBox.style.display = 'none';
  }
}

function showLoading(show) {
  loadingDiv.style.display = show ? 'block' : 'none';
  if (show) {
    hideResult();
    hideMessages();
  }
}

function hideResult() {
  resultDiv.style.display = 'none';
  severityBadge.style.display = 'none';
  confidenceBar.style.width = '0%';
  if (explanationBox) explanationBox.style.display = 'none';
  if (suggestionBox) suggestionBox.style.display = 'none';
}

function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  successDiv.style.display = 'none';
}

function showSuccess(message) {
  successDiv.textContent = message;
  successDiv.style.display = 'block';
  errorDiv.style.display = 'none';
}

function hideMessages() {
  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';
}

// Info page navigation
function switchToInfoPage() {
  analyzePage.classList.remove('active');
  infoPage.classList.add('active');
  analyzeTab.classList.remove('active');
  infoTab.classList.add('active');
}

function switchToAnalyzePage() {
  infoPage.classList.remove('active');
  analyzePage.classList.add('active');
  infoTab.classList.remove('active');
  analyzeTab.classList.add('active');
}

analyzeTab.addEventListener('click', switchToAnalyzePage);
infoTab.addEventListener('click', switchToInfoPage);
backToAnalyzeBtn.addEventListener('click', switchToAnalyzePage);

textInput.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';
});

// Theme Toggle Functions
themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark-theme');
  updateThemeIcons(isDark);
  saveTheme(isDark ? 'dark' : 'light');
});

function loadTheme() {
  chrome.storage.local.get(['theme']).then((result) => {
    const theme = result.theme || 'light';
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      updateThemeIcons(true);
    } else {
      document.body.classList.remove('dark-theme');
      updateThemeIcons(false);
    }
  }).catch((error) => {
    console.error('Error loading theme:', error);
  });
}

function saveTheme(theme) {
  chrome.storage.local.set({ theme: theme }).catch((error) => {
    console.error('Error saving theme:', error);
  });
}

function updateThemeIcons(isDark) {
  if (isDark) {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  } else {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  }
}