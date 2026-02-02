import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Bus, Seat, City, Route } from '../models';

export interface SearchParams {
  from: string;
  to: string;
  date: string;
}

export interface BookedSeatsResponse {
  busId: string;
  date: string;
  bookedSeats: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BusService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Fallback data for offline/demo mode
  // Cities must match backend: Bangalore, Chennai, Hyderabad, Mumbai, Pune, Delhi
  private readonly fallbackCities: City[] = [
    { id: 'CHN', name: 'Chennai', state: 'Tamil Nadu', coordinates: { x: 80, y: 25 } },
    { id: 'BLR', name: 'Bengaluru', state: 'Karnataka', coordinates: { x: 35, y: 35 } },
    { id: 'HYD', name: 'Hyderabad', state: 'Telangana', coordinates: { x: 55, y: 30 } },
    { id: 'MUM', name: 'Mumbai', state: 'Maharashtra', coordinates: { x: 15, y: 35 } },
    { id: 'PUN', name: 'Pune', state: 'Maharashtra', coordinates: { x: 20, y: 45 } },
    { id: 'DEL', name: 'Delhi', state: 'Delhi', coordinates: { x: 40, y: 5 } },
  ];

  private readonly fallbackRoutes: Route[] = [
    { id: 'R1', from: 'Chennai', to: 'Bengaluru', distance: 350, duration: '6h 30m', buses: ['B1', 'B2', 'B3'] },
    { id: 'R2', from: 'Bengaluru', to: 'Chennai', distance: 350, duration: '6h 30m', buses: ['B4', 'B5'] },
    { id: 'R3', from: 'Chennai', to: 'Hyderabad', distance: 630, duration: '8h', buses: ['B6', 'B7'] },
    { id: 'R4', from: 'Hyderabad', to: 'Chennai', distance: 630, duration: '8h', buses: ['B8', 'B9'] },
    { id: 'R5', from: 'Bengaluru', to: 'Hyderabad', distance: 570, duration: '7h', buses: ['B10', 'B11'] },
    { id: 'R6', from: 'Hyderabad', to: 'Bengaluru', distance: 570, duration: '7h', buses: ['B12'] },
    { id: 'R7', from: 'Chennai', to: 'Mumbai', distance: 1330, duration: '12h', buses: ['B13', 'B14'] },
    { id: 'R8', from: 'Mumbai', to: 'Chennai', distance: 1330, duration: '12h', buses: ['B15'] },
    { id: 'R9', from: 'Bengaluru', to: 'Mumbai', distance: 980, duration: '10h', buses: ['B16'] },
    { id: 'R10', from: 'Mumbai', to: 'Bengaluru', distance: 980, duration: '10h', buses: ['B17', 'B18'] },
  ];

  // Get cities from API
  getCitiesFromApi(): Observable<City[]> {
    return this.http.get<City[]>(`${this.apiUrl}/cities`)
      .pipe(
        catchError(() => of(this.fallbackCities))
      );
  }

  // Synchronous getter for local use
  getCities(): City[] {
    return this.fallbackCities;
  }

  getRoutes(): Route[] {
    return this.fallbackRoutes;
  }

  // Search buses from API
  searchBuses(from: string, to: string, date: string): Observable<Bus[]> {
    // Validate inputs before making API call
    if (!from || !to || !date) {
      console.warn('searchBuses: Missing required parameters');
      return of([]);
    }

    // Convert date to ISO format for ASP.NET Core compatibility
    const isoDate = new Date(date).toISOString();

    return this.http.get<Bus[]>(`${this.apiUrl}/buses/search`, {
      params: { from, to, date: isoDate }
    }).pipe(
      catchError(error => {
        console.error('Search buses error:', error);
        return of([]);
      })
    );
  }

  // Get bus by ID
  getBusById(id: string): Observable<Bus | undefined> {
    return this.http.get<Bus>(`${this.apiUrl}/buses/${id}`)
      .pipe(
        catchError(() => of(undefined))
      );
  }

  // Get booked seats for a bus on a specific date
  getBookedSeats(busId: string, date: string): Observable<string[]> {
    return this.http.get<BookedSeatsResponse>(`${this.apiUrl}/buses/${busId}/seats`, {
      params: { date }
    }).pipe(
      map(response => response.bookedSeats || []),
      catchError(() => of([]))
    );
  }

  // Generate seats for a bus (client-side logic for seat layout)
  generateSeatsForBus(bus: Bus, bookedSeats: string[] = []): Seat[] {
    const seats: Seat[] = [];
    const totalSeats = bus.totalSeats;
    const seatsPerRow = bus.type === 'Sleeper' ? 6 : 8;
    const rows = Math.ceil(totalSeats / seatsPerRow);

    let seatNum = 1;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < seatsPerRow && seatNum <= totalSeats; col++) {
        const seatId = `${bus.id}-S${seatNum}`;
        const seatNumber = `S${seatNum}`;
        let type: 'window' | 'aisle' | 'middle' = 'middle';

        if (col === 0 || col === seatsPerRow - 1) type = 'window';
        else if (col === 2 || col === 3) type = 'aisle';

        seats.push({
          id: seatId,
          number: seatNumber,
          type,
          deck: row < rows / 2 ? 'lower' : 'upper',
          isBooked: bookedSeats.includes(seatNumber),
          price: bus.fare + (type === 'window' ? 50 : 0)
        });
        seatNum++;
      }
    }

    return seats;
  }

  // Get buses for a specific route (used in route map)
  getBusesForRoute(from: string, to: string): Observable<Bus[]> {
    // Validate inputs
    if (!from || !to) {
      return of([]);
    }
    const today = new Date().toISOString().split('T')[0];
    return this.searchBuses(from, to, today);
  }
}
