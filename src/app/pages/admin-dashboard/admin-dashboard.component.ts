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
    // Load analytics from API
    this.adminService.getAnalytics().subscribe({
      next: (analytics) => {
        this.stats.set({
          totalUsers: analytics.totalUsers,
          totalVendors: analytics.totalVendors,
          activeVendors: analytics.activeVendors,
          totalBuses: analytics.totalBuses,
          activeBuses: analytics.activeBuses,
          totalBookings: analytics.totalBookings,
          confirmedBookings: analytics.confirmedBookings,
          cancelledBookings: analytics.cancelledBookings,
          totalRoutes: analytics.totalRoutes,
          totalRevenue: analytics.totalRevenue
        });
        this.mostTravelledRoutes.set(analytics.mostTravelledRoutes || []);
        this.peakTravelDates.set(analytics.peakTravelDates || []);
        this.vendorPerformance.set(analytics.vendorPerformance || []);
        this.busTypeDistribution.set(analytics.busTypeDistribution || []);
      },
      error: (err) => this.actionError.set('Failed to load analytics.')
    });

    // Load vendors
    this.adminService.getVendors().subscribe({
      next: (vendors) => this.vendors.set(vendors),
      error: () => this.vendors.set([])
    });

    // Load users
    this.adminService.getAllUsers().subscribe({
      next: (users) => this.users.set(users),
      error: () => this.users.set([])
    });

    // Load buses
    this.adminService.getAllBuses().subscribe({
      next: (buses) => this.buses.set(buses),
      error: () => this.buses.set([])
    });

    // Load bookings
    this.adminService.getAllBookings().subscribe({
      next: (bookings) => this.bookings.set(bookings),
      error: () => this.bookings.set([])
    });

    // Load routes (static)
    this.routes.set(this.adminService.getAllRoutes());
  }

  switchTab(tab: TabType): void {
    this.activeTab.set(tab);
    this.actionMessage.set('');
    this.actionError.set('');
  }

  toggleVendorStatus(vendorId: string): void {
    this.adminService.toggleVendorStatus(vendorId).subscribe({
      next: (result) => {
        this.actionMessage.set(result.message);
        this.loadAllData();
        this.clearMessages();
      },
      error: (err) => {
        this.actionError.set(err.message || 'Failed to toggle vendor status.');
        this.clearMessages();
      }
    });
  }

  toggleBusStatus(busId: string): void {
    this.adminService.toggleBusStatus(busId).subscribe({
      next: (result) => {
        this.actionMessage.set(result.message);
        this.loadAllData();
        this.clearMessages();
      },
      error: (err) => {
        this.actionError.set(err.message || 'Failed to toggle bus status.');
        this.clearMessages();
      }
    });
  }

  private clearMessages(): void {
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
