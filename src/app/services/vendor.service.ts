import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Vendor, Bus, Booking, City } from '../models';

export interface VendorLoginResponse {
  token: string;
  vendor: Vendor;
  message: string;
}

export interface VendorDashboardResponse {
  totalBuses: number;
  activeBuses: number;
  totalBookings: number;
  totalRevenue: number;
  seatOccupancy: number;
  mostPopularRoute: string;
  routeStats: { route: string; bookings: number; revenue: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AddBusRequest {
  name: string;
  type: 'Sleeper' | 'Semi-Sleeper' | 'Seater' | 'Luxury';
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  totalSeats: number;
  fare: number;
  amenities: string[];
}

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private currentVendorSignal = signal<Vendor | null>(null);
  private isVendorAuthenticatedSignal = signal<boolean>(false);

  currentVendor = this.currentVendorSignal.asReadonly();
  isVendorAuthenticated = this.isVendorAuthenticatedSignal.asReadonly();

  readonly cities: City[] = [
    { id: 'CHN', name: 'Chennai', state: 'Tamil Nadu', coordinates: { x: 80, y: 25 } },
    { id: 'BLR', name: 'Bengaluru', state: 'Karnataka', coordinates: { x: 35, y: 35 } },
    { id: 'HYD', name: 'Hyderabad', state: 'Telangana', coordinates: { x: 55, y: 30 } },
    { id: 'MUM', name: 'Mumbai', state: 'Maharashtra', coordinates: { x: 15, y: 35 } },
    { id: 'PUN', name: 'Pune', state: 'Maharashtra', coordinates: { x: 20, y: 45 } },
    { id: 'DEL', name: 'Delhi', state: 'Delhi', coordinates: { x: 40, y: 5 } },
  ];

  constructor() {
    this.checkStoredVendorAuth();
  }

  private checkStoredVendorAuth(): void {
    const token = localStorage.getItem('vendorToken');
    const storedVendor = localStorage.getItem('loggedInVendor');

    if (token && storedVendor) {
      try {
        const vendor = JSON.parse(storedVendor);
        this.currentVendorSignal.set(vendor);
        this.isVendorAuthenticatedSignal.set(true);
      } catch {
        this.clearVendorAuth();
      }
    }
  }

  vendorLogin(email: string, password: string): Observable<VendorLoginResponse> {
    return this.http.post<VendorLoginResponse>(`${this.apiUrl}/auth/login`, {
      email,
      password,
      role: 'vendor'
    }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('vendorToken', response.token);
          localStorage.setItem('loggedInVendor', JSON.stringify(response.vendor));
          this.currentVendorSignal.set(response.vendor);
          this.isVendorAuthenticatedSignal.set(true);
        }
      }),
      catchError(this.handleError)
    );
  }

  vendorLogout(): void {
    this.clearVendorAuth();
  }

  private clearVendorAuth(): void {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('loggedInVendor');
    this.currentVendorSignal.set(null);
    this.isVendorAuthenticatedSignal.set(false);
  }

  getCities(): City[] {
    return this.cities;
  }

  // Get vendor dashboard stats
  getDashboard(): Observable<VendorDashboardResponse> {
    return this.http.get<VendorDashboardResponse>(`${this.apiUrl}/vendor/dashboard`)
      .pipe(catchError(this.handleError));
  }

  // Get vendor's buses
  getVendorBuses(): Observable<Bus[]> {
    return this.http.get<Bus[]>(`${this.apiUrl}/vendor/buses`)
      .pipe(catchError(() => of([])));
  }

  // Add a new bus
  addBus(busData: AddBusRequest): Observable<ApiResponse<Bus>> {
    return this.http.post<ApiResponse<Bus>>(`${this.apiUrl}/vendor/buses`, busData)
      .pipe(catchError(this.handleError));
  }

  // Update a bus
  updateBus(busId: string, updates: Partial<Bus>): Observable<ApiResponse<Bus>> {
    return this.http.put<ApiResponse<Bus>>(`${this.apiUrl}/vendor/buses/${busId}`, updates)
      .pipe(catchError(this.handleError));
  }

  // Toggle bus availability
  toggleBusStatus(busId: string): Observable<ApiResponse<Bus>> {
    return this.http.patch<ApiResponse<Bus>>(`${this.apiUrl}/vendor/buses/${busId}/toggle`, {})
      .pipe(catchError(this.handleError));
  }

  // Delete a bus
  deleteBus(busId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/vendor/buses/${busId}`)
      .pipe(catchError(this.handleError));
  }

  // Get booked seats for a bus
  getBookedSeatsForBus(busId: string): Observable<number> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/vendor/buses/${busId}/bookings/count`)
      .pipe(
        catchError(() => of({ count: 0 }))
      ) as Observable<any>;
  }

  getBusTypeOptions(): string[] {
    return ['Sleeper', 'Semi-Sleeper', 'Seater', 'Luxury'];
  }

  getSeatLayoutOptions(): { type: string; seats: number }[] {
    return [
      { type: '2+1 Sleeper', seats: 30 },
      { type: '2+2 Seater', seats: 40 },
      { type: '2+2 Semi-Sleeper', seats: 36 },
      { type: '1+1 Luxury', seats: 24 },
      { type: '2+1 Semi-Sleeper', seats: 33 }
    ];
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred.';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Invalid vendor credentials. Access denied.';
    } else if (error.status === 403) {
      errorMessage = 'Your vendor account has been disabled. Contact administration.';
    }

    return throwError(() => ({ success: false, message: errorMessage }));
  }
}
