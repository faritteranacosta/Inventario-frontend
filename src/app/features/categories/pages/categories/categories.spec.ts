import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { CategoriesPage } from './categories';

describe('CategoriesPage', () => {
  let fixture: ComponentFixture<CategoriesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesPage],
      providers: [provideHttpClient()],
    }).compileComponents();
    fixture = TestBed.createComponent(CategoriesPage);
  });

  it('renders the categories heading', () => {
    expect(fixture.nativeElement.textContent).toContain('Categorías');
  });
});
