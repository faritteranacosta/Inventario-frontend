import { APP_CURRENCY_CODE, APP_LOCALE_ID } from './currency';

describe('currency configuration', () => {
  it('uses Colombian Spanish and pesos colombianos', () => {
    expect(APP_LOCALE_ID).toBe('es-CO');
    expect(APP_CURRENCY_CODE).toBe('COP');
  });
});
