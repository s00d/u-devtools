// Patterns for finding secrets in values or keys
export const SECRET_PATTERNS = [
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'AWS Secret Key', regex: /(aws|amazon).*(key|secret).*[0-9a-zA-Z/+]{40}/i },
  { name: 'Generic API Key', regex: /(api|access)[_-]?(key|token).*['"][\w-]{16,}['"]/i },
  { name: 'Private Key', regex: /-----BEGIN.*PRIVATE KEY-----/ },
  { name: 'Stripe Secret', regex: /sk_live_[0-9a-zA-Z]{24}/ },
  { name: 'Slack Token', regex: /xox[baprs]-([0-9a-zA-Z]{10,48})/ },
  { name: 'Google API Key', regex: /AIza[0-9A-Za-z\\-_]{35}/ },
  { name: 'Firebase Secret', regex: /([0-9a-fA-F]{32})/ },
];

// Env variable keys that are suspicious if accessible on client (VITE_*)
export const SUSPICIOUS_ENV_KEYS = [
  'SECRET',
  'PASSWORD',
  'PASS',
  'TOKEN',
  'KEY',
  'AUTH',
  'CREDENTIAL',
  'PRIVATE',
];
