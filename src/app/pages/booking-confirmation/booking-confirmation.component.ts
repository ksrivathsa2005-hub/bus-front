import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './booking-confirmation.component.html',
  styleUrl: './booking-confirmation.component.scss'
})
export class BookingConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingService);

  booking = signal<Booking | undefined>(undefined);

  ngOnInit(): void {
    const bookingId = this.route.snapshot.params['id'];
    this.bookingService.getBookingById(bookingId).subscribe({
      next: (booking) => this.booking.set(booking),
      error: () => this.booking.set(undefined)
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
