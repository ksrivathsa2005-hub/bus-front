# 🌙 Night Journey Club - Bus Ticket Booking Platform

Welcome to the **Night Journey Club**, a premium, retro-vintage themed bus ticket booking platform designed for travelers who appreciate the elegance of the past and the reliability of modern technology.

## 🏛️ Project Overview
Night Journey Club is a full-featured Angular application that simulates a real-world bus booking experience. It features distinct portals for Travelers, Vendors, and Administrators, all wrapped in a unique "High Command" and "Carrier Registry" aesthetic.

### ✨ Key Features
- **Traveler Portal:** Search routes, select seats, manage profiles, and view booking history.
- **Vendor Portal:** Manage fleets, monitor bookings, and update bus details.
- **Admin Terminal:** System-wide analytics, vendor management, and operational oversight.
- **Retro Aesthetic:** Custom-designed UI with vintage typography, parchment textures, and cinematic transitions.
- **Responsive Design:** Optimized for both desktop manifest entries and mobile navigation.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Angular CLI](https://angular.io/cli)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd bus
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open your browser and navigate to `http://localhost:4200`.

## 📂 Project Structure
```text
src/
├── app/
│   ├── components/      # Shared UI elements (Modals, Headers, Footers)
│   ├── guards/          # Role-based access control (Admin, Vendor, User)
│   ├── models/          # TypeScript interfaces & data structures
│   ├── pages/           # Main route components (Home, Dashboard, Login)
│   ├── services/        # Business logic & Mock data handling
│   └── variables.scss   # Global vintage theme variables
├── assets/              # Static images and icons
└── styles.scss          # Global styles and parchment effects
```

## 🛠️ Roles & Access
| Role | Landing Path | Description |
| :--- | :--- | :--- |
| **Traveler** | `/login` | Regular users booking their passage. |
| **Vendor** | `/vendor` | Bus operators managing their fleet. |
| **Admin** | `/admin` | Terminal officers overseeing the entire network. |

## 🛡️ Backend Integration
Currently, this application uses `localStorage` for data persistence. To transition to a live production environment, please refer to the following guides:
- [Backend Setup Guide (ASP.NET & MySQL)](BACKEND_SETUP.md)
- [API Specification](API_SPECIFICATION.md)
- [Backend Generation Prompt](BACKEND_PROMPT.md)

## 📜 License
© 1952 - 2026 Night Journey Club. All rights reserved.
"Where every journey becomes legend."
