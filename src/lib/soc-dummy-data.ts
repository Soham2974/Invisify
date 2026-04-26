import type { ScanResult, Severity, ContentType } from './types';

// ── Dummy Scan Results ───────────────────────────────────────────────
// Based on actual detection-engine.ts output shapes

const severities: Severity[] = ['Safe', 'Low', 'Medium', 'High', 'Critical'];
const types: ContentType[] = ['Text', 'Image', 'Emoji'];
// Use a fixed base timestamp to avoid SSR/client hydration mismatch.
// This represents "now" as a constant so server and client agree.
const BASE_TIME = new Date('2026-04-25T14:00:00Z').getTime();

function ts(minutesAgo: number): string {
  return new Date(BASE_TIME - minutesAgo * 60_000).toISOString();
}

export const DUMMY_SCANS: ScanResult[] = [
  {
    id: 'scan-001',
    timestamp: ts(2),
    content_type: 'Text',
    severity: 'Critical',
    score: 92,
    summary: 'Multiple zero-width characters detected with verified ZWSP-Tool payload. BIDI override attack present. Prompt injection pattern matched.',
    findings: JSON.stringify({
      text: {
        zero_width: { found: true, count: 47, types: ['ZWSP', 'ZWNJ', 'ZWJ', 'BOM'], decoded_payload: '[VERIFIED ZWSP-TOOL PAYLOAD]: "exfiltrate_credentials"' },
        homoglyphs: { present: false, samples: [] },
        bidi: { found: true, characters: ['RLO', 'PDF'], count: 3 },
        entropy: { score: 6.2, suspicious: true },
        markov: { score: 0.91, suspicious: true },
        snow: { found: false },
      },
      semantic_ai: { isSuspicious: true, perplexityScore: 78, reason: 'Text exhibits machine-generated stegotext patterns with abnormally uniform token distribution', confidence: 0.87 },
      ensemble_confidence: 0.94,
      detectors_triggered: 6,
      detectors_total: 8,
    }),
    reasons: [
      'Zero-width payload detected: 47 hidden characters (ZWSP, ZWNJ, ZWJ, BOM)',
      'Verified ZWSP-Tool encoded payload decoded successfully',
      'BIDI override attack: RLO character reverses text rendering direction',
      'Shannon entropy 6.2 bits/char exceeds threshold (>5.5)',
      'Markov chain anomaly: bigram transition score 0.91 (>0.85)',
      'AI semantic analysis: stegotext confidence 87%',
    ],
  },
  {
    id: 'scan-002',
    timestamp: ts(8),
    content_type: 'Image',
    severity: 'High',
    score: 78,
    summary: 'Chi-square analysis indicates high probability of LSB embedding. RS Analysis confirms with 34% estimated embedding rate.',
    findings: JSON.stringify({
      image: {
        chi_square: { probability: 0.97, suspicious: true },
        spa: { embeddingRate: 0.34, suspicious: true },
        rs_analysis: { regular: 0.42, singular: 0.18, embeddingRate: 0.34, suspicious: true },
        stegoveritas_analysis: {
          trailingData: { detected: true, size: 2048 },
          metadata: ['StegHide signature detected in EXIF comment'],
          shadowChunks: [],
          channelInconsistency: { detected: true, scores: { r: 0.12, g: 0.11, b: 0.45 } },
        },
      },
      ensemble_confidence: 0.88,
      detectors_triggered: 5,
      detectors_total: 6,
    }),
    reasons: [
      'Chi-square attack: p-value 0.97 indicates LSB embedding (>0.95)',
      'Sample Pair Analysis: 34% estimated embedding rate',
      'RS Analysis confirms: Regular=0.42, Singular=0.18',
      'Trailing data: 2048 bytes after PNG IEND marker',
      'StegHide tool signature detected in EXIF metadata',
      'Blue channel LSB entropy anomaly: 0.45 vs R:0.12, G:0.11',
    ],
  },
  {
    id: 'scan-003',
    timestamp: ts(15),
    content_type: 'Emoji',
    severity: 'High',
    score: 71,
    summary: 'Emoji nibble steganography detected: exactly 16 unique emojis with uniform distribution. EmojiEncode payload verified.',
    findings: JSON.stringify({
      emoji: {
        threats: {
          nibble_stego: { detected: true, unique_count: 16, distribution_variance: 0.8, isPowerOf2: true },
          encoding_pattern: { detected: true, confidence: 0.82 },
          zwj_abuse: { detected: false },
          variation_selector: { detected: true, count: 24 },
        },
        decode_attempts: { emojiEncode: { success: true, payload: 'attack_vector_alpha' }, variationSelector: { success: false } },
      },
      ensemble_confidence: 0.79,
      detectors_triggered: 3,
      detectors_total: 5,
    }),
    reasons: [
      'Nibble steganography: exactly 16 unique emojis (2^4 — stego signature)',
      'Distribution variance 0.8 — near-uniform (expected for encoding)',
      'EmojiEncode payload decoded: "attack_vector_alpha"',
      '24 variation selectors detected — potential binary channel',
    ],
  },
  {
    id: 'scan-004',
    timestamp: ts(22),
    content_type: 'Text',
    severity: 'Medium',
    score: 52,
    summary: 'Homoglyph substitution detected: 12 Cyrillic characters masquerading as Latin. Possible phishing URL construction.',
    findings: JSON.stringify({
      text: {
        zero_width: { found: false, count: 0, types: [] },
        homoglyphs: {
          present: true,
          samples: [
            { char: 'а', looks_like: 'a', category: 'Cyrillic' },
            { char: 'е', looks_like: 'e', category: 'Cyrillic' },
            { char: 'о', looks_like: 'o', category: 'Cyrillic' },
            { char: 'р', looks_like: 'p', category: 'Cyrillic' },
          ],
          detailed: { totalCount: 12, categories: ['Cyrillic'] },
        },
        entropy: { score: 4.8, suspicious: false },
        skeleton: { issues: 12, suspicious: true },
      },
      ensemble_confidence: 0.65,
      detectors_triggered: 2,
      detectors_total: 8,
    }),
    reasons: [
      'Homoglyph phishing: 12 Cyrillic characters substituted for Latin equivalents',
      'TR39 skeletal mapping detected mixed-script anomaly',
      'Characters: а→a, е→e, о→o, р→p (Cyrillic → Latin lookalikes)',
    ],
  },
  {
    id: 'scan-005',
    timestamp: ts(35),
    content_type: 'Text',
    severity: 'Safe',
    score: 3,
    summary: 'No steganographic content detected. Clean text with normal entropy and no hidden characters.',
    findings: JSON.stringify({
      text: {
        zero_width: { found: false, count: 0, types: [] },
        homoglyphs: { present: false, samples: [] },
        entropy: { score: 4.1, suspicious: false },
        markov: { score: 0.62, suspicious: false },
        snow: { found: false },
        bidi: { found: false },
      },
      ensemble_confidence: 0.12,
      detectors_triggered: 0,
      detectors_total: 8,
    }),
    reasons: [],
  },
  {
    id: 'scan-006',
    timestamp: ts(42),
    content_type: 'Image',
    severity: 'Safe',
    score: 8,
    summary: 'Image analysis clean. No statistical anomalies in LSB plane. No trailing data or metadata signatures.',
    findings: JSON.stringify({
      image: {
        chi_square: { probability: 0.23, suspicious: false },
        spa: { embeddingRate: 0.02, suspicious: false },
        rs_analysis: { regular: 0.31, singular: 0.29, embeddingRate: 0.03, suspicious: false },
        stegoveritas_analysis: {
          trailingData: { detected: false, size: 0 },
          metadata: [],
          shadowChunks: [],
          channelInconsistency: { detected: false, scores: { r: 0.11, g: 0.12, b: 0.10 } },
        },
      },
      ensemble_confidence: 0.08,
      detectors_triggered: 0,
      detectors_total: 6,
    }),
    reasons: [],
  },
  {
    id: 'scan-007',
    timestamp: ts(55),
    content_type: 'Text',
    severity: 'Low',
    score: 18,
    summary: 'Minor SNOW whitespace steganography indicators. 5 lines with trailing whitespace. No decoded payload.',
    findings: JSON.stringify({
      text: {
        zero_width: { found: false, count: 0, types: [] },
        homoglyphs: { present: false, samples: [] },
        snow: { found: true, trailing_count: 5 },
        entropy: { score: 4.3, suspicious: false },
      },
      ensemble_confidence: 0.28,
      detectors_triggered: 1,
      detectors_total: 8,
    }),
    reasons: [
      'SNOW whitespace steganography: 5 lines with trailing whitespace detected',
    ],
  },
  {
    id: 'scan-008',
    timestamp: ts(68),
    content_type: 'Emoji',
    severity: 'Medium',
    score: 45,
    summary: 'Illegal ZWJ sequences detected. 3 grapheme clusters exceed maximum ZWJ count. Possible ZWJ sequence manipulation.',
    findings: JSON.stringify({
      emoji: {
        threats: {
          nibble_stego: { detected: false },
          encoding_pattern: { detected: false },
          zwj_abuse: { detected: true, illegal_clusters: 3, max_zwj: 7 },
          variation_selector: { detected: false },
        },
      },
      ensemble_confidence: 0.52,
      detectors_triggered: 1,
      detectors_total: 5,
    }),
    reasons: [
      'Illegal ZWJ sequences: 3 clusters exceed maximum ZWJ count (>3 per grapheme)',
      'Maximum ZWJ density: 7 per cluster (legal maximum: 3)',
    ],
  },
  {
    id: 'scan-009',
    timestamp: ts(80),
    content_type: 'Image',
    severity: 'Medium',
    score: 55,
    summary: 'Bit-cycle autocorrelation detected at lag 8. RGB channel inconsistency in blue channel. Possible structured LSB embedding.',
    findings: JSON.stringify({
      image: {
        chi_square: { probability: 0.72, suspicious: false },
        spa: { embeddingRate: 0.18, suspicious: true },
        rs_analysis: { regular: 0.38, singular: 0.22, embeddingRate: 0.21, suspicious: true },
        stegoveritas_analysis: {
          trailingData: { detected: false, size: 0 },
          metadata: [],
          channelInconsistency: { detected: true, scores: { r: 0.14, g: 0.13, b: 0.38 } },
        },
      },
      ensemble_confidence: 0.61,
      detectors_triggered: 3,
      detectors_total: 6,
    }),
    reasons: [
      'Sample Pair Analysis: 18% embedding rate estimate',
      'RS Analysis: Regular/Singular ratio anomaly (0.38/0.22)',
      'Blue channel LSB entropy 0.38 — significant deviation from R:0.14, G:0.13',
    ],
  },
  {
    id: 'scan-010',
    timestamp: ts(95),
    content_type: 'Text',
    severity: 'Critical',
    score: 88,
    summary: 'Prompt injection attack detected. Multiple LLM injection patterns matched. BIDI override with zero-width obfuscation.',
    findings: JSON.stringify({
      text: {
        zero_width: { found: true, count: 23, types: ['ZWSP', 'BOM'] },
        bidi: { found: true, characters: ['RLE', 'PDF', 'RLO'], count: 5 },
        prompt_injection: { detected: true, patterns: ['IGNORE PREVIOUS', 'SYSTEM PROMPT', 'RESET INSTRUCTIONS'], count: 3 },
      },
      semantic_ai: { isSuspicious: true, perplexityScore: 91, reason: 'High-confidence prompt injection attempt detected with obfuscation layer', confidence: 0.93 },
      ensemble_confidence: 0.96,
      detectors_triggered: 5,
      detectors_total: 8,
    }),
    reasons: [
      'Prompt injection: 3 LLM attack patterns detected',
      'Zero-width obfuscation: 23 hidden characters interleaved with injection payload',
      'BIDI override: RLE + RLO characters alter text rendering',
      'AI semantic analysis: injection confidence 93%',
    ],
  },
  {
    id: 'scan-011',
    timestamp: ts(120),
    content_type: 'Text',
    severity: 'Safe',
    score: 5,
    summary: 'Standard English text. Normal entropy profile. No anomalies detected.',
    findings: JSON.stringify({
      text: { zero_width: { found: false }, homoglyphs: { present: false }, entropy: { score: 3.8 }, snow: { found: false } },
      ensemble_confidence: 0.05,
      detectors_triggered: 0,
      detectors_total: 8,
    }),
    reasons: [],
  },
  {
    id: 'scan-012',
    timestamp: ts(145),
    content_type: 'Emoji',
    severity: 'Safe',
    score: 2,
    summary: 'Normal emoji usage. No steganographic patterns detected.',
    findings: JSON.stringify({
      emoji: { threats: { nibble_stego: { detected: false }, encoding_pattern: { detected: false }, zwj_abuse: { detected: false }, variation_selector: { detected: false } } },
      ensemble_confidence: 0.03,
      detectors_triggered: 0,
      detectors_total: 5,
    }),
    reasons: [],
  },
  {
    id: 'scan-013',
    timestamp: ts(180),
    content_type: 'Image',
    severity: 'High',
    score: 74,
    summary: 'OutGuess tool signature in metadata. Trailing data after JPEG EOI marker. Chi-square probability elevated.',
    findings: JSON.stringify({
      image: {
        chi_square: { probability: 0.89, suspicious: true },
        spa: { embeddingRate: 0.28, suspicious: true },
        stegoveritas_analysis: {
          trailingData: { detected: true, size: 4096 },
          metadata: ['OutGuess signature in JPEG APP0 marker'],
          shadowChunks: ['Unknown chunk: sTEg'],
        },
      },
      ensemble_confidence: 0.82,
      detectors_triggered: 4,
      detectors_total: 6,
    }),
    reasons: [
      'OutGuess tool signature detected in JPEG metadata',
      'Trailing data: 4096 bytes after JPEG EOI marker',
      'Chi-square probability 0.89 — approaching LSB threshold',
      'Unknown PNG chunk "sTEg" — possible shadow data container',
    ],
  },
  {
    id: 'scan-014',
    timestamp: ts(210),
    content_type: 'Text',
    severity: 'Medium',
    score: 41,
    summary: 'Mongolian Vowel Separator (U+180E) characters detected. Potential zero-width channel. Entropy slightly elevated.',
    findings: JSON.stringify({
      text: {
        zero_width: { found: true, count: 8, types: ['MVS'] },
        entropy: { score: 5.1, suspicious: false },
      },
      ensemble_confidence: 0.48,
      detectors_triggered: 1,
      detectors_total: 8,
    }),
    reasons: [
      'Mongolian Vowel Separator (U+180E): 8 instances detected',
      'Uncommon zero-width character — potential covert channel',
    ],
  },
  {
    id: 'scan-015',
    timestamp: ts(250),
    content_type: 'Text',
    severity: 'Safe',
    score: 1,
    summary: 'Clean content. All detectors returned negative.',
    findings: JSON.stringify({
      text: { zero_width: { found: false }, homoglyphs: { present: false }, entropy: { score: 3.5 } },
      ensemble_confidence: 0.01,
      detectors_triggered: 0,
      detectors_total: 8,
    }),
    reasons: [],
  },
  {
    id: 'scan-016',
    timestamp: ts(290),
    content_type: 'Image',
    severity: 'Low',
    score: 22,
    summary: 'Minor filter anomaly in IDAT chunks. No conclusive evidence of steganography. Possible compression artifact.',
    findings: JSON.stringify({
      image: {
        chi_square: { probability: 0.41, suspicious: false },
        stegoveritas_analysis: {
          filterAnomaly: { detected: true, uniformity: 0.72 },
          trailingData: { detected: false },
        },
      },
      ensemble_confidence: 0.22,
      detectors_triggered: 1,
      detectors_total: 6,
    }),
    reasons: [
      'IDAT filter anomaly: content uniformity 0.72 — slightly elevated',
    ],
  },
  {
    id: 'scan-017',
    timestamp: ts(320),
    content_type: 'Text',
    severity: 'High',
    score: 69,
    summary: 'Armenian and Greek homoglyphs mixed with Latin text. TR39 skeletal mapping reveals 28 confusable characters across 3 scripts.',
    findings: JSON.stringify({
      text: {
        homoglyphs: {
          present: true,
          samples: [
            { char: 'Η', looks_like: 'H', category: 'Greek' },
            { char: 'Տ', looks_like: 'S', category: 'Armenian' },
          ],
          detailed: { totalCount: 28, categories: ['Greek', 'Armenian', 'Cyrillic'] },
        },
        skeleton: { issues: 28, suspicious: true },
      },
      ensemble_confidence: 0.74,
      detectors_triggered: 2,
      detectors_total: 8,
    }),
    reasons: [
      'Multi-script homoglyph attack: Greek, Armenian, Cyrillic characters detected',
      'TR39 skeletal mapping: 28 confusable characters across 3 scripts',
      'Mixed-script ratio indicates deliberate obfuscation',
    ],
  },
  {
    id: 'scan-018',
    timestamp: ts(360),
    content_type: 'Emoji',
    severity: 'Low',
    score: 15,
    summary: 'Slightly elevated variation selector count. No conclusive encoding pattern. Likely legitimate emoji rendering.',
    findings: JSON.stringify({
      emoji: {
        threats: {
          variation_selector: { detected: true, count: 8 },
          nibble_stego: { detected: false },
        },
      },
      ensemble_confidence: 0.18,
      detectors_triggered: 1,
      detectors_total: 5,
    }),
    reasons: [
      'Variation selectors: 8 instances — slightly above normal',
    ],
  },
];

