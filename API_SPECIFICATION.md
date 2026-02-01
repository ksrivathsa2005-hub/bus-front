# 📡 API Specification: Night Journey Club

This document outlines the REST API endpoints required to power the Night Journey Club platform. All endpoints expect and return JSON.

## 🔐 Authentication & Identity

### `POST /api/auth/register`
- **Description:** Register a new traveler.
- **Payload:** `FullName`, `Email`, `Phone`, `Password`, `City`.
- **Response:** `201 Created` with User object and JWT.

### `POST /api/auth/login`
- **Description:** Authenticate user, vendor, or admin.
- **Payload:** `Email`, `Password`.
- **Response:** `200 OK` with JWT and Role (`User`, `Vendor`, `Admin`).

### `GET /api/profile`
- **Auth:** Required (JWT)
- **Description:** Get profile details for the logged-in user.

## 🚌 Bus & Route Operations

### `GET /api/cities`
- **Description:** Get all available cities for origin/destination dropdowns.

### `GET /api/buses/search`
- **Query Params:** `from`, `to`, `date`
- **Description:** Find available buses for a specific route and date.

### `GET /api/buses/{id}/seats`
- **Description:** Get real-time seat availability and layout for a specific bus journey.

## 🎟️ Booking Management

### `POST /api/bookings`
- **Auth:** Required (User Role)
- **Description:** Create a new ticket booking.
- **Payload:** `BusId`, `TravelDate`, `Seats[]`, `Passengers[]`.

### `GET /api/bookings/my-bookings`
- **Auth:** Required (User Role)
- **Description:** Get travel history for the logged-in traveler.

### `PATCH /api/bookings/{id}/cancel`
- **Auth:** Required (User Role / Admin)
- **Description:** Cancel a confirmed booking.

## 💼 Vendor Portal (Role: Vendor)

### `GET /api/vendor/dashboard`
- **Description:** Statistics for the vendor (Total revenue, active buses).

### `GET /api/vendor/buses`
- **Description:** List of buses owned by the vendor.

### `POST /api/vendor/buses`
- **Description:** Add a new bus to the fleet.

## 🛡️ Admin Terminal (Role: Admin)

### `GET /api/admin/analytics`
- **Description:** System-wide stats (Most traveled routes, peak dates, revenue).

### `GET /api/admin/vendors`
- **Description:** List all vendors for approval/vetting.

### `PATCH /api/admin/vendors/{id}/toggle`
- **Description:** Enable or disable a vendor's access to the platform.

---

## 💾 Data Models (Schema)

### User
```json
{
  "id": "string",
  "fullName": "string",
  "email": "string",
  "role": "User | Vendor | Admin",
  "createdAt": "date-time"
}
```

### Bus
```json
{
  "id": "string",
  "name": "string",
  "type": "Sleeper | Seater | Luxury",
  "fare": "number",
  "amenities": ["string"],
  "vendorId": "string"
}
```

### Booking
```json
{
  "id": "string",
  "userId": "string",
  "busId": "string",
  "seats": ["string"],
  "totalFare": "number",
  "status": "Confirmed | Cancelled | Completed"
}
```
