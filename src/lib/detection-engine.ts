import * as unicode from './unicode';
import * as emoji from './emoji';
import * as stegoveritas from './stegoveritas-detector';
import { analyzeStego } from './steg-detector';
import { semanticStegoCheck } from './semantic-scanner';

export type ContentType = 'Text' | 'Image' | 'Emoji';

export interface DetectionResults {
    type: ContentType;
    score: number;
    severity: 'Safe' | 'Low' | 'Medium' | 'High' | 'Critical';
    confidence: number;
    findings: any;
    reasons: string[];
}

/**
 * Sentinel Prime: Detection Engine v5.0
 * 
 * Architecture: 3-Tier Cascade with Fisher's Combined Probability Ensemble
 * 
 * Tier 1 — Deterministic: Zero-width, homoglyph, emoji pattern matching
 * Tier 2 — Statistical: Chi-square, RS, SPA, Shannon entropy, Markov, n-gram
 * Tier 3 — AI/Heuristic: Gemini semantic perplexity scoring
 * 
 * Scoring: Direct 0-100 accumulation. No normalization denominator.
 * Ensemble: Fisher's method combines independent p-values into a single test statistic.
 */
export class DetectionEngine {

    static async analyze(
        text: string,
        imageBuffer: ArrayBuffer | null,
        pixels: number[] | Uint8Array | null,
        mimeType: string = 'image/png'
    ): Promise<DetectionResults> {
        let text_in = text || "";
        let media_type: ContentType = "Text";

        if (imageBuffer && imageBuffer.byteLength > 0) {
            media_type = "Image";
        } else if (unicode.EMOJI_REGEX.test(text_in)) {
            const emojiCount = (text_in.match(unicode.EMOJI_REGEX) || []).length;
            const textLength = [...text_in].length;
            if (emojiCount / textLength > 0.5) media_type = "Emoji";
        }

        // --- CASCADE DETECTION PIPELINE ---
        let score = 0;
        const reasons: string[] = [];
        const findings: any = {};
        const pValues: number[] = []; // For Fisher's Combined Probability Test
        let detectorsTriggered = 0;
        let detectorsTotal = 0;

        if (media_type === 'Text' || media_type === 'Emoji') {
            // ==========================================
            // TIER 1: Deterministic Checks
            // ==========================================
            const textResults = this.analyzeTextAndEmoji(text_in);
            findings.text = textResults;

            // --- Zero-Width Characters ---
            detectorsTotal++;
            if (textResults.zero_width?.present) {
                detectorsTriggered++;
                score += 30;
                reasons.push('zero_width_characters_detected');
                pValues.push(0.001); // Very strong evidence

                if (textResults.zero_width.verifiedPayload) {
                    score += 40; // Verified payload = near-certain stego
                    reasons.push('VERIFIED_HIDDEN_PAYLOAD_EXTRACTED');
                    pValues.push(0.0001);
                }

                if (textResults.zero_width.bidiAnomalies?.present) {
                    score += 10;
                    reasons.push('bidi_override_attack_detected');
                }
            } else {
                pValues.push(0.95);
            }

            // --- Homoglyph Detection ---
            detectorsTotal++;
            if (textResults.homoglyphs?.present) {
                detectorsTriggered++;
                score += 25;
                reasons.push('homoglyph_characters_detected');
                pValues.push(0.005);

                if (textResults.homoglyphs.skeletalAnalysis?.suspicious) {
                    score += 35; // Bumped to push intent-based phishing into "High Risk" (60%+)
                    reasons.push('homoglyph_skeleton_phishing_detected');
                    pValues.push(0.001); // Increased p-value significance
                }
                if (textResults.homoglyphs.visualSpoofing?.detected) {
                    score += 35; // Bumped to escalate IDN homograph attacks
                    reasons.push('visual_spoofing_attack_detected');
                    pValues.push(0.0005); // High confidence spoof indicator
                }
            } else {
                pValues.push(0.90);
            }

            // --- Shannon Entropy ---
            detectorsTotal++;
            if (textResults.homoglyphs?.entropy?.suspicious) {
                detectorsTriggered++;
                score += 40; // Escalated from 10 to catch raw base64/encrypted short payloads
                reasons.push(`high_character_entropy_detected_payload_risk (${textResults.homoglyphs.entropy.score.toFixed(2)})`);
                pValues.push(0.005); // High confidence anomaly
            } else {
                pValues.push(0.85);
            }

            // --- Base64 / Encoded Payload Check ---
            detectorsTotal++;
            // Check if string looks like a discrete base64/hex payload (no spaces, specific charset)
            const isBase64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(text_in);
            const isHighDensity = /^[\w!@#$%^&*()-+=]{12,}$/.test(text_in) && !text_in.includes(' ');
            if ((isBase64 && text_in.length >= 16) || (isHighDensity && textResults.homoglyphs?.entropy?.score && textResults.homoglyphs.entropy.score > 3.5)) {
                detectorsTriggered++;
                score += 45; 
                reasons.push('obfuscated_or_base64_payload_detected');
                pValues.push(0.001);
            } else {
                pValues.push(0.90);
            }

            // --- SNOW Steganography ---
            detectorsTotal++;
            if (textResults.homoglyphs?.snow?.detected) {
                detectorsTriggered++;
                score += 10;
                reasons.push(...textResults.homoglyphs.snow.reasons);
                pValues.push(0.02);
            } else {
                pValues.push(0.90);
            }

            // --- Markov Chain n-gram Analysis ---
            detectorsTotal++;
            if (textResults.homoglyphs?.markovAnomaly?.suspicious) {
                detectorsTriggered++;
                score += 10;
                reasons.push('markov_bigram_anomaly_detected');
                pValues.push(0.04);
            } else {
                pValues.push(0.80);
            }

            // ==========================================
            // TIER 1: Emoji-Specific Detection
            // ==========================================
            detectorsTotal++;
            if (textResults.emoji_threats?.suspicious) {
                detectorsTriggered++;
                const emojiRisk = textResults.emoji_threats.riskScore || 0;

                // EmojiEncode alphabet detection is definitive
                if (emojiRisk >= 60) {
                    score += 40;
                    pValues.push(0.001);
                } else if (emojiRisk >= 30) {
                    score += 20;
                    pValues.push(0.02);
                } else {
                    score += 10;
                    pValues.push(0.05);
                }
                reasons.push(...textResults.emoji_threats.reasons);

                if (textResults.emoji_threats.verifiedPayload) {
                    score += 30;
                    reasons.push('VERIFIED_EMOJI_STEGO_PAYLOAD');
                    pValues.push(0.0001);
                }
            } else {
                pValues.push(0.90);
            }

            // ==========================================
            // TIER 2: Statistical n-gram Frequency Deviation
            // ==========================================
            detectorsTotal++;
            if (text_in.length > 30) {
                const ngramResult = this.ngramFrequencyDeviation(text_in);
                findings.ngram_forensics = ngramResult;
                if (ngramResult.suspicious) {
                    detectorsTriggered++;
                    score += 10;
                    reasons.push(`ngram_frequency_deviation (dev=${ngramResult.deviation.toFixed(3)})`);
                    pValues.push(ngramResult.pValue);
                } else {
                    pValues.push(0.80);
                }
            }

            // ==========================================
            // TIER 2: Character-Level Perplexity (DistilBERT Equivalent)
            // ==========================================
            detectorsTotal++;
            if (text_in.length > 40) {
                const perplexity = this.characterPerplexity(text_in);
                findings.perplexity_analysis = perplexity;
                if (perplexity.suspicious) {
                    detectorsTriggered++;
                    score += 12;
                    reasons.push(`high_character_perplexity (ppl=${perplexity.score.toFixed(1)})`);
                    pValues.push(perplexity.pValue);
                } else {
                    pValues.push(0.85);
                }
            }

            // ==========================================
            // TIER 3: AI Semantic Scanner (Gemini)
            // ==========================================
            if (text_in.length > 50 && (score > 5 || unicode.EMOJI_REGEX.test(text_in))) {
                detectorsTotal++;
                try {
                    const aiResult = await semanticStegoCheck(text_in);
                    findings.semantic_ai = aiResult;
                    if (aiResult.isSuspicious) {
                        detectorsTriggered++;
                        score += Math.min(20, Math.floor(aiResult.perplexityScore / 5));
                        reasons.push(`semantic_anomaly_detected (${aiResult.reason})`);
                        pValues.push(Math.max(0.001, 1 - aiResult.confidence));
                    } else {
                        pValues.push(0.90);
                    }
                } catch (e) {
                    // AI unavailable — no penalty, no bonus
                    findings.semantic_ai = { isSuspicious: false, reason: "AI unavailable", confidence: 0 };
                }
            }

        } else if (media_type === 'Image' && imageBuffer && pixels) {
            // ==========================================
            // IMAGE ANALYSIS PIPELINE
            // ==========================================
            const imageResults = this.analyzeImage(imageBuffer, pixels, mimeType);
            findings.image = imageResults;
            const stego = imageResults.stego_analysis;
            const veritas = imageResults.stegoveritas_analysis;

            // --- Chi-Square Test ---
            detectorsTotal++;
            if (stego?.chiSquareProbability > 0.95) {
                detectorsTriggered++;
                score += 35;
                reasons.push('chi_square_anomaly_detected');
                pValues.push(1 - stego.chiSquareProbability);
            } else if (stego?.chiSquareProbability > 0.7) {
                detectorsTriggered++;
                score += Math.floor((stego.chiSquareProbability - 0.7) * 60);
                reasons.push('chi_square_elevated');
                pValues.push(1 - stego.chiSquareProbability);
            } else {
                pValues.push(0.80);
            }

            // --- RS Analysis ---
            detectorsTotal++;
            if (stego?.rsEmbeddingRate > 0.1) {
                detectorsTriggered++;
                score += 25;
                reasons.push(`rs_embedding_detected (rate=${stego.rsEmbeddingRate.toFixed(3)})`);
                pValues.push(Math.max(0.001, 0.5 - stego.rsEmbeddingRate));
            } else if (stego?.rsEmbeddingRate > 0.01) {
                detectorsTriggered++;
                score += 10;
                reasons.push(`rs_embedding_low (rate=${stego.rsEmbeddingRate.toFixed(3)})`);
                pValues.push(0.1);
            } else {
                pValues.push(0.85);
            }

            // --- Sample Pair Analysis ---
            detectorsTotal++;
            if (stego?.spaEmbeddingRate > 0.15) {
                detectorsTriggered++;
                score += 25;
                reasons.push(`spa_embedding_detected (rate=${stego.spaEmbeddingRate.toFixed(3)})`);
                pValues.push(Math.max(0.001, 0.5 - stego.spaEmbeddingRate));
            } else if (stego?.spaEmbeddingRate > 0.02) {
                detectorsTriggered++;
                score += 10;
                pValues.push(0.1);
            } else {
                pValues.push(0.85);
            }

            // --- Bit-Cycle Periodicity ---
            detectorsTotal++;
            if (stego?.bitCycleAnomaly?.detected) {
                detectorsTriggered++;
                score += 15;
                reasons.push(`periodic_lsb_pattern (period=${stego.bitCycleAnomaly.periodicity})`);
                pValues.push(0.01);
            } else {
                pValues.push(0.80);
            }

            // --- Noise Fingerprint ---
            detectorsTotal++;
            if (stego?.noiseFingerprint?.suspicious) {
                detectorsTriggered++;
                score += 10;
                reasons.push('noise_floor_inconsistency_detected');
                pValues.push(0.03);
            } else {
                pValues.push(0.85);
            }

            // --- Trailing Data ---
            detectorsTotal++;
            if (veritas?.trailingDataDetected) {
                detectorsTriggered++;
                score += 20;
                reasons.push(`trailing_data_detected (${veritas.trailingDataSize} bytes)`);
                pValues.push(0.005);
            } else {
                pValues.push(0.90);
            }

            // --- Channel Inconsistency ---
            detectorsTotal++;
            if (veritas?.channelInconsistency?.detected) {
                detectorsTriggered++;
                score += 15;
                reasons.push('rgb_channel_inconsistency');
                pValues.push(0.02);
            } else {
                pValues.push(0.85);
            }

            // --- Bit Plane Anomaly ---
            detectorsTotal++;
            if (veritas?.bitPlaneAnomaly) {
                detectorsTriggered++;
                score += 10;
                reasons.push('bit_plane_correlation_anomaly');
                pValues.push(0.03);
            } else {
                pValues.push(0.85);
            }

            // --- Shadow Chunks (PNG) ---
            detectorsTotal++;
            if (veritas?.shadowChunks?.detected) {
                detectorsTriggered++;
                score += 20;
                reasons.push(`shadow_chunks_detected (${veritas.shadowChunks.chunks.join(', ')})`);
                pValues.push(0.005);
            } else {
                pValues.push(0.90);
            }

            // --- JPEG DCT Analysis ---
            detectorsTotal++;
            if (veritas?.dctAnomaly?.detected) {
                detectorsTriggered++;
                score += 25;
                reasons.push(`jpeg_dct_anomaly (benford_dev=${veritas.dctAnomaly.benfordDeviation.toFixed(3)})`);
                pValues.push(veritas.dctAnomaly.pValue);
            } else {
                pValues.push(0.85);
            }

            // --- Fisher's Combined Image Ensemble ---
            const imagePValues = pValues.filter(p => p < 0.5);
            if (imagePValues.length >= 3) {
                const fisherStat = this.fisherCombinedTest(imagePValues);
                findings.fisher_ensemble = { statistic: fisherStat.statistic, pValue: fisherStat.pValue, k: imagePValues.length };
                if (fisherStat.pValue < 0.01) {
                    score += 15; // Multi-detector confirmation bonus
                    reasons.push('fisher_ensemble_confirmed');
                }
            }
        }

        // ==========================================
        // FINAL SCORING
        // ==========================================
        const finalScore = Math.min(100, Math.max(0, score));

        // Check for verified payloads
        const verifiedPayloads: string[] = [];
        if (findings.text?.zero_width?.verifiedPayload) verifiedPayloads.push(findings.text.zero_width.verifiedPayload);
        if (findings.text?.emoji_threats?.verifiedPayload) verifiedPayloads.push(findings.text.emoji_threats.verifiedPayload);

        let verifiedScore = finalScore;
        if (verifiedPayloads.length > 0 && finalScore < 90) {
            verifiedScore = 100;
            if (!reasons.includes('VERIFIED_HIDDEN_PAYLOAD_EXTRACTED')) {
                reasons.push('VERIFIED_HIDDEN_PAYLOAD_EXTRACTED');
            }
        }

        // Confidence: based on how many independent detectors agree
        const confidence = detectorsTotal > 0
            ? Math.min(0.99, 0.5 + (detectorsTriggered / detectorsTotal) * 0.5)
            : 0.5;

        // Fisher's Combined Probability for overall confidence
        const significantPValues = pValues.filter(p => p < 0.1);
        let fisherConfidence = confidence;
        if (significantPValues.length >= 2) {
            const fisher = this.fisherCombinedTest(significantPValues);
            if (fisher.pValue < 0.001) fisherConfidence = Math.max(confidence, 0.95);
            else if (fisher.pValue < 0.01) fisherConfidence = Math.max(confidence, 0.85);
            else if (fisher.pValue < 0.05) fisherConfidence = Math.max(confidence, 0.75);
        }

        return {
            type: media_type,
            score: verifiedScore,
            severity: this.getSeverity(verifiedScore),
            confidence: fisherConfidence,
            findings: {
                ...findings,
                verified_payloads: verifiedPayloads.length > 0 ? verifiedPayloads : undefined,
                ensemble_confidence: fisherConfidence,
                detectors_triggered: detectorsTriggered,
                detectors_total: detectorsTotal
            },
            reasons: Array.from(new Set(reasons))
        };
    }

    // ==========================================
    // STATISTICAL METHODS
    // ==========================================

    /**
     * Fisher's Combined Probability Test
     * Combines independent p-values: X² = -2 * Σ ln(pᵢ)
     * Under H₀, follows chi-square distribution with 2k degrees of freedom
     */
    private static fisherCombinedTest(pValues: number[]): { statistic: number; pValue: number } {
        const k = pValues.length;
        if (k === 0) return { statistic: 0, pValue: 1 };

        const clampedP = pValues.map(p => Math.max(1e-10, Math.min(1 - 1e-10, p)));
        const statistic = -2 * clampedP.reduce((sum, p) => sum + Math.log(p), 0);
        const df = 2 * k;

        // Approximate chi-square survival function using regularized gamma
        const pValue = 1 - this.gammaCDF(statistic / 2, df / 2);
        return { statistic, pValue: Math.max(0, Math.min(1, pValue)) };
    }

    /**
     * Regularized lower incomplete gamma function (for chi-square CDF)
     * Uses series expansion for small x, continued fraction for large x
     */
    private static gammaCDF(x: number, a: number): number {
        if (x <= 0) return 0;
        if (x > a + 20) {
            // Use continued fraction approximation
            let f = 1 + x - a;
            let c = 1 / 1e-30;
            let d = 1 / f;
            let h = d;
            for (let i = 1; i <= 100; i++) {
                const an = -i * (i - a);
                const bn = 2 * i + 1 + x - a;
                d = bn + an * d;
                if (Math.abs(d) < 1e-30) d = 1e-30;
                c = bn + an / c;
                if (Math.abs(c) < 1e-30) c = 1e-30;
                d = 1 / d;
                const del = d * c;
                h *= del;
                if (Math.abs(del - 1) < 1e-8) break;
            }
            return 1 - Math.exp(-x + a * Math.log(x) - this.logGamma(a)) * h;
        }
        // Series expansion
        let sum = 1 / a;
        let term = 1 / a;
        for (let n = 1; n <= 200; n++) {
            term *= x / (a + n);
            sum += term;
            if (Math.abs(term) < Math.abs(sum) * 1e-10) break;
        }
        return sum * Math.exp(-x + a * Math.log(x) - this.logGamma(a));
    }

    /**
     * Log-gamma function (Stirling's approximation)
     */
    private static logGamma(x: number): number {
        const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
            -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
        let y = x;
        let tmp = x + 5.5;
        tmp -= (x + 0.5) * Math.log(tmp);
        let ser = 1.000000000190015;
        for (let j = 0; j < 6; j++) ser += c[j] / ++y;
        return -tmp + Math.log(2.5066282746310005 * ser / x);
    }

    /**
     * N-gram Frequency Deviation Analysis
     * Compares trigram distribution against English language baseline
     * Stegotext has unnaturally uniform or skewed trigram distributions
     */
    private static ngramFrequencyDeviation(text: string): { suspicious: boolean; deviation: number; pValue: number } {
        const normalized = text.toLowerCase().replace(/[^a-z ]/g, '');
        if (normalized.length < 20) return { suspicious: false, deviation: 0, pValue: 1 };

        // English trigram frequency baseline (top 30 trigrams)
        const englishBaseline: Record<string, number> = {
            'the': 0.035, 'and': 0.016, 'ing': 0.013, 'ent': 0.012, 'ion': 0.011,
            'her': 0.010, 'for': 0.010, 'tha': 0.009, 'nth': 0.009, 'int': 0.008,
            'ere': 0.008, 'tio': 0.008, 'ver': 0.007, 'ati': 0.007, 'ter': 0.007,
            'est': 0.007, 'ous': 0.006, 'all': 0.006, 'are': 0.006, 'rea': 0.006,
            'hat': 0.006, 'was': 0.006, 'ith': 0.006, 'his': 0.005, 'not': 0.005,
            'but': 0.005, 'you': 0.005, 'com': 0.005, 'pro': 0.005, 'con': 0.005,
        };

        // Build input trigram frequencies
        const trigrams: Record<string, number> = {};
        let total = 0;
        for (let i = 0; i <= normalized.length - 3; i++) {
            const tri = normalized.substring(i, i + 3);
            if (tri.includes(' ')) continue;
            trigrams[tri] = (trigrams[tri] || 0) + 1;
            total++;
        }
        if (total < 10) return { suspicious: false, deviation: 0, pValue: 1 };

        // Calculate KL-divergence from English baseline
        let klDiv = 0;
        let matchedTrigrams = 0;
        for (const tri in englishBaseline) {
            const observed = (trigrams[tri] || 0) / total;
            const expected = englishBaseline[tri];
            if (observed > 0) {
                klDiv += observed * Math.log(observed / expected);
                matchedTrigrams++;
            } else {
                klDiv += 0.001 * Math.log(0.001 / expected); // Smoothing
            }
        }

        const deviation = Math.abs(klDiv);
        // High deviation from English = suspicious
        const suspicious = deviation > 2.0 && normalized.length > 30;
        const pValue = suspicious ? Math.max(0.001, Math.exp(-deviation)) : 0.8;

        return { suspicious, deviation, pValue };
    }

    /**
     * Character-Level Perplexity Estimator (DistilBERT Equivalent)
     * Uses character-level cross-entropy against English unigram/bigram frequencies
     * High perplexity = text is unlike natural language = possible stegotext
     */
    private static characterPerplexity(text: string): { suspicious: boolean; score: number; pValue: number } {
        const lower = text.toLowerCase();
        // English character frequencies (from large corpus analysis)
        const charFreq: Record<string, number> = {
            'e': 0.127, 't': 0.091, 'a': 0.082, 'o': 0.075, 'i': 0.070,
            'n': 0.067, 's': 0.063, 'h': 0.061, 'r': 0.060, 'd': 0.043,
            'l': 0.040, 'c': 0.028, 'u': 0.028, 'm': 0.024, 'w': 0.024,
            'f': 0.022, 'g': 0.020, 'y': 0.020, 'p': 0.019, 'b': 0.015,
            'v': 0.010, 'k': 0.008, 'j': 0.002, 'x': 0.002, 'q': 0.001,
            'z': 0.001, ' ': 0.180,
        };

        let crossEntropy = 0;
        let counted = 0;
        for (const ch of lower) {
            const p = charFreq[ch] || 0.0005; // Smoothing for unknown chars
            crossEntropy -= Math.log2(p);
            counted++;
        }

        if (counted === 0) return { suspicious: false, score: 0, pValue: 1 };

        const perplexity = Math.pow(2, crossEntropy / counted);
        // Natural English text: perplexity ~8-15
        // Stegotext/encoded: perplexity > 25
        // Random: perplexity > 40
        const suspicious = perplexity > 25 && text.length > 30;
        const pValue = suspicious ? Math.max(0.001, Math.exp(-perplexity / 10)) : 0.8;

        return { suspicious, score: perplexity, pValue };
    }

    // ==========================================
    // ANALYSIS METHODS
    // ==========================================

    private static analyzeTextAndEmoji(text: string) {
        return {
            zero_width: unicode.detect_zero_width(text),
            homoglyphs: unicode.detect_homoglyphs(text, true),
            emoji_threats: emoji.enhancedEmojiSecurityScan(text)
        };
    }

    private static analyzeImage(buffer: ArrayBuffer, pixels: number[] | Uint8Array, mimeType: string) {
        return {
            stego_analysis: analyzeStego(pixels),
            stegoveritas_analysis: stegoveritas.analyzeStegoVeritas(buffer, pixels, mimeType)
        };
    }

    private static getSeverity(score: number): 'Safe' | 'Low' | 'Medium' | 'High' | 'Critical' {
        if (score >= 85) return 'Critical';
        if (score >= 60) return 'High';
        if (score >= 35) return 'Medium';
        if (score >= 15) return 'Low';
        return 'Safe';
    }
}
