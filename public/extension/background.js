/**
 * Sentinel Prime Background Service Worker
 * Handles cross-origin image fetching to bypass CSP and CORS restrictions.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetch_image') {
        fetchImageAsBase64(request.url)
            .then(data => sendResponse({ success: true, data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response
    }
});

async function fetchImageAsBase64(url) {
    try {
        const isGoogle = url.includes('google.com') || url.includes('googleusercontent.com');
        const response = await fetch(url, { credentials: isGoogle ? 'include' : 'omit' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) {
            throw new Error(`Fetched content is not an image. Type: ${blob.type}`);
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error('[Sentinel Background] Fetch failed:', e);
        throw e;
    }
}
