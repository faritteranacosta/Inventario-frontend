import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routerFeatures } from './router.config';

describe('routerFeatures', () => {
  it('uses hash URLs so GitHub Pages can serve client-side routes', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([], ...routerFeatures)],
    });

    expect(TestBed.inject(LocationStrategy)).toBeInstanceOf(HashLocationStrategy);
  });
});
