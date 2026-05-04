/**
 * Steg-Detector Library
 * Port of core heuristics from StegExpose (Java) to TypeScript
 * Detects LSB steganography using statistical analysis.
 */

export interface StegoAnalysisResult {
    suspicious: boolean;
    chiSquareProbability: number;
    spaEmbeddingRate: number;
    rsEmbeddingRate: number;
    bitCycleAnomaly: {
        detected: boolean;
        periodicity: number;
    };
    noiseFingerprint: {
        suspicious: boolean;
        varianceSpread: number;
    };
    lbpAnomaly?: {
        detected: boolean;
        variance: number;
    };
    verifiedPayload?: string;
    reasons: string[];
}

export function chiSquareAttack(pixelData: number[] | Uint8Array): number {
    if (pixelData.length === 0) return 0;
    const limit = Math.min(pixelData.length, 1000000);
    const frequencies = new Array(256).fill(0);
    for (let i = 0; i < limit; i++) frequencies[pixelData[i]]++;
    let chiSquareSum = 0;
    let df = 0;
    for (let i = 0; i < 128; i++) {
        const obs1 = frequencies[2 * i];
        const obs2 = frequencies[2 * i + 1];
        const totalPoV = obs1 + obs2;
        if (totalPoV > 10) {
            const expected = totalPoV / 2;
            chiSquareSum += Math.pow(obs1 - expected, 2) / expected;
            df++;
        }
    }
    if (df === 0) return 0;
    const x = chiSquareSum / 2;
    const k = df / 2;
    let sum = 1.0;
    let term = 1.0;
    for (let i = 1; i < k; i++) {
        term *= x / i;
        sum += term;
    }
    // Survival function: probability that a random distribution would be MORE unequal than this.
    // If chiSquareSum is small (equal frequencies), pValue is high (near 1.0).
    const pValue = Math.exp(-x) * sum;
    return Math.max(0, Math.min(1, pValue));
}

export function samplePairAnalysis(pixelData: number[] | Uint8Array): number {
    if (pixelData.length < 128) return 0;
    const limit = Math.min(pixelData.length - 1, 1000000);
    let r0 = 0, s0 = 0, r1 = 0, s1 = 0;
    for (let i = 0; i < limit; i += 2) {
        const u = pixelData[i];
        const v = pixelData[i + 1];
        const isX = (v % 2 === 0 && u < v) || (v % 2 !== 0 && u > v);
        const isY = (v % 2 === 0 && u > v) || (v % 2 !== 0 && u < v);
        if (isX) r0++;
        if (isY) s0++;
        if (u % 2 === v % 2) r1++; else s1++;
    }
    const a = 2 * (r1 + s1);
    const b = (s0 - r0) - (2 * r1 + s1);
    const c = r0 - s0;
    if (Math.abs(a) < 0.001) return 0;
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return 0;
    const p1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const p2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    const results = [p1, p2].filter(v => v > 0 && v <= 0.5); // Capped at 0.5 for realistic LSB
    const p = results.length > 0 ? Math.min(...results) : 0;
    
    // Homogeneity check: if the image is too smooth, SPA is unreliable.
    if ((r0 + s0) < (r1 + s1) * 0.1) return 0;
    return p;
}

