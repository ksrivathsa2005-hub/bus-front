// src/app/services/bus.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { City, Bus, SeatLayout } from '../models';

@Injectable({ providedIn: 'root' })
export class BusService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7145/api';

  getCities() {
    return this.http.get<City[]>(`${this.baseUrl}/cities`);
  }

  searchBuses(from: string, to: string, date: string) {
    const params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('date', date);
    return this.http.get<Bus[]>(`${this.baseUrl}/buses/search`, { params });
  }

  getBusById(id: string) {
    return this.http.get<Bus>(`${this.baseUrl}/buses/${id}`);
  }

  getSeatLayout(busId: string, date: string) {
    const params = new HttpParams().set('date', date);
    return this.http.get<SeatLayout>(`${this.baseUrl}/buses/${busId}/seats`, { params });
  }
}
