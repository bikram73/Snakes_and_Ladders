/**
 * Room Link & URL utilities optimized for static hosting (Netlify, Vercel, GitHub Pages)
 * and cross-device sharing via WhatsApp, SMS, Discord, and browsers.
 */

/**
 * Builds a clean, bulletproof shareable room URL for Netlify and other static hosts.
 *
 * Uses both ?room=CODE (query string) and #room=CODE (hash fragment):
 * - Eliminates double-slash redirects (`//?room=`) that cause Netlify to strip query params.
 * - Protects against CDN edge redirects and social app crawlers stripping query parameters.
 * - Hash fragment is 100% immune to server-side rewrite/redirect issues.
 */
export function buildShareUrl(roomCode: string): string {
  const code = (roomCode || '').trim().toUpperCase();
  if (!code) return '';
  if (typeof window === 'undefined') return `?room=${code}#room=${code}`;

  const origin = window.location.origin;
  // Clean pathname: remove trailing index.html and any trailing slashes
  let cleanPath = window.location.pathname.replace(/\/index\.html$/i, '').replace(/\/+$/, '');
  if (cleanPath === '/') {
    cleanPath = '';
  }

  return `${origin}${cleanPath}/?room=${encodeURIComponent(code)}#room=${encodeURIComponent(code)}`;
}

/**
 * Robust extractor for room codes from:
 * 1. URL search params (?room=CODE, ?join=CODE, ?code=CODE)
 * 2. URL hash (#room=CODE, #join=CODE, #CODE)
 * 3. URL path (/room/CODE, /join/CODE)
 * 4. Pasted full URLs or shared chat messages (e.g. "Join my match! Code: 7KF9A https://...")
 * 5. Direct raw code string
 */
export function extractRoomCode(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();

  // 1. Look for ?room=CODE, ?join=CODE, &code=CODE in query strings or hashes
  const paramMatch = trimmed.match(/[?&#](?:room|join|code)=([a-zA-Z0-9]+)/i);
  if (paramMatch && paramMatch[1]) {
    return paramMatch[1].slice(0, 6).toUpperCase();
  }

  // 2. Look for hash routing like #room=CODE or #7KF9A
  const hashMatch = trimmed.match(/#(?:room=|join=|code=)?([a-zA-Z0-9]{4,6})(?:[/?#]|$)/i);
  if (hashMatch && hashMatch[1]) {
    return hashMatch[1].toUpperCase();
  }

  // 3. Look for /room/CODE or /join/CODE in URL paths
  const pathMatch = trimmed.match(/(?:\/room\/|\/join\/)([a-zA-Z0-9]+)/i);
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1].slice(0, 6).toUpperCase();
  }

  // 4. Look for "code: CODE" or "room: CODE" or "code is CODE" in pasted messages
  const textMatch = trimmed.match(/(?:code|room)(?:\s+is|\s*:|\s*=\s*|\s+)\s*([a-zA-Z0-9]{4,6})/i);
  if (textMatch && textMatch[1]) {
    return textMatch[1].toUpperCase();
  }

  // 5. If it looks like a URL (starts with http, https, www, or contains ://):
  if (/^(?:https?:\/\/|www\.)/i.test(trimmed) || trimmed.includes('://')) {
    const endMatch = trimmed.match(/\/([a-zA-Z0-9]{4,6})(?:[/?#]|$)/);
    if (endMatch && endMatch[1]) {
      return endMatch[1].toUpperCase();
    }
    return '';
  }

  // 6. Direct room code typed or pasted: strip spaces/symbols, limit to 6 chars
  return trimmed.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
}

/**
 * Automatically inspects the current window URL (query, hash, and full href)
 * to detect an incoming room invite code on initial page load or navigation.
 */
export function detectRoomCodeFromCurrentUrl(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Check window.location.search
    const searchParams = new URLSearchParams(window.location.search);
    const fromSearch = searchParams.get('room') || searchParams.get('join') || searchParams.get('code');
    if (fromSearch) {
      const code = extractRoomCode(fromSearch);
      if (code && code.length >= 4) return code;
    }

    // 2. Check window.location.hash
    if (window.location.hash) {
      const fromHash = extractRoomCode(window.location.hash);
      if (fromHash && fromHash.length >= 4) return fromHash;
    }

    // 3. Check window.location.href
    const fromHref = extractRoomCode(window.location.href);
    if (fromHref && fromHref.length >= 4) return fromHref;
  } catch (e) {
    // Ignore URL parse error
  }

  return null;
}

/**
 * Synchronizes the browser address bar with the active room code.
 * Keeps query and hash in sync without reloading the page.
 */
export function syncBrowserUrlWithRoom(code: string | null) {
  if (typeof window === 'undefined' || !window.history || !window.history.replaceState) return;

  try {
    const url = new URL(window.location.href);
    if (code) {
      const cleanCode = code.trim().toUpperCase();
      url.searchParams.set('room', cleanCode);
      url.hash = `room=${cleanCode}`;
      window.history.replaceState({}, '', url.toString());
    } else {
      url.searchParams.delete('room');
      url.searchParams.delete('join');
      url.searchParams.delete('code');
      // Clear hash if it was a room hash
      if (url.hash.includes('room=') || url.hash.includes('join=') || url.hash.includes('code=')) {
        url.hash = '';
      }
      const newPath = url.pathname + (url.search ? url.search : '') + (url.hash ? url.hash : '');
      window.history.replaceState({}, '', newPath);
    }
  } catch (e) {}
}

/**
 * High-reliability clipboard copy with native clipboard API and fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Modern navigator.clipboard
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // fallback
  }

  // 2. Fallback using temporary textarea
  try {
    if (typeof document !== 'undefined') {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '-9999px';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (e) {
    // Ignore fallback failure
  }

  return false;
}
