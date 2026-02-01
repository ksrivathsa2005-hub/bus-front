export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  preferredFrom: string;
  preferredTo: string;
  bio: string;
  createdAt: Date;
  role?: 'user' | 'admin' | 'vendor';
}

export interface Vendor {
  id: string;
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  registrationNumber: string;
  busCount: number;
  isEnabled: boolean;
  createdAt: Date;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin';
  createdAt: Date;
}

export interface Bus {
  id: string;
  name: string;
  type: 'Sleeper' | 'Semi-Sleeper' | 'Seater' | 'Luxury';
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  fare: number;
  totalSeats: number;
  availableSeats: number;
  amenities: string[];
  rating: number;
  vendorId?: string;
  isEnabled?: boolean;
}

export interface Seat {
  id: string;
  number: string;
  type: 'window' | 'aisle' | 'middle';
  deck: 'lower' | 'upper';
  isBooked: boolean;
  price: number;
}

export interface Booking {
  id: string;
  oderId: string;
  userId: string;
  busId: string;
  busName: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  seats: string[];
  passengers: Passenger[];
  totalFare: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  bookedAt: Date;
}

export interface Passenger {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  seatNumber: string;
}

export interface Route {
  id: string;
  from: string;
  to: string;
  distance: number;
  duration: string;
  buses: string[];
}

export interface City {
  id: string;
  name: string;
  state: string;
  coordinates: { x: number; y: number };
}
