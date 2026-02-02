import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BusService } from '../../services/bus.service';
import { AuthService } from '../../services/auth.service';
import { AuthModalComponent } from '../../components/auth-modal/auth-modal.component';
import { Bus } from '../../models';

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

  isAuthenticated = this.authService.isAuthenticated;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.from = params['from'] || '';
      this.to = params['to'] || '';
      this.date = params['date'] || '';
      this.searchBuses();
    });
  }

  private searchBuses(): void {
    // Stop API call if any required field is missing
    if (!this.from || !this.to || !this.date) {
      console.warn('Search blocked: missing required fields (from, to, or date)');
      this.isLoading.set(false);
      this.buses.set([]);
      return;
    }

    this.isLoading.set(true);

    this.busService.searchBuses(this.from, this.to, this.date).subscribe({
      next: (results) => {
        this.buses.set(results);
        this.isLoading.set(false);
      },
      error: () => {
        this.buses.set([]);
        this.isLoading.set(false);
      }
    });
  }

  selectBus(bus: Bus): void {
    if (!this.isAuthenticated()) {
      this.showAuthModal.set(true);
      return;
    }

    this.router.navigate(['/seat-selection', bus.id], {
      queryParams: { date: this.date }
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getAmenitiesArray(amenities: string | string[] | undefined): string[] {
    if (!amenities) return [];
    if (Array.isArray(amenities)) return amenities;
    // If it's a comma-separated string, split it
    return amenities.split(',').map(a => a.trim()).filter(a => a.length > 0);
  }

  getAmenityIcon(amenity: string): string {
    const icons: { [key: string]: string } = {
      'WiFi': '📶',
      'AC': '❄️',
      'Blanket': '🛏️',
      'Water': '💧',
      'Charging Point': '🔌',
      'TV': '📺',
      'Snacks': '🍿',
      'Pillow': '🛋️'
    };
    return icons[amenity] || '✓';
  }
}
