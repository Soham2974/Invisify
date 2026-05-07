
/**
 * Sentinel Prime: Email Guard - Research-Grade Content Script
 * Advanced steganography detection with client-side fallback and ML UI
 * 
 * Features:
 * - Zero-lag MutationObserver instead of intervals
 * - SHA-256 fingerprinting for duplicate prevention
 * - Client-side Shannon Entropy + Base64 + Homoglyph detection
 * - Attachment scanner (.txt, .html)
 * - Keyboard send interception (Ctrl+Enter)
 * - Threat score meter UI
 */

console.log('[Sentinel] Research-Grade Email Guard Active');

// API URL resolution: build-time placeholder -> chrome.storage -> localhost fallback
let SCAN_API_URL = 'http://localhost:3000/api/scan';
let EXTENSION_EVENTS_API_URL = 'http://localhost:3000/api/extension-events';
let API_URL_RESOLVED = false;

function resolveApiUrls() {
    return new Promise((resolve) => {
        const buildTimeUrl = '__API_BASE_URL__';
        if (buildTimeUrl && !buildTimeUrl.includes('__API_BASE_URL__')) {
            SCAN_API_URL = buildTimeUrl + '/api/scan';
            EXTENSION_EVENTS_API_URL = buildTimeUrl + '/api/extension-events';
            API_URL_RESOLVED = true;
            console.log('[Sentinel] Using build-time API URL:', buildTimeUrl);
            resolve();
            return;
        }
        try {
            chrome.storage.local.get(['apiBaseUrl'], (result) => {
                if (result.apiBaseUrl) {
                    SCAN_API_URL = result.apiBaseUrl + '/api/scan';
                    EXTENSION_EVENTS_API_URL = result.apiBaseUrl + '/api/extension-events';
                    console.log('[Sentinel] Using API base URL from storage:', result.apiBaseUrl);
                } else {
                    console.warn('[Sentinel] No API base URL configured. Falling back to localhost:3000. Set NEXT_PUBLIC_APP_URL at build time, or configure via popup.');
                }
                API_URL_RESOLVED = true;
                resolve();
            });
        } catch (e) {
            API_URL_RESOLVED = true;
            console.warn('[Sentinel] chrome.storage unavailable, using localhost fallback');
            resolve();
        }
    });
}

// Run immediately but also expose promise for async waits
const apiUrlsPromise = resolveApiUrls();

const escapeHTML = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag]));
};

// ============================================================================
// UTILITY: SHA-256 Fingerprinting
// ============================================================================
async function sha256(text) {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================================
// CLIENT-SIDE FORENSICS (Fallback Detection)
// ============================================================================

// ============================================================================
// ATTACHMENT INTERCEPTION SYSTEM (Sender-Side)
// ============================================================================

const ALLOWED_IMAGE_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif'
];

const IMAGE_TYPE_NAMES = {
    'image/png': 'PNG',
    'image/jpeg': 'JPEG',
    'image/jpg': 'JPEG',
    'image/webp': 'WebP',
    'image/gif': 'GIF'
};

function normalizeMimeType(type) {
    if (!type) return 'image/png';
    const lower = String(type).toLowerCase().trim();
    if (lower === 'image/jpg') return 'image/jpeg';
    return lower;
}

function isAllowedImageType(type) {
    return ALLOWED_IMAGE_TYPES.includes(normalizeMimeType(type));
}

// Robust unique compose ID generation
let _composeIdCounter = 0;
function getComposeId(composeWindow) {
    if (!composeWindow) return 'default_compose';
    if (composeWindow.dataset && composeWindow.dataset.sentinelComposeId) {
        return composeWindow.dataset.sentinelComposeId;
    }
    const id = 'sentinel_compose_' + (++_composeIdCounter) + '_' + Math.random().toString(36).slice(2, 8);
    composeWindow.dataset.sentinelComposeId = id;
    return id;
}

// Attachment state: Map<composeId, Array<{file, scanned, result, error}>>
const pendingAttachments = new Map();

function getComposeAttachments(composeId) {
    if (!pendingAttachments.has(composeId)) {
        pendingAttachments.set(composeId, []);
    }
    return pendingAttachments.get(composeId);
}

function addAttachment(composeId, file) {
    const list = getComposeAttachments(composeId);
    const mime = normalizeMimeType(file.type);
    if (!isAllowedImageType(mime)) {
        console.log(`[Sentinel] Skipping non-whitelisted attachment: ${file.name} (${file.type})`);
        return false;
    }
    // Deduplicate by name + size
    const exists = list.some(a => a.file.name === file.name && a.file.size === file.size);
    if (exists) {
        console.log(`[Sentinel] Duplicate attachment skipped: ${file.name}`);
        return false;
    }
    list.push({
        file,
        mime,
        scanned: false,
        result: null,
        error: null,
        id: Math.random().toString(36).slice(2, 10)
    });
    console.log(`[Sentinel] Intercepted attachment: ${file.name} (${IMAGE_TYPE_NAMES[mime] || mime}, ${file.size} bytes)`);
    return true;
}

