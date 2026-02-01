import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BusService } from '../../services/bus.service';
import { AuthService } from '../../services/auth.service';
import { AuthModalComponent } from '../../components/auth-modal/auth-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private busService = inject(BusService);
  private authService = inject(AuthService);
  private router = inject(Router);

  cities = this.busService.getCities();
  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;

  fromCity = '';
  toCity = '';
  journeyDate = '';
  loginEmail = '';
  loginPassword = '';
  loginError = '';
  searchError = signal('');

  showAuthModal = signal(false);
  minDate = new Date().toISOString().split('T')[0];

  get popularRoutes() {
    return this.busService.getRoutes().slice(0, 6);
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  searchBuses(): void {
    // Validate all fields
    if (!this.fromCity) {
      this.searchError.set('Please select a departure city.');
      return;
    }

    if (!this.toCity) {
      this.searchError.set('Please select an arrival city.');
      return;
    }

    if (this.fromCity === this.toCity) {
      this.searchError.set('Departure and arrival cities cannot be the same.');
      return;
    }

    if (!this.journeyDate) {
      this.searchError.set('Please select a travel date.');
      return;
    }

    // Check if date is in the past
    const selectedDate = new Date(this.journeyDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      this.searchError.set('Travel date cannot be in the past.');
      return;
    }

    // Check if date is too far in the future (90 days)
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    if (selectedDate > maxDate) {
      this.searchError.set('Bookings are only available for the next 90 days.');
      return;
    }

    this.searchError.set('');
    this.router.navigate(['/search'], {
      queryParams: {
        from: this.fromCity,
        to: this.toCity,
        date: this.journeyDate
      }
    });
  }

  selectRoute(from: string, to: string): void {
    this.fromCity = from;
    this.toCity = to;
    this.journeyDate = this.minDate;
    this.searchError.set('');
  }

  swapCities(): void {
    const temp = this.fromCity;
    this.fromCity = this.toCity;
    this.toCity = temp;
    this.searchError.set('');
  }

  onQuickLogin(): void {
    this.loginError = '';

    if (!this.loginEmail) {
      this.loginError = 'Email address is required.';
      return;
    }

    if (!this.validateEmail(this.loginEmail)) {
      this.loginError = 'Please enter a valid email format.';
      return;
    }

    if (!this.loginPassword) {
      this.loginError = 'Password is required.';
      return;
    }

    if (this.loginPassword.length < 6) {
      this.loginError = 'Password must be at least 6 characters.';
      return;
    }

    const result = this.authService.login(this.loginEmail, this.loginPassword);
    if (!result.success) {
      this.loginError = result.message;
    } else {
      this.loginEmail = '';
      this.loginPassword = '';
    }
  }
}
