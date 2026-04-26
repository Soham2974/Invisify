
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { DetectionEngine } from '@/lib/detection-engine';
import { Severity } from '@/lib/types';
import * as unicode from '@/lib/unicode';

// ============================================================================
// RATE LIMITER: Sliding window, 100 requests/minute per IP
// ============================================================================
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 100;
const MAX_TRACKED_IPS = 10000;
const MAX_TEXT_LENGTH = 50_000; // 50KB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp'];

// CORS: Configurable allowed origins
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(s => s.trim());

function getCorsOrigin(reqOrigin: string | null): string {
    if (!reqOrigin) return ALLOWED_ORIGINS[0];
    if (ALLOWED_ORIGINS.includes('*')) return '*';
    if (ALLOWED_ORIGINS.includes(reqOrigin)) return reqOrigin;
    // Allow chrome extensions
    if (reqOrigin.startsWith('chrome-extension://')) return reqOrigin;
    return ALLOWED_ORIGINS[0];
}

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) || [];
    // Remove expired entries
    const valid = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (valid.length >= RATE_LIMIT_MAX) {
        rateLimitMap.set(ip, valid);
        return true;
    }
    valid.push(now);
    rateLimitMap.set(ip, valid);
    return false;
}

// Prune rate limit map periodically to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of rateLimitMap.entries()) {
        const valid = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
        if (valid.length === 0) rateLimitMap.delete(ip);
        else rateLimitMap.set(ip, valid);
    }
    // Cap total tracked IPs to prevent unbounded growth
    if (rateLimitMap.size > MAX_TRACKED_IPS) {
        const toDelete = rateLimitMap.size - MAX_TRACKED_IPS;
        let deleted = 0;
        for (const key of rateLimitMap.keys()) {
            if (deleted >= toDelete) break;
            rateLimitMap.delete(key);
            deleted++;
        }
    }
}, 60_000);

export async function POST(req: NextRequest) {
    try {
        // Rate limiting
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        const origin = req.headers.get('origin');
        const corsOrigin = getCorsOrigin(origin);
        if (isRateLimited(ip)) {
            const res = NextResponse.json({ error: 'Rate limit exceeded. Max 100 requests/minute.' }, { status: 429 });
            res.headers.set('Access-Control-Allow-Origin', corsOrigin);
            return res;
        }

        let text = '';
        let imageBuffer: ArrayBuffer | null = null;
        let mimeType = 'text/plain';

        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            text = formData.get('text') as string || '';
            const imageFile = formData.get('image') as File | null;
            if (imageFile && imageFile.size > 0) {
                // Input validation: image size
                if (imageFile.size > MAX_IMAGE_SIZE) {
                    const res = NextResponse.json({ error: 'Image too large. Maximum 10MB.' }, { status: 413 });
                    res.headers.set('Access-Control-Allow-Origin', corsOrigin);
                    return res;
                }
                // Input validation: MIME type
                if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
                    const res = NextResponse.json({ error: 'Unsupported image format. Allowed: PNG, JPEG, GIF, WebP, BMP.' }, { status: 415 });
                    res.headers.set('Access-Control-Allow-Origin', corsOrigin);
                    return res;
                }
                imageBuffer = await imageFile.arrayBuffer();
                mimeType = imageFile.type;
            }
        } else {
            const body = await req.json();
            text = body.text || '';
            mimeType = body.mimeType || 'text/plain';
        }

        // Input validation: text length
        if (text.length > MAX_TEXT_LENGTH) {
            text = text.substring(0, MAX_TEXT_LENGTH);
        }

        if (!text && !imageBuffer) {
            return NextResponse.json({ error: 'No content provided' }, { status: 400 });
        }

        // Run link analysis
        const linkAnalysis = unicode.detect_homoglyph_links(text);

        // Decode image pixels using sharp (RGBA output)
        let imagePixels: Uint8Array | null = null;
        if (imageBuffer) {
            const { data } = await sharp(Buffer.from(imageBuffer))
                .ensureAlpha() // Force RGBA output to match stegoveritas stride=4
                .raw()
                .toBuffer({ resolveWithObject: true });
            imagePixels = data;
        }

        const detection = await DetectionEngine.analyze(
            text,
            imageBuffer,
            imagePixels,
            mimeType
        );

        let severity = detection.severity as Severity;
        if (linkAnalysis.detected && severity !== 'Critical') {
            severity = 'High';
        }

        const res = NextResponse.json({
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            type: detection.type,
            severity,
            score: detection.score,
            confidence: detection.confidence,
            findings: {
                ...detection.findings,
                link_analysis: linkAnalysis
            },
            reasons: [
                ...detection.reasons,
                ...(linkAnalysis.detected ? ['homoglyph_links_detected'] : [])
            ]
        });

        res.headers.set('Access-Control-Allow-Origin', corsOrigin);
        res.headers.set('X-Content-Type-Options', 'nosniff');
        return res;

    } catch (error: any) {
        console.error('API Scan Error:', error);
        const errRes = NextResponse.json({
            error: error.message || 'Internal Server Error',
        }, { status: 500 });
        errRes.headers.set('Access-Control-Allow-Origin', getCorsOrigin(req.headers.get('origin')));
        return errRes;
    }
}

// Handle preflight requests for CORS
export async function OPTIONS(req: NextRequest) {
    const origin = req.headers.get('origin');
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': getCorsOrigin(origin),
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
