import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  errorMessage = signal('');
  isLoading = signal(false);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  getEmailError(): string {
    const control = this.loginForm.get('email');
    if (control?.hasError('required')) {
      return 'Email address is required to access the route.';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email format (e.g., traveler@journey.com).';
    }
    return '';
  }

  getPasswordError(): string {
    const control = this.loginForm.get('password');
    if (control?.hasError('required')) {
      return 'Password is required for authentication.';
    }
    if (control?.hasError('minlength')) {
      return 'Password must contain at least 6 characters.';
    }
    return '';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage.set('Please correct the errors above to proceed.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Login failed. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
}
