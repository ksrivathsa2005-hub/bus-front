import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Admin, Vendor, User, Bus, Booking, Route } from '../models';

export interface AdminLoginResponse {
  token: string;
  admin: Admin;
  message: string;
}

export interface AnalyticsResponse {
  totalUsers: number;
  totalVendors: number;
  activeVendors: number;
  totalBuses: number;
  activeBuses: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRoutes: number;
  totalRevenue: number;
  mostTravelledRoutes: { route: string; count: number }[];
  peakTravelDates: { date: string; count: number }[];
  busTypeDistribution: { type: string; count: number }[];
  vendorPerformance: { vendor: string; buses: number; enabled: boolean }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private currentAdminSignal = signal<Admin | null>(null);
  private isAdminAuthenticatedSignal = signal<boolean>(false);

  currentAdmin = this.currentAdminSignal.asReadonly();
  isAdminAuthenticated = this.isAdminAuthenticatedSignal.asReadonly();

  constructor() {
    this.checkStoredAdminAuth();
  }

  private checkStoredAdminAuth(): void {
    const token = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('loggedInAdmin');

    if (token && storedAdmin) {
      try {
        const admin = JSON.parse(storedAdmin);
        this.currentAdminSignal.set(admin);
        this.isAdminAuthenticatedSignal.set(true);
      } catch {
        this.clearAdminAuth();
      }
    }
  }

  adminLogin(email: string, password: string): Observable<AdminLoginResponse> {
    return this.http.post<AdminLoginResponse>(`${this.apiUrl}/auth/login`, {
      email,
      password,
      role: 'admin'
    }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('adminToken', response.token);
          localStorage.setItem('loggedInAdmin', JSON.stringify(response.admin));
          this.currentAdminSignal.set(response.admin);
          this.isAdminAuthenticatedSignal.set(true);
        }
      }),
      catchError(this.handleError)
    );
  }

  adminLogout(): void {
    this.clearAdminAuth();
  }

  private clearAdminAuth(): void {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('loggedInAdmin');
    this.currentAdminSignal.set(null);
    this.isAdminAuthenticatedSignal.set(false);
  }

  // Get analytics/dashboard data
  getAnalytics(): Observable<AnalyticsResponse> {
    return this.http.get<AnalyticsResponse>(`${this.apiUrl}/admin/analytics`)
      .pipe(catchError(this.handleError));
  }

  // Get all vendors
  getVendors(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${this.apiUrl}/admin/vendors`)
      .pipe(catchError(() => of([])));
  }

  // Toggle vendor status
  toggleVendorStatus(vendorId: string): Observable<ApiResponse<Vendor>> {
    return this.http.patch<ApiResponse<Vendor>>(`${this.apiUrl}/admin/vendors/${vendorId}/toggle`, {})
      .pipe(catchError(this.handleError));
  }

  // Get all users (if API supports it)
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/admin/users`)
      .pipe(catchError(() => of([])));
  }

  // Get all buses (if API supports it)
  getAllBuses(): Observable<Bus[]> {
    return this.http.get<Bus[]>(`${this.apiUrl}/admin/buses`)
      .pipe(catchError(() => of([])));
  }

  // Toggle bus status (if API supports it)
  toggleBusStatus(busId: string): Observable<ApiResponse<Bus>> {
    return this.http.patch<ApiResponse<Bus>>(`${this.apiUrl}/admin/buses/${busId}/toggle`, {})
      .pipe(catchError(this.handleError));
  }

  // Get all bookings (if API supports it)
  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/admin/bookings`)
      .pipe(catchError(() => of([])));
  }

  // Get all routes
  getAllRoutes(): Route[] {
    return [
      { id: 'R1', from: 'Chennai', to: 'Bengaluru', distance: 350, duration: '6h 30m', buses: [] },
      { id: 'R2', from: 'Bengaluru', to: 'Chennai', distance: 350, duration: '6h 30m', buses: [] },
      { id: 'R3', from: 'Chennai', to: 'Hyderabad', distance: 630, duration: '8h', buses: [] },
      { id: 'R4', from: 'Hyderabad', to: 'Chennai', distance: 630, duration: '8h', buses: [] },
      { id: 'R5', from: 'Bengaluru', to: 'Hyderabad', distance: 570, duration: '7h', buses: [] },
      { id: 'R6', from: 'Hyderabad', to: 'Bengaluru', distance: 570, duration: '7h', buses: [] },
      { id: 'R7', from: 'Chennai', to: 'Mumbai', distance: 1330, duration: '12h', buses: [] },
      { id: 'R8', from: 'Mumbai', to: 'Chennai', distance: 1330, duration: '12h', buses: [] },
      { id: 'R9', from: 'Bengaluru', to: 'Mumbai', distance: 980, duration: '10h', buses: [] },
      { id: 'R10', from: 'Mumbai', to: 'Bengaluru', distance: 980, duration: '10h', buses: [] },
    ];
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred.';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Access denied. Invalid administrative credentials.';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    }

    return throwError(() => ({ success: false, message: errorMessage }));
  }
}
