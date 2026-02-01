import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { vendorGuard } from './guards/vendor.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'vendor',
    loadComponent: () => import('./pages/vendor-login/vendor-login.component').then(m => m.VendorLoginComponent)
  },
  {
    path: 'vendor/dashboard',
    loadComponent: () => import('./pages/vendor-dashboard/vendor-dashboard.component').then(m => m.VendorDashboardComponent),
    canActivate: [vendorGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search-results/search-results.component').then(m => m.SearchResultsComponent)
  },
  {
    path: 'seat-selection/:id',
    loadComponent: () => import('./pages/seat-selection/seat-selection.component').then(m => m.SeatSelectionComponent),
    canActivate: [authGuard]
  },
  {
    path: 'booking-confirmation/:id',
    loadComponent: () => import('./pages/booking-confirmation/booking-confirmation.component').then(m => m.BookingConfirmationComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-bookings',
    loadComponent: () => import('./pages/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-profile',
    loadComponent: () => import('./pages/my-profile/my-profile.component').then(m => m.MyProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'route-map',
    loadComponent: () => import('./pages/route-map/route-map.component').then(m => m.RouteMapComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
