// src/app/services/vendor.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VendorDashboard, Bus, CreateBusRequest, UpdateBusRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class VendorService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7145/api';

  getDashboard() {
    return this.http.get<VendorDashboard>(`${this.baseUrl}/vendor/dashboard`);
  }

  getBuses() {
    return this.http.get<Bus[]>(`${this.baseUrl}/vendor/buses`);
  }

  addBus(busData: CreateBusRequest) {
    return this.http.post<Bus>(`${this.baseUrl}/vendor/buses`, busData);
  }

  updateBus(id: string, busData: UpdateBusRequest) {
    return this.http.put<void>(`${this.baseUrl}/vendor/buses/${id}`, busData);
  }

  deleteBus(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/vendor/buses/${id}`);
  }
}