export function rsAnalysis(pixelData: number[] | Uint8Array): number {
    if (pixelData.length < 256) return 0;
    const flip = (x: number) => (x % 2 === 0 ? x + 1 : x - 1);
    const invert = (x: number) => (x === 255 ? 254 : (x === 0 ? 1 : (x % 2 === 0 ? x - 1 : x + 1)));

    let Rm = 0, Sm = 0, R_m = 0, S_m = 0;
    const groupSize = 4;
    const limit = Math.min(pixelData.length - groupSize, 1000000);
    for (let i = 0; i <= limit; i += groupSize) {
        const p0 = pixelData[i];
        const p1 = pixelData[i + 1];
        const p2 = pixelData[i + 2];
        const p3 = pixelData[i + 3];

        const f0 = Math.abs(p0 - p1) + Math.abs(p1 - p2) + Math.abs(p2 - p3);
        
        const m_p1 = flip(p1);
        const m_p2 = flip(p2);
        const fm = Math.abs(p0 - m_p1) + Math.abs(m_p1 - m_p2) + Math.abs(m_p2 - p3);
        if (fm > f0) Rm++; else if (fm < f0) Sm++;

        const im_p1 = invert(p1);
        const im_p2 = invert(p2);
        const f_m = Math.abs(p0 - im_p1) + Math.abs(im_p1 - im_p2) + Math.abs(im_p2 - p3);
        if (f_m > f0) R_m++; else if (f_m < f0) S_m++;
    }
    const n = Math.floor((limit + groupSize) / groupSize);
    const d0 = (Rm - Sm) / n;
    const d1 = (R_m - S_m) / n;
    // Homogeneity check for RS: discard if groups are too uniform or too noisy
    if (Math.abs(d0) < 0.001 && Math.abs(d1) < 0.001) return 0;
    const z = d1 - d0;
    if (Math.abs(z) < 0.001) return 0;
    const rate = Math.abs(d0 / z);
    return Math.max(0, Math.min(0.5, rate));
}


export function analyzeBitCycle(pixelData: number[] | Uint8Array): { detected: boolean; periodicity: number } {
    const limit = Math.min(pixelData.length, 500000);
    const maxLag = 32;
    const correlations: number[] = [];
    for (let lag = 1; lag <= maxLag; lag++) {
        let matches = 0;
        let trials = 0;
        for (let i = 0; i < limit - lag; i++) {
            if ((pixelData[i] & 1) === (pixelData[i + lag] & 1)) matches++;
            trials++;
        }
        correlations.push(matches / trials);
    }
    let maxCorr = 0, period = 0;
    for (let i = 0; i < correlations.length; i++) {
        if (correlations[i] > maxCorr) { maxCorr = correlations[i]; period = i + 1; }
    }
    // Reverted threshold to 0.85 to avoid false positives on safe images
    return { detected: maxCorr > 0.85, periodicity: period };
}

export function analyzeNoiseFingerprint(pixelData: number[] | Uint8Array): { suspicious: boolean; varianceSpread: number } {
    if (pixelData.length < 4096) return { suspicious: false, varianceSpread: 0 };
    const blockSize = 1024;
    const variances: number[] = [];
    for (let i = 0; i < pixelData.length; i += blockSize) {
        const block = Array.from(pixelData.slice(i, i + blockSize));
        const lsb = block.map(p => p & 1);
        const mean = lsb.reduce((a: number, b: number) => a + b, 0) / lsb.length;
        const variance = lsb.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) / lsb.length;
        variances.push(variance);
    }
    const max = Math.max(...variances), min = Math.min(...variances);
    const spread = max - min;
    // Increased thresholds to avoid false positives on safe images
    return { suspicious: spread > 0.35 && max > 0.40, varianceSpread: spread };
}

/**
 * Local Binary Pattern (LBP) variance analysis.
 * Detects unnatural texture smoothing or noise injection in local neighborhoods.
 */
export function analyzeLBP(pixelData: number[] | Uint8Array): { detected: boolean; variance: number } {
    if (pixelData.length < 1000) return { detected: false, variance: 0 };
    const limit = Math.min(pixelData.length - 1, 1000000);
    const freq = new Array(4).fill(0);
    
    // Simple 1D LBP as proxy for 2D
    for (let i = 1; i < limit; i++) {
        let pattern = 0;
        if (pixelData[i-1] >= pixelData[i]) pattern |= 1;
        if (pixelData[i+1] >= pixelData[i]) pattern |= 2;
        freq[pattern]++;
    }

    const mean = (limit - 1) / 4;
    const variance = freq.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / (limit - 1);
    
    // Natural images have high LBP variance. Stego embedding makes LBP more uniform.
    return { detected: variance < 0.1, variance };
}

/**
 * Attempts to extract a payload from LSBs.
 * Checks for valid UTF-8 strings or common file magic bytes.
 */
