const DEFAULT_API_URL = 'http://localhost:3000';

function getDashboardUrl(baseUrl) {
    return (baseUrl || DEFAULT_API_URL) + '/soc';
}

async function getApiBaseUrl() {
    return new Promise((resolve) => {
        try {
            chrome.storage.local.get(['apiBaseUrl'], (result) => {
                resolve(result.apiBaseUrl || '');
            });
        } catch (e) {
            resolve('');
        }
    });
}

async function saveApiBaseUrl(url) {
    const clean = (url || '').trim().replace(/\/$/, '');
    return new Promise((resolve) => {
        try {
            chrome.storage.local.set({ apiBaseUrl: clean }, () => {
                resolve(clean);
            });
        } catch (e) {
            resolve(clean);
        }
    });
}

async function testApiUrl(baseUrl) {
    try {
        const response = await fetch(baseUrl + '/api/scan', {
            method: 'OPTIONS',
            signal: AbortSignal.timeout(8000)
        });
        return response.ok;
    } catch (e) {
        return false;
    }
}

function setStatus(msg, isError) {
    const el = document.getElementById('configStatus');
    el.textContent = msg;
    el.className = 'config-status ' + (isError ? 'status-err' : 'status-ok');
}

function setSystemStatus(msg, isError) {
    const el = document.getElementById('systemStatus');
    if (!el) return;
    const color = isError ? '#ef4444' : '#22c55e';
    el.innerHTML = `<div class="pulse" style="background:${color};box-shadow:0 0 0 0 ${color}80"></div> ${msg}`;
}

async function initPopup() {
    const savedUrl = await getApiBaseUrl();
    document.getElementById('apiUrl').value = savedUrl;

    if (savedUrl) {
        const ok = await testApiUrl(savedUrl);
        if (ok) {
            setStatus('Connected: API reachable');
            setSystemStatus('API Connected', false);
        } else {
            setStatus('Error: API unreachable at saved URL', true);
            setSystemStatus('API Unreachable', true);
        }
    } else {
        setStatus('Not configured. Enter your deployed app URL above.');
        setSystemStatus('No API Configured', true);
    }
}

document.getElementById('saveUrl').addEventListener('click', async () => {
    const raw = document.getElementById('apiUrl').value.trim();
    if (!raw) {
        setStatus('Please enter a URL', true);
        return;
    }
    let url = raw;
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }
    setStatus('Testing...');
    const ok = await testApiUrl(url);
    if (ok) {
        await saveApiBaseUrl(url);
        setStatus('Saved & connected!');
        setSystemStatus('API Connected', false);
    } else {
        await saveApiBaseUrl(url);
        setStatus('Saved but API not reachable. Check URL & CORS.', true);
        setSystemStatus('API Unreachable', true);
    }
});

document.getElementById('checkNow').addEventListener('click', async () => {
    const savedUrl = await getApiBaseUrl();
    chrome.tabs.create({ url: getDashboardUrl(savedUrl) });
});

initPopup();