// ── Activity Feed Events ──────────────────────────────────────────

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: 'zero_width' | 'homoglyph' | 'emoji_stego' | 'image_lsb' | 'bidi' | 'prompt_injection' | 'ai_semantic' | 'safe' | 'extension';
  severity: Severity;
  message: string;
  source: 'scanner' | 'extension' | 'api';
}

export const ACTIVITY_EVENTS: ActivityEvent[] = [
  { id: 'evt-001', timestamp: ts(1), type: 'zero_width', severity: 'Critical', message: 'ZWSP-Tool payload decoded: 47 hidden characters in email body', source: 'extension' },
  { id: 'evt-002', timestamp: ts(3), type: 'image_lsb', severity: 'High', message: 'Chi-square p=0.97 — LSB embedding confirmed in uploaded PNG', source: 'scanner' },
  { id: 'evt-003', timestamp: ts(5), type: 'emoji_stego', severity: 'High', message: 'Nibble stego: 16 unique emojis, σ²=0.8 — EmojiEncode payload verified', source: 'scanner' },
  { id: 'evt-004', timestamp: ts(7), type: 'homoglyph', severity: 'Medium', message: 'Cyrillic homoglyph phishing: а→a, е→e, о→o in URL "раyраl.com"', source: 'extension' },
  { id: 'evt-005', timestamp: ts(10), type: 'safe', severity: 'Safe', message: 'Clean text scan completed — entropy 4.1, no anomalies', source: 'scanner' },
  { id: 'evt-006', timestamp: ts(12), type: 'bidi', severity: 'Critical', message: 'BIDI override attack: RLO + RLE characters reversing text direction', source: 'extension' },
  { id: 'evt-007', timestamp: ts(14), type: 'prompt_injection', severity: 'Critical', message: 'Prompt injection: "IGNORE PREVIOUS INSTRUCTIONS" pattern detected', source: 'api' },
  { id: 'evt-008', timestamp: ts(18), type: 'image_lsb', severity: 'High', message: 'StegHide signature in EXIF — 2048 bytes trailing data after IEND', source: 'scanner' },
  { id: 'evt-009', timestamp: ts(22), type: 'ai_semantic', severity: 'High', message: 'AI semantic: perplexity 78 — machine-generated stegotext suspected', source: 'scanner' },
  { id: 'evt-010', timestamp: ts(25), type: 'safe', severity: 'Safe', message: 'Image analysis clean — Chi-square 0.23, SPA 2%, RS normal', source: 'scanner' },
  { id: 'evt-011', timestamp: ts(28), type: 'extension', severity: 'Low', message: 'Gmail: incoming email scanned — 5 trailing whitespace lines (SNOW)', source: 'extension' },
  { id: 'evt-012', timestamp: ts(33), type: 'emoji_stego', severity: 'Medium', message: 'Illegal ZWJ sequences: 3 clusters with >3 ZWJ (max observed: 7)', source: 'scanner' },
  { id: 'evt-013', timestamp: ts(40), type: 'image_lsb', severity: 'Medium', message: 'Blue channel LSB entropy 0.38 — deviation from R/G channels', source: 'scanner' },
  { id: 'evt-014', timestamp: ts(50), type: 'homoglyph', severity: 'High', message: 'Multi-script attack: Greek Η→H, Armenian Տ→S — 28 confusables', source: 'scanner' },
  { id: 'evt-015', timestamp: ts(60), type: 'safe', severity: 'Safe', message: 'Normal emoji usage — no steganographic patterns detected', source: 'scanner' },
];

