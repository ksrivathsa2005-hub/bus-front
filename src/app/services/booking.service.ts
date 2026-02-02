// src/app/services/booking.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateBookingRequest, Booking } from '../models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7145/api';

  createBooking(data: CreateBookingRequest) {
    return this.http.post<Booking>(`${this.baseUrl}/bookings`, data);
  }

  getMyBookings() {
    return this.http.get<Booking[]>(`${this.baseUrl}/bookings/my-bookings`);
  }

  cancelBooking(bookingId: string) {
    return this.http.patch<Booking>(`${this.baseUrl}/bookings/${bookingId}/cancel`, {});
  }
}
