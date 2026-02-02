// src/app/pages/vendor-dashboard/vendor-dashboard.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { VendorService } from '../../services/vendor.service';
import { AuthService } from '../../services/auth.service';
import { Bus, City, VendorDashboard, CreateBusRequest, UpdateBusRequest, BusType, formatTime, calculateDuration } from '../../models';
import { firstValueFrom } from 'rxjs';

type TabType = 'overview' | 'buses' | 'add-bus';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './vendor-dashboard.component.html',
  styleUrl: './vendor-dashboard.component.scss'
})
export class VendorDashboardComponent implements OnInit {
  private vendorService = inject(VendorService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  currentUser = this.authService.currentUser$;
  activeTab = signal<TabType>('overview');
  actionMessage = signal('');
  actionError = signal('');

  // Data
  dashboard = signal<VendorDashboard | null>(null);
  buses = signal<Bus[]>([]);

  // Add/Edit Bus Form
  busForm!: FormGroup;
  isSubmitting = signal(false);
  editingBusId = signal<string | null>(null);

  ngOnInit(): void {
    if (!this.authService.isLoggedIn() || this.authService.getRole() !== 'Vendor') {
      this.router.navigate(['/vendor']);
      return;
    }
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.busForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: [BusType.Seater, Validators.required],
      fromCity: ['', Validators.required],
      toCity: ['', Validators.required],
      departureTime: ['', Validators.required],
      arrivalTime: ['', Validators.required],
      fare: [0, [Validators.required, Validators.min(1)]],
      totalSeats: [40, [Validators.required, Validators.min(10)]],
      amenities: [[]]
    });
  }

  private async loadData() {
    try {
      const db = await firstValueFrom(this.vendorService.getDashboard());
      this.dashboard.set(db);
      const bs = await firstValueFrom(this.vendorService.getBuses());
      this.buses.set(bs);
    } catch (error) {
      console.error('Failed to load vendor data', error);
    }
  }

  switchTab(tab: TabType): void {
    this.activeTab.set(tab);
    this.actionMessage.set('');
    this.actionError.set('');
    if (tab === 'add-bus' && !this.editingBusId()) {
      this.busForm.reset({
        type: BusType.Seater,
        totalSeats: 40,
        fare: 0,
        amenities: []
      });
    }
  }

  async onSubmitBus() {
    if (this.busForm.invalid) {
      this.busForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formData = this.busForm.value;

    const request: CreateBusRequest = {
      name: formData.name,
      type: formData.type,
      fromCity: formData.fromCity,
      toCity: formData.toCity,
      departureTime: this.ensureSeconds(formData.departureTime),
      arrivalTime: this.ensureSeconds(formData.arrivalTime),
      fare: formData.fare,
      totalSeats: formData.totalSeats,
      amenities: formData.amenities
    };

    try {
      if (this.editingBusId()) {
        const updateRequest: UpdateBusRequest = { ...request };
        await firstValueFrom(this.vendorService.updateBus(this.editingBusId()!, updateRequest));
        this.actionMessage.set('Bus updated successfully.');
      } else {
        await firstValueFrom(this.vendorService.addBus(request));
        this.actionMessage.set('Bus added successfully.');
      }
      this.editingBusId.set(null);
      this.switchTab('buses');
      this.loadData();
    } catch (error: any) {
      this.actionError.set(error.error?.message || 'Operation failed.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private ensureSeconds(time: string): string {
    if (time.split(':').length === 2) {
      return `${time}:00`;
    }
    return time;
  }

  async deleteBus(id: string) {
    if (confirm('Are you sure you want to delete this bus?')) {
      try {
        await firstValueFrom(this.vendorService.deleteBus(id));
        this.actionMessage.set('Bus deleted.');
        this.loadData();
      } catch (error) {
        this.actionError.set('Failed to delete bus.');
      }
    }
  }

  editBus(bus: Bus) {
    this.editingBusId.set(bus.id);
    this.busForm.patchValue({
      name: bus.name,
      type: bus.type,
      fromCity: bus.fromCity,
      toCity: bus.toCity,
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      fare: bus.fare,
      totalSeats: bus.totalSeats,
      amenities: bus.amenities
    });
    this.switchTab('add-bus');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/vendor']);
  }

  getFormattedTime(time: string): string {
    return formatTime(time);
  }

  getDuration(bus: Bus): string {
    return calculateDuration(bus.departureTime, bus.arrivalTime);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }
}
