# AI Tools Explorers Night - Website

A modern, static website for the "AI Tools Explorers Night" meetup event.
Built with HTML, CSS, and Vanilla JavaScript.
Integrates with Google Sheets for form submissions via Google Apps Script.

## 🚀 Quick Start

1.  **Clone the repo**
2.  **Open `index.html`** in your browser to view the site.
3.  **Deploy** to Netlify, Vercel, or GitHub Pages.

## 🛠️ Google Sheets Integration (REQUIRED)

To make the forms work, you must set up a Google Apps Script Web App.

### Step 1: Create the Sheet
1.  Go to [Google Sheets](https://sheets.new).
2.  Name it `AI Meetup Responses`.
3.  Rename the first tab to `Members`.
4.  Create a second tab named `Hackathon`.
5.  Add headers to row 1 of BOTH tabs:
    - **Members**: `timestamp`, `fullName`, `email`, `ageRange`, `role`, `school`, `linkedin`, `source`, `notes`
    - **Hackathon**: `timestamp`, `fullName`, `project`, `phone`, `presenting`, `tools`, `favoriteLLM`

### Step 2: Create the Script
1.  In the Sheet, go to **Extensions > Apps Script**.
2.  Delete any code in `Code.gs` and paste the following:

```javascript
/* 
  Apps Script for AI Tools Night Forms 
  Handles POST requests and appends to specific sheets.
*/

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const data = JSON.parse(e.postData.contents);
    
    // Determine target sheet
    let sheetName = "Members"; // Default
    if (data.formType === "hackathon") {
      sheetName = "Hackathon";
    }
    
    const sheet = doc.getSheetByName(sheetName);
    
    // Create row data based on form type
    let row = [];
    const timestamp = new Date();
    
    if (sheetName === "Members") {
      row = [
        timestamp,
        data.fullName,
        data.email,
        data.ageRange,
        data.role,
        data.school,
        data.linkedin,
        data.source,
        data.notes
      ];
    } else {
      row = [
        timestamp,
        data.fullName,
        data.project,
        data.phone,
        data.presenting,
        data.tools,
        data.favoriteLLM
      ];
    }

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success", "row": row }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": e }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

### Step 3: Deploy as Web App (CRITICAL)
1.  Click **Deploy** (blue button) > **New deployment**.
2.  Select type: **Web app**.
3.  Description: `v1`.
4.  Execute as: **Me** (your email).
5.  Who has access: **Anyone** (IMPORTANT: This allows the form to work without login).
6.  Click **Deploy**.
7.  **Copy the Web App URL** (starts with `https://script.google.com/macros/s/...`).

### Step 4: Update Frontend Code
1.  Open `js/sheets.js` in your code editor.
2.  Find the line: `const SHEET_API_URL = "..."`
3.  Paste your copied Web App URL inside the quotes.
4.  Save the file.

## 🎨 Customizing Design
- **Theme**: Edit `css/styles.css` root variables to change colors.
- **Content**: Update HTML files directly.
- **Images**: Replace files in `assets/` with your own.

## 📂 Project Structure
```
/assets        # Images & Logos
/css
  styles.css   # Main stylesheet (Dark Mode / Glassmorphism)
/js
  main.js      # Mobile menu & animations
  sheets.js    # Form submission logic
index.html     # Check-in Form + Landing
hackathon.html # Hackathon Invite Form
about.html     # About Page
success.html   # Fallback Success Page
```
