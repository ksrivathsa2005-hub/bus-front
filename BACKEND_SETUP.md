# 🛠️ Backend Setup Guide (ASP.NET Core & MySQL)

This guide provides step-by-step instructions to set up a production-ready backend for the Night Journey Club using **ASP.NET Core** and **MySQL**.

## 🏗️ Technical Stack
- **Framework:** ASP.NET Core 8.0/9.0 Web API
- **Database:** MySQL 8.0+
- **ORM:** Entity Framework Core
- **Auth:** JWT (JSON Web Tokens) with Role-based Authorization

## 📋 Prerequisites
- [Visual Studio 2022](https://visualstudio.microsoft.com/) or [VS Code](https://code.visualstudio.com/)
- [.NET SDK](https://dotnet.microsoft.com/download)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) & [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)

## 🚀 Setup Steps

### 1. Initialize Project
Create a new ASP.NET Core Web API project:
```bash
dotnet new webapi -n NightJourneyClub.API
cd NightJourneyClub.API
```

### 2. Install NuGet Packages
Run the following commands to install required dependencies:
```bash
dotnet add package Pomelo.EntityFrameworkCore.MySql
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package AutoMapper
```

### 3. Configure Database Connection
Update your `appsettings.json` with your MySQL connection string:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=night_journey_db;User=root;Password=your_password;"
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyForJWTEncryption123!",
    "Issuer": "NightJourneyClub",
    "Audience": "NightJourneyClubTravelers"
  }
}
```

### 4. Create Database Context
Define your `AppDbContext.cs` inside a `Data` folder:
```csharp
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Bus> Buses { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    // Add other DbSets based on API_SPECIFICATION.md
}
```

### 5. Register Services in Program.cs
Add the database and authentication services:
```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"), 
    ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });
```

### 6. Run Migrations
Create and apply the database schema:
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## 🔍 Verification
1. Start the backend: `dotnet run`
2. Open Swagger UI (usually at `https://localhost:5001/swagger`)
3. Test the `POST /api/auth/register` endpoint to create your first user.

---
*For detailed API documentation, see [API_SPECIFICATION.md](API_SPECIFICATION.md).*
