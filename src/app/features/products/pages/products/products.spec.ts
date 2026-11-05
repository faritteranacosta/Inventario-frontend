import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsPage } from './products';

describe('ProductsPage', () => {
  let fixture: ComponentFixture<ProductsPage>;
  let http: HttpTestingController;

  beforeEach(async () => {
    localStorage.setItem('inventario.auth.token', 'test-token');
    localStorage.setItem(
      'inventario.auth.user',
      JSON.stringify({
        id: 'user-1',
        tenantId: 'tenant-1',
        email: 'admin@stokio.test',
        role: 'Admin',
        createdAtUtc: '2026-01-01T00:00:00Z',
      }),
    );
    localStorage.setItem(
      'inventario.auth.session',
      JSON.stringify({
        id: 'user-1',
        email: 'admin@stokio.test',
        platformRole: null,
        activeTenantId: 'tenant-1',
        activeTenantName: 'Stokio',
        activeTenantLogoUrl: null,
        memberships: [],
      }),
    );
    await TestBed.configureTestingModule({
      imports: [ProductsPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductsPage);
    http = TestBed.inject(HttpTestingController);
    http
      .match((request) => request.url.includes('/Products') && !request.url.includes('/alerts'))
      .forEach((request) => {
        request.flush({
          items: [
            {
              id: 'product-1',
              name: 'Producto de prueba',
              description: null,
              price: 1000,
              stock: 3,
              categoryId: 'category-1',
              imageUrl: null,
              minimumStock: 5,
              barcode: null,
              createdAtUtc: '2026-01-01T00:00:00Z',
            },
          ],
          page: 1,
          pageSize: 25,
          totalItems: 1,
          totalPages: 1,
        });
      });
    http
      .match((request) => request.url.includes('/Products/alerts'))
      .forEach((request) => {
        request.flush([]);
      });
    http
      .match((request) => request.url.includes('/Categories'))
      .forEach((request) => {
        request.flush([]);
      });
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('offers camera and file selection without exposing an image URL field', () => {
    const newProductButton = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
      (button: HTMLButtonElement) => button.textContent?.includes('Nuevo producto'),
    );
    expect(newProductButton).toBeDefined();
    newProductButton?.click();
    fixture.detectChanges();
    const fileInputs = fixture.nativeElement.querySelectorAll(
      'input[type="file"][accept="image/*"]',
    );

    expect(fileInputs.length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelector('input[type="url"]')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Guardar URL');
  });

  it('renders product actions as accessible icon buttons', () => {
    expect(
      fixture.nativeElement.querySelector('button[aria-label="Editar producto"]'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('button[aria-label="Cambiar imagen"]'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('button[aria-label="Eliminar producto"]'),
    ).not.toBeNull();
  });

  it('switches between list and grid views', () => {
    const gridButton = fixture.nativeElement.querySelector(
      'button[aria-label="Ver productos en rejilla"]',
    );
    gridButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.product-grid')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.table-wrap')).toBeNull();
    expect(gridButton.getAttribute('aria-pressed')).toBe('true');
  });

  afterEach(() => localStorage.clear());
});
