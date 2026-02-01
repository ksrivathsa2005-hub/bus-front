import { Injectable, signal, computed } from '@angular/core';
import { Admin, Vendor, User, Bus, Booking, Route } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private currentAdminSignal = signal<Admin | null>(null);
  private isAdminAuthenticatedSignal = signal<boolean>(false);

  currentAdmin = this.currentAdminSignal.asReadonly();
  isAdminAuthenticated = this.isAdminAuthenticatedSignal.asReadonly();

  // Hardcoded admin credentials for demo
  private readonly adminAccounts: Admin[] = [
    {
      id: 'ADMIN-SUPER-001',
      name: 'Super Administrator',
      email: 'admin@njc.com',
      password: 'admin123',
      role: 'super_admin',
      createdAt: new Date('2020-01-01')
    },
    {
      id: 'ADMIN-002',
      name: 'Operations Manager',
      email: 'ops@njc.com',
      password: 'ops123',
      role: 'admin',
      createdAt: new Date('2021-06-15')
    }
  ];

  // Demo vendors
  private readonly demoVendors: Vendor[] = [
    {
      id: 'VND-001',
      companyName: 'Night Voyager Travels',
      ownerName: 'Rajesh Kumar',
      email: 'nightvoyager@travels.com',
      phone: '9876543210',
      password: 'vendor123',
      address: 'Chennai, Tamil Nadu',
      registrationNumber: 'TN-BUS-2019-001',
      busCount: 5,
      isEnabled: true,
      createdAt: new Date('2019-03-15')
    },
    {
      id: 'VND-002',
      companyName: 'Royal Heritage Buses',
      ownerName: 'Suresh Menon',
      email: 'royalheritage@buses.com',
      phone: '9876543211',
      password: 'vendor123',
      address: 'Bengaluru, Karnataka',
      registrationNumber: 'KA-BUS-2020-045',
      busCount: 3,
      isEnabled: true,
      createdAt: new Date('2020-07-22')
    },
    {
      id: 'VND-003',
      companyName: 'Malabar Express Ltd',
      ownerName: 'Mohammed Ashraf',
      email: 'malabar@express.com',
      phone: '9876543212',
      password: 'vendor123',
      address: 'Kochi, Kerala',
      registrationNumber: 'KL-BUS-2018-112',
      busCount: 4,
      isEnabled: true,
      createdAt: new Date('2018-11-05')
    },
    {
      id: 'VND-004',
      companyName: 'Temple City Travels',
      ownerName: 'Anand Sharma',
      email: 'templecity@travels.com',
      phone: '9876543213',
      password: 'vendor123',
      address: 'Madurai, Tamil Nadu',
      registrationNumber: 'TN-BUS-2021-078',
      busCount: 2,
      isEnabled: false,
      createdAt: new Date('2021-02-28')
    }
  ];

  constructor() {
    this.seedVendors();
    this.checkStoredAdminAuth();
  }

  private seedVendors(): void {
    const vendors = this.getVendors();
    let updated = false;

    this.demoVendors.forEach(demoVendor => {
      if (!vendors.find(v => v.id === demoVendor.id)) {
        vendors.push(demoVendor);
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem('vendors', JSON.stringify(vendors));
    }
  }

  private checkStoredAdminAuth(): void {
    const storedAdmin = localStorage.getItem('loggedInAdmin');
    if (storedAdmin) {
      const admin = JSON.parse(storedAdmin);
      this.currentAdminSignal.set(admin);
      this.isAdminAuthenticatedSignal.set(true);
    }
  }

  adminLogin(email: string, password: string): { success: boolean; message: string } {
    const admin = this.adminAccounts.find(a => a.email === email && a.password === password);

    if (admin) {
      this.currentAdminSignal.set(admin);
      this.isAdminAuthenticatedSignal.set(true);
      localStorage.setItem('loggedInAdmin', JSON.stringify(admin));
      return { success: true, message: 'Welcome to the High Command, Administrator.' };
    }

    return { success: false, message: 'Access denied. Invalid administrative credentials.' };
  }

  adminLogout(): void {
    this.currentAdminSignal.set(null);
    this.isAdminAuthenticatedSignal.set(false);
    localStorage.removeItem('loggedInAdmin');
  }

  // ========== USER MANAGEMENT ==========
  getAllUsers(): User[] {
    const stored = localStorage.getItem('users');
    return stored ? JSON.parse(stored) : [];
  }

  getUserCount(): number {
    return this.getAllUsers().length;
  }

  // ========== VENDOR MANAGEMENT ==========
  getVendors(): Vendor[] {
    const stored = localStorage.getItem('vendors');
    return stored ? JSON.parse(stored) : [];
  }

  getVendorCount(): number {
    return this.getVendors().length;
  }

  getActiveVendorCount(): number {
    return this.getVendors().filter(v => v.isEnabled).length;
  }

  toggleVendorStatus(vendorId: string): { success: boolean; message: string } {
    const vendors = this.getVendors();
    const index = vendors.findIndex(v => v.id === vendorId);

    if (index !== -1) {
      vendors[index].isEnabled = !vendors[index].isEnabled;
      localStorage.setItem('vendors', JSON.stringify(vendors));
      const status = vendors[index].isEnabled ? 'enabled' : 'disabled';
      return { success: true, message: `Vendor ${vendors[index].companyName} has been ${status}.` };
    }

    return { success: false, message: 'Vendor not found.' };
  }

  // ========== BUS MANAGEMENT ==========
  getAllBuses(): Bus[] {
    // Get from bus service mock data and localStorage for status
    const busStatuses = this.getBusStatuses();
    const buses: Bus[] = [
      { id: 'B1', name: 'Night Voyager Express', type: 'Sleeper', from: 'Chennai', to: 'Bengaluru', departureTime: '21:00', arrivalTime: '05:30', duration: '8h 30m', fare: 850, totalSeats: 36, availableSeats: 24, amenities: ['WiFi', 'Blanket', 'Water', 'Charging Point'], rating: 4.5, vendorId: 'VND-001', isEnabled: busStatuses['B1'] !== false },
      { id: 'B2', name: 'Midnight Cruiser', type: 'Semi-Sleeper', from: 'Chennai', to: 'Bengaluru', departureTime: '22:30', arrivalTime: '06:00', duration: '7h 30m', fare: 650, totalSeats: 40, availableSeats: 18, amenities: ['AC', 'Blanket', 'Charging Point'], rating: 4.2, vendorId: 'VND-001', isEnabled: busStatuses['B2'] !== false },
      { id: 'B3', name: 'Royal Heritage', type: 'Luxury', from: 'Chennai', to: 'Bengaluru', departureTime: '20:00', arrivalTime: '04:00', duration: '8h', fare: 1200, totalSeats: 24, availableSeats: 12, amenities: ['WiFi', 'TV', 'Snacks', 'Blanket', 'Pillow', 'Charging Point'], rating: 4.8, vendorId: 'VND-002', isEnabled: busStatuses['B3'] !== false },
      { id: 'B4', name: 'Kovai Express', type: 'Sleeper', from: 'Chennai', to: 'Coimbatore', departureTime: '21:30', arrivalTime: '06:30', duration: '9h', fare: 750, totalSeats: 36, availableSeats: 20, amenities: ['AC', 'Blanket', 'Water'], rating: 4.3, vendorId: 'VND-001', isEnabled: busStatuses['B4'] !== false },
      { id: 'B5', name: 'Nilgiri Traveler', type: 'Semi-Sleeper', from: 'Chennai', to: 'Coimbatore', departureTime: '23:00', arrivalTime: '07:30', duration: '8h 30m', fare: 550, totalSeats: 40, availableSeats: 28, amenities: ['AC', 'Charging Point'], rating: 4.0, vendorId: 'VND-001', isEnabled: busStatuses['B5'] !== false },
      { id: 'B6', name: 'Temple City Runner', type: 'Sleeper', from: 'Chennai', to: 'Madurai', departureTime: '20:30', arrivalTime: '05:00', duration: '8h 30m', fare: 680, totalSeats: 36, availableSeats: 15, amenities: ['AC', 'Blanket', 'Water', 'Charging Point'], rating: 4.4, vendorId: 'VND-004', isEnabled: busStatuses['B6'] !== false },
      { id: 'B7', name: 'Pandyan Express', type: 'Seater', from: 'Chennai', to: 'Madurai', departureTime: '06:00', arrivalTime: '14:00', duration: '8h', fare: 450, totalSeats: 48, availableSeats: 32, amenities: ['AC'], rating: 3.9, vendorId: 'VND-004', isEnabled: busStatuses['B7'] !== false },
      { id: 'B8', name: 'Malabar Night Rider', type: 'Sleeper', from: 'Bengaluru', to: 'Kochi', departureTime: '21:00', arrivalTime: '07:00', duration: '10h', fare: 980, totalSeats: 36, availableSeats: 22, amenities: ['WiFi', 'TV', 'Blanket', 'Snacks'], rating: 4.6, vendorId: 'VND-003', isEnabled: busStatuses['B8'] !== false },
      { id: 'B9', name: 'Backwater Express', type: 'Semi-Sleeper', from: 'Bengaluru', to: 'Kochi', departureTime: '22:00', arrivalTime: '07:30', duration: '9h 30m', fare: 720, totalSeats: 40, availableSeats: 16, amenities: ['AC', 'Blanket', 'Charging Point'], rating: 4.1, vendorId: 'VND-003', isEnabled: busStatuses['B9'] !== false },
      { id: 'B10', name: 'Western Ghats Voyager', type: 'Luxury', from: 'Bengaluru', to: 'Coimbatore', departureTime: '22:30', arrivalTime: '05:30', duration: '7h', fare: 950, totalSeats: 24, availableSeats: 10, amenities: ['WiFi', 'TV', 'Snacks', 'Blanket', 'Pillow'], rating: 4.7, vendorId: 'VND-002', isEnabled: busStatuses['B10'] !== false },
      { id: 'B11', name: 'Kongu Express', type: 'Sleeper', from: 'Bengaluru', to: 'Coimbatore', departureTime: '21:30', arrivalTime: '05:00', duration: '7h 30m', fare: 680, totalSeats: 36, availableSeats: 25, amenities: ['AC', 'Blanket', 'Water'], rating: 4.2, vendorId: 'VND-002', isEnabled: busStatuses['B11'] !== false },
      { id: 'B12', name: 'Palakkad Shuttle', type: 'Semi-Sleeper', from: 'Coimbatore', to: 'Kochi', departureTime: '08:00', arrivalTime: '12:30', duration: '4h 30m', fare: 380, totalSeats: 40, availableSeats: 30, amenities: ['AC', 'Water'], rating: 4.0, vendorId: 'VND-003', isEnabled: busStatuses['B12'] !== false },
      { id: 'B13', name: 'Rock Fort Express', type: 'Sleeper', from: 'Chennai', to: 'Trichy', departureTime: '22:00', arrivalTime: '04:30', duration: '6h 30m', fare: 520, totalSeats: 36, availableSeats: 28, amenities: ['AC', 'Blanket', 'Charging Point'], rating: 4.3, vendorId: 'VND-001', isEnabled: busStatuses['B13'] !== false },
      { id: 'B14', name: 'Kaveri Cruiser', type: 'Seater', from: 'Chennai', to: 'Trichy', departureTime: '07:00', arrivalTime: '13:00', duration: '6h', fare: 350, totalSeats: 48, availableSeats: 35, amenities: ['AC'], rating: 3.8, vendorId: 'VND-001', isEnabled: busStatuses['B14'] !== false },
      { id: 'B15', name: 'Temple Link', type: 'Seater', from: 'Trichy', to: 'Madurai', departureTime: '09:00', arrivalTime: '12:00', duration: '3h', fare: 220, totalSeats: 48, availableSeats: 40, amenities: ['AC', 'Water'], rating: 4.0, vendorId: 'VND-004', isEnabled: busStatuses['B15'] !== false },
      { id: 'B16', name: 'Southern Star', type: 'Sleeper', from: 'Madurai', to: 'Kochi', departureTime: '21:00', arrivalTime: '03:30', duration: '6h 30m', fare: 580, totalSeats: 36, availableSeats: 18, amenities: ['AC', 'Blanket', 'Water', 'Charging Point'], rating: 4.4, vendorId: 'VND-003', isEnabled: busStatuses['B16'] !== false },
      { id: 'B17', name: 'Garden City Return', type: 'Sleeper', from: 'Bengaluru', to: 'Chennai', departureTime: '21:30', arrivalTime: '05:00', duration: '7h 30m', fare: 780, totalSeats: 36, availableSeats: 20, amenities: ['WiFi', 'Blanket', 'Water', 'Charging Point'], rating: 4.4, vendorId: 'VND-002', isEnabled: busStatuses['B17'] !== false },
      { id: 'B18', name: 'Silicon Express', type: 'Luxury', from: 'Bengaluru', to: 'Chennai', departureTime: '20:00', arrivalTime: '03:30', duration: '7h 30m', fare: 1100, totalSeats: 24, availableSeats: 8, amenities: ['WiFi', 'TV', 'Snacks', 'Blanket', 'Pillow', 'Charging Point'], rating: 4.9, vendorId: 'VND-002', isEnabled: busStatuses['B18'] !== false },
    ];
    return buses;
  }

  private getBusStatuses(): { [key: string]: boolean } {
    const stored = localStorage.getItem('busStatuses');
    return stored ? JSON.parse(stored) : {};
  }

  getBusCount(): number {
    return this.getAllBuses().length;
  }

  getActiveBusCount(): number {
    return this.getAllBuses().filter(b => b.isEnabled !== false).length;
  }

  toggleBusStatus(busId: string): { success: boolean; message: string } {
    const statuses = this.getBusStatuses();
    const currentStatus = statuses[busId] !== false;
    statuses[busId] = !currentStatus;
    localStorage.setItem('busStatuses', JSON.stringify(statuses));

    const bus = this.getAllBuses().find(b => b.id === busId);
    const status = statuses[busId] ? 'enabled' : 'disabled';
    return { success: true, message: `Bus ${bus?.name || busId} has been ${status}.` };
  }

  // ========== BOOKING MANAGEMENT ==========
  getAllBookings(): Booking[] {
    const stored = localStorage.getItem('bookings');
    return stored ? JSON.parse(stored) : [];
  }

  getBookingCount(): number {
    return this.getAllBookings().length;
  }

  getConfirmedBookingCount(): number {
    return this.getAllBookings().filter(b => b.status === 'confirmed').length;
  }

  getCancelledBookingCount(): number {
    return this.getAllBookings().filter(b => b.status === 'cancelled').length;
  }

  // ========== ROUTE MANAGEMENT ==========
  getAllRoutes(): Route[] {
    return [
      { id: 'R1', from: 'Chennai', to: 'Bengaluru', distance: 350, duration: '6h 30m', buses: ['B1', 'B2', 'B3'] },
      { id: 'R2', from: 'Chennai', to: 'Coimbatore', distance: 500, duration: '8h', buses: ['B4', 'B5'] },
      { id: 'R3', from: 'Chennai', to: 'Madurai', distance: 460, duration: '7h 30m', buses: ['B6', 'B7'] },
      { id: 'R4', from: 'Bengaluru', to: 'Kochi', distance: 560, duration: '9h', buses: ['B8', 'B9'] },
      { id: 'R5', from: 'Bengaluru', to: 'Coimbatore', distance: 365, duration: '6h', buses: ['B10', 'B11'] },
      { id: 'R6', from: 'Coimbatore', to: 'Kochi', distance: 190, duration: '4h', buses: ['B12'] },
      { id: 'R7', from: 'Chennai', to: 'Trichy', distance: 330, duration: '5h 30m', buses: ['B13', 'B14'] },
      { id: 'R8', from: 'Trichy', to: 'Madurai', distance: 140, duration: '2h 30m', buses: ['B15'] },
      { id: 'R9', from: 'Madurai', to: 'Kochi', distance: 280, duration: '5h', buses: ['B16'] },
      { id: 'R10', from: 'Bengaluru', to: 'Chennai', distance: 350, duration: '6h 30m', buses: ['B17', 'B18'] },
    ];
  }

  getRouteCount(): number {
    return this.getAllRoutes().length;
  }

  // ========== STATISTICS ==========
  getTotalRevenue(): number {
    return this.getAllBookings()
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.totalFare, 0);
  }

  getMostTravelledRoutes(): { route: string; count: number }[] {
    const bookings = this.getAllBookings().filter(b => b.status === 'confirmed');
    const routeCounts: { [key: string]: number } = {};

    bookings.forEach(b => {
      const route = `${b.from} → ${b.to}`;
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });

    return Object.entries(routeCounts)
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  getPeakTravelDates(): { date: string; count: number }[] {
    const bookings = this.getAllBookings().filter(b => b.status === 'confirmed');
    const dateCounts: { [key: string]: number } = {};

    bookings.forEach(b => {
      dateCounts[b.date] = (dateCounts[b.date] || 0) + 1;
    });

    return Object.entries(dateCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  getBookingsByMonth(): { month: string; count: number; revenue: number }[] {
    const bookings = this.getAllBookings().filter(b => b.status === 'confirmed');
    const monthData: { [key: string]: { count: number; revenue: number } } = {};

    bookings.forEach(b => {
      const date = new Date(b.bookedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthData[monthKey]) {
        monthData[monthKey] = { count: 0, revenue: 0 };
      }
      monthData[monthKey].count++;
      monthData[monthKey].revenue += b.totalFare;
    });

    return Object.entries(monthData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
  }

  getBusTypeDistribution(): { type: string; count: number }[] {
    const buses = this.getAllBuses();
    const typeCounts: { [key: string]: number } = {};

    buses.forEach(b => {
      typeCounts[b.type] = (typeCounts[b.type] || 0) + 1;
    });

    return Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }));
  }

  getVendorPerformance(): { vendor: string; buses: number; enabled: boolean }[] {
    const vendors = this.getVendors();
    const buses = this.getAllBuses();

    return vendors.map(v => ({
      vendor: v.companyName,
      buses: buses.filter(b => b.vendorId === v.id).length,
      enabled: v.isEnabled
    }));
  }
}
