async function sendRequest(action) {
    const response = await fetch(`/${action}`, {
        method: 'POST'
    });
    const message = await response.text();
    alert(message);
}

async function fetchSystemInfo() {
    const response = await fetch('/system-info');
    const systemInfo = await response.json();
    document.getElementById('hostname').textContent = systemInfo.hostname;
    document.getElementById('platform').textContent = systemInfo.platform;
    document.getElementById('release').textContent = systemInfo.release;
    document.getElementById('uptime').textContent = systemInfo.uptime + ' seconds';
    document.getElementById('totalmem').textContent = (systemInfo.totalmem / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    document.getElementById('freemem').textContent = (systemInfo.freemem / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function startUpdatingSystemInfo() {
    fetchSystemInfo();
    setInterval(fetchSystemInfo, 5000); // Update every 5 seconds
}

window.onload = startUpdatingSystemInfo;

// Logout function
function logout() {
    window.location.href = '/logout';
}
