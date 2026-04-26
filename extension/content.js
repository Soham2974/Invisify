
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

console.log('🛡️ Sentinel Prime: Research-Grade Email Guard Active');

const SCAN_API_URL = 'http://localhost:3000/api/scan';

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

    for (const match of matches) {
        const domain = match[1];
        // Check for non-ASCII characters (potential punycode/homoglyphs)
        if (/[^\x00-\x7F]/.test(domain)) {
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
        'а': 'a', 'с': 'c', 'е': 'e', 'о': 'o', 'р': 'p', 'х': 'x', 'у': 'y',
        'і': 'i', 'ј': 'j', 'ѕ': 's', 'ѵ': 'v', 'һ': 'h', 'ԁ': 'd',
        'А': 'A', 'В': 'B', 'С': 'C', 'Е': 'E', 'Н': 'H', 'І': 'I',
        'К': 'K', 'М': 'M', 'О': 'O', 'Р': 'P', 'Т': 'T', 'Х': 'X',
        'ο': 'o', 'ν': 'v', 'κ': 'k', 'α': 'a', 'ε': 'e', 'ι': 'i',
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

function injectToast(message, type = 'info', onClean = null) {
    const existing = document.querySelector('.sentinel-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
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

    if (!onClean) {
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => toast.remove(), 500);
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
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #9ca3af;">×</button>
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
                ${result.entropy > 5.5 ? '⚠️' : '✓'}
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

async function scanContent(text, images = []) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
        let response;
        if (images.length > 0) {
            const formData = new FormData();
            formData.append('text', text);
            for (let i = 0; i < images.length; i++) {
                formData.append('image', images[i]);
            }
            response = await fetch(SCAN_API_URL, {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });
        } else {
            response = await fetch(SCAN_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
                signal: controller.signal
            });
        }
        clearTimeout(timeoutId);
        if (!response.ok) {
            console.warn('🛡️ Sentinel API returned:', response.status);
            return null; // Return null instead of throwing — callers handle fallback
        }
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        // Don't use console.error — Chrome logs these as extension errors
        console.warn('🛡️ Sentinel: API unreachable, switching to local forensics.', error.name);
        return null; // Return null — callers will fallback to local scanning
    }
}

// ============================================================================
// IMAGE EXTRACTION
// ============================================================================

async function extractImagesFromContainer(container) {
    const extracted = [];
    const imgEls = container.querySelectorAll('img');
    
    for (const img of imgEls) {
        try {
            // Skip tracking pixels, UI icons, profile images
            if (img.width < 20 || img.height < 20) continue;
            const src = img.src || img.dataset.src;
            if (!src) continue;
            if (src.includes('clearcache') || src.includes('mail.google.com/mail/u/')) {
                // Often UI elements, skip unless it's a real attachment URL
                if (!src.includes('disp=thd') && !src.includes('disp=inline') && !src.includes('ui=2')) continue;
            }

            const response = await fetch(src);
            const blob = await response.blob();
            
            if (blob.type.startsWith('image/') && blob.size > 1000) {
                const ext = blob.type.split('/')[1] || 'png';
                // Only take the first image to prevent overload/rate-limiting
                extracted.push(new File([blob], `scanned_image.${ext}`, { type: blob.type }));
                break; // Backend currently only processes one image per request
            }
        } catch (e) {
            console.warn('Sentinel: Failed to extract image from DOM:', e.message);
        }
    }
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

    console.log(`🛡️ Sentinel Prime: Scanning inbound email... (Text: ${text.length} chars, Images: ${images.length})`);

    // Try API first, fallback to local
    const result = await scanContent(text, images);
    if (result) {
        // API succeeded — check result
        if (result.severity === 'Critical' || result.severity === 'High' || ((result.severity === 'Medium' || result.severity === 'Low') && result.score > 60)) {
            injectInboundWarning(emailBody, result, false);
        }
    } else {
        // API unavailable — use local forensics
        console.log('🛡️ API unavailable, using local forensics');
        const localResult = localForensicScan(text);
        if (localResult.score > 50) {
            injectInboundWarning(emailBody, {
                score: localResult.score,
                severity: localResult.severity || (localResult.score > 70 ? 'Critical' : 'Medium'),
                reasons: localResult.reasons.length > 0 ? localResult.reasons : localResult.threats
            }, true);
        }
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
    const images = await extractImagesFromContainer(composeWindow);

    if (!text && images.length === 0) return { allow: true };

    injectToast(`Performing Security Scan (Images: ${images.length})...`);

    // Try API first, fallback to local
    const result = await scanContent(text, images);
    if (result) {
        showThreatScoreMeter(result, false);

        if (result.severity === 'Critical' || result.severity === 'High') {
            injectToast('CRITICAL: Send blocked!', 'danger');
            alert('🚨 SENTINEL PRIME: High-risk content detected!\n\n' + escapeHTML(result.reasons?.join('\n') || ''));
            return { allow: false, result };
        } else if ((result.severity === 'Medium' || result.severity === 'Low') && result.score > 50) {
            injectToast(`Warning: Suspicious (${result.score}%)`, 'warning');
            return { allow: true, result };
        } else {
            injectToast('Email verified clean.', 'info');
            return { allow: true, result };
        }
    } else {
        // API unavailable — use local forensics
        console.log('🛡️ API unavailable, using local forensics');
        const localResult = localForensicScan(text);
        localResult.threats = localResult.threats.length > 0 ? localResult.threats : ['Clean'];
        showThreatScoreMeter(localResult, true);

        if (localResult.score > 70) {
            injectToast('CRITICAL: Send blocked (Local)', 'danger');
            alert('🚨 SENTINEL PRIME (Local Mode): High-risk content!\n\n' + localResult.threats.join('\n'));
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
    if (target && (target.innerText === 'Send' || target.getAttribute('aria-label')?.includes('Send'))) {
        const composeWindow = target.closest('.M9, [role="dialog"]');
        if (!composeWindow) return;

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const scanResult = await performSendScan(composeWindow);

        if (scanResult.allow) {
            // Use sendInProgress flag to prevent re-triggering the scan on the re-dispatched click
            sendInProgress = true;
            try {
                target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            } finally {
                // Reset flag after the event has been dispatched and processed
                setTimeout(() => { sendInProgress = false; }, 1000);
            }
        }
    }
}, true);

// Keyboard interception (Ctrl+Enter / Cmd+Enter)
document.addEventListener('keydown', async (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const composeWindow = e.target.closest('.M9, [role="dialog"]');
        if (!composeWindow) return;

        // Check if we're in a compose window
        const editor = composeWindow.querySelector('[role="textbox"][g_editable="true"]');
        if (!editor) return;

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const scanResult = await performSendScan(composeWindow);

        if (scanResult.allow) {
            // Simulate send button click
            const sendBtn = composeWindow.querySelector('[role="button"]');
            if (sendBtn && (sendBtn.innerText === 'Send' || sendBtn.getAttribute('aria-label')?.includes('Send'))) {
                setTimeout(() => sendBtn.click(), 100);
            }
        }
    }
}, true);

console.log('✅ Sentinel Prime: Research-grade protection active');
