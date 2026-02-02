import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { BusService } from '../../services/bus.service';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { Bus, Seat } from '../../models';

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

  bus: Bus | undefined;
  seats: Seat[] = [];
  date = '';
  selectedSeats = signal<Seat[]>([]);
  currentStep = signal<'seats' | 'details' | 'confirm'>('seats');
  isLoading = signal(false);
  validationError = signal('');

  passengerForm!: FormGroup;
  currentUser = this.authService.currentUser;

  ngOnInit(): void {
    const busId = this.route.snapshot.params['id'];
    this.date = this.route.snapshot.queryParams['date'] || '';

    this.isLoading.set(true);

    // Load bus and booked seats
    forkJoin({
      bus: this.busService.getBusById(busId),
      bookedSeats: this.busService.getBookedSeats(busId, this.date)
    }).subscribe({
      next: ({ bus, bookedSeats }) => {
        this.bus = bus;
        if (bus) {
          this.seats = this.busService.generateSeatsForBus(bus, bookedSeats);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });

    this.initForm();
  }

  private initForm(): void {
    this.passengerForm = this.fb.group({
      passengers: this.fb.array([])
    });
  }

  get passengersArray(): FormArray {
    return this.passengerForm.get('passengers') as FormArray;
  }

  // Custom validator for passenger name
  nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value && !/^[a-zA-Z\s]+$/.test(value)) {
      return { invalidName: true };
    }
    if (value && value.trim().length < 2) {
      return { minlength: true };
    }
    return null;
  }

  // Custom validator for age
  ageValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value !== null && value !== '') {
      const age = Number(value);
      if (isNaN(age) || !Number.isInteger(age)) {
        return { invalidAge: true };
      }
      if (age < 1) {
        return { minAge: true };
      }
      if (age > 120) {
        return { maxAge: true };
      }
      if (age < 5) {
        return { infantAge: true };
      }
    }
    return null;
  }

  toggleSeat(seat: Seat): void {
    if (seat.isBooked) return;

    const selected = this.selectedSeats();
    const index = selected.findIndex(s => s.id === seat.id);

    if (index > -1) {
      this.selectedSeats.set(selected.filter(s => s.id !== seat.id));
    } else {
      if (selected.length < 6) {
        this.selectedSeats.set([...selected, seat]);
      } else {
        this.validationError.set('Maximum 6 seats can be selected per booking.');
      }
    }
  }

  isSeatSelected(seat: Seat): boolean {
    return this.selectedSeats().some(s => s.id === seat.id);
  }

  get totalFare(): number {
    return this.selectedSeats().reduce((sum, seat) => sum + seat.price, 0);
  }

  proceedToDetails(): void {
    if (this.selectedSeats().length === 0) {
      this.validationError.set('Please select at least one seat to proceed.');
      return;
    }

    this.validationError.set('');

    // Clear and rebuild passengers form
    this.passengersArray.clear();
    const user = this.currentUser();

    this.selectedSeats().forEach((seat, index) => {
      this.passengersArray.push(this.fb.group({
        name: [index === 0 && user ? user.fullName : '', [Validators.required, this.nameValidator.bind(this)]],
        age: ['', [Validators.required, this.ageValidator.bind(this)]],
        gender: ['', Validators.required],
        seatNumber: [seat.number]
      }));
    });

    this.currentStep.set('details');
  }

  getPassengerNameError(index: number): string {
    const control = this.passengersArray.at(index).get('name');
    if (control?.hasError('required')) {
      return 'Passenger name is required.';
    }
    if (control?.hasError('invalidName')) {
      return 'Name should only contain letters and spaces.';
    }
    if (control?.hasError('minlength')) {
      return 'Name must be at least 2 characters.';
    }
    return '';
  }

  getPassengerAgeError(index: number): string {
    const control = this.passengersArray.at(index).get('age');
    if (control?.hasError('required')) {
      return 'Age is required.';
    }
    if (control?.hasError('invalidAge')) {
      return 'Please enter a valid age.';
    }
    if (control?.hasError('minAge')) {
      return 'Age must be at least 1.';
    }
    if (control?.hasError('maxAge')) {
      return 'Age cannot exceed 120 years.';
    }
    if (control?.hasError('infantAge')) {
      return 'Children below 5 years require guardian accompaniment.';
    }
    return '';
  }

  getPassengerGenderError(index: number): string {
    const control = this.passengersArray.at(index).get('gender');
    if (control?.hasError('required')) {
      return 'Please select gender.';
    }
    return '';
  }

  hasInfants(): boolean {
    return this.passengersArray.controls.some(control => {
      const age = control.get('age')?.value;
      return age && Number(age) < 5;
    });
  }

  proceedToConfirm(): void {
    if (this.passengerForm.invalid) {
      this.passengerForm.markAllAsTouched();
      this.validationError.set('Please fill in all passenger details correctly.');
      return;
    }

    // Check for infants
    if (this.hasInfants()) {
      this.validationError.set('Children below 5 years need guardian accompaniment. Please update the age or add an adult guardian.');
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

  confirmBooking(): void {
    if (!this.bus || !this.currentUser()) return;

    this.isLoading.set(true);

    const bookingData = {
      busId: this.bus.id,
      busName: this.bus.name,
      from: this.bus.from,
      to: this.bus.to,
      date: this.date,
      departureTime: this.bus.departureTime,
      arrivalTime: this.bus.arrivalTime,
      seats: this.selectedSeats().map(s => s.number),
      passengers: this.passengerForm.value.passengers,
      totalFare: this.totalFare
    };

    this.bookingService.createBooking(bookingData).subscribe({
      next: (response) => {
        if (response.booking) {
          this.router.navigate(['/booking-confirmation', response.booking.id]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.validationError.set(err.message || 'Failed to create booking. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  getSeatRows(): Seat[][] {
    const rows: Seat[][] = [];
    const seatsPerRow = this.bus?.type === 'Sleeper' ? 6 : 8;

    for (let i = 0; i < this.seats.length; i += seatsPerRow) {
      rows.push(this.seats.slice(i, i + seatsPerRow));
    }

    return rows;
  }
}
