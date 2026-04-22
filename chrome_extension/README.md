# Cyberbullying Detector Chrome Extension - Enhanced

A Chrome extension that detects cyberbullying in selected text using your FastAPI ML backend with advanced UI features.

## 🌟 Enhanced Features

- **✨ Automatic Text Population**: Selected text instantly appears in the extension input box
- **🖱️ Universal Selection Support**: Works with mouse, keyboard, double-click, and single-click selection
- **⚡ Real-time Updates**: Text updates dynamically as you select
- **🎯 Smart Focus Management**: Automatically focuses and selects text for easy editing
- **🕒 Recent Selection Priority**: Prioritizes recently selected text (within 5 minutes)
- **🏷️ Severity Badges**: Color-coded severity levels (🔴 Severe, 🟠 Offensive, 🟡 Mild, 🟢 Safe)
- **📊 Animated Confidence Bar**: Visual progress bar with percentage display
- **💡 Smart Suggestions**: Context-aware recommendations based on severity
- **🌙 Dark/Light Theme**: Full theme support with persistent preference
- **📋 Context Menu**: Right-click to analyze selected text
- **🔍 Explanation System**: Shows words that influenced the prediction

## Installation

1. **Ensure Prerequisites**:
   - Your FastAPI backend must be running on `http://localhost:8000`
   - Chrome browser (version 88 or higher)

2. **Load the Extension**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `chrome_extension` folder from this project

3. **Verify Installation**:
   - Look for the extension icon in your Chrome toolbar
   - Click the icon to open the popup interface

## Usage

### Method 1: Select Text on Webpage (Recommended)
1. Navigate to any webpage
2. Select/highlight text you want to analyze (mouse drag, double-click, or keyboard)
3. Click the extension icon in the toolbar
4. The selected text will automatically appear in the text box
5. Click "Analyze Text" or press Enter
6. View results with severity badge, confidence bar, and suggestions

### Method 2: Right-Click Context Menu
1. Navigate to any webpage
2. Select/highlight text
3. Right-click on the selected text
4. Choose "Analyze for Cyberbullying" from the context menu
5. Click the extension icon to view the loaded text and analyze

### Method 3: Manual Input
1. Click the extension icon
2. Paste or type text directly into the text box
3. Click "Analyze Text" or press Enter

### Theme Toggle
- Click the **🌙 moon icon** (top-right) to switch to dark theme
- Click the **☀️ sun icon** (top-right) to switch to light theme
- Your theme preference is automatically saved

### API Connection Testing
Click the "Test API Connection" button to verify:
- FastAPI server is running
- Model is properly loaded
- Network connectivity is working

## How It Works

1. **Text Capture**: Content script monitors text selection on webpages (mouse, keyboard, click)
2. **Storage**: Selected text is temporarily stored in Chrome's local storage
3. **Analysis**: Popup sends text to your FastAPI backend at `http://localhost:8000/predict`
4. **Results**: Enhanced classification results including:
   - **Label**: Bullying or Non-Bullying
   - **Severity**: Severe, Offensive, Mild, or Safe
   - **Confidence**: Animated progress bar with percentage
   - **Suggestions**: Context-aware recommendations
   - **Explanation**: Key words that influenced the prediction
5. **Theme Persistence**: User's theme preference saved in Chrome storage

## Technical Details

### Files Structure
```
chrome_extension/
├── manifest.json      # Extension configuration (Manifest V3)
├── popup.html         # User interface
├── popup.js           # Popup logic and API communication
├── content.js         # Text selection capture on webpages
├── background.js      # Service worker for background tasks
├── icon16.png         # Extension icon (16x16)
├── icon48.png         # Extension icon (48x48)
└── icon128.png        # Extension icon (128x128)
```

### Permissions Required
- `activeTab`: Access to current webpage for text selection
- `storage`: Temporary storage of selected text and theme preference
- `contextMenus`: Right-click menu integration
- `alarms`: Periodic storage cleanup
- `http://localhost:8000/*`: Access to your FastAPI backend

## Troubleshooting

### Extension Not Working
- Ensure FastAPI server is running: `python fastapi_backend.py`
- Check that server is accessible at `http://localhost:8000`
- Verify extension has proper permissions in Chrome settings

### Text Not Capturing
- Make sure you're selecting text (not just clicking)
- Try refreshing the webpage
- Check Chrome developer console for errors (Ctrl+Shift+J)

### API Connection Issues
- Run the "Test API Connection" button
- Verify FastAPI server logs show no errors
- Check if firewall is blocking localhost connections

## Sample Test Cases

Try these examples in the extension:

**Bullying Examples:**
- "You are so stupid and worthless"
- "I hate you and hope you die"
- "Go away loser"

**Non-Bullying Examples:**
- "Have a great day and stay safe"
- "The weather is beautiful today"
- "Thanks for helping me out"

## Customization

### Change API Endpoint
Modify the `API_BASE_URL` constant in `popup.js`:
```javascript
const API_BASE_URL = 'http://your-server:port';
```

### Modify Appearance
Edit styles in `popup.html`:
- Colors and themes
- Layout and sizing
- Animation effects
- Severity badge colors
- Confidence bar gradients

### Customize Severity Thresholds
In `fastapi_backend.py`, modify the `get_severity_and_suggestion()` function:
```python
if confidence >= 0.85:    # Adjust threshold for "Severe"
if confidence >= 0.70:    # Adjust threshold for "Offensive"
```

## Development Notes

- Built using Manifest V3 (latest Chrome extension standard)
- Uses modern JavaScript with async/await
- Responsive design for different popup sizes
- Error handling for network and API issues
- SVG icons for crisp rendering at any size
- CSS transitions for smooth theme switching
- Chrome Storage API for persistent preferences
- Event-driven architecture for text capture

## UI Features

### Severity Classification
- **Severe** (≥85% confidence): Red badge - Highly offensive content
- **Offensive** (70-84% confidence): Orange badge - Inappropriate language
- **Mild** (<70% confidence for bullying): Yellow badge - Slightly inappropriate
- **Safe** (non-bullying): Green badge - Respectful content

### Confidence Bar
- Animated progress bar with cubic-bezier easing
- Red gradient for bullying content
- Green gradient for non-bullying content
- Displays percentage inside the bar

### Smart Suggestions
- **Severe**: Warning about harmful content
- **Offensive**: Suggestion to rephrase
- **Mild**: Gentle reminder to review wording
- **Safe**: Confirmation that text is appropriate

### Dark Theme
- Complete dark mode with optimized contrast
- All UI elements adapt to theme
- Smooth 0.3s transitions
- Persistent preference across sessions
- Sun/Moon icon toggle button (top-right corner)

## Future Enhancements

- ~~Context menu integration~~ ✅ **COMPLETED**
- ~~Dark mode support~~ ✅ **COMPLETED**
- Batch analysis of multiple text selections
- History of analyzed texts
- Customizable sensitivity thresholds
- Export analysis reports
- Multi-language support
- Real-time page scanning mode