// ── Extension Events ──────────────────────────────────────────────

export interface ExtensionEvent {
  id: string;
  timestamp: string;
  emailSubject: string;
  sender: string;
  threatType: string;
  score: number;
  severity: Severity;
  action: 'allowed' | 'warned' | 'blocked';
  fingerprint: string;
}

export const EXTENSION_EVENTS: ExtensionEvent[] = [
  { id: 'ext-001', timestamp: ts(2), emailSubject: 'Urgent: Verify Your Account', sender: 'security@раyраl.com', threatType: 'Homoglyph Phishing', score: 72, severity: 'High', action: 'blocked', fingerprint: 'a3f2c1...d8e7b4' },
  { id: 'ext-002', timestamp: ts(8), emailSubject: 'Meeting Notes - Q4 Review', sender: 'john@company.com', threatType: 'Zero-width Payload', score: 88, severity: 'Critical', action: 'blocked', fingerprint: 'b7d4e9...f2a1c3' },
  { id: 'ext-003', timestamp: ts(15), emailSubject: 'Weekly Newsletter', sender: 'news@techblog.io', threatType: 'None', score: 3, severity: 'Safe', action: 'allowed', fingerprint: 'c1e5f8...a4b2d6' },
  { id: 'ext-004', timestamp: ts(25), emailSubject: 'Invoice #4521', sender: 'billing@vendor.net', threatType: 'Image LSB Anomaly', score: 65, severity: 'High', action: 'warned', fingerprint: 'd9a3b7...e1f5c8' },
  { id: 'ext-005', timestamp: ts(40), emailSubject: 'Team Updates', sender: 'manager@company.com', threatType: 'None', score: 1, severity: 'Safe', action: 'allowed', fingerprint: 'e2b6c4...d8a3f1' },
  { id: 'ext-006', timestamp: ts(55), emailSubject: 'Important: Password Reset', sender: 'noreply@gооgle.com', threatType: 'Homoglyph + BIDI', score: 81, severity: 'Critical', action: 'blocked', fingerprint: 'f4c8d1...b5e2a7' },
  { id: 'ext-007', timestamp: ts(70), emailSubject: 'Shared Document', sender: 'colleague@company.com', threatType: 'Emoji Stego', score: 45, severity: 'Medium', action: 'warned', fingerprint: 'a8d2e6...c3f1b9' },
  { id: 'ext-008', timestamp: ts(90), emailSubject: 'Project Proposal', sender: 'client@external.org', threatType: 'SNOW Whitespace', score: 18, severity: 'Low', action: 'allowed', fingerprint: 'b1f5a3...d7c4e8' },
];

