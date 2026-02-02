import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Get token from localStorage
  const token = localStorage.getItem('authToken');
  const adminToken = localStorage.getItem('adminToken');
  const vendorToken = localStorage.getItem('vendorToken');

  // Determine which token to use based on the request URL
  let activeToken = token;
  if (req.url.includes('/admin')) {
    activeToken = adminToken || token;
  } else if (req.url.includes('/vendor')) {
    activeToken = vendorToken || token;
  }

  // Clone request and add authorization header if token exists
  let authReq = req;
  if (activeToken) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${activeToken}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');

        // Redirect based on the request type
        if (req.url.includes('/admin')) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('loggedInAdmin');
          router.navigate(['/admin']);
        } else if (req.url.includes('/vendor')) {
          localStorage.removeItem('vendorToken');
          localStorage.removeItem('loggedInVendor');
          router.navigate(['/vendor']);
        } else {
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
