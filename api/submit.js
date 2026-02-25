const crypto = require('crypto');

const EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
let PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY || '';
const SHEET_ID = process.env.GOOGLE_SHEET_ID || '';

if (PRIVATE_KEY && PRIVATE_KEY.startsWith('"') && PRIVATE_KEY.endsWith('"')) {
    PRIVATE_KEY = PRIVATE_KEY.slice(1, -1).replace(/\\n/g, '\n');
} else {
    PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
}

function base64UrlEncode(str) {
    return Buffer.from(str).toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

async function getAccessToken() {
    const header = JSON.stringify({ alg: 'RS256', typ: 'JWT' });
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600;

    const claimSet = JSON.stringify({
        iss: EMAIL,
        scope: "https://www.googleapis.com/auth/spreadsheets",
        aud: "https://oauth2.googleapis.com/token",
        exp,
        iat
    });

    const signatureInput = `${base64UrlEncode(header)}.${base64UrlEncode(claimSet)}`;

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signatureInput);
    const signature = sign.sign(PRIVATE_KEY, 'base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    const jwt = `${signatureInput}.${signature}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt
        })
    });

    if (!res.ok) throw new Error(await res.text());
    return (await res.json()).access_token;
}

module.exports = async function (req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        const rawDate = data.timestamp ? new Date(data.timestamp) : new Date();
        const readableDate = `${rawDate.getMonth() + 1}/${rawDate.getDate()}/${rawDate.getFullYear()}`;

        let values = [];
        let actualSheetName = '';

        if (data.formType === 'hackathon') {
            values = [
                readableDate,
                data.fullName || '',
                data.project || '',
                data.linkedin || '',
                data.phone || '',
                data.presenting || '',
                data.tools || '',
                data.favoriteLLM || ''
            ];
            actualSheetName = 'Hackathon Form';
        } else if (data.formType === 'member') {
            values = [
                readableDate,
                data.fullName || '',
                data.email || '',
                data.ageRange || '',
                data.role || '',
                data.school || '',
                data.linkedin || '',
                data.source || '',
                data.notes || ''
            ];
            actualSheetName = 'Main Form';
        } else if (data.formType === 'careers') {
            values = [
                readableDate,
                data.role || '',
                data.full_name || '',
                data.email || '',
                data.tools_used || '',
                data.project_description || '',
                data.working_style || '',
                data.links || '',
                data.location_timezone || ''
            ];
            actualSheetName = 'AI Tools Night - Applications';
        } else {
            throw new Error("Invalid formType");
        }

        const token = await getAccessToken();

        const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(actualSheetName)}!A1:append?valueInputOption=USER_ENTERED`;
        const sheetRes = await fetch(sheetUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ values: [values] })
        });

        if (!sheetRes.ok) throw new Error(await sheetRes.text());

        return res.status(200).json({ success: true, message: "Added to Google Sheets properly." });

    } catch (err) {
        console.error("Error writing data to Google Sheets:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
