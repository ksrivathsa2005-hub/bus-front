// src/app/pages/seat-selection/seat-selection.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { BusService } from '../../services/bus.service';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { Bus, Seat, CreateBookingRequest, PassengerRequest, Gender, GENDERS, calculateDuration, formatTime } from '../../models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './seat-selection.component.html',
  styleUrl: './seat-selection.component.scss'
})
export class SeatSelectionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private busService = inject(BusService);
  private authService = inject(AuthService);
  private bookingService = inject(BookingService);
  private fb = inject(FormBuilder);

  bus = signal<Bus | null>(null);
  seats = signal<Seat[]>([]);
  date = '';
  selectedSeats = signal<Seat[]>([]);
  currentStep = signal<'seats' | 'details' | 'confirm'>('seats');
  isLoading = signal(false);
  validationError = signal('');
  genders = GENDERS;


  passengerForm!: FormGroup;

  ngOnInit(): void {
    const busId = this.route.snapshot.params['id'];
    this.date = this.route.snapshot.queryParams['date'] || '';
    this.loadData(busId);
    this.initForm();
  }

  private async loadData(busId: string) {
    this.isLoading.set(true);
    try {
      const busData = await firstValueFrom(this.busService.getBusById(busId));
      this.bus.set(busData);
      const layoutData = await firstValueFrom(this.busService.getSeatLayout(busId, this.date));
      this.seats.set(layoutData.seats);
    } catch (error) {
      console.error('Failed to load bus or layout', error);
      this.validationError.set('Failed to load bus or layout data.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private initForm(): void {
    this.passengerForm = this.fb.group({
      passengers: this.fb.array([])
    });
  }

  get passengersArray(): FormArray {
    return this.passengerForm.get('passengers') as FormArray;
  }

  toggleSeat(seat: Seat): void {
    if (!seat.isAvailable) return;

    const selected = this.selectedSeats();
    const index = selected.findIndex(s => s.seatNumber === seat.seatNumber);

    if (index > -1) {
      this.selectedSeats.set(selected.filter(s => s.seatNumber !== seat.seatNumber));
    } else {
      if (selected.length < 6) {
        this.selectedSeats.set([...selected, seat]);
      } else {
        this.validationError.set('Maximum 6 seats can be selected per booking.');
      }
    }
  }

  isSeatSelected(seat: Seat): boolean {
    return this.selectedSeats().some(s => s.seatNumber === seat.seatNumber);
  }

  get totalFare(): number {
    return this.selectedSeats().length * (this.bus()?.fare || 0);
  }

  async proceedToDetails() {
    if (this.selectedSeats().length === 0) {
      this.validationError.set('Please select at least one seat to proceed.');
      return;
    }

    this.validationError.set('');
    this.passengersArray.clear();

    const currentUser = await firstValueFrom(this.authService.currentUser$);

    this.selectedSeats().forEach((seat, index) => {
      this.passengersArray.push(this.fb.group({
        name: [index === 0 && currentUser ? currentUser.fullName : '', Validators.required],
        age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
        gender: ['', Validators.required],
        seatNumber: [seat.seatNumber]
      }));
    });

    this.currentStep.set('details');
  }

  proceedToConfirm(): void {
    if (this.passengerForm.invalid) {
      this.passengerForm.markAllAsTouched();
      this.validationError.set('Please fill in all passenger details correctly.');
      return;
    }
    this.validationError.set('');
    this.currentStep.set('confirm');
  }

  goBack(): void {
    if (this.currentStep() === 'details') {
      this.currentStep.set('seats');
    } else if (this.currentStep() === 'confirm') {
      this.currentStep.set('details');
    }
  }

  async confirmBooking() {
    const bus = this.bus();
    if (!bus) return;

    this.isLoading.set(true);
    this.validationError.set('');

    const passengers: PassengerRequest[] = this.passengersArray.value.map((p: any) => ({
      name: p.name,
      age: Number(p.age),
      gender: Number(p.gender) as Gender,
      seatNumber: p.seatNumber
    }));

    const request: CreateBookingRequest = {
      busId: bus.id,
      travelDate: this.date,
      seats: this.selectedSeats().map(s => s.seatNumber),
      passengers: passengers
    };

    try {
      const response = await firstValueFrom(this.bookingService.createBooking(request));
      this.router.navigate(['/booking-confirmation', response.id]);
    } catch (error: any) {
      this.validationError.set(error.error?.message || 'Booking failed. Some seats might have been taken.');
    } finally {
      this.isLoading.set(false);
    }
  }

  getSeatsByRow(row: number): Seat[] {
    return this.seats().filter(s => s.row === row).sort((a, b) => a.column - b.column);
  }

  getRows(): number[] {
    const rows = new Set(this.seats().map(s => s.row));
    return Array.from(rows).sort((a, b) => a - b);
  }

  formatBusTime(time: string): string {
    return formatTime(time);
  }

  getBusDuration(): string {
    const bus = this.bus();
    return bus ? calculateDuration(bus.departureTime, bus.arrivalTime) : '';
  }
}
