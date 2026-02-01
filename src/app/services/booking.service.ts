import { Injectable, signal } from '@angular/core';
import { Booking, Passenger } from '../models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private bookingsSignal = signal<Booking[]>([]);
  bookings = this.bookingsSignal.asReadonly();

  constructor(private authService: AuthService) {
    this.loadBookings();
  }

  private loadBookings(): void {
    const stored = localStorage.getItem('bookings');
    if (stored) {
      this.bookingsSignal.set(JSON.parse(stored));
    }
  }

  createBooking(booking: Omit<Booking, 'id' | 'oderId' | 'bookedAt' | 'status'>): Booking {
    const newBooking: Booking = {
      ...booking,
      id: this.generateBookingId(),
      oderId: this.generateOrderId(),
      status: 'confirmed',
      bookedAt: new Date()
    };

    const allBookings = [...this.bookingsSignal(), newBooking];
    this.bookingsSignal.set(allBookings);
    localStorage.setItem('bookings', JSON.stringify(allBookings));

    return newBooking;
  }

  getUserBookings(userId: string): Booking[] {
    return this.bookingsSignal().filter(b => b.userId === userId);
  }

  cancelBooking(bookingId: string): boolean {
    const bookings = this.bookingsSignal();
    const index = bookings.findIndex(b => b.id === bookingId);

    if (index !== -1) {
      const updatedBookings = [...bookings];
      updatedBookings[index] = { ...updatedBookings[index], status: 'cancelled' };
      this.bookingsSignal.set(updatedBookings);
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));
      return true;
    }

    return false;
  }

  getBookingById(bookingId: string): Booking | undefined {
    return this.bookingsSignal().find(b => b.id === bookingId);
  }

  getUserJourneysForRoute(userId: string, from: string, to: string): Booking[] {
    return this.bookingsSignal().filter(b =>
      b.userId === userId &&
      b.from.toLowerCase() === from.toLowerCase() &&
      b.to.toLowerCase() === to.toLowerCase()
    );
  }

  private generateBookingId(): string {
    return 'BKG-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  }

  private generateOrderId(): string {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `NJC-${year}-${random}`;
  }
}
