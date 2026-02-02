import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Booking, Passenger } from '../models';

export interface CreateBookingRequest {
  busId: string;
  busName: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  seats: string[];
  passengers: Passenger[];
  totalFare: number;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  booking?: Booking;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private bookingsSignal = signal<Booking[]>([]);
  bookings = this.bookingsSignal.asReadonly();

  // Create a new booking
  createBooking(bookingData: CreateBookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.apiUrl}/bookings`, bookingData)
      .pipe(
        tap(response => {
          if (response.booking) {
            const current = this.bookingsSignal();
            this.bookingsSignal.set([...current, response.booking]);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Get current user's bookings
  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings/my-bookings`)
      .pipe(
        tap(bookings => this.bookingsSignal.set(bookings)),
        catchError(error => {
          console.error('Error fetching bookings:', error);
          return throwError(() => error);
        })
      );
  }

  // Cancel a booking
  cancelBooking(bookingId: string): Observable<BookingResponse> {
    return this.http.patch<BookingResponse>(`${this.apiUrl}/bookings/${bookingId}/cancel`, {})
      .pipe(
        tap(response => {
          if (response.success) {
            const updated = this.bookingsSignal().map(b =>
              b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
            );
            this.bookingsSignal.set(updated);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Get booking by ID
  getBookingById(bookingId: string): Observable<Booking | undefined> {
    return this.http.get<Booking>(`${this.apiUrl}/bookings/${bookingId}`)
      .pipe(
        catchError(() => {
          // Try to find in local cache
          const booking = this.bookingsSignal().find(b => b.id === bookingId);
          return throwError(() => booking);
        })
      );
  }

  // Get user's bookings for a specific route
  getUserJourneysForRoute(from: string, to: string): Observable<Booking[]> {
    return this.getMyBookings().pipe(
      map(bookings => bookings.filter(b =>
        b.from.toLowerCase() === from.toLowerCase() &&
        b.to.toLowerCase() === to.toLowerCase()
      ))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred with your booking.';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Please login to manage bookings.';
    } else if (error.status === 404) {
      errorMessage = 'Booking not found.';
    } else if (error.status === 400) {
      errorMessage = 'Invalid booking request.';
    }

    return throwError(() => ({ success: false, message: errorMessage }));
  }
}
