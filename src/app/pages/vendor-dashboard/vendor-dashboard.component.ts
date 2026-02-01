import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { VendorService } from '../../services/vendor.service';
import { Bus, City } from '../../models';

type TabType = 'overview' | 'buses' | 'add-bus' | 'insights';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './vendor-dashboard.component.html',
  styleUrl: './vendor-dashboard.component.scss'
})
export class VendorDashboardComponent implements OnInit {
  private vendorService = inject(VendorService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  currentVendor = this.vendorService.currentVendor;
  activeTab = signal<TabType>('overview');
  actionMessage = signal('');
  actionError = signal('');

  // Data
  buses = signal<Bus[]>([]);
  cities = signal<City[]>([]);
  busTypes = signal<string[]>([]);
  seatLayouts = signal<{ type: string; seats: number }[]>([]);

  // Stats
  stats = signal({
    totalBuses: 0,
    activeBuses: 0,
    totalBookings: 0,
    totalRevenue: 0,
    seatOccupancy: 0,
    mostPopularRoute: ''
  });

  routeStats = signal<{ route: string; bookings: number; revenue: number }[]>([]);

  // Add Bus Form
  busForm!: FormGroup;
  isSubmitting = signal(false);
  editingBusId = signal<string | null>(null);

  ngOnInit(): void {
    if (!this.vendorService.isVendorAuthenticated()) {
      this.router.navigate(['/vendor']);
      return;
    }

    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.busForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      type: ['', Validators.required],
      from: ['', Validators.required],
      to: ['', Validators.required],
      departureTime: ['', Validators.required],
      arrivalTime: ['', Validators.required],
      duration: ['', Validators.required],
      totalSeats: [36, [Validators.required, Validators.min(10), Validators.max(60)]],
      fare: [500, [Validators.required, Validators.min(100), Validators.max(5000)]],
      amenities: [[]]
    }, { validators: this.routeValidator });
  }

  routeValidator(group: FormGroup) {
    const from = group.get('from')?.value;
    const to = group.get('to')?.value;
    if (from && to && from === to) {
      return { sameRoute: true };
    }
    return null;
  }

  private loadData(): void {
    const vendor = this.currentVendor();
    if (!vendor) return;

    this.cities.set(this.vendorService.getCities());
    this.busTypes.set(this.vendorService.getBusTypeOptions());
    this.seatLayouts.set(this.vendorService.getSeatLayoutOptions());
    this.loadBuses();
    this.loadStats();
  }

  private loadBuses(): void {
    const vendor = this.currentVendor();
    if (!vendor) return;
    this.buses.set(this.vendorService.getVendorBuses(vendor.id));
  }

  private loadStats(): void {
    const vendor = this.currentVendor();
    if (!vendor) return;

    const buses = this.vendorService.getVendorBuses(vendor.id);

    this.stats.set({
      totalBuses: buses.length,
      activeBuses: buses.filter(b => b.isEnabled !== false).length,
      totalBookings: this.vendorService.getVendorTotalBookings(vendor.id),
      totalRevenue: this.vendorService.getVendorRevenue(vendor.id),
      seatOccupancy: this.vendorService.getVendorSeatOccupancy(vendor.id),
      mostPopularRoute: this.vendorService.getVendorMostPopularRoute(vendor.id)
    });

    this.routeStats.set(this.vendorService.getVendorRouteStats(vendor.id));
  }

  switchTab(tab: TabType): void {
    this.activeTab.set(tab);
    this.actionMessage.set('');
    this.actionError.set('');

    if (tab === 'add-bus') {
      this.editingBusId.set(null);
      this.busForm.reset({
        totalSeats: 36,
        fare: 500,
        amenities: []
      });
    }
  }

  // ========== BUS MANAGEMENT ==========
  toggleBusStatus(busId: string): void {
    const result = this.vendorService.toggleBusStatus(busId);
    if (result.success) {
      this.actionMessage.set(result.message);
      this.loadBuses();
      this.loadStats();
    } else {
      this.actionError.set(result.message);
    }
    this.clearMessages();
  }

  editBus(bus: Bus): void {
    this.editingBusId.set(bus.id);
    this.busForm.patchValue({
      name: bus.name,
      type: bus.type,
      from: bus.from,
      to: bus.to,
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      duration: bus.duration,
      totalSeats: bus.totalSeats,
      fare: bus.fare,
      amenities: bus.amenities || []
    });
    this.activeTab.set('add-bus');
  }

  deleteBus(busId: string): void {
    const vendor = this.currentVendor();
    if (!vendor) return;

    if (confirm('Are you sure you want to remove this bus from your fleet?')) {
      const result = this.vendorService.deleteBus(busId, vendor.id);
      if (result.success) {
        this.actionMessage.set(result.message);
        this.loadBuses();
        this.loadStats();
      } else {
        this.actionError.set(result.message);
      }
      this.clearMessages();
    }
  }

  updateFare(busId: string, newFare: number): void {
    if (newFare < 100 || newFare > 5000) {
      this.actionError.set('Fare must be between ₹100 and ₹5000.');
      this.clearMessages();
      return;
    }

    const result = this.vendorService.updateBus(busId, { fare: newFare });
    if (result.success) {
      this.actionMessage.set('Fare updated successfully.');
      this.loadBuses();
    } else {
      this.actionError.set(result.message);
    }
    this.clearMessages();
  }

  // ========== ADD/EDIT BUS ==========
  onSubmitBus(): void {
    if (this.busForm.invalid) {
      this.busForm.markAllAsTouched();
      this.actionError.set('Please fill all required fields correctly.');
      return;
    }

    if (this.busForm.hasError('sameRoute')) {
      this.actionError.set('Origin and destination cannot be the same.');
      return;
    }

    const vendor = this.currentVendor();
    if (!vendor) return;

    this.isSubmitting.set(true);
    this.actionError.set('');

    const formData = this.busForm.value;

    setTimeout(() => {
      if (this.editingBusId()) {
        // Update existing bus
        const result = this.vendorService.updateBus(this.editingBusId()!, {
          name: formData.name,
          type: formData.type as Bus['type'],
          from: formData.from,
          to: formData.to,
          departureTime: formData.departureTime,
          arrivalTime: formData.arrivalTime,
          duration: formData.duration,
          totalSeats: formData.totalSeats,
          fare: formData.fare,
          amenities: formData.amenities
        });

        if (result.success) {
          this.actionMessage.set('Bus updated successfully.');
          this.switchTab('buses');
        } else {
          this.actionError.set(result.message);
        }
      } else {
        // Add new bus
        const result = this.vendorService.addBus({
          name: formData.name,
          type: formData.type as Bus['type'],
          from: formData.from,
          to: formData.to,
          departureTime: formData.departureTime,
          arrivalTime: formData.arrivalTime,
          duration: formData.duration,
          totalSeats: formData.totalSeats,
          fare: formData.fare,
          amenities: formData.amenities,
          vendorId: vendor.id,
          isEnabled: true
        });

        if (result.success) {
          this.actionMessage.set(result.message);
          this.switchTab('buses');
        } else {
          this.actionError.set(result.message);
        }
      }

      this.loadBuses();
      this.loadStats();
      this.isSubmitting.set(false);
    }, 800);
  }

  cancelEdit(): void {
    this.editingBusId.set(null);
    this.busForm.reset({
      totalSeats: 36,
      fare: 500,
      amenities: []
    });
    this.switchTab('buses');
  }

  // ========== AMENITIES ==========
  availableAmenities = [
    'WiFi', 'AC', 'Blanket', 'Water', 'Charging Point', 'TV', 'Snacks', 'Pillow'
  ];

  toggleAmenity(amenity: string): void {
    const current = this.busForm.get('amenities')?.value || [];
    const index = current.indexOf(amenity);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(amenity);
    }
    this.busForm.patchValue({ amenities: [...current] });
  }

  hasAmenity(amenity: string): boolean {
    const current = this.busForm.get('amenities')?.value || [];
    return current.includes(amenity);
  }

  // ========== HELPERS ==========
  logout(): void {
    this.vendorService.vendorLogout();
    this.router.navigate(['/vendor']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getBookedSeats(busId: string): number {
    return this.vendorService.getBookedSeatsForBus(busId);
  }

  private clearMessages(): void {
    setTimeout(() => {
      this.actionMessage.set('');
      this.actionError.set('');
    }, 4000);
  }

  // Form getters for validation
  getFieldError(fieldName: string): string {
    const control = this.busForm.get(fieldName);
    if (!control?.touched || !control?.invalid) return '';

    if (control.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required.`;
    }
    if (control.hasError('minlength')) {
      return `${this.getFieldLabel(fieldName)} is too short.`;
    }
    if (control.hasError('maxlength')) {
      return `${this.getFieldLabel(fieldName)} is too long.`;
    }
    if (control.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} value is too low.`;
    }
    if (control.hasError('max')) {
      return `${this.getFieldLabel(fieldName)} value is too high.`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Bus name',
      type: 'Bus type',
      from: 'Origin city',
      to: 'Destination city',
      departureTime: 'Departure time',
      arrivalTime: 'Arrival time',
      duration: 'Duration',
      totalSeats: 'Total seats',
      fare: 'Base fare'
    };
    return labels[fieldName] || fieldName;
  }
}
