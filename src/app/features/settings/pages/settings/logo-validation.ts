const MAX_LOGO_SIZE = 5 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = new Set([
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/webp',
]);

export function validateLogoFile(file: File): string | null {
  if (!ALLOWED_LOGO_TYPES.has(file.type)) {
    return 'Formato no permitido. Usa JPG, PNG, GIF, WebP o SVG.';
  }
  if (file.size > MAX_LOGO_SIZE) {
    return 'La imagen supera el límite de 5 MB.';
  }
  return null;
}
