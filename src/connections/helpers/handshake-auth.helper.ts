function parseCookieHeader(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce(
    (acc, part) => {
      const eq = part.indexOf('=');
      if (eq === -1) return acc;
      const key = part.slice(0, eq).trim();
      const value = part.slice(eq + 1).trim();
      if (key && value) acc[key] = value;
      return acc;
    },
    {} as Record<string, string>,
  );
}

export function getTokenFromHandshake(cookieHeader: string | undefined): string | null {
  const cookies = parseCookieHeader(cookieHeader);
  return cookies['token'] ?? null;
}
