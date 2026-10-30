import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { LandingPage } from './landing-page';

describe('LandingPage', () => {
  let fixture: ComponentFixture<LandingPage>;
  let component: LandingPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea', () => {
    expect(component).toBeTruthy();
  });

  it('navega al panel administrativo', () => {
    const router = TestBed.inject(Router);
    const spy = jest.spyOn(router, 'navigate');
    (component as unknown as { goToAdmin: () => void }).goToAdmin();
    expect(spy).toHaveBeenCalledWith(['/admin']);
  });
});
