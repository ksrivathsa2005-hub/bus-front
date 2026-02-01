import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AdminService } from '../services/admin.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const adminService = inject(AdminService);
  const router = inject(Router);

  if (adminService.isAdminAuthenticated()) {
    return true;
  }

  // Redirect to admin login
  router.navigate(['/admin'], { queryParams: { returnUrl: state.url } });
  return false;
};
