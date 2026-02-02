// ============================================
// Night Journey Club - Frontend Models
// ============================================
// src/app/models/index.ts
// ============================================

// ============================================
// ENUMS
// ============================================

export enum UserRole {
  User = 'User',
  Vendor = 'Vendor',
  Admin = 'Admin'
}

export enum BusType {
  Seater = 'Seater',
  Sleeper = 'Sleeper',
  Luxury = 'Luxury'
}

export enum BookingStatus {
  Confirmed = 'Confirmed',
  Cancelled = 'Cancelled',
  Completed = 'Completed'
}

export enum Gender {
  Male = 0,
  Female = 1,
  Other = 2
}

// ============================================
// AUTH MODELS
// ============================================

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  city?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  role: UserRole;
  createdAt: Date;
}

// ============================================
// CITY MODELS
// ============================================

export interface City {
  id: string;
  name: string;
  state?: string;
}

// ============================================
// BUS MODELS
// ============================================

export interface Bus {
  id: string;
  name: string;
  type: BusType;
  fromCity: string;
  toCity: string;
  departureTime: string; // Format: "HH:mm"
  arrivalTime: string;   // Format: "HH:mm"
  fare: number;
  totalSeats: number;
  availableSeats: number;
  amenities: string[];
  vendorName: string;
}

export interface BusSearchParams {
  from: string;
  to: string;
  date: string; // Format: "YYYY-MM-DD"
}

export interface Seat {
  seatNumber: string;
  isAvailable: boolean;
  row: number;
  column: number;
}

export interface SeatLayout {
  busId: string;
  totalSeats: number;
  seats: Seat[];
}

export interface CreateBusRequest {
  name: string;
  type: BusType;
  fromCity: string;
  toCity: string;
  departureTime: string; // Format: "HH:mm:ss"
  arrivalTime: string;   // Format: "HH:mm:ss"
  fare: number;
  totalSeats: number;
  amenities?: string[];
}

export interface UpdateBusRequest {
  name?: string;
  type?: BusType;
  fromCity?: string;
  toCity?: string;
  departureTime?: string;
  arrivalTime?: string;
  fare?: number;
  totalSeats?: number;
  amenities?: string[];
  isActive?: boolean;
}

// ============================================
// BOOKING MODELS
// ============================================

export interface PassengerRequest {
  name: string;
  age: number;
  gender: Gender;
  seatNumber: string;
}

export interface CreateBookingRequest {
  busId: string;
  travelDate: string; // Format: "YYYY-MM-DD"
  seats: string[];
  passengers: PassengerRequest[];
}

export interface Passenger {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  seatNumber: string;
}

export interface Booking {
  id: string;
  busId: string;
  busName: string;
  fromCity: string;
  toCity: string;
  bookingDate: Date;
  travelDate: Date;
  totalFare: number;
  status: BookingStatus;
  seats: string[];
  passengers: Passenger[];
}

// ============================================
// VENDOR MODELS
// ============================================

export interface VendorDashboard {
  totalRevenue: number;
  totalBuses: number;
  activeBuses: number;
  totalBookings: number;
  todayBookings: number;
  recentBookings: RecentBooking[];
}

export interface RecentBooking {
  bookingId: string;
  busName: string;
  route: string;
  travelDate: Date;
  passengerCount: number;
  fare: number;
}

export interface Vendor {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  companyName: string;
  registrationNumber?: string;
  address?: string;
  isEnabled: boolean;
  createdAt: Date;
  busCount: number;
}

export interface CreateVendorRequest {
  companyName: string;
  registrationNumber?: string;
  address?: string;
}

// ============================================
// ADMIN MODELS
// ============================================

export interface Analytics {
  totalRevenue: number;
  totalUsers: number;
  totalVendors: number;
  totalBookings: number;
  activeBuses: number;
  mostTraveledRoutes: RouteStats[];
  peakDates: PeakDate[];
  monthlyRevenue: MonthlyRevenue[];
}

export interface RouteStats {
  fromCity: string;
  toCity: string;
  bookingCount: number;
  revenue: number;
}

export interface PeakDate {
  date: Date;
  bookingCount: number;
}

export interface MonthlyRevenue {
  year: number;
  month: number;
  revenue: number;
  bookingCount: number;
}

// ============================================
// API RESPONSE MODELS
// ============================================

export interface ApiError {
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// UTILITY TYPES
// ============================================

// For form handling
export type BookingFormData = {
  busId: string;
  travelDate: Date;
  selectedSeats: string[];
  passengers: {
    name: string;
    age: number;
    gender: Gender;
    seatNumber: string;
  }[];
};

// For search form
export type SearchFormData = {
  from: string;
  to: string;
  date: Date;
};

// For login form
export type LoginFormData = {
  email: string;
  password: string;
};

// For registration form
export type RegisterFormData = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  city: string;
};

// ============================================
// CONSTANTS
// ============================================

export const BUS_TYPES: { value: BusType; label: string }[] = [
  { value: BusType.Seater, label: 'Seater' },
  { value: BusType.Sleeper, label: 'Sleeper' },
  { value: BusType.Luxury, label: 'Luxury' }
];

export const GENDERS = [
  { value: Gender.Male, label: 'Male' },
  { value: Gender.Female, label: 'Female' },
  { value: Gender.Other, label: 'Other' }
];

export const BOOKING_STATUSES: { value: BookingStatus; label: string; color: string }[] = [
  { value: BookingStatus.Confirmed, label: 'Confirmed', color: 'green' },
  { value: BookingStatus.Cancelled, label: 'Cancelled', color: 'red' },
  { value: BookingStatus.Completed, label: 'Completed', color: 'blue' }
];

// ============================================
// TYPE GUARDS
// ============================================

export function isAuthResponse(obj: unknown): obj is AuthResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'token' in obj &&
    'role' in obj
  );
}

export function isApiError(obj: unknown): obj is ApiError {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'message' in obj &&
    typeof (obj as ApiError).message === 'string'
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format time string from "HH:mm" to display format
 */
export function formatTime(time: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Format date to API format "YYYY-MM-DD"
 */
export function formatDateForApi(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Calculate journey duration from departure and arrival times
 */
export function calculateDuration(departure: string, arrival: string): string {
  if (!departure || !arrival) return '';
  const [depHours, depMinutes] = departure.split(':').map(Number);
  const [arrHours, arrMinutes] = arrival.split(':').map(Number);

  let totalMinutes = (arrHours * 60 + arrMinutes) - (depHours * 60 + depMinutes);
  if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle overnight journeys

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

/**
 * Get status badge color class
 */
export function getStatusColor(status: BookingStatus): string {
  switch (status) {
    case BookingStatus.Confirmed:
      return 'bg-green-100 text-green-800';
    case BookingStatus.Cancelled:
      return 'bg-red-100 text-red-800';
    case BookingStatus.Completed:
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get bus type icon/emoji
 */
export function getBusTypeIcon(type: BusType): string {
  switch (type) {
    case BusType.Luxury:
      return '🌟';
    case BusType.Sleeper:
      return '🛏️';
    case BusType.Seater:
      return '💺';
    default:
      return '🚌';
  }
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}

/**
 * Get month name from month number
 */
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || '';
}
