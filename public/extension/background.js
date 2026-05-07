/**
 * Sentinel Prime Background Service Worker (MV3)
 * Handles cross-origin image fetching to bypass CSP and CORS restrictions.
 */

chrome.runtime.onInstalled.addListener((details) => {
    console.log(`[Sentinel Background] Extension ${details.reason} complete.`);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetch_image') {
        fetchImageAsBase64(request.url)
            .then(data => sendResponse({ success: true, data }))
            .catch(error => {
                console.error('[Sentinel Background] fetch_image error:', error?.message || error);
                sendResponse({ success: false, error: error?.message || 'Unknown error' });
            });
        return true; // Keep channel open for async response
    }

    if (request.action === 'ping') {
        sendResponse({ success: true, version: chrome.runtime.getManifest().version });
        return false;
    }
});

async function fetchImageAsBase64(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        const isGoogle = url.includes('google.com') || url.includes('googleusercontent.com');
        const response = await fetch(url, {
            credentials: isGoogle ? 'include' : 'omit',
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} for ${url.substring(0, 80)}`);
        }

        const blob = await response.blob();
        if (!blob.type || !blob.type.startsWith('image/')) {
            throw new Error(`Fetched content is not an image. Type: ${blob.type}`);
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('FileReader failed'));
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        clearTimeout(timeoutId);
        console.error('[Sentinel Background] Fetch failed:', e?.message || e);
        throw e;
    }
}
