import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  seedBookings,
  seedRides,
  seedVerificationQueue,
  type Booking,
  type Ride,
  type VerificationSubmission,
} from "./mock-data";

export type DriverStatus = "none" | "pending" | "verified" | "rejected";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinedAt: string;
  driverStatus: DriverStatus;
  rating: number;
  ridesTaken: number;
  ridesOffered: number;
};

type State = {
  user: User | null;
  rides: Ride[];
  bookings: Booking[];
  verificationQueue: VerificationSubmission[];
  login: (email: string, name?: string) => void;
  logout: () => void;
  register: (name: string, email: string) => void;
  updateProfile: (patch: Partial<User>) => void;
  bookRide: (ride: Ride) => void;
  cancelBooking: (bookingId: string) => void;
  publishRide: (
    ride: Omit<Ride, "id" | "driverId" | "driverName" | "driverAvatar" | "rating" | "verified">,
  ) => void;
  submitVerification: (submission: Omit<VerificationSubmission, "id" | "submittedAt" | "status">) => void;
  approveVerification: (id: string) => void;
  rejectVerification: (id: string, feedback: string) => void;
};

const defaultUser: User = {
  id: "u1",
  name: "Alex Morgan",
  email: "alex@neighbourly.app",
  phone: "+91 98000 12345",
  avatar: "https://i.pravatar.cc/160?img=13",
  joinedAt: "2026-01-12",
  driverStatus: "none",
  rating: 4.8,
  ridesTaken: 24,
  ridesOffered: 0,
};

export const useAppStore = create<State>()(
  persist(
    (set, get) => ({
      user: null,
      rides: seedRides,
      bookings: seedBookings,
      verificationQueue: seedVerificationQueue,

      login: (email, name) =>
        set({ user: { ...defaultUser, email, name: name ?? defaultUser.name } }),
      logout: () => set({ user: null }),
      register: (name, email) =>
        set({ user: { ...defaultUser, name, email, ridesTaken: 0 } }),
      updateProfile: (patch) =>
        set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),

      bookRide: (ride) =>
        set((s) => ({
          bookings: [
            { id: `b_${Date.now()}`, rideId: ride.id, ride, status: "upcoming", bookedAt: new Date().toISOString().slice(0, 10) },
            ...s.bookings,
          ],
          user: s.user ? { ...s.user, ridesTaken: s.user.ridesTaken + 1 } : s.user,
        })),
      cancelBooking: (bookingId) =>
        set((s) => ({
          bookings: s.bookings.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b)),
        })),

      publishRide: (ride) => {
        const u = get().user;
        if (!u) return;
        const newRide: Ride = {
          ...ride,
          id: `r_${Date.now()}`,
          driverId: u.id,
          driverName: u.name,
          driverAvatar: u.avatar,
          rating: u.rating,
          verified: true,
        };
        set((s) => ({
          rides: [newRide, ...s.rides],
          user: s.user ? { ...s.user, ridesOffered: s.user.ridesOffered + 1 } : s.user,
        }));
      },

      submitVerification: (submission) => {
        const id = `v_${Date.now()}`;
        set((s) => ({
          verificationQueue: [
            { ...submission, id, submittedAt: new Date().toISOString().slice(0, 10), status: "pending" },
            ...s.verificationQueue,
          ],
          user: s.user ? { ...s.user, driverStatus: "pending" } : s.user,
        }));
      },

      approveVerification: (id) =>
        set((s) => {
          const target = s.verificationQueue.find((v) => v.id === id);
          const isMe = target && s.user && target.userId === s.user.id;
          return {
            verificationQueue: s.verificationQueue.map((v) =>
              v.id === id ? { ...v, status: "verified", feedback: undefined } : v,
            ),
            user: isMe && s.user ? { ...s.user, driverStatus: "verified" } : s.user,
          };
        }),

      rejectVerification: (id, feedback) =>
        set((s) => {
          const target = s.verificationQueue.find((v) => v.id === id);
          const isMe = target && s.user && target.userId === s.user.id;
          return {
            verificationQueue: s.verificationQueue.map((v) =>
              v.id === id ? { ...v, status: "rejected", feedback } : v,
            ),
            user: isMe && s.user ? { ...s.user, driverStatus: "rejected" } : s.user,
          };
        }),
    }),
    { name: "neighbourly-store" },
  ),
);