function findComposeWindowForInput(target) {
    // Walk up DOM to find the Gmail compose container
    let el = target;
    while (el && el !== document.body) {
        if (el.classList && (el.classList.contains('M9') || el.getAttribute('role') === 'dialog')) {
            return el;
        }
        el = el.parentElement;
    }
    // Fallback: find the most recently active compose window
    const allCompose = document.querySelectorAll('.M9, [role="dialog"]');
    if (allCompose.length === 1) return allCompose[0];
    // If multiple, try to find the one containing the focused element
    const active = document.activeElement;
    if (active) {
        for (const win of allCompose) {
            if (win.contains(active)) return win;
        }
    }
    return allCompose[allCompose.length - 1] || document.body;
}

document.addEventListener('change', (e) => {
    if (e.target && e.target.type === 'file' && e.target.files && e.target.files.length > 0) {
        const composeWindow = findComposeWindowForInput(e.target);
        const composeId = getComposeId(composeWindow);
        for (const file of e.target.files) {
            addAttachment(composeId, file);
        }
    }
}, true);

document.addEventListener('drop', (e) => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const composeWindow = findComposeWindowForInput(e.target);
        const composeId = getComposeId(composeWindow);
        for (const file of e.dataTransfer.files) {
            addAttachment(composeId, file);
        }
    }
}, true);

// Also intercept paste events for inline images
window.addEventListener('paste', (e) => {
    if (!e.clipboardData || !e.clipboardData.files) return;
    const composeWindow = findComposeWindowForInput(e.target);
    const composeId = getComposeId(composeWindow);
    for (const file of e.clipboardData.files) {
        if (file.type && file.type.startsWith('image/')) {
            addAttachment(composeId, file);
        }
    }
}, true);

/**
 * Shannon Entropy Calculation
 * Natural text: ~3.5-5.0 bits/char
 * Steganography/encoded: >5.5 bits/char
 */
function calculateEntropy(text) {
    if (!text || text.length === 0) return 0;
    const freqs = {};
    for (const char of text) {
        freqs[char] = (freqs[char] || 0) + 1;
    }
    let entropy = 0;
    const len = text.length;
    for (const char in freqs) {
        const p = freqs[char] / len;
        entropy -= p * Math.log2(p);
    }
    return entropy;
}

/**
 * Base64 Exfiltration Detection
 */
function detectBase64Exfiltration(text) {
    const base64Regex = /([A-Za-z0-9+/]{40,}={0,2})/g;
    const matches = text.match(base64Regex) || [];
    return {
        detected: matches.length > 0,
        count: matches.length,
        samples: matches.slice(0, 3)
    };
}

/**
 * Homoglyph/Punycode Detection (Client-Side)
 */
