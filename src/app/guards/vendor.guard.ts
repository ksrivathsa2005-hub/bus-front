// src/app/guards/vendor.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const vendorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.getRole() === 'Vendor') {
    return true;
  }

  router.navigate(['/vendor'], { queryParams: { returnUrl: state.url } });
  return false;
};
