const SECRET = 'jwt-secret';

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export interface JwtPayload {
  sub: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

function simpleSig(input: string) {
  // Non-cryptographic placeholder signature: base64url(SECRET + '.' + input)
  return base64url(`${SECRET}.${input}`);
}

export function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresInSeconds = 3600): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = { ...payload, iat: now, exp: now + expiresInSeconds };

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(fullPayload));
  const data = `${headerB64}.${payloadB64}`;
  const sigB64 = simpleSig(data);
  return `${data}.${sigB64}`;
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    const [headerB64, payloadB64, sigB64] = token.split('.');
    if (!headerB64 || !payloadB64 || !sigB64) return null;
    const data = `${headerB64}.${payloadB64}`;
    const expected = simpleSig(data);
    if (expected !== sigB64) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8')) as JwtPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}
