import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models';

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
  currentUser = this.authService.currentUser;

  ngOnInit(): void {
    this.loadBookings();
  }

  private loadBookings(): void {
    this.isLoading.set(true);
    this.bookingService.getMyBookings().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings.sort((a, b) =>
          new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
        ));
        this.isLoading.set(false);
      },
      error: () => {
        this.bookings.set([]);
        this.isLoading.set(false);
      }
    });
  }

  // Check if booking can be cancelled (at least 4 hours before departure)
  canCancelBooking(booking: Booking): { canCancel: boolean; reason: string } {
    const journeyDate = new Date(booking.date);
    const now = new Date();

    // If journey date has passed
    if (journeyDate < now) {
      return { canCancel: false, reason: 'This journey has already passed.' };
    }

    // Parse departure time (e.g., "10:30 PM")
    const timeParts = booking.departureTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeParts) {
      let hours = parseInt(timeParts[1]);
      const minutes = parseInt(timeParts[2]);
      const period = timeParts[3].toUpperCase();

      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      journeyDate.setHours(hours, minutes, 0, 0);
    }

    const hoursUntilDeparture = (journeyDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDeparture < 4) {
      return { canCancel: false, reason: 'Cancellation not allowed within 4 hours of departure.' };
    }

    return { canCancel: true, reason: '' };
  }

  cancelBooking(booking: Booking): void {
    this.cancellationMessage.set('');
    this.cancellationError.set('');

    const validationResult = this.canCancelBooking(booking);

    if (!validationResult.canCancel) {
      this.cancellationError.set(validationResult.reason);
      setTimeout(() => this.cancellationError.set(''), 5000);
      return;
    }

    if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      this.bookingService.cancelBooking(booking.id).subscribe({
        next: () => {
          this.cancellationMessage.set('Booking cancelled successfully. Refund will be processed within 5-7 business days.');
          setTimeout(() => this.cancellationMessage.set(''), 5000);
          this.loadBookings();
        },
        error: (err) => {
          this.cancellationError.set(err.message || 'Failed to cancel booking.');
          setTimeout(() => this.cancellationError.set(''), 5000);
        }
      });
    }
  }

  isPastJourney(booking: Booking): boolean {
    const journeyDate = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return journeyDate < today;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatBookedAt(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get confirmedBookings(): Booking[] {
    return this.bookings().filter(b => b.status === 'confirmed');
  }

  get cancelledBookings(): Booking[] {
    return this.bookings().filter(b => b.status === 'cancelled');
  }
}
