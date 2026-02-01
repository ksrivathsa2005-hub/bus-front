import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BusService } from '../../services/bus.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private busService = inject(BusService);
  private router = inject(Router);

  currentStep = signal(1);
  errorMessage = signal('');
  isLoading = signal(false);
  cities = this.busService.getCities();

  step1Form: FormGroup;
  step2Form: FormGroup;

  travelerTypes = [
    'The Night Owl - I travel when the world sleeps',
    'The Early Bird - Dawn journeys are my calling',
    'The Wanderer - No schedule, just the road',
    'The Planner - Every mile is calculated',
    'The Explorer - New routes excite me',
    'The Comfort Seeker - Luxury is my companion'
  ];

  constructor() {
    this.step1Form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), this.nameValidator]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.step2Form = this.fb.group({
      city: ['', Validators.required],
      preferredFrom: [''],
      preferredTo: [''],
      bio: ['']
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

  // Custom validator: Password strength
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value && !/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
      return { weakPassword: true };
    }
    return null;
  }

  // Custom validator: Passwords must match
  passwordMatchValidator(group: FormGroup): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
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
    const control = this.step1Form.get('fullName');
    if (control?.hasError('required')) {
      return 'Full name is required to join the journey.';
    }
    if (control?.hasError('minlength')) {
      return 'Name must be at least 3 characters long.';
    }
    if (control?.hasError('maxlength')) {
      return 'Name cannot exceed 50 characters.';
    }
    if (control?.hasError('invalidName')) {
      return 'Name should only contain letters and spaces.';
    }
    return '';
  }

  getEmailError(): string {
    const control = this.step1Form.get('email');
    if (control?.hasError('required')) {
      return 'Email is required for your journey manifest.';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email format.';
    }
    return '';
  }

  getPhoneError(): string {
    const control = this.step1Form.get('phone');
    if (control?.hasError('required')) {
      return 'Phone number is required for journey updates.';
    }
    if (control?.hasError('pattern')) {
      return 'Please enter a valid 10-digit phone number.';
    }
    return '';
  }

  getPasswordError(): string {
    const control = this.step1Form.get('password');
    if (control?.hasError('required')) {
      return 'Password is required to secure your account.';
    }
    if (control?.hasError('minlength')) {
      return 'Password must be at least 6 characters.';
    }
    if (control?.hasError('maxlength')) {
      return 'Password cannot exceed 20 characters.';
    }
    if (control?.hasError('weakPassword')) {
      return 'Password must contain both letters and numbers.';
    }
    return '';
  }

  getConfirmPasswordError(): string {
    const control = this.step1Form.get('confirmPassword');
    if (control?.hasError('required')) {
      return 'Please confirm your password.';
    }
    if (this.step1Form.hasError('passwordMismatch')) {
      return 'Passwords do not match.';
    }
    return '';
  }

  getCityError(): string {
    const control = this.step2Form.get('city');
    if (control?.hasError('required')) {
      return 'Please select your home city to continue.';
    }
    return '';
  }

  getRouteError(): string {
    if (this.step2Form.hasError('sameRoute')) {
      return 'Origin and destination cannot be the same city.';
    }
    return '';
  }

  nextStep(): void {
    if (this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      this.errorMessage.set('Please correct the errors above to proceed.');
      return;
    }

    if (this.step1Form.hasError('passwordMismatch')) {
      this.errorMessage.set('Passwords do not match. Please verify.');
      return;
    }

    this.errorMessage.set('');
    this.currentStep.set(2);
  }

  prevStep(): void {
    this.currentStep.set(1);
  }

  onSubmit(): void {
    if (this.step2Form.invalid) {
      this.step2Form.markAllAsTouched();
      this.errorMessage.set('Please select your home city.');
      return;
    }

    if (this.step2Form.hasError('sameRoute')) {
      this.errorMessage.set('Origin and destination cannot be the same.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const userData = {
      fullName: this.step1Form.value.fullName,
      email: this.step1Form.value.email,
      phone: this.step1Form.value.phone,
      password: this.step1Form.value.password,
      city: this.step2Form.value.city,
      preferredFrom: this.step2Form.value.preferredFrom || '',
      preferredTo: this.step2Form.value.preferredTo || '',
      bio: this.step2Form.value.bio || ''
    };

    setTimeout(() => {
      const result = this.authService.register(userData);

      if (result.success) {
        this.router.navigate(['/']);
      } else {
        this.errorMessage.set(result.message);
      }

      this.isLoading.set(false);
    }, 1000);
  }
}
