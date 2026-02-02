import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  errorMessage = signal('');
  isLoading = signal(false);

  constructor() {
    // If already logged in, redirect to dashboard
    if (this.adminService.isAdminAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  getEmailError(): string {
    const control = this.loginForm.get('email');
    if (control?.hasError('required')) {
      return 'Administrative identifier is required.';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid administrative email format.';
    }
    return '';
  }

  getPasswordError(): string {
    const control = this.loginForm.get('password');
    if (control?.hasError('required')) {
      return 'Master key is required for authentication.';
    }
    if (control?.hasError('minlength')) {
      return 'Master key must contain at least 6 characters.';
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

    this.adminService.adminLogin(email, password).subscribe({
      next: (response) => {
        this.router.navigate(['/admin/dashboard']);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Access denied. Invalid credentials.');
        this.isLoading.set(false);
      }
    });
  }
}