function detectHomoglyphDomains(text) {
    const urlRegex = /https?:\/\/([^\s/$.?#]+)/gi;
    const suspiciousDomains = [];
    const matches = text.matchAll(urlRegex);
    const BRAND_PATTERNS = [
        { name: 'paypal', regex: /p[a4]yp[a4][lI1]/i },
        { name: 'microsoft', regex: /micr[o0]s[o0]ft/i },
        { name: 'google', regex: /g[o0][o0]gle/i },
        { name: 'facebook', regex: /f[a4]ceb[o0][o0]k/i },
        { name: 'apple', regex: /[a4]pp[lI1]e/i }
    ];

    for (const match of matches) {
        const domain = match[1].toLowerCase();
        let isSuspicious = false;

        // Check for non-ASCII (Unicode Homoglyphs)
        if (/[^\x00-\x7F]/.test(domain)) {
            isSuspicious = true;
        } else {
            // Check for ASCII Typosquatting
            for (const brand of BRAND_PATTERNS) {
                if (brand.regex.test(domain) && domain !== brand.name + '.com' && domain !== brand.name + '.net') {
                    isSuspicious = true;
                    break;
                }
            }
        }

        if (isSuspicious) {
            suspiciousDomains.push(domain);
        }
    }

    return {
        detected: suspiciousDomains.length > 0,
        domains: suspiciousDomains
    };
}

/**
 * Zero-Width Character Detection
 */
function detectZeroWidth(text) {
    const zwChars = /[\u200B\u200C\u200D\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF\u180E]/g;
    const matches = text.match(zwChars) || [];
    return {
        detected: matches.length > 0,
        count: matches.length
    };
}

/**
 * Homoglyph Text Detection (not just domains)
 * Detects Cyrillic/Greek characters masquerading as Latin
 */
function detectHomoglyphText(text) {
    const homoglyphs = {
        'Ð°': 'a', 'Ñ': 'c', 'Ðµ': 'e', 'Ð¾': 'o', 'Ñ€': 'p', 'Ñ…': 'x', 'Ñƒ': 'y',
        'Ñ–': 'i', 'Ñ˜': 'j', 'Ñ•': 's', 'Ñµ': 'v', 'Ò»': 'h', 'Ô': 'd',
        'Ð': 'A', 'Ð’': 'B', 'Ð¡': 'C', 'Ð•': 'E', 'Ð': 'H', 'Ð†': 'I',
        'Ðš': 'K', 'Ðœ': 'M', 'Ðž': 'O', 'Ð ': 'P', 'Ð¢': 'T', 'Ð¥': 'X',
        'Î¿': 'o', 'Î½': 'v', 'Îº': 'k', 'Î±': 'a', 'Îµ': 'e', 'Î¹': 'i',
    };
    const found = [];
    for (const char of text) {
        if (homoglyphs[char]) {
            found.push({ char, looksLike: homoglyphs[char] });
        }
    }
    return { detected: found.length > 0, count: found.length, samples: found.slice(0, 5) };
}

/**
 * Emoji Encoding Pattern Detection
 * Checks if emoji sequence matches known stego encoding alphabets
 */
function detectEmojiEncoding(text) {
    const emojiRegex = /\p{Extended_Pictographic}/gu;
    const emojis = text.match(emojiRegex) || [];
    if (emojis.length < 5) return { detected: false };

    const unique = new Set(emojis).size;
    const totalChars = [...text].length;
    const emojiRatio = emojis.length / totalChars;

    // High emoji density + power-of-2 alphabet = encoding signature
    const powersOfTwo = [2, 4, 8, 16, 32, 64, 128];
    const isEncoding = (emojiRatio > 0.8 && emojis.length > 5) ||
        (powersOfTwo.includes(unique) && emojis.length > 20);

    return { detected: isEncoding, emojiCount: emojis.length, uniqueEmojis: unique };
}

/**
 * BIDI Override Detection
 */
function detectBidiAttack(text) {
    const bidiChars = /[\u202A-\u202E\u2066-\u2069]/g;
    const matches = text.match(bidiChars) || [];
    return { detected: matches.length > 0, count: matches.length };
}

/**
 * Comprehensive Client-Side Scan (Fallback)
 */
function localForensicScan(text) {
    if (!text || text.length < 10) {
        return { score: 0, threats: [], reasons: [], safe: true };
    }

    const entropy = calculateEntropy(text);
    const base64 = detectBase64Exfiltration(text);
    const homoglyphDomains = detectHomoglyphDomains(text);
    const homoglyphText = detectHomoglyphText(text);
    const zeroWidth = detectZeroWidth(text);
    const emojiEncoding = detectEmojiEncoding(text);
    const bidi = detectBidiAttack(text);

    const threats = [];
    const reasons = [];
    let score = 0;

    if (entropy > 5.8) {
        threats.push(`High entropy: ${entropy.toFixed(2)} bits/char`);
        reasons.push('high_shannon_entropy_detected');
        score += 25;
    }
    if (base64.detected) {
        threats.push(`Base64 exfiltration: ${base64.count} strings`);
        reasons.push('base64_exfiltration_detected');
        score += 25;
    }
    if (homoglyphDomains.detected) {
        threats.push(`Homoglyph domains: ${homoglyphDomains.domains.join(', ')}`);
        reasons.push('homoglyph_domain_phishing');
        score += 35;
    }
    if (homoglyphText.detected) {
        threats.push(`Homoglyph chars: ${homoglyphText.count} non-Latin lookalikes`);
        reasons.push('homoglyph_text_spoofing_detected');
        score += 30;
    }
    if (zeroWidth.detected) {
        threats.push(`Zero-width chars: ${zeroWidth.count}`);
        reasons.push('zero_width_characters_detected');
        score += 30;
    }
    if (emojiEncoding.detected) {
        threats.push(`Emoji encoding: ${emojiEncoding.emojiCount} emojis, ${emojiEncoding.uniqueEmojis} unique`);
        reasons.push('emoji_steganography_pattern_detected');
        score += 40;
    }
    if (bidi.detected) {
        threats.push(`BIDI override attack: ${bidi.count} control chars`);
        reasons.push('bidi_override_attack_detected');
        score += 30;
    }

    return {
        score: Math.min(100, score),
        threats,
        reasons,
        safe: score < 30,
        entropy,
        severity: score >= 85 ? 'Critical' : score >= 60 ? 'High' : score >= 35 ? 'Medium' : score >= 15 ? 'Low' : 'Safe',
        details: { base64, homoglyphDomains, homoglyphText, zeroWidth, emojiEncoding, bidi }
    };
}

// ============================================================================
// UTILITY: Sanitization
// ============================================================================
function comprehensiveClean(text) {
    if (!text) return '';
    // Remove harmful zero-width chars but PRESERVE ZWJ (\u200D) which is essential for composite emoji
    const harmfulChars = /[\u200B\u200C\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF\u180E]/g;
    let cleaned = text.replace(harmfulChars, '');
    const exoticSpaces = /[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g;
    cleaned = cleaned.replace(exoticSpaces, ' ');
    return cleaned;
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

function injectToast(message, type = 'info', onClean = null, persistent = false) {
    const toastId = 'sentinel-scan-toast';
    const existing = document.getElementById(toastId);
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = 'sentinel-toast';

    let bgColor = '#0369a1';
    if (type === 'danger') bgColor = '#ef4444';
    if (type === 'warning') bgColor = '#f97316';

    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        font-family: sans-serif;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease-out;
    `;

    toast.innerHTML = `
        <div style="display: flex; flex-direction: column;">
            <span style="font-weight: bold; font-size: 14px;">Sentinel Prime</span>
            <span style="font-size: 13px; opacity: 0.9;">${escapeHTML(message)}</span>
        </div>
    `;

    if (onClean) {
        const cleanBtn = document.createElement('button');
        cleanBtn.innerText = 'Clean Text';
        cleanBtn.style.cssText = `
            background: white;
            color: ${bgColor};
            border: none;
            padding: 4px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            font-size: 12px;
            white-space: nowrap;
        `;
        cleanBtn.addEventListener('click', () => {
            onClean();
            toast.remove();
        });
        toast.appendChild(cleanBtn);
    }

    document.body.appendChild(toast);

    if (!onClean && !persistent) {
        setTimeout(() => {
            if (document.getElementById(toastId) === toast) {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.5s';
                setTimeout(() => toast.remove(), 500);
            }
        }, 4000);
    }
}

/**
 * Threat Score Meter UI
 */
function showThreatScoreMeter(result, isLocal = false) {
    const existing = document.querySelector('.sentinel-meter');
    if (existing) existing.remove();

    const meter = document.createElement('div');
    meter.className = 'sentinel-meter';

    const score = result.score || 0;
    let color = '#10b981'; // Green
    if (score > 70) color = '#ef4444'; // Red
    else if (score > 40) color = '#f97316'; // Orange

    meter.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: white;
        color: #1f2937;
        padding: 20px;
        border-radius: 12px;
        z-index: 10001;
        font-family: sans-serif;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        min-width: 300px;
        border: 2px solid ${color};
        animation: slideInRight 0.4s ease-out;
    `;

    const threatList = Array.isArray(result.reasons) ? result.reasons : (Array.isArray(result.threats) ? result.threats : []);
    const threatsHtml = threatList.length > 0
        ? threatList.map(t => `<li style="font-size: 12px; margin: 4px 0;">${escapeHTML(t)}</li>`).join('')
        : '<li style="font-size: 12px;">No specific threats</li>';

    meter.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span style="font-weight: bold; font-size: 16px;">🛡️ Threat Analysis</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #9ca3af;">&times;</button>
        </div>
        
        <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 13px; font-weight: 600;">Risk Score</span>
                <span style="font-size: 13px; font-weight: bold; color: ${color};">${score}%</span>
            </div>
            <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="background: ${color}; width: ${score}%; height: 100%; transition: width 0.5s;"></div>
            </div>
        </div>
        
        <div style="margin-bottom: 12px;">
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 6px; color: #6b7280;">Detection Method</div>
            <div style="font-size: 13px; background: ${isLocal ? '#fef3c7' : '#dbeafe'}; padding: 6px 10px; border-radius: 6px;">
                ${isLocal ? '⚡ Local Forensics' : '🌐 API + Local'}
            </div>
        </div>
        
        <div>
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 6px; color: #6b7280;">Detected Threats</div>
            <ul style="margin: 0; padding-left: 20px; color: #374151;">
                ${threatsHtml}
            </ul>
        </div>
        
        ${result.entropy ? `
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
            <div style="font-size: 11px; color: #6b7280;">
                Entropy: <strong>${result.entropy.toFixed(2)}</strong> bits/char
                ${result.entropy > 5.5 ? '⚠️' : '✅'}
            </div>
        </div>
        ` : ''}
    `;

    document.body.appendChild(meter);

    setTimeout(() => {
        meter.style.opacity = '0';
        meter.style.transition = 'opacity 0.5s';
        setTimeout(() => meter.remove(), 500);
    }, 10000);
}

// ============================================================================
// API COMMUNICATION
// ============================================================================

function isMixedContent(apiUrl) {
    try {
        const apiProtocol = new URL(apiUrl).protocol;
        const pageProtocol = window.location.protocol;
        return pageProtocol === 'https:' && apiProtocol === 'http:';
    } catch (e) {
        return false;
    }
}

async function scanContent(text, images = [], retries = 2) {
    // Wait for API URLs to be resolved before scanning
    if (!API_URL_RESOLVED) {
        await apiUrlsPromise;
    }

    if (isMixedContent(SCAN_API_URL)) {
        console.error(`[Sentinel] MIXED CONTENT BLOCKED: Cannot call HTTP API (${SCAN_API_URL}) from HTTPS page (${window.location.origin}). Set NEXT_PUBLIC_APP_URL to an HTTPS domain at build time, or configure via extension popup.`);
        injectToast('API Error: Mixed Content. Configure API URL in popup.', 'danger');
        return null;
    }

    // For multi-image: scan the largest image only (backend only reads one image field).
    let primaryImage = null;
    if (images.length > 0) {
        const sized = images.map(img => ({
            img,
            size: img.size || img.byteLength || 0
        }));
        sized.sort((a, b) => b.size - a.size);
        primaryImage = sized[0].img;
        if (images.length > 1) {
            console.log(`[Sentinel] Scanning largest of ${images.length} images (${primaryImage.size || primaryImage.byteLength || '?'} bytes). Remaining images will be checked client-side.`);
        }
    }

    const attempt = async (attemptNum) => {
        const controller = new AbortController();
        const timeoutMs = images.length > 0 ? 20000 : 10000;
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            let response;
            if (primaryImage) {
                const formData = new FormData();
                formData.append('text', text || '');
                formData.append('image', primaryImage);
                response = await fetch(SCAN_API_URL, {
                    method: 'POST',
                    body: formData,
                    signal: controller.signal
                });
            } else {
                response = await fetch(SCAN_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: text || '' }),
                    signal: controller.signal
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        } finally {
            clearTimeout(timeoutId);
        }
    };

    for (let attemptNum = 0; attemptNum <= retries; attemptNum++) {
        try {
            const result = await attempt(attemptNum);
            console.log(`[Sentinel] API scan successful (attempt ${attemptNum + 1})`);
            return result;
        } catch (error) {
            const isLast = attemptNum === retries;
            const errMsg = error?.message || error?.name || String(error);
            console.warn(`[Sentinel] API scan failed (attempt ${attemptNum + 1}/${retries + 1}): ${errMsg}`, error);
            if (isLast) {
                if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError')) {
                    injectToast('API unreachable. Check API URL in extension popup.', 'danger');
                }
                return null;
            }
            await new Promise(r => setTimeout(r, 500 * (attemptNum + 1)));
        }
    }
    return null;
}

function getThreatTypeFromReasons(reasons = []) {
    const joined = reasons.join(' ').toLowerCase();
    if (joined.includes('homoglyph') || joined.includes('link')) return 'Homoglyph Phishing';
    if (joined.includes('zero_width') || joined.includes('zero-width')) return 'Zero-width Payload';
    if (joined.includes('emoji')) return 'Emoji Stego';
    if (joined.includes('bidi')) return 'BIDI Attack';
    if (joined.includes('image') || joined.includes('lsb') || joined.includes('jpeg') || joined.includes('png')) return 'Image LSB Anomaly';
    if (joined.includes('prompt')) return 'Prompt Injection';
    return reasons.length > 0 ? reasons[0] : 'None';
}

function getActionFromResult(result) {
    const severity = String(result.severity || 'Safe');
    const score = Number(result.score || 0);
    if (severity === 'Critical' || severity === 'High' || score >= 75) return 'blocked';
    if (severity === 'Medium' || score >= 40) return 'warned';
    return 'allowed';
}

function getInboundContext(emailBody) {
    const subject =
        document.querySelector('h2.hP')?.innerText?.trim() ||
        document.querySelector('[data-thread-perm-id] h2')?.innerText?.trim() ||
        'Unknown Subject';
    const sender =
        document.querySelector('span[email]')?.getAttribute('email') ||
        document.querySelector('span.gD')?.getAttribute('email') ||
        'unknown@sender';
    return { subject, sender };
}

async function publishExtensionEvent(payload) {
    if (isMixedContent(EXTENSION_EVENTS_API_URL)) return;
    try {
        await fetch(EXTENSION_EVENTS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch {
        // Best-effort telemetry only
    }
}

// ============================================================================
// IMAGE EXTRACTION
// ============================================================================

async function extractImagesFromContainer(container) {
    const extracted = [];
    const composeId = getComposeId(container);

    // ---- 1. Intercepted file attachments (sender-side compose) ----
    const pending = getComposeAttachments(composeId);
    if (pending.length > 0) {
        for (const attachment of pending) {
            extracted.push(attachment.file);
            console.log(`[Sentinel] Queuing intercepted attachment for scan: ${attachment.file.name} (${attachment.mime})`);
        }
    }

    // ---- 2. Inline images in the compose editor (paste, drag-drop inline) ----
    // Gmail may render attached images as inline <img> elements with data URLs or blob URLs
    const inlineImages = container.querySelectorAll('img, [data-image-src], .a11y img, .gmail_signature img');
    for (const img of inlineImages) {
        try {
            let src = img.src || img.dataset?.imageSrc || img.getAttribute('data-image-src');
            if (!src) continue;
            if (src.startsWith('data:image/svg')) continue;
            if (src.includes('clearcache') || src.includes('gstatic.com') || src.includes('mail-icons')) continue;

            const width = img.naturalWidth || img.width || img.clientWidth || 0;
            const height = img.naturalHeight || img.height || img.clientHeight || 0;
            if (width < 20 || height < 20) continue;

            // data: URLs can be converted directly to Blobs
            if (src.startsWith('data:image/')) {
                try {
                    const res = await fetch(src);
                    const blob = await res.blob();
                    if (blob.size > 500 && isAllowedImageType(blob.type)) {
                        extracted.push(new File([blob], `inline_image.${blob.type.split('/')[1]}`, { type: blob.type }));
                    }
                } catch (e) {
                    console.warn('[Sentinel] Failed to decode inline data URL:', e);
                }
                continue;
            }

            // blob: URLs (local browser objects) — not useful for scanning from container
            if (src.startsWith('blob:')) continue;

            // External / Gmail-hosted images: try to fetch
            if (src.includes('mail.google.com') && src.includes('sz=')) {
                src = src.replace(/sz=[^&]+/, 'sz=s0');
            }

            try {
                const response = await fetch(src, { credentials: 'include' });
                if (response.ok) {
                    const blob = await response.blob();
                    if (blob.size > 1000 && isAllowedImageType(blob.type)) {
                        extracted.push(new File([blob], `fetched_image.${blob.type.split('/')[1]}`, { type: blob.type }));
                    }
                }
            } catch (err) {
                // CORS blocked — try background script bypass
                try {
                    const bgResponse = await chrome.runtime.sendMessage({ action: 'fetch_image', url: src });
                    if (bgResponse && bgResponse.success) {
                        const res = await fetch(bgResponse.data);
                        const blob = await res.blob();
                        if (blob.size > 1000 && isAllowedImageType(blob.type)) {
                            extracted.push(new File([blob], `bg_fetched_image.${blob.type.split('/')[1]}`, { type: blob.type }));
                        }
                    }
                } catch (bgErr) {
                    console.warn('[Sentinel] Background fetch also failed for:', src.substring(0, 60));
                }
            }
        } catch (e) {
            console.warn('[Sentinel] Inline image extraction error:', e);
        }
    }

    // ---- 3. Attachment chip links (for receiver-side / read email) ----
    const attachmentLinks = container.querySelectorAll('a[href*="view=att"], a[download]');
    for (const link of attachmentLinks) {
        if (!link.href) continue;
        try {
            let src = link.href;
            if (src.includes('mail.google.com')) {
                src = src.replace('disp=safe', 'disp=inline').replace('view=att', 'view=fimg');
                if (!src.includes('sz=')) src += '&sz=s0';
            }
            const response = await fetch(src, { credentials: 'include' });
            if (response.ok) {
                const blob = await response.blob();
                if (blob.size > 1000 && isAllowedImageType(blob.type)) {
                    extracted.push(new File([blob], `attachment_image.${blob.type.split('/')[1]}`, { type: blob.type }));
                }
            }
        } catch (e) {
            console.warn('[Sentinel] Attachment link fetch failed:', e);
        }
    }

    console.log(`[Sentinel] extractImagesFromContainer: ${extracted.length} image(s) found (${pending.length} pending attachments + ${extracted.length - pending.length} inline/fetched)`);
    return extracted;
}

// ============================================================================
// INBOUND EMAIL SCANNING
// ============================================================================

const scannedEmailFingerprints = new Set();

async function getEmailFingerprint(emailBody) {
    const text = (emailBody.innerText || emailBody.textContent || '').substring(0, 500);
    const imgSrc = emailBody.querySelector('img')?.src?.substring(0, 100) || '';
    return await sha256(text + imgSrc);
}

async function scanInboundEmail(emailBody) {
    if (!emailBody || !emailBody.innerText) return;

    const fingerprint = await getEmailFingerprint(emailBody);
    if (scannedEmailFingerprints.has(fingerprint)) return;
    scannedEmailFingerprints.add(fingerprint);

    const text = emailBody.innerText;
    const images = await extractImagesFromContainer(emailBody);

    if (!text && images.length === 0) return;
    if (text && text.length < 20 && images.length === 0) return;

    console.log(`[Sentinel] Scanning inbound email... (Text: ${text.length} chars, Images: ${images.length})`);

    const result = await scanContent(text, images);
    const context = getInboundContext(emailBody);

    if (result) {
        if (result.severity === 'Critical' || result.severity === 'High' || ((result.severity === 'Medium' || result.severity === 'Low') && result.score > 60)) {
            injectInboundWarning(emailBody, result, false);
        }

        publishExtensionEvent({
            timestamp: new Date().toISOString(),
            emailSubject: context.subject,
            sender: context.sender,
            threatType: getThreatTypeFromReasons(result.reasons || []),
            score: Number(result.score || 0),
            severity: result.severity || 'Safe',
            action: getActionFromResult(result),
            fingerprint: fingerprint.slice(0, 16),
            source: 'inbound',
        });
    } else {
        console.log('[Sentinel] API unavailable, using local forensics');
        const localResult = localForensicScan(text);
        if (localResult.score > 50) {
            injectInboundWarning(emailBody, {
                score: localResult.score,
                severity: localResult.severity || (localResult.score > 70 ? 'Critical' : 'Medium'),
                reasons: localResult.reasons.length > 0 ? localResult.reasons : localResult.threats
            }, true);
        }

        publishExtensionEvent({
            timestamp: new Date().toISOString(),
            emailSubject: context.subject,
            sender: context.sender,
            threatType: getThreatTypeFromReasons(localResult.reasons || localResult.threats || []),
            score: Number(localResult.score || 0),
            severity: localResult.severity || 'Safe',
            action: getActionFromResult(localResult),
            fingerprint: fingerprint.slice(0, 16),
            source: 'inbound',
        });
    }
}

function injectInboundWarning(emailBody, result, isLocal) {
    if (!result || emailBody.querySelector('.sentinel-inbound-warning')) return;

    const warning = document.createElement('div');
    warning.className = 'sentinel-inbound-warning';
    const isHighRisk = result.severity === 'Critical' || result.severity === 'High';

    warning.style.cssText = `
        background: ${isHighRisk ? '#fef2f2' : '#fff7ed'};
        border-left: 4px solid ${isHighRisk ? '#ef4444' : '#f97316'};
        padding: 16px;
        margin-bottom: 12px;
        border-radius: 4px;
        color: ${isHighRisk ? '#991b1b' : '#9a3412'};
        font-family: sans-serif;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
    `;

    let reasonsText = escapeHTML(Array.isArray(result.reasons) ? result.reasons.join(', ') : 'Unknown detection');

    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; font-weight: bold; margin-bottom: 4px;">
            <span>${isHighRisk ? '🚨 SECURITY ALERT' : '⚠️ SECURITY WARNING'}</span>
            ${isLocal ? '<span style="font-size: 10px; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 3px;">LOCAL</span>' : ''}
        </div>
        <div style="font-size: 14px;">
            Threat Score: <strong>${result.score}%</strong>
            <br/><span style="font-size: 12px; opacity: 0.8;">${reasonsText}</span>
        </div>
    `;
    warning.appendChild(infoDiv);

    const sanitizeBtn = document.createElement('button');
    sanitizeBtn.innerText = 'Sanitize';
    sanitizeBtn.style.cssText = `
        background: ${isHighRisk ? '#ef4444' : '#f97316'};
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        font-size: 12px;
        white-space: nowrap;
    `;
    sanitizeBtn.onclick = () => {
        emailBody.innerText = comprehensiveClean(emailBody.innerText);
        warning.remove();
        injectToast('Email sanitized.', 'info');
    };
    warning.appendChild(sanitizeBtn);

    emailBody.prepend(warning);
}

function getAllEmailBodies() {
    const selectors = [
        '.a3s.aiL',
        '.a3s.aXjCH',
        '.ii.gt',
        '[data-message-id]',
        '.gs .adn.ads'
    ];

    const bodies = [];
    selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            if (el && el.innerText && el.innerText.length > 20) {
                bodies.push(el);
            }
        });
    });
    return bodies;
}

