// Môi trường TypeScript cho Cloudflare Workers
export interface Env {
  CORS_ORIGIN: string;
  GOOGLE_CLIENT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;
}

// Hàm chuyển chuỗi Base64 thông thường sang Base64Url
function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Lấy OAuth Token từ Google thông qua JWT (Web Crypto)
async function getGoogleAuthToken(email: string, privateKey: string): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: email,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedClaim = btoa(JSON.stringify(claim));
  const unsignedToken = `${encodedHeader}.${encodedClaim}`;

  // Chuẩn bị Private Key (Import)
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  
  // Clean format
  let cleanKey = privateKey.replace(/\\n/g, '\n');
  if (!cleanKey.includes(pemHeader)) cleanKey = `${pemHeader}\n${cleanKey}\n${pemFooter}`;
  
  const pemContents = cleanKey.replace(pemHeader, "").replace(pemFooter, "").replace(/\s/g, "");
  const binaryDerString = atob(pemContents);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signedToken = `${unsignedToken}.${base64UrlEncode(signature)}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${signedToken}`
  });

  const data: any = await response.json();
  if (!response.ok) throw new Error(`Google Auth Error: ${JSON.stringify(data)}`);
  return data.access_token;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Xử lý CORS Options
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Range, Authorization',
          'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length, Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const match = url.pathname.match(/^\/api\/stream\/gdrive\/([a-zA-Z0-9_-]+)/);
    if (!match) {
      return new Response('File ID Not Found', { status: 404 });
    }

    const fileId = match[1];

    try {
      if (!env.GOOGLE_CLIENT_EMAIL || !env.GOOGLE_PRIVATE_KEY) {
        return new Response('Server Configuration Error: Missing Google Credentials', { status: 500 });
      }

      const token = await getGoogleAuthToken(env.GOOGLE_CLIENT_EMAIL, env.GOOGLE_PRIVATE_KEY);
      const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

      // Pass the Range header from the client to Google Drive
      const reqHeaders = new Headers();
      reqHeaders.set('Authorization', `Bearer ${token}`);
      const range = request.headers.get('Range');
      if (range) reqHeaders.set('Range', range);

      const response = await fetch(driveUrl, { headers: reqHeaders });

      if (!response.ok) {
        const errorText = await response.text();
        return new Response(`Google Drive API Error: ${response.status} - ${errorText}`, { status: response.status });
      }

      // Proxy everything back to the client natively
      const resHeaders = new Headers(response.headers);
      resHeaders.set('Access-Control-Allow-Origin', env.CORS_ORIGIN || '*');
      resHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      resHeaders.set('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length, Content-Type');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: resHeaders,
      });

    } catch (err: any) {
      return new Response(`Worker Error: ${err.message}`, { status: 500 });
    }
  },
};
