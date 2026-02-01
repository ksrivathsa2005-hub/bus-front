import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { User, Vendor, Bus, Booking, Route } from '../../models';

type TabType = 'overview' | 'users' | 'vendors' | 'buses' | 'routes' | 'bookings';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);

  currentAdmin = this.adminService.currentAdmin;
  activeTab = signal<TabType>('overview');
  actionMessage = signal('');
  actionError = signal('');

  // Data signals
  users = signal<User[]>([]);
  vendors = signal<Vendor[]>([]);
  buses = signal<Bus[]>([]);
  bookings = signal<Booking[]>([]);
  routes = signal<Route[]>([]);

  // Stats
  stats = signal({
    totalUsers: 0,
    totalVendors: 0,
    activeVendors: 0,
    totalBuses: 0,
    activeBuses: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    totalRoutes: 0,
    totalRevenue: 0
  });

  mostTravelledRoutes = signal<{ route: string; count: number }[]>([]);
  peakTravelDates = signal<{ date: string; count: number }[]>([]);
  vendorPerformance = signal<{ vendor: string; buses: number; enabled: boolean }[]>([]);
  busTypeDistribution = signal<{ type: string; count: number }[]>([]);

  ngOnInit(): void {
    if (!this.adminService.isAdminAuthenticated()) {
      this.router.navigate(['/admin']);
      return;
    }
    this.loadAllData();
  }

  private loadAllData(): void {
    // Load all data
    this.users.set(this.adminService.getAllUsers());
    this.vendors.set(this.adminService.getVendors());
    this.buses.set(this.adminService.getAllBuses());
    this.bookings.set(this.adminService.getAllBookings());
    this.routes.set(this.adminService.getAllRoutes());

    // Load stats
    this.stats.set({
      totalUsers: this.adminService.getUserCount(),
      totalVendors: this.adminService.getVendorCount(),
      activeVendors: this.adminService.getActiveVendorCount(),
      totalBuses: this.adminService.getBusCount(),
      activeBuses: this.adminService.getActiveBusCount(),
      totalBookings: this.adminService.getBookingCount(),
      confirmedBookings: this.adminService.getConfirmedBookingCount(),
      cancelledBookings: this.adminService.getCancelledBookingCount(),
      totalRoutes: this.adminService.getRouteCount(),
      totalRevenue: this.adminService.getTotalRevenue()
    });

    // Load analytics
    this.mostTravelledRoutes.set(this.adminService.getMostTravelledRoutes());
    this.peakTravelDates.set(this.adminService.getPeakTravelDates());
    this.vendorPerformance.set(this.adminService.getVendorPerformance());
    this.busTypeDistribution.set(this.adminService.getBusTypeDistribution());
  }

  switchTab(tab: TabType): void {
    this.activeTab.set(tab);
    this.actionMessage.set('');
    this.actionError.set('');
  }

  toggleVendorStatus(vendorId: string): void {
    const result = this.adminService.toggleVendorStatus(vendorId);
    if (result.success) {
      this.actionMessage.set(result.message);
      this.loadAllData();
    } else {
      this.actionError.set(result.message);
    }
    setTimeout(() => {
      this.actionMessage.set('');
      this.actionError.set('');
    }, 3000);
  }

  toggleBusStatus(busId: string): void {
    const result = this.adminService.toggleBusStatus(busId);
    if (result.success) {
      this.actionMessage.set(result.message);
      this.loadAllData();
    } else {
      this.actionError.set(result.message);
    }
    setTimeout(() => {
      this.actionMessage.set('');
      this.actionError.set('');
    }, 3000);
  }

  logout(): void {
    this.adminService.adminLogout();
    this.router.navigate(['/admin']);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getVendorName(vendorId: string | undefined): string {
    if (!vendorId) return 'Unknown';
    const vendor = this.vendors().find(v => v.id === vendorId);
    return vendor?.companyName || 'Unknown';
  }

  getUserName(userId: string): string {
    const user = this.users().find(u => u.id === userId);
    return user?.fullName || 'Unknown User';
  }
}