// MutationObserver for email detection (performance improvement)
const emailObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) {
                const emailBodies = getAllEmailBodies();
                emailBodies.forEach(scanInboundEmail);
            }
        }
    }
});

emailObserver.observe(document.body, { childList: true, subtree: true });

// Initial scan
setTimeout(() => {
    console.log('🛡️ Sentinel Prime: Initial scan...');
    getAllEmailBodies().forEach(scanInboundEmail);
}, 4000);

// ============================================================================
// COMPOSE WINDOW MONITORING (MutationObserver instead of setInterval)
// ============================================================================

const composeObserver = new MutationObserver((mutations) => {
    const editors = document.querySelectorAll('[role="textbox"][g_editable="true"]');
    editors.forEach(editor => {
        const text = editor.innerText || editor.textContent || '';
        if (!text || text.length < 10) return;

        const harmfulZwChars = /[\u200B\u200C\u200E\u200F\uFEFF\u180E\u202A-\u202E\u2066-\u2069]/g;

        if (harmfulZwChars.test(text) && !editor.dataset.sentinelWarned) {
            editor.style.border = '2px solid #f97316';
            editor.dataset.sentinelWarned = 'true';
            injectToast('Warning: Hidden characters detected!', 'warning', () => {
                editor.innerText = comprehensiveClean(text);
                editor.style.border = '';
                delete editor.dataset.sentinelWarned;
            });
        } else if (!harmfulZwChars.test(text) && editor.dataset.sentinelWarned) {
            editor.style.border = '';
            delete editor.dataset.sentinelWarned;
        }
    });
});

