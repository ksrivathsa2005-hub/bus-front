// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { AuthResponse, RegisterRequest, LoginRequest, UserRole, UserProfile } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7145/api';

  currentUser$ = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());

  register(data: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, data).pipe(
      tap(response => this.handleAuth(response))
    );
  }

  login(email: string, password: string) {
    const data: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, data).pipe(
      tap(response => this.handleAuth(response))
    );
  }

  getProfile() {
    return this.http.get<UserProfile>(`${this.baseUrl}/profile`);
  }

  updateProfile(data: any) {
    return this.http.put<UserProfile>(`${this.baseUrl}/profile`, data);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser$.next(null);
  }

  private handleAuth(response: AuthResponse) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response));
    this.currentUser$.next(response);
  }

  private getStoredUser(): AuthResponse | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getRole(): UserRole | null {
    const user = this.currentUser$.value;
    return user ? user.role : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