// ── Chart Data Helpers ────────────────────────────────────────────

export function getDetectionTypeDistribution(scans: ScanResult[]) {
  const counts = {
    'Zero-Width': 0,
    'Homoglyph': 0,
    'Emoji Stego': 0,
    'Image LSB': 0,
    'BIDI Attack': 0,
    'AI Semantic': 0,
    'SNOW': 0,
    'Prompt Injection': 0,
  };

  scans.forEach((scan) => {
    try {
      const f = typeof scan.findings === 'string' ? JSON.parse(scan.findings) : scan.findings;
      if (f?.text?.zero_width?.found) counts['Zero-Width']++;
      if (f?.text?.homoglyphs?.present) counts['Homoglyph']++;
      if (f?.text?.bidi?.found) counts['BIDI Attack']++;
      if (f?.text?.snow?.found) counts['SNOW']++;
      if (f?.text?.prompt_injection?.detected) counts['Prompt Injection']++;
      if (f?.emoji?.threats?.nibble_stego?.detected || f?.emoji?.threats?.encoding_pattern?.detected || f?.emoji?.threats?.zwj_abuse?.detected) counts['Emoji Stego']++;
      if (f?.image?.chi_square?.suspicious || f?.image?.spa?.suspicious) counts['Image LSB']++;
      if (f?.semantic_ai?.isSuspicious) counts['AI Semantic']++;
    } catch {}
  });

  return Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));
}

export function getSeverityDistribution(scans: ScanResult[]) {
  const counts: Record<Severity, number> = { Safe: 0, Low: 0, Medium: 0, High: 0, Critical: 0 };
  scans.forEach((s) => { counts[s.severity]++; });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function getTimelineData(scans: ScanResult[]) {
  return [...scans]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((s) => ({
      time: new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      score: s.score,
      severity: s.severity,
    }));
}

export function getContentTypeDistribution(scans: ScanResult[]) {
  const counts: Record<ContentType, number> = { Text: 0, Image: 0, Emoji: 0 };
  scans.forEach((s) => { counts[s.content_type]++; });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}
