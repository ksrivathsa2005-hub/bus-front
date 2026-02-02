// src/app/pages/booking-confirmation/booking-confirmation.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models';
import { firstValueFrom } from 'rxjs';

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

  booking = signal<Booking | null>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    const bookingId = this.route.snapshot.params['id'];
    this.loadBooking(bookingId);
  }

  private async loadBooking(id: string) {
    this.isLoading.set(true);
    try {
      const bookings = await firstValueFrom(this.bookingService.getMyBookings());
      const match = bookings.find(b => b.id === id);
      this.booking.set(match || null);
    } catch (error) {
      console.error('Failed to load booking details', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
