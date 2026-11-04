import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalesPage } from './sales';

describe('SalesPage', () => {
  let fixture: ComponentFixture<SalesPage>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(SalesPage);
    http = TestBed.inject(HttpTestingController);
    http
      .match((request) => request.url.includes('/Products'))
      .forEach((request) => {
        request.flush([
          {
            id: 'product-1',
            name: 'Café',
            description: null,
            price: 5000,
            stock: 4,
            categoryId: 'category-1',
            imageUrl: null,
            createdAtUtc: '2026-01-01T00:00:00Z',
          },
        ]);
      });
    http
      .match((request) => request.url.endsWith('/Sales'))
      .forEach((request) => {
        request.flush([]);
      });
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('shows a cart workflow when registering a sale', () => {
    const registerButton = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
      (button: HTMLButtonElement) => button.textContent?.includes('Registrar venta'),
    );
    registerButton?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#cart-title')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Tu carrito está vacío');
  });

  it('adds a product to the cart and shows its total', () => {
    fixture.componentInstance['activeView'].set('new');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.product-picker button').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Café');
    expect(fixture.nativeElement.textContent).toContain('$5,000.00');
    expect(fixture.nativeElement.textContent).not.toContain('Tu carrito está vacío');
    expect(fixture.componentInstance['lines']()).toHaveLength(1);
    expect(fixture.componentInstance['lines']()[0].quantity).toBe(1);
  });
});
