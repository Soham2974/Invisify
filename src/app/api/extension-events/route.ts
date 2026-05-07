import { NextRequest, NextResponse } from 'next/server';
import { addExtensionEvent, listExtensionEvents } from '@/lib/extension-events-store';
import type { ExtensionEvent } from '@/lib/soc-types';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim());

function getCorsOrigin(reqOrigin: string | null): string {
  if (!reqOrigin) return ALLOWED_ORIGINS[0];
  if (ALLOWED_ORIGINS.includes('*')) return '*';
  if (ALLOWED_ORIGINS.includes(reqOrigin)) return reqOrigin;
  if (reqOrigin.startsWith('chrome-extension://')) return reqOrigin;
  if (reqOrigin.includes('mail.google.com')) return reqOrigin;
  return ALLOWED_ORIGINS[0];
}

function withCors(res: NextResponse, origin: string | null) {
  res.headers.set('Access-Control-Allow-Origin', getCorsOrigin(origin));
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res;
}

const MAX_EVENTS_LIMIT = 1000;

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    const limitRaw = req.nextUrl.searchParams.get('limit');
    let limit = limitRaw ? Number(limitRaw) : 100;
    if (!Number.isFinite(limit) || limit < 1) limit = 100;
    if (limit > MAX_EVENTS_LIMIT) limit = MAX_EVENTS_LIMIT;
    const events = listExtensionEvents(limit);
    return withCors(NextResponse.json({ events }), origin);
  } catch (error: any) {
    console.error('Extension events GET error:', error);
    return withCors(
      NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 }),
      origin
    );
  }
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    const body = (await req.json()) as Partial<ExtensionEvent>;
    if (!body || typeof body !== 'object') {
      return withCors(NextResponse.json({ error: 'Invalid payload' }, { status: 400 }), origin);
    }

    // Sanitize and validate inputs
    const score = Number(body.score || 0);
    const fingerprint = String(body.fingerprint || '').slice(0, 64);

    const event = addExtensionEvent({
      emailSubject: String(body.emailSubject || 'Unknown Subject').slice(0, 500),
      sender: String(body.sender || 'unknown@sender').slice(0, 320),
      threatType: String(body.threatType || 'None').slice(0, 100),
      score: Number.isFinite(score) ? score : 0,
      severity: (body.severity as ExtensionEvent['severity']) || 'Safe',
      action: (body.action as ExtensionEvent['action']) || 'allowed',
      fingerprint: fingerprint,
      source: (body.source as ExtensionEvent['source']) || 'inbound',
      timestamp: body.timestamp,
      id: body.id,
    });

    return withCors(NextResponse.json({ ok: true, event }), origin);
  } catch (error: any) {
    console.error('Extension events POST error:', error);
    return withCors(
      NextResponse.json({ error: error?.message || 'Failed to store extension event' }, { status: 500 }),
      origin
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': getCorsOrigin(origin),
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    },
  });
}
