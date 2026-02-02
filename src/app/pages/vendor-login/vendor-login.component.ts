// src/app/pages/vendor-login/vendor-login.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-vendor-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './vendor-login.component.html',
  styleUrl: './vendor-login.component.scss'
})
export class VendorLoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  errorMessage = signal('');
  isLoading = signal(false);

  constructor() {
    if (this.authService.isLoggedIn() && this.authService.getRole() === 'Vendor') {
      this.router.navigate(['/vendor/dashboard']);
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    try {
      const response = await firstValueFrom(this.authService.login(email, password));
      if (response.role === 'Vendor') {
        this.router.navigate(['/vendor/dashboard']);
      } else {
        this.authService.logout();
        this.errorMessage.set('Unauthorized. This access point is for vendors only.');
      }
    } catch (error: any) {
      this.errorMessage.set(error.error?.message || 'Vendor login failed.');
    } finally {
      this.isLoading.set(false);
    }
  }

  getEmailError(): string {
    const control = this.loginForm.get('email');
    if (control?.hasError('required')) return 'Required.';
    if (control?.hasError('email')) return 'Invalid format.';
    return '';
  }

  getPasswordError(): string {
    const control = this.loginForm.get('password');
    if (control?.hasError('required')) return 'Required.';
    return '';
  }
}
