import { validateLogoFile } from './logo-validation';

describe('validateLogoFile', () => {
  it('accepts supported raster and SVG image formats', () => {
    expect(validateLogoFile(new File(['png'], 'logo.png', { type: 'image/png' }))).toBeNull();
    expect(validateLogoFile(new File(['svg'], 'logo.svg', { type: 'image/svg+xml' }))).toBeNull();
    expect(validateLogoFile(new File(['webp'], 'logo.webp', { type: 'image/webp' }))).toBeNull();
  });

  it('rejects unsupported formats with an actionable message', () => {
    expect(validateLogoFile(new File(['pdf'], 'logo.pdf', { type: 'application/pdf' }))).toBe(
      'Formato no permitido. Usa JPG, PNG, GIF, WebP o SVG.',
    );
  });

  it('rejects files larger than 5 MB', () => {
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'logo.png', {
      type: 'image/png',
    });

    expect(validateLogoFile(file)).toBe('La imagen supera el límite de 5 MB.');
  });
});
