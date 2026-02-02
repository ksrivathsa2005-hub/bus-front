// src/app/pages/route-map/route-map.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BusService } from '../../services/bus.service';
import { AuthService } from '../../services/auth.service';
import { City } from '../../models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-route-map',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './route-map.component.html',
  styleUrl: './route-map.component.scss'
})
export class RouteMapComponent implements OnInit {
  private busService = inject(BusService);
  private authService = inject(AuthService);

  cities = signal<City[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData() {
    this.isLoading.set(true);
    try {
      const data = await firstValueFrom(this.busService.getCities());
      this.cities.set(data);
    } catch (error) {
      console.error('Failed to load map data', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Simplified logic for a broken map (since coordinates are gone in new model)
  getCityPosition(city: City) {
    // Return some default or calculated positions if we want to show anything
    return { x: 50, y: 50 };
  }
}
