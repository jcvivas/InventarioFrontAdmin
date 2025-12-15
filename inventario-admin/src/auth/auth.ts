const TOKEN_KEY = "token";

export function setToken(token: string): void {
  const clean = token.startsWith("Bearer ") ? token.slice(7) : token;
  localStorage.setItem(TOKEN_KEY, clean);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

type JwtPayload = { exp?: number };

function parseJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(normalized)
        .split("")
        .map(c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  const exp = payload?.exp;
  if (!exp) return false; 
  const nowSec = Math.floor(Date.now() / 1000);
  return exp <= nowSec;
}
