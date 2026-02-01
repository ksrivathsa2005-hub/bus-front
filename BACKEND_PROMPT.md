# 🤖 Backend Generation Prompt

Use this prompt with an LLM (like ChatGPT, Claude, or Gemini) to generate the complete C# ASP.NET Core backend code for this project.

---

### **Prompt:**

"I have an Angular frontend for a Bus Ticket Booking Platform called 'Night Journey Club'. I need you to build a complete, production-ready REST API backend using **ASP.NET Core 8.0/9.0** and **MySQL**.

**Requirements:**
1. **Architecture:** Use a Clean Architecture or N-Layer approach (Controllers, Services, Models, Data).
2. **Database:** Use Entity Framework Core with a MySQL provider.
3. **Authentication:** Implement JWT-based authentication. Use `Microsoft.AspNetCore.Authentication.JwtBearer`.
4. **Authorization:** Implement Role-based access control for three roles: `User` (Traveler), `Vendor` (Bus Operator), and `Admin` (System Manager).
5. **Security:** Use BCrypt for password hashing. Sanitize all inputs.
6. **Features to Implement:**
   - **Auth:** Registration, Login, and Profile management.
   - **User:** Search buses by origin/destination/date, get seat layouts, and create bookings.
   - **Vendor:** Dashboard for stats, fleet management (CRUD for Buses), and viewing passenger lists for their buses.
   - **Admin:** System-wide analytics (revenue, peak dates, most traveled routes) and Vendor management (toggle enable/disable status).
7. **Concurrency:** Handle seat booking concurrency using Database Transactions or Optimistic Locking to prevent double-booking of the same seat.
8. **Data Seed:** Provide a seed script to populate initial Cities, Routes, and a few demo accounts (one for each role).

**Models to include:**
- `User` (Id, Name, Email, Phone, PasswordHash, Role, CreatedAt)
- `Vendor` (Id, UserId, CompanyName, RegistrationNumber, Address, IsEnabled)
- `Bus` (Id, VendorId, Name, Type, From, To, DepartureTime, ArrivalTime, Fare, TotalSeats, Amenities)
- `Booking` (Id, UserId, BusId, BookingDate, TravelDate, TotalFare, Status)
- `Passenger` (Id, BookingId, Name, Age, Gender, SeatNumber)

Please provide the `Program.cs` configuration, the `AppDbContext`, the Models, the DTOs, and the main Controllers/Services for Auth, Buses, and Bookings."

---

### **How to use this prompt:**
1. Copy the text above.
2. Paste it into your preferred LLM.
3. Once the code is generated, follow the steps in [BACKEND_SETUP.md](BACKEND_SETUP.md) to integrate it into your local environment.
