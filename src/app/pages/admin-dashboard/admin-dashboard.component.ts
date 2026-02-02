// src/app/pages/admin-dashboard/admin-dashboard.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Analytics, Vendor, formatCurrency as modelFormatCurrency } from '../../models';
import { firstValueFrom } from 'rxjs';

type TabType = 'overview' | 'vendors';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);

  activeTab = signal<TabType>('overview');
  actionMessage = signal('');
  actionError = signal('');

  analytics = signal<Analytics | null>(null);
  vendors = signal<Vendor[]>([]);

  ngOnInit(): void {
    if (!this.authService.isLoggedIn() || this.authService.getRole() !== 'Admin') {
      this.router.navigate(['/admin']);
      return;
    }
    this.loadData();
  }

  private async loadData() {
    try {
      const data = await firstValueFrom(this.adminService.getAnalytics());
      this.analytics.set(data);
      const vendorList = await firstValueFrom(this.adminService.getVendors());
      this.vendors.set(vendorList);
    } catch (error) {
      console.error('Error loading admin data', error);
    }
  }

  async toggleVendorStatus(id: string) {
    try {
      await firstValueFrom(this.adminService.toggleVendorStatus(id));
      this.actionMessage.set('Vendor status updated.');
      this.loadData();
    } catch (error) {
      this.actionError.set('Failed to update status.');
    }
    setTimeout(() => {
      this.actionMessage.set('');
      this.actionError.set('');
    }, 3000);
  }

  switchTab(tab: TabType): void {
    this.activeTab.set(tab);
    this.actionMessage.set('');
    this.actionError.set('');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin']);
  }

  formatCurrency(amount: number): string {
    return modelFormatCurrency(amount);
  }
}
