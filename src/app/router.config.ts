import { withRouterConfig } from '@angular/router';

export const routerFeatures = [withRouterConfig({ onSameUrlNavigation: 'reload' })] as const;
