import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);

  currentUser = this.currentUserSignal.asReadonly();
  isAuthenticated = this.isAuthenticatedSignal.asReadonly();

  // Demo accounts
  private demoAccounts: User[] = [
    {
      id: 'ADMIN-001',
      fullName: 'Admin User',
      email: 'admin@njc.com',
      phone: '9999999999',
      password: 'admin123',
      city: 'Chennai',
      preferredFrom: 'Chennai',
      preferredTo: 'Bengaluru',
      bio: 'System Administrator',
      createdAt: new Date('2020-01-01')
    },
    {
      id: 'VENDOR-001',
      fullName: 'Vendor User',
      email: 'vendor@njc.com',
      phone: '8888888888',
      password: 'vendor123',
      city: 'Bengaluru',
      preferredFrom: 'Bengaluru',
      preferredTo: 'Chennai',
      bio: 'Bus Operator Partner',
      createdAt: new Date('2021-01-01')
    },
    {
      id: 'DEMO-001',
      fullName: 'Demo Traveler',
      email: 'demo@njc.com',
      phone: '7777777777',
      password: 'demo123',
      city: 'Kochi',
      preferredFrom: 'Kochi',
      preferredTo: 'Chennai',
      bio: 'The Night Owl - I travel when the world sleeps',
      createdAt: new Date('2023-01-01')
    }
  ];

  constructor() {
    this.seedDemoAccounts();
    this.checkStoredAuth();
  }

  private seedDemoAccounts(): void {
    const users = this.getUsers();
    let updated = false;

    this.demoAccounts.forEach(demoAccount => {
      if (!users.find(u => u.email === demoAccount.email)) {
        users.push(demoAccount);
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  private checkStoredAuth(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.currentUserSignal.set(user);
      this.isAuthenticatedSignal.set(true);
    }
  }

  login(email: string, password: string): { success: boolean; message: string } {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      this.currentUserSignal.set(user);
      this.isAuthenticatedSignal.set(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true, message: 'Welcome back, Traveler.' };
    }

    return { success: false, message: 'Invalid credentials. The route remains closed.' };
  }

  register(user: Omit<User, 'id' | 'createdAt'>): { success: boolean; message: string } {
    const users = this.getUsers();

    if (users.find(u => u.email === user.email)) {
      return { success: false, message: 'A traveler with this identity already exists.' };
    }

    const newUser: User = {
      ...user,
      id: this.generateId(),
      createdAt: new Date()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Auto login after registration
    this.currentUserSignal.set(newUser);
    this.isAuthenticatedSignal.set(true);
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    return { success: true, message: 'Welcome to the Night Journey Club.' };
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    localStorage.removeItem('currentUser');
  }

  updateProfile(updates: Partial<User>): { success: boolean; message: string } {
    const currentUser = this.currentUserSignal();
    if (!currentUser) {
      return { success: false, message: 'No active session.' };
    }

    const updatedUser = { ...currentUser, ...updates };
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === currentUser.id);

    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      this.currentUserSignal.set(updatedUser);
      return { success: true, message: 'Your journey profile has been updated.' };
    }

    return { success: false, message: 'Failed to update profile.' };
  }

  private getUsers(): User[] {
    const stored = localStorage.getItem('users');
    return stored ? JSON.parse(stored) : [];
  }

  private generateId(): string {
    return 'USR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  }
}
