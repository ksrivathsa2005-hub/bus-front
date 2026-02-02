import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models';

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  city?: string;
  preferredFrom?: string;
  preferredTo?: string;
  bio?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private currentUserSignal = signal<User | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);

  currentUser = this.currentUserSignal.asReadonly();
  isAuthenticated = this.isAuthenticatedSignal.asReadonly();

  constructor() {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');

    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSignal.set(user);
        this.isAuthenticatedSignal.set(true);
      } catch {
        this.clearAuth();
      }
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            this.currentUserSignal.set(response.user);
            this.isAuthenticatedSignal.set(true);
          }
        }),
        catchError(this.handleError)
      );
  }

  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            this.currentUserSignal.set(response.user);
            this.isAuthenticatedSignal.set(true);
          }
        }),
        catchError(this.handleError)
      );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/profile`)
      .pipe(
        tap(user => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSignal.set(user);
        }),
        catchError(this.handleError)
      );
  }

  updateProfile(updates: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/auth/profile`, updates)
      .pipe(
        tap(response => {
          if (response.data) {
            localStorage.setItem('currentUser', JSON.stringify(response.data));
            this.currentUserSignal.set(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    this.clearAuth();
  }

  private clearAuth(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred. Please try again.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 401) {
        errorMessage = 'Invalid credentials. The route remains closed.';
      } else if (error.status === 409) {
        errorMessage = 'A traveler with this identity already exists.';
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      }
    }

    return throwError(() => ({ success: false, message: errorMessage }));
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
