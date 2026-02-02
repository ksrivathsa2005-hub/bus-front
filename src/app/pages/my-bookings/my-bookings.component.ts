// src/app/pages/my-bookings/my-bookings.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { Booking, BookingStatus } from '../../models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.scss'
})
export class MyBookingsComponent implements OnInit {
  private authService = inject(AuthService);
  private bookingService = inject(BookingService);

  bookings = signal<Booking[]>([]);
  isLoading = signal(true);
  cancellationMessage = signal('');
  cancellationError = signal('');

  ngOnInit(): void {
    this.loadBookings();
  }

  async loadBookings() {
    this.isLoading.set(true);
    try {
      const data = await firstValueFrom(this.bookingService.getMyBookings());
      this.bookings.set(data.sort((a, b) =>
        new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      ));
    } catch (error) {
      console.error('Failed to load bookings', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async cancelBooking(bookingId: string) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        await firstValueFrom(this.bookingService.cancelBooking(bookingId));
        this.cancellationMessage.set('Booking cancelled successfully.');
        this.loadBookings();
      } catch (error: any) {
        this.cancellationError.set(error.error?.message || 'Failed to cancel booking.');
      }
      setTimeout(() => {
        this.cancellationMessage.set('');
        this.cancellationError.set('');
      }, 5000);
    }
  }

  isPastJourney(booking: Booking): boolean {
    const journeyDate = new Date(booking.travelDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return journeyDate < today;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatDateTime(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get confirmedCount() {
    return this.bookings().filter(b => b.status === BookingStatus.Confirmed).length;
  }

  get cancelledCount() {
    return this.bookings().filter(b => b.status === BookingStatus.Cancelled).length;
  }
}
