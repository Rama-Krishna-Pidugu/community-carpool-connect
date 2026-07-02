export type Ride = {
  id: string;
  driverId: string;
  driverName: string;
  driverAvatar: string;
  rating: number;
  vehicle: string;
  pickup: string;
  destination: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  seats: number;
  price: number;
  verified: boolean;
};

export type Booking = {
  id: string;
  rideId: string;
  ride: Ride;
  status: "upcoming" | "past" | "cancelled";
  bookedAt: string;
};

export type VerificationSubmission = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  submittedAt: string;
  status: "pending" | "verified" | "rejected";
  feedback?: string;
  personal: { fullName: string; dob: string; phone: string; email: string };
  vehicle: { type: string; model: string; regNumber: string; seats: number };
  documents: { dlFront?: string; dlBack?: string; rc?: string; insurance?: string; govId?: string; selfie?: string };
};

export const seedRides: Ride[] = [
  {
    id: "r1", driverId: "d1", driverName: "Priya Sharma",
    driverAvatar: "https://i.pravatar.cc/120?img=47", rating: 4.9,
    vehicle: "Honda City · White",
    pickup: "Green Park Colony", destination: "Cyber Hub, Sector 24",
    date: "2026-07-04", time: "08:30", seats: 3, price: 80, verified: true,
  },
  {
    id: "r2", driverId: "d2", driverName: "Arjun Mehta",
    driverAvatar: "https://i.pravatar.cc/120?img=12", rating: 4.7,
    vehicle: "Maruti Swift · Silver",
    pickup: "Sunrise Apartments", destination: "Tech Park East",
    date: "2026-07-04", time: "09:00", seats: 2, price: 60, verified: true,
  },
  {
    id: "r3", driverId: "d3", driverName: "Ananya Iyer",
    driverAvatar: "https://i.pravatar.cc/120?img=32", rating: 5.0,
    vehicle: "Hyundai Creta · Blue",
    pickup: "Rosewood Society", destination: "Downtown Metro",
    date: "2026-07-05", time: "07:45", seats: 4, price: 90, verified: true,
  },
  {
    id: "r4", driverId: "d4", driverName: "Rahul Verma",
    driverAvatar: "https://i.pravatar.cc/120?img=15", rating: 4.6,
    vehicle: "Tata Nexon EV · Green",
    pickup: "Lakeview Enclave", destination: "Business Bay",
    date: "2026-07-05", time: "08:15", seats: 3, price: 100, verified: true,
  },
  {
    id: "r5", driverId: "d5", driverName: "Neha Kapoor",
    driverAvatar: "https://i.pravatar.cc/120?img=48", rating: 4.8,
    vehicle: "Kia Seltos · Red",
    pickup: "Palm Meadows", destination: "Innovation District",
    date: "2026-07-06", time: "09:30", seats: 2, price: 75, verified: true,
  },
  {
    id: "r6", driverId: "d6", driverName: "Vikram Singh",
    driverAvatar: "https://i.pravatar.cc/120?img=68", rating: 4.5,
    vehicle: "Honda Activa · Black",
    pickup: "Green Park Colony", destination: "City Hospital",
    date: "2026-07-04", time: "10:00", seats: 1, price: 40, verified: true,
  },
];

export const seedBookings: Booking[] = [
  { id: "b1", rideId: "r1", ride: seedRides[0], status: "upcoming", bookedAt: "2026-07-01" },
  { id: "b2", rideId: "r3", ride: seedRides[2], status: "upcoming", bookedAt: "2026-07-02" },
  {
    id: "b3", rideId: "past1",
    ride: { ...seedRides[1], id: "past1", date: "2026-06-20", pickup: "Home", destination: "Airport Terminal 3" },
    status: "past", bookedAt: "2026-06-18",
  },
];

export const seedVerificationQueue: VerificationSubmission[] = [
  {
    id: "v1", userId: "u_pending_1", userName: "Sanjay Rao",
    userAvatar: "https://i.pravatar.cc/120?img=52",
    submittedAt: "2026-07-02", status: "pending",
    personal: { fullName: "Sanjay Rao", dob: "1990-05-14", phone: "+91 98765 43210", email: "sanjay@example.com" },
    vehicle: { type: "Car", model: "Toyota Innova", regNumber: "KA 05 MJ 4421", seats: 6 },
    documents: {},
  },
  {
    id: "v2", userId: "u_pending_2", userName: "Meera Nair",
    userAvatar: "https://i.pravatar.cc/120?img=45",
    submittedAt: "2026-07-01", status: "pending",
    personal: { fullName: "Meera Nair", dob: "1994-11-02", phone: "+91 99887 76655", email: "meera@example.com" },
    vehicle: { type: "Car", model: "Volkswagen Polo", regNumber: "MH 12 AC 8890", seats: 4 },
    documents: {},
  },
];

export const testimonials = [
  { name: "Ishita R.", role: "Daily commuter", quote: "I've saved almost half my monthly commute cost and met great neighbours along the way.", avatar: "https://i.pravatar.cc/120?img=25" },
  { name: "Kabir M.", role: "Verified driver", quote: "The verification process felt secure and quick. Passengers know they can trust the ride.", avatar: "https://i.pravatar.cc/120?img=33" },
  { name: "Farah A.", role: "Student", quote: "Booking a ride to campus takes under a minute. Way easier than juggling bus routes.", avatar: "https://i.pravatar.cc/120?img=41" },
];
