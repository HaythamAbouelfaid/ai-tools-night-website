/* 
  sheets.js - Google Sheets Integration 
  
  IMPORTANT: You must replace the checks below with your actual Google Apps Script Web App URL.
  See README.md for deployment instructions.
*/

// ============================================================================
// CONFIGURATION - API ROUTE URL
// ============================================================================
const SHEET_API_URL = "/api/submit";


// ============================================================================
// FORM HANDLING LOGIC
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {

    // Check for Member Form (index.html)
    const memberForm = document.getElementById('member-form');
    if (memberForm) {
        setupForm(memberForm, 'member');
    }

    // Check for Hackathon Form (hackathon.html)
    const hackathonForm = document.getElementById('hackathon-form');
    if (hackathonForm) {
        setupForm(hackathonForm, 'hackathon');
    }

    // Check for Careers Form (careers.html)
    const careersForm = document.getElementById('careers-form');
    if (careersForm) {
        setupForm(careersForm, 'careers');
    }

    // Setup Copy Button
    const copyBtns = document.querySelectorAll('#copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const code = document.getElementById('secret-code-display').innerText;
            navigator.clipboard.writeText(code).then(() => {
                const originalText = btn.innerText;
                btn.innerText = "Copied!";
                setTimeout(() => btn.innerText = originalText, 2000);
            });
        });
    });
});

/**
 * Attaches submit handler to a form
 * @param {HTMLFormElement} formElement 
 * @param {string} formType - 'member' or 'hackathon'
 */
function setupForm(formElement, formType) {
    formElement.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. UI State: Loading
        const btn = formElement.querySelector('button[type="submit"]');
        const originalBtnText = btn.querySelector('span').innerText;
        const spinner = btn.querySelector('.spinner');
        const errorMessage = document.getElementById('error-message');

        btn.disabled = true;
        btn.style.opacity = '0.7';
        btn.querySelector('span').innerText = "Sending...";
        if (spinner) spinner.style.display = 'inline-block';
        if (errorMessage) errorMessage.classList.add('hidden');

        // 2. Collect Data
        const formData = new FormData(formElement);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Add metadata
        data.formType = formType;
        data.timestamp = new Date().toISOString();

        try {
            // 3. Send Data
            // Note: 'no-cors' mode is often required for Google Apps Script simple POSTs from client-side
            // However, 'no-cors' means we can't read the response JSON.
            // If you want to read response, you must use a standard CORS setup in Apps Script (ContentService).
            // We'll assume the provided Apps Script pattern returns JSONP or JSON with CORS headers.

            // Standard fetch call for our Express JSON API
            const response = await fetch(SHEET_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error("API Response Error");
            }

            // 4. UI State: Success
            formElement.style.display = 'none'; // Hide form
            const successPanel = document.getElementById('success-message');
            if (successPanel) successPanel.classList.remove('hidden');
            if (successPanel) successPanel.style.display = 'block';

            // Scroll to success message
            successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });

        } catch (error) {
            console.error("Submission Error:", error);

            // 5. UI State: Error
            if (errorMessage) {
                errorMessage.classList.remove('hidden');
                errorMessage.innerText = "Network error. Please try again later.";
            }

            // Reset button
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.querySelector('span').innerText = originalBtnText;
            if (spinner) spinner.style.display = 'none';
        }
    });
}
