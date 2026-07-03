
export const getSubdomain = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const host = window.location.hostname;
  
  // Ignore localhost and typical development URLs if they don't have enough parts
  // Standard logic: subdomain.domain.tld
  const parts = host.split('.');
  
  // If we're on a development URL like ais-dev-..., it might have many parts.
  // We usually want to ignore the platform-specific domain.
  // For production domains like kemalavicenna.com:
  // kemalavicenna.com -> parts: ["kemalavicenna", "com"] (length 2)
  // articles.kemalavicenna.com -> parts: ["articles", "kemalavicenna", "com"] (length 3)
  
  if (parts.length >= 3) {
    // Check if it's not just "www"
    if (parts[0] === 'www') return parts.length > 3 ? parts[1] : null;
    
    // In many dev environments, the first part might be the app ID.
    // So we only want to treat it as a subdomain if it matches our known app subdomains.
    const knownSubdomains = ['articles', 'quran', 'practice', 'exam', 'dream'];
    if (knownSubdomains.includes(parts[0])) {
      return parts[0];
    }
  }
  
  return null;
};

export const getSubdomainUrl = (subdomain: string): string => {
  const { protocol, host } = window.location;
  const parts = host.split('.');
  
  // This logic is tricky because it depends on how the user's domain is structured.
  // We'll provide a best-effort implementation.
  if (parts.length >= 2) {
    const domain = parts.slice(-2).join('.');
    return `${protocol}//${subdomain}.${domain}`;
  }
  
  return `${protocol}//${subdomain}.${host}`;
};
