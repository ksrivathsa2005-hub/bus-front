// src/app/pages/my-profile/my-profile.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BusService } from '../../services/bus.service';
import { City, UserProfile, AuthResponse } from '../../models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss'
})
export class MyProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private busService = inject(BusService);
  private fb = inject(FormBuilder);

  currentUser = signal<UserProfile | null>(null);
  cities = signal<City[]>([]);
  isEditing = signal(false);
  isSaving = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  profileForm!: FormGroup;

  ngOnInit(): void {
    this.loadData();
    this.initForm();
  }

  private async loadData() {
    try {
      const user = await firstValueFrom(this.authService.getProfile());
      this.currentUser.set(user);
      this.updateForm(user);
      const cityList = await firstValueFrom(this.busService.getCities());
      this.cities.set(cityList);
    } catch (error) {
      console.error('Failed to load profile data', error);
    }
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      city: ['']
    });
  }

  private updateForm(user: UserProfile): void {
    this.profileForm.patchValue({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      city: user.city || ''
    });
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      const user = this.currentUser();
      if (user) this.updateForm(user);
    }
    this.isEditing.set(!this.isEditing());
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  async saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const updates = {
      fullName: this.profileForm.value.fullName,
      phone: this.profileForm.value.phone,
      city: this.profileForm.value.city
    };

    try {
      // Assuming updateProfile exists or we add it to AuthService
      await firstValueFrom(this.authService.updateProfile(updates));
      this.successMessage.set('Profile updated successfully.');
      this.isEditing.set(false);
      this.loadData();
    } catch (error: any) {
      this.errorMessage.set(error.error?.message || 'Failed to update profile.');
    } finally {
      this.isSaving.set(false);
    }
  }

  get memberSince(): string {
    const user = this.currentUser();
    if (!user) return '';
    return new Date().toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric'
    });
  }
}
