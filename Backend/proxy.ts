import { NextRequest, NextResponse } from 'next/server';

const defaultOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:3001',
  'http://127.0.0.1:3001'
];

function getAllowedOrigins() {
  const fromEnv = String(process.env.CORS_ORIGIN || '')
    .split(',')
    .map(function (origin) { return origin.trim(); })
    .filter(Boolean);

  return fromEnv.length ? fromEnv : defaultOrigins;
}

function buildCorsHeaders(origin: string | null) {
  const allowedOrigins = getAllowedOrigins();
  const allowNullOrigin = process.env.NODE_ENV !== 'production';
  const isNullOrigin = origin === 'null';
  const isAllowed = !!origin && allowedOrigins.includes(origin);
  const allowOrigin = isAllowed ? origin : isNullOrigin && allowNullOrigin ? 'null' : '';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    Vary: 'Origin'
  };
}

export function proxy(req: NextRequest) {
  const origin = req.headers.get('origin');
  const headers = buildCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers
    });
  }

  const response = NextResponse.next();
  Object.entries(headers).forEach(function (entry) {
    if (entry[1]) {
      response.headers.set(entry[0], entry[1]);
    }
  });

  return response;
}

export const config = {
  matcher: ['/api/:path*']
};