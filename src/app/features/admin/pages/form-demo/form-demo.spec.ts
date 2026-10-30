import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { FormDemoPage } from './form-demo';

describe('FormDemoPage', () => {
  let fixture: ComponentFixture<FormDemoPage>;
  let component: FormDemoPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormDemoPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FormDemoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  interface Internals {
    submitted: () => boolean;
    submit: () => void;
    form: import('@angular/forms').FormGroup;
  }
  const internals = (): Internals => component as unknown as Internals;

  it('se crea', () => {
    expect(component).toBeTruthy();
  });

  it('no marca enviado cuando el formulario es inválido', () => {
    internals().submit();
    expect(internals().submitted()).toBe(false);
  });

  it('marca enviado cuando el formulario es válido', () => {
    internals().form.setValue({
      name: 'Audífonos',
      sku: 'AUD-001',
      category: 'electronica',
      warehouse: 'principal',
      quantity: 10,
      minimumStock: 2,
      description: '',
    });
    internals().submit();
    expect(internals().submitted()).toBe(true);
  });
});
