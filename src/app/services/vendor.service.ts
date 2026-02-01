import { Injectable, signal } from '@angular/core';
import { Vendor, Bus, Booking, City } from '../models';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private currentVendorSignal = signal<Vendor | null>(null);
  private isVendorAuthenticatedSignal = signal<boolean>(false);

  currentVendor = this.currentVendorSignal.asReadonly();
  isVendorAuthenticated = this.isVendorAuthenticatedSignal.asReadonly();

  // Demo vendors with credentials
  private readonly demoVendors: Vendor[] = [
    {
      id: 'VND-001',
      companyName: 'Night Voyager Travels',
      ownerName: 'Rajesh Kumar',
      email: 'vendor@njc.com',
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
      email: 'royal@njc.com',
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
      email: 'malabar@njc.com',
      phone: '9876543212',
      password: 'vendor123',
      address: 'Kochi, Kerala',
      registrationNumber: 'KL-BUS-2018-112',
      busCount: 4,
      isEnabled: true,
      createdAt: new Date('2018-11-05')
    }
  ];

  readonly cities: City[] = [
    { id: 'CHN', name: 'Chennai', state: 'Tamil Nadu', coordinates: { x: 80, y: 25 } },
    { id: 'BLR', name: 'Bengaluru', state: 'Karnataka', coordinates: { x: 35, y: 35 } },
    { id: 'KCH', name: 'Kochi', state: 'Kerala', coordinates: { x: 20, y: 70 } },
    { id: 'CBE', name: 'Coimbatore', state: 'Tamil Nadu', coordinates: { x: 40, y: 55 } },
    { id: 'MDU', name: 'Madurai', state: 'Tamil Nadu', coordinates: { x: 55, y: 75 } },
    { id: 'TRY', name: 'Trichy', state: 'Tamil Nadu', coordinates: { x: 60, y: 55 } },
  ];

  constructor() {
    this.seedVendors();
    this.checkStoredVendorAuth();
  }

  private seedVendors(): void {
    const vendors = this.getVendorsFromStorage();
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

  private getVendorsFromStorage(): Vendor[] {
    const stored = localStorage.getItem('vendors');
    return stored ? JSON.parse(stored) : [];
  }

  private checkStoredVendorAuth(): void {
    const storedVendor = localStorage.getItem('loggedInVendor');
    if (storedVendor) {
      const vendor = JSON.parse(storedVendor);
      this.currentVendorSignal.set(vendor);
      this.isVendorAuthenticatedSignal.set(true);
    }
  }

  vendorLogin(email: string, password: string): { success: boolean; message: string } {
    const vendors = this.getVendorsFromStorage();
    const vendor = vendors.find(v => v.email === email && v.password === password);

    if (vendor) {
      if (!vendor.isEnabled) {
        return { success: false, message: 'Your vendor account has been disabled. Contact administration.' };
      }
      this.currentVendorSignal.set(vendor);
      this.isVendorAuthenticatedSignal.set(true);
      localStorage.setItem('loggedInVendor', JSON.stringify(vendor));
      return { success: true, message: 'Welcome to your control room, Operator.' };
    }

    return { success: false, message: 'Invalid vendor credentials. Access denied.' };
  }

  vendorLogout(): void {
    this.currentVendorSignal.set(null);
    this.isVendorAuthenticatedSignal.set(false);
    localStorage.removeItem('loggedInVendor');
  }

  getCities(): City[] {
    return this.cities;
  }

  // ========== BUS MANAGEMENT ==========
  getVendorBuses(vendorId: string): Bus[] {
    const allBuses = this.getAllBuses();
    return allBuses.filter(b => b.vendorId === vendorId);
  }

  getAllBuses(): Bus[] {
    const stored = localStorage.getItem('vendorBuses');
    return stored ? JSON.parse(stored) : [];
  }

  private saveBuses(buses: Bus[]): void {
    localStorage.setItem('vendorBuses', JSON.stringify(buses));
  }

  addBus(busData: Omit<Bus, 'id' | 'availableSeats' | 'rating'>): { success: boolean; message: string; bus?: Bus } {
    const buses = this.getAllBuses();

    const newBus: Bus = {
      ...busData,
      id: 'VB-' + Date.now().toString(36).toUpperCase(),
      availableSeats: busData.totalSeats,
      rating: 4.0 + Math.random() * 0.9, // Random rating between 4.0 and 4.9
      isEnabled: true
    };

    buses.push(newBus);
    this.saveBuses(buses);

    // Update vendor bus count
    this.updateVendorBusCount(busData.vendorId!);

    return { success: true, message: 'Bus added successfully to your fleet.', bus: newBus };
  }

  updateBus(busId: string, updates: Partial<Bus>): { success: boolean; message: string } {
    const buses = this.getAllBuses();
    const index = buses.findIndex(b => b.id === busId);

    if (index !== -1) {
      buses[index] = { ...buses[index], ...updates };
      this.saveBuses(buses);
      return { success: true, message: 'Bus details updated successfully.' };
    }

    return { success: false, message: 'Bus not found.' };
  }

  toggleBusStatus(busId: string): { success: boolean; message: string } {
    const buses = this.getAllBuses();
    const index = buses.findIndex(b => b.id === busId);

    if (index !== -1) {
      buses[index].isEnabled = !buses[index].isEnabled;
      this.saveBuses(buses);
      const status = buses[index].isEnabled ? 'enabled' : 'disabled';
      return { success: true, message: `Bus "${buses[index].name}" has been ${status}.` };
    }

    return { success: false, message: 'Bus not found.' };
  }

  deleteBus(busId: string, vendorId: string): { success: boolean; message: string } {
    const buses = this.getAllBuses();
    const index = buses.findIndex(b => b.id === busId && b.vendorId === vendorId);

    if (index !== -1) {
      buses.splice(index, 1);
      this.saveBuses(buses);
      this.updateVendorBusCount(vendorId);
      return { success: true, message: 'Bus removed from your fleet.' };
    }

    return { success: false, message: 'Bus not found or you do not have permission.' };
  }

  private updateVendorBusCount(vendorId: string): void {
    const vendors = this.getVendorsFromStorage();
    const index = vendors.findIndex(v => v.id === vendorId);
    if (index !== -1) {
      vendors[index].busCount = this.getVendorBuses(vendorId).length;
      localStorage.setItem('vendors', JSON.stringify(vendors));
    }
  }

  // ========== BOOKING & REVENUE INSIGHTS ==========
  getVendorBookings(vendorId: string): Booking[] {
    const allBookings = this.getAllBookings();
    const vendorBuses = this.getVendorBuses(vendorId);
    const vendorBusIds = vendorBuses.map(b => b.id);

    return allBookings.filter(b => vendorBusIds.includes(b.busId));
  }

  private getAllBookings(): Booking[] {
    const stored = localStorage.getItem('bookings');
    return stored ? JSON.parse(stored) : [];
  }

  getVendorRevenue(vendorId: string): number {
    return this.getVendorBookings(vendorId)
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.totalFare, 0);
  }

  getVendorTotalBookings(vendorId: string): number {
    return this.getVendorBookings(vendorId).filter(b => b.status === 'confirmed').length;
  }

  getVendorMostPopularRoute(vendorId: string): string {
    const bookings = this.getVendorBookings(vendorId).filter(b => b.status === 'confirmed');
    const routeCounts: { [key: string]: number } = {};

    bookings.forEach(b => {
      const route = `${b.from} → ${b.to}`;
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });

    const sorted = Object.entries(routeCounts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : 'No bookings yet';
  }

  getVendorSeatOccupancy(vendorId: string): number {
    const buses = this.getVendorBuses(vendorId);
    const bookings = this.getVendorBookings(vendorId).filter(b => b.status === 'confirmed');

    const totalSeats = buses.reduce((sum, b) => sum + b.totalSeats, 0);
    const bookedSeats = bookings.reduce((sum, b) => sum + b.seats.length, 0);

    if (totalSeats === 0) return 0;
    return Math.round((bookedSeats / totalSeats) * 100);
  }

  getBookedSeatsForBus(busId: string): number {
    const bookings = this.getAllBookings()
      .filter(b => b.busId === busId && b.status === 'confirmed');
    return bookings.reduce((sum, b) => sum + b.seats.length, 0);
  }

  getVendorRouteStats(vendorId: string): { route: string; bookings: number; revenue: number }[] {
    const bookings = this.getVendorBookings(vendorId).filter(b => b.status === 'confirmed');
    const routeStats: { [key: string]: { bookings: number; revenue: number } } = {};

    bookings.forEach(b => {
      const route = `${b.from} → ${b.to}`;
      if (!routeStats[route]) {
        routeStats[route] = { bookings: 0, revenue: 0 };
      }
      routeStats[route].bookings++;
      routeStats[route].revenue += b.totalFare;
    });

    return Object.entries(routeStats)
      .map(([route, stats]) => ({ route, ...stats }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  getBusTypeOptions(): string[] {
    return ['Sleeper', 'Semi-Sleeper', 'Seater', 'Luxury'];
  }

  getSeatLayoutOptions(): { type: string; seats: number }[] {
    return [
      { type: '2+1 Sleeper', seats: 30 },
      { type: '2+2 Seater', seats: 40 },
      { type: '2+2 Semi-Sleeper', seats: 36 },
      { type: '1+1 Luxury', seats: 24 },
      { type: '2+1 Semi-Sleeper', seats: 33 }
    ];
  }
}
