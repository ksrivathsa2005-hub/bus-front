import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { VendorService } from '../services/vendor.service';

export const vendorGuard: CanActivateFn = (route, state) => {
  const vendorService = inject(VendorService);
  const router = inject(Router);

  if (vendorService.isVendorAuthenticated()) {
    return true;
  }

  // Redirect to vendor login
  router.navigate(['/vendor'], { queryParams: { returnUrl: state.url } });
  return false;
};
