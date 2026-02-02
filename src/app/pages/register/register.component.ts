// src/app/pages/register/register.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BusService } from '../../services/bus.service';
import { City, RegisterRequest } from '../../models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private busService = inject(BusService);
  private router = inject(Router);

  currentStep = signal(1);
  errorMessage = signal('');
  isLoading = signal(false);
  cities = signal<City[]>([]);

  registerForm: FormGroup;

  constructor() {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      city: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadCities();
  }

  private async loadCities() {
    try {
      const data = await firstValueFrom(this.busService.getCities());
      this.cities.set(data);
    } catch (error) {
      console.error('Failed to load cities', error);
    }
  }

  passwordMatchValidator(group: FormGroup) {
    const p = group.get('password')?.value;
    const cp = group.get('confirmPassword')?.value;
    return p === cp ? null : { passwordMismatch: true };
  }

  nextStep(): void {
    if (this.registerForm.get('fullName')?.invalid ||
      this.registerForm.get('email')?.invalid ||
      this.registerForm.get('phone')?.invalid ||
      this.registerForm.get('password')?.invalid ||
      this.registerForm.get('confirmPassword')?.invalid ||
      this.registerForm.hasError('passwordMismatch')) {

      this.registerForm.get('fullName')?.markAsTouched();
      this.registerForm.get('email')?.markAsTouched();
      this.registerForm.get('phone')?.markAsTouched();
      this.registerForm.get('password')?.markAsTouched();
      this.registerForm.get('confirmPassword')?.markAsTouched();

      this.errorMessage.set('Please fill identity details correctly.');
      return;
    }
    this.errorMessage.set('');
    this.currentStep.set(2);
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const formData = this.registerForm.value;
    const request: RegisterRequest = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      city: formData.city
    };

    try {
      await firstValueFrom(this.authService.register(request));
      this.router.navigate(['/']);
    } catch (error: any) {
      this.errorMessage.set(error.error?.message || 'Registration failed.');
    } finally {
      this.isLoading.set(false);
    }
  }

  getEmailError(): string { return ''; }
  getNameError(): string { return ''; }
  getPhoneError(): string { return ''; }
  getPasswordError(): string { return ''; }
  getConfirmPasswordError(): string { return ''; }
  getCityError(): string { return ''; }
}