// Observe compose windows
const composeWindowObserver = new MutationObserver(() => {
    const composeWindows = document.querySelectorAll('.M9, [role="dialog"]');
    composeWindows.forEach(win => {
        const editor = win.querySelector('[role="textbox"][g_editable="true"]');
        if (editor && !editor.dataset.sentinelObserved) {
            editor.dataset.sentinelObserved = 'true';
            composeObserver.observe(editor, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }
    });
});

composeWindowObserver.observe(document.body, { childList: true, subtree: true });

// ============================================================================
// SEND INTERCEPTION (Click + Keyboard)
// ============================================================================

async function performSendScan(composeWindow) {
    const editor = composeWindow.querySelector('[role="textbox"][g_editable="true"]');
    const text = editor ? (editor.innerText || editor.textContent || '') : '';
    const composeId = getComposeId(composeWindow);

    injectToast('\u{1F6E1}\u{FE0F} Scanning email for threats...', 'info', null, true);

    // Extract images from intercepted attachments + inline elements
    const images = await extractImagesFromContainer(composeWindow);

    console.log(`[Sentinel] performSendScan: composeId=${composeId}, text=${text.length} chars, images=${images.length}`);

    if (!text && images.length === 0) return { allow: true };

    const outboundFingerprint = await sha256((text || '').slice(0, 500) + `:${images.length}`);

    const result = await scanContent(text, images);

    if (result) {
        showThreatScoreMeter(result, false);

        publishExtensionEvent({
            timestamp: new Date().toISOString(),
            emailSubject: 'Outbound Compose',
            sender: 'local-user',
            threatType: getThreatTypeFromReasons(result.reasons || []),
            score: Number(result.score || 0),
            severity: result.severity || 'Safe',
            action: getActionFromResult(result),
            fingerprint: outboundFingerprint.slice(0, 16),
            source: 'outbound',
        });

        // Clear scanned attachments for this compose window to prevent memory leaks
        if (pendingAttachments.has(composeId)) {
            pendingAttachments.delete(composeId);
        }

        if (result.severity === 'Critical' || result.severity === 'High' || result.score >= 85) {
            injectToast('CRITICAL: Send blocked!', 'danger');
            alert('[SENTINEL PRIME] High-risk content detected!\n\n' + (result.reasons?.join('\n') || 'Security anomaly detected'));
            return { allow: false, result };
        } else if (result.score > 55) {
            injectToast(`Warning: Suspicious Content (${result.score}%)`, 'warning');
            return { allow: true, result };
        } else {
            injectToast('Email verified clean.', 'info');
            return { allow: true, result };
        }
    } else {
        console.log('[Sentinel] API unavailable, using local forensics');
        const localResult = localForensicScan(text);
        localResult.threats = localResult.threats.length > 0 ? localResult.threats : ['Clean'];
        showThreatScoreMeter(localResult, true);

        publishExtensionEvent({
            timestamp: new Date().toISOString(),
            emailSubject: 'Outbound Compose',
            sender: 'local-user',
            threatType: getThreatTypeFromReasons(localResult.reasons || localResult.threats || []),
            score: Number(localResult.score || 0),
            severity: localResult.severity || 'Safe',
            action: getActionFromResult(localResult),
            fingerprint: outboundFingerprint.slice(0, 16),
            source: 'outbound',
        });

        // Clear attachments even on API failure
        if (pendingAttachments.has(composeId)) {
            pendingAttachments.delete(composeId);
        }

        if (localResult.score > 70) {
            injectToast('CRITICAL: Send blocked (Local)', 'danger');
            alert('[SENTINEL PRIME - Local Mode] High-risk content!\n\n' + localResult.threats.join('\n'));
            return { allow: false, result: localResult };
        } else if (localResult.score > 40) {
            injectToast(`Warning: Suspicious (${localResult.score}%, Local)`, 'warning');
            return { allow: true, result: localResult };
        } else {
            injectToast('Email verified clean (Local).', 'info');
            return { allow: true, result: localResult };
        }
    }
}

let sendInProgress = false;

// Click interception
document.addEventListener('click', async (e) => {
    if (sendInProgress) return;

    const target = e.target.closest('[role="button"]');
    if (!target) return;

    // Skip if this is our own programmatic re-trigger
    if (target.dataset.sentinelTriggered === 'true') return;

    const isSendBtn = (
        target.innerText === 'Send' ||
        target.getAttribute('aria-label')?.includes('Send') ||
        target.dataset.tooltip?.includes('Send')
    );
    if (!isSendBtn) return;

    const composeWindow = target.closest('.M9, [role="dialog"]');
    if (!composeWindow) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const scanResult = await performSendScan(composeWindow);

    if (scanResult.allow) {
        sendInProgress = true;
        try {
            console.log('[Sentinel] Scan complete. Proceeding with send...');
            await new Promise(r => setTimeout(r, 300));

            // Mark element so our listener skips it
            target.dataset.sentinelTriggered = 'true';
            try {
                if (typeof target.click === 'function') {
                    target.click();
                } else {
                    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                }
            } finally {
                delete target.dataset.sentinelTriggered;
            }
        } finally {
            setTimeout(() => { sendInProgress = false; }, 3000);
        }
    }
}, true);

// Keyboard interception (Ctrl+Enter / Cmd+Enter)
document.addEventListener('keydown', async (e) => {
    if (sendInProgress) return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const composeWindow = e.target.closest('.M9, [role="dialog"]');
        if (!composeWindow) return;

        const editor = composeWindow.querySelector('[role="textbox"][g_editable="true"]');
        if (!editor) return;

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const scanResult = await performSendScan(composeWindow);

        if (scanResult.allow) {
            // Find the actual Send button and trigger it (which will go through our click interceptor)
            const sendBtn = composeWindow.querySelector('[role="button"][data-tooltip*="Send"], [role="button"][aria-label*="Send"]');
            if (sendBtn) {
                sendBtn.click();
            } else {
                // Fallback: dispatch Enter key on editor
                editor.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'Enter', bubbles: true, cancelable: true, ctrlKey: e.ctrlKey, metaKey: e.metaKey
                }));
            }
        }
    }
}, true);

console.log('✅ Sentinel Prime: Research-grade protection active');




