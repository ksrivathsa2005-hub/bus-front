// src/app/pages/home/home.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BusService } from '../../services/bus.service';
import { AuthService } from '../../services/auth.service';
import { AuthModalComponent } from '../../components/auth-modal/auth-modal.component';
import { City } from '../../models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private busService = inject(BusService);
  private authService = inject(AuthService);
  private router = inject(Router);

  cities = signal<City[]>([]);
  currentUser = this.authService.currentUser$;

  fromCity = '';
  toCity = '';
  journeyDate = '';
  loginEmail = '';
  loginPassword = '';
  loginError = signal('');
  searchError = signal('');
  isLoading = signal(false);

  showAuthModal = signal(false);
  minDate = new Date().toISOString().split('T')[0];

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

  searchBuses(): void {
    if (!this.fromCity || !this.toCity || !this.journeyDate) {
      this.searchError.set('Please fill in all search fields.');
      return;
    }

    if (this.fromCity === this.toCity) {
      this.searchError.set('Origin and destination cannot be the same.');
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

  swapCities(): void {
    const temp = this.fromCity;
    this.fromCity = this.toCity;
    this.toCity = temp;
  }

  async onQuickLogin() {
    this.loginError.set('');
    if (!this.loginEmail || !this.loginPassword) {
      this.loginError.set('Credentials required.');
      return;
    }

    this.isLoading.set(true);
    try {
      await firstValueFrom(this.authService.login(this.loginEmail, this.loginPassword));
      this.loginEmail = '';
      this.loginPassword = '';
    } catch (error: any) {
      this.loginError.set(error.error?.message || 'Login failed.');
    } finally {
      this.isLoading.set(false);
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
