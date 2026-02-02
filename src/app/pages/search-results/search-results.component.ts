// src/app/search-results/search-results.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BusService } from '../../services/bus.service';
import { AuthService } from '../../services/auth.service';
import { AuthModalComponent } from '../../components/auth-modal/auth-modal.component';
import { Bus, calculateDuration, formatTime, getBusTypeIcon } from '../../models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthModalComponent],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss'
})
export class SearchResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private busService = inject(BusService);
  private authService = inject(AuthService);

  from = '';
  to = '';
  date = '';
  buses = signal<Bus[]>([]);
  isLoading = signal(true);
  showAuthModal = signal(false);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.from = params['from'] || '';
      this.to = params['to'] || '';
      this.date = params['date'] || '';
      if (this.from && this.to && this.date) {
        this.searchBuses();
      }
    });
  }

  private async searchBuses() {
    this.isLoading.set(true);
    try {
      const results = await firstValueFrom(this.busService.searchBuses(this.from, this.to, this.date));
      this.buses.set(results);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  selectBus(bus: Bus): void {
    if (!this.authService.isLoggedIn()) {
      this.showAuthModal.set(true);
      return;
    }

    this.router.navigate(['/seat-selection', bus.id], {
      queryParams: { date: this.date }
    });
  }

  formatDisplayDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getDuration(bus: Bus): string {
    return calculateDuration(bus.departureTime, bus.arrivalTime);
  }

  getFormattedTime(time: string): string {
    return formatTime(time);
  }

  getTypeIcon(type: any): string {
    return getBusTypeIcon(type);
  }
}
