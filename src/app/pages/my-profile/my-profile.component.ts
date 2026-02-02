import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BusService } from '../../services/bus.service';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss'
})
export class MyProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private busService = inject(BusService);
  private bookingService = inject(BookingService);
  private fb = inject(FormBuilder);

  currentUser = this.authService.currentUser;
  cities = this.busService.getCities();
  isEditing = signal(false);
  isSaving = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  profileForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const user = this.currentUser();
    this.profileForm = this.fb.group({
      fullName: [user?.fullName || '', [Validators.required, Validators.minLength(3), Validators.maxLength(50), this.nameValidator]],
      email: [{ value: user?.email || '', disabled: true }],
      phone: [user?.phone || '', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      city: [user?.city || ''],
      preferredFrom: [user?.preferredFrom || ''],
      preferredTo: [user?.preferredTo || ''],
      bio: [user?.bio || '']
    }, { validators: this.routeValidator });
  }

  // Custom validator: Name should contain only letters and spaces
  nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value && !/^[a-zA-Z\s]+$/.test(value)) {
      return { invalidName: true };
    }
    return null;
  }

  // Custom validator: From and To cannot be same
  routeValidator(group: FormGroup): ValidationErrors | null {
    const from = group.get('preferredFrom')?.value;
    const to = group.get('preferredTo')?.value;
    if (from && to && from === to) {
      return { sameRoute: true };
    }
    return null;
  }

  getNameError(): string {
    const control = this.profileForm.get('fullName');
    if (control?.hasError('required')) {
      return 'Name is required.';
    }
    if (control?.hasError('minlength')) {
      return 'Name must be at least 3 characters.';
    }
    if (control?.hasError('maxlength')) {
      return 'Name cannot exceed 50 characters.';
    }
    if (control?.hasError('invalidName')) {
      return 'Name should only contain letters and spaces.';
    }
    return '';
  }

  getPhoneError(): string {
    const control = this.profileForm.get('phone');
    if (control?.hasError('required')) {
      return 'Phone number is required.';
    }
    if (control?.hasError('pattern')) {
      return 'Please enter a valid 10-digit phone number.';
    }
    return '';
  }

  getRouteError(): string {
    if (this.profileForm.hasError('sameRoute')) {
      return 'Origin and destination cannot be the same city.';
    }
    return '';
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      this.initForm();
    }
    this.isEditing.set(!this.isEditing());
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.errorMessage.set('Please correct the errors before saving.');
      return;
    }

    if (this.profileForm.hasError('sameRoute')) {
      this.errorMessage.set('Origin and destination cannot be the same city.');
      return;
    }

    this.isSaving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const updates = {
      fullName: this.profileForm.value.fullName,
      phone: this.profileForm.value.phone,
      city: this.profileForm.value.city,
      preferredFrom: this.profileForm.value.preferredFrom,
      preferredTo: this.profileForm.value.preferredTo,
      bio: this.profileForm.value.bio
    };

    this.authService.updateProfile(updates).subscribe({
      next: (response) => {
        this.successMessage.set(response.message || 'Profile updated successfully.');
        this.isEditing.set(false);
        this.isSaving.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Failed to update profile.');
        this.isSaving.set(false);
      }
    });
  }

  get totalBookings(): number {
    return 0; // Will be loaded from bookings
  }

  get memberSince(): string {
    const user = this.currentUser();
    if (!user) return '';
    return new Date(user.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }
}
