// src/app/services/admin.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Analytics, Vendor } from '../models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7145/api';

  getAnalytics() {
    return this.http.get<Analytics>(`${this.baseUrl}/admin/analytics`);
  }

  getVendors() {
    return this.http.get<Vendor[]>(`${this.baseUrl}/admin/vendors`);
  }

  toggleVendorStatus(vendorId: string) {
    return this.http.patch<Vendor>(`${this.baseUrl}/admin/vendors/${vendorId}/toggle`, {});
  }
}
