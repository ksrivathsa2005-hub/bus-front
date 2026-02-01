import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { VendorService } from '../../services/vendor.service';

@Component({
  selector: 'app-vendor-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './vendor-login.component.html',
  styleUrl: './vendor-login.component.scss'
})
export class VendorLoginComponent {
  private fb = inject(FormBuilder);
  private vendorService = inject(VendorService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  errorMessage = signal('');
  isLoading = signal(false);

  constructor() {
    // If already logged in, redirect to dashboard
    if (this.vendorService.isVendorAuthenticated()) {
      this.router.navigate(['/vendor/dashboard']);
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  getEmailError(): string {
    const control = this.loginForm.get('email');
    if (control?.hasError('required')) {
      return 'Vendor email address is required.';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid vendor email format.';
    }
    return '';
  }

  getPasswordError(): string {
    const control = this.loginForm.get('password');
    if (control?.hasError('required')) {
      return 'Security key is required for access.';
    }
    if (control?.hasError('minlength')) {
      return 'Security key must contain at least 6 characters.';
    }
    return '';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage.set('Please correct the errors above.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    setTimeout(() => {
      const result = this.vendorService.vendorLogin(email, password);

      if (result.success) {
        this.router.navigate(['/vendor/dashboard']);
      } else {
        this.errorMessage.set(result.message);
      }

      this.isLoading.set(false);
    }, 800);
  }
}
