/**
 * Application constants
 */

// DigitalOcean Spaces CDN URL
export const DO_SPACES_CDN_URL = 'https://d4lcdn.tor1.cdn.digitaloceanspaces.com';

// Asset URLs for commonly used assets
export const ASSETS = {
  LOGO: `${DO_SPACES_CDN_URL}/branding/logo.png`,
  FAVICON: `${DO_SPACES_CDN_URL}/branding/favicon.ico`,
  HERO_BG: `${DO_SPACES_CDN_URL}/backgrounds/hero.jpeg`,
  GRID_PATTERN: `${DO_SPACES_CDN_URL}/backgrounds/grid-pattern.svg`,
  
  // Social media icons
  ICONS: {
    TWITTER: `${DO_SPACES_CDN_URL}/icons/twitter.svg`,
    DISCORD: `${DO_SPACES_CDN_URL}/icons/discord.svg`,
    GITHUB: `${DO_SPACES_CDN_URL}/icons/github.svg`,
    TELEGRAM: `${DO_SPACES_CDN_URL}/icons/telegram.svg`,
  },
  
  // Token images
  TOKENS: {
    D4L: `${DO_SPACES_CDN_URL}/tokens/d4l.png`,
    ETH: `${DO_SPACES_CDN_URL}/tokens/eth.png`,
    USDC: `${DO_SPACES_CDN_URL}/tokens/usdc.png`,
  },
  
  // User avatars (placeholders)
  AVATARS: {
    DEFAULT: `${DO_SPACES_CDN_URL}/avatars/default.png`,
  },
};

// Folder structure for organizing uploads
export const UPLOAD_FOLDERS = {
  AVATARS: 'avatars',
  PROOFS: 'proofs',
  DOCUMENTS: 'documents',
  MEDIA: 'media',
  TEMP: 'temp',
};

// Maximum file sizes
export const MAX_FILE_SIZES = {
  AVATAR: 2 * 1024 * 1024, // 2MB
  PROOF: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  MEDIA: 50 * 1024 * 1024, // 50MB
};

// Allowed file extensions
export const ALLOWED_EXTENSIONS = {
  IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  DOCUMENTS: ['.pdf', '.doc', '.docx', '.txt', '.md'],
  MEDIA: ['.mp4', '.mp3', '.wav', '.ogg'],
};
