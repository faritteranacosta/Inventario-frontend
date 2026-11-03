import { withHashLocation, withRouterConfig } from '@angular/router';

export const routerFeatures = [
  withHashLocation(),
  withRouterConfig({ onSameUrlNavigation: 'reload' }),
] as const;