export function extractLSBPayload(pixelData: number[] | Uint8Array): string | undefined {
    if (pixelData.length < 64) return undefined;
    
    const bits: number[] = [];
    for (let i = 0; i < Math.min(pixelData.length, 8000); i++) {
        bits.push(pixelData[i] & 1);
    }

    const bytes = new Uint8Array(Math.floor(bits.length / 8));
    for (let i = 0; i < bytes.length; i++) {
        let byte = 0;
        for (let j = 0; j < 8; j++) {
            byte = (byte << 1) | bits[i * 8 + j];
        }
        bytes[i] = byte;
    }

    // Check for common magic bytes
    const magic = [
        { name: 'ZIP/DOCX', bytes: [0x50, 0x4B, 0x03, 0x04] },
        { name: 'PNG', bytes: [0x89, 0x50, 0x4E, 0x47] },
        { name: 'PDF', bytes: [0x25, 0x50, 0x44, 0x46] },
    ];

    for (const m of magic) {
        let match = true;
        for (let i = 0; i < m.bytes.length; i++) {
            if (bytes[i] !== m.bytes[i]) {
                match = false;
                break;
            }
        }
        if (match) return `EXTRACTED_FILE_HEADER (${m.name})`;
    }

    // Check if it's a readable ASCII string
    let content = '';
    for (const b of bytes) {
        if ((b >= 32 && b <= 126) || b === 10 || b === 13) {
            content += String.fromCharCode(b);
        } else if (b === 0 && content.length > 8) {
            // Found a null terminator after a decent string
            break;
        } else if (content.length > 8) {
            // Non-printable char after a decent string - probably end of payload
            break;
        } else {
            // Not a readable sequence yet
            content = '';
        }
    }

    // Require at least 20 consecutive printable characters to avoid accidental noise triggers
    if (content.length > 20) {
        // Double check: if it's just the same character repeated, it's likely noise
        const uniqueChars = new Set(content).size;
        if (uniqueChars > 3) {
            return `EXTRACTED_TEXT_PAYLOAD: "${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"`;
        }
    }

    return undefined;
}

export function analyzeStego(pixelData: number[] | Uint8Array): StegoAnalysisResult {
    const prob = chiSquareAttack(pixelData);
    const rate_spa = samplePairAnalysis(pixelData);
    const rate_rs = rsAnalysis(pixelData);
    const bitCycle = analyzeBitCycle(pixelData);
    const noisePrint = analyzeNoiseFingerprint(pixelData);
    const lbp = analyzeLBP(pixelData);
    const payload = extractLSBPayload(pixelData);
    
    const reasons: string[] = [];
    if (prob > 0.95) reasons.push('chi_square_anomaly_detected');
    if (rate_spa > 0.15) reasons.push('lsb_embedding_detected (spa)');
    if (rate_rs > 0.15) reasons.push('lsb_embedding_detected (rs)');
    if (bitCycle.detected) reasons.push(`periodic_lsb_pattern_detected (period: ${bitCycle.periodicity})`);
    if (noisePrint.suspicious) reasons.push('noise_floor_inconsistency_detected');
    if (lbp.detected) reasons.push('lbp_texture_anomaly_detected');
    if (payload) reasons.push('VERIFIED_HIDDEN_PAYLOAD_EXTRACTED');

    const isSuspicious =
        (payload !== undefined) ||
        (prob > 0.999) || // Increased from 0.99
        (prob > 0.95 && (rate_rs > 0.25 || rate_spa > 0.25)) || // Tightened
        (rate_rs > 0.35 && rate_spa > 0.30) || // Tightened
        (rate_rs > 0.45) ||
        (bitCycle.detected && prob > 0.90) ||
        (lbp.detected && prob > 0.85) || // LBP alone is not enough for suspicion
        noisePrint.suspicious;
        
    return { 
        suspicious: isSuspicious, 
        chiSquareProbability: prob, 
        spaEmbeddingRate: rate_spa, 
        rsEmbeddingRate: rate_rs, 
        bitCycleAnomaly: bitCycle, 
        noiseFingerprint: noisePrint, 
        lbpAnomaly: lbp,
        verifiedPayload: payload,
        reasons 
    };
}

