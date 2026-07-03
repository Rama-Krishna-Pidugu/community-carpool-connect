# Neighbourhood Carpool Platform - Frontend

This is the React frontend for the Neighbourhood Carpool Platform. It is built as a Single Page Application using **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **TanStack Router**. It communicates with the FastAPI backend for Cognito Authentication, Driver Verification, and Ride scheduling.

## Tech Stack
* **Build System:** Vite
* **Routing:** TanStack Router (`@tanstack/react-router`)
* **State Management:** Zustand (with storage persistence)
* **Form & Validation:** React Hook Form & Zod
* **Styling:** Tailwind CSS & Shadcn UI components
* **Icons:** Lucide React

---

## Local Setup Instructions

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** (or **bun**) installed.

### 2. Environment Configuration
The frontend automatically references the API backend (defaults to `http://localhost:8000`). If your local server is running on a different port, make sure to update the environment variables or the configuration files (`src/lib/api.ts`).

### 3. Install Dependencies
Install all packages required:

```bash
# Using npm
npm install

# Or using Bun
bun install
```

### 4. Running the Development Server
Run the local hot-reloading dev server:

```bash
# Using npm
npm run dev

# Or using Bun
bun dev
```

The app will be accessible at: `http://localhost:5173`

---

## Folder Structure

```text
src/
├── components/          # Reusable UI widgets (Navbar, StatCard, WebcamCapture, FileUpload, etc.)
│   └── ui/              # Shadcn components (Avatar, Card, Dialog, Select, etc.)
├── lib/
│   ├── api.ts           # API fetch wrappers and authentication handling
│   ├── mock-data.ts     # Local seed data and interfaces
│   └── store.ts         # Zustand global store configuration
├── routes/              # TanStack Router page templates
│   ├── __root.tsx       # Root layout wrapping Navbar and Footer
│   ├── admin.tsx        # Admin Dashboard portal
│   ├── auth.tsx         # Cognito Sign-in, Register, and OTP confirmation page
│   ├── dashboard.tsx    # Passenger/Driver overview panel
│   ├── offer-ride.tsx   # Verified driver's Ride Creation panel
│   ├── profile.tsx      # User profile, verification status, and stats page
│   └── verification.tsx # 4-step driver verification wizard
├── styles.css           # Global CSS variables and utility imports
└── router.tsx           # Global router instance setup
```

---

## Main Modules

### 1. Authentication (Cognito Integration)
* Integrates with Cognito via the backend API.
* Handles sign-up, sign-in, and verification code (OTP) entry.
* Token is securely persisted in `localStorage` and automatically sent in the `Authorization: Bearer <token>` header for subsequent requests.

### 2. Driver Verification Wizard
* A multi-step flow that collects driver details step-by-step.
* Uses the webcam to capture a **Live Selfie** to prevent pre-recorded image submissions.
* Interfaces with Amazon S3 presigned POST URLs to upload heavy files directly, saving backend compute overhead.

### 3. Admin Verification Portal
* Exclusively accessible to users with the `ADMIN` role.
* Allows administrators to preview pending driver profiles, view uploaded license/identity documents in a fullscreen modal overlay, and Approve or Reject applications.
* Features a backdrop-blurred modal view for inspecting documents with a high-visibility close button.

### 4. Ride Creation Panel (`/offer-ride`)
* Exclusively accessible to users with a `VERIFIED` driver status.
* Automatically queries the backend for the driver's registered vehicles list to populate the dropdown.
* Restricts maximum seats to match the selected vehicle's capacity.
* Emits a `POST /api/v1/rides` request to schedule the ride and displays a Success page showing the scheduled details with status `SCHEDULED`.
