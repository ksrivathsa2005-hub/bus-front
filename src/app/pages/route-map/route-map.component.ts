import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BusService } from '../../services/bus.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { City, Route, Bus } from '../../models';

@Component({
  selector: 'app-route-map',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './route-map.component.html',
  styleUrl: './route-map.component.scss'
})
export class RouteMapComponent {
  private busService = inject(BusService);
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);

  cities = this.busService.getCities();
  routes = this.busService.getRoutes();
  currentUser = this.authService.currentUser;

  selectedRoute = signal<Route | null>(null);
  selectedCity = signal<City | null>(null);
  hoveredCity = signal<string | null>(null);
  routeBuses = signal<Bus[]>([]);
  routePastJourneys = signal<number>(0);

  selectRoute(route: Route): void {
    this.selectedRoute.set(route);
    this.selectedCity.set(null);

    // Load buses for this route
    this.busService.getBusesForRoute(route.from, route.to).subscribe({
      next: (buses) => this.routeBuses.set(buses),
      error: () => this.routeBuses.set([])
    });

    // Load past journeys count
    this.bookingService.getUserJourneysForRoute(route.from, route.to).subscribe({
      next: (bookings) => this.routePastJourneys.set(bookings.length),
      error: () => this.routePastJourneys.set(0)
    });
  }

  selectCity(city: City): void {
    this.selectedCity.set(city);
    this.selectedRoute.set(null);
  }

  closePanel(): void {
    this.selectedRoute.set(null);
    this.selectedCity.set(null);
  }

  getRoutesForCity(city: City): Route[] {
    return this.routes.filter(r =>
      r.from === city.name || r.to === city.name
    );
  }


  getLineCoordinates(route: Route): { x1: number; y1: number; x2: number; y2: number } | null {
    const fromCity = this.cities.find(c => c.name === route.from);
    const toCity = this.cities.find(c => c.name === route.to);

    if (!fromCity || !toCity) return null;

    return {
      x1: fromCity.coordinates.x,
      y1: fromCity.coordinates.y,
      x2: toCity.coordinates.x,
      y2: toCity.coordinates.y
    };
  }

  isRouteSelected(route: Route): boolean {
    return this.selectedRoute()?.id === route.id;
  }

  isCitySelected(city: City): boolean {
    return this.selectedCity()?.id === city.id;
  }
}
