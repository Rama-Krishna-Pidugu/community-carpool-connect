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
  moneySaved: number;
  co2Saved: number;
  role: "USER" | "ADMIN";
};

type State = {
  user: User | null;
  rides: Ride[];
  bookings: Booking[];
  verificationQueue: VerificationSubmission[];
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password?: string, phone?: string) => Promise<void>;
  confirmOTP: (email: string, otp: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: Partial<User>) => void;
  bookRide: (ride: Ride, couponCode?: string) => Promise<void>;
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
  phone: "",
  avatar: "",
  joinedAt: "2026-01-12",
  driverStatus: "none",
  rating: 4.8,
  ridesTaken: 24,
  ridesOffered: 0,
  moneySaved: 0,
  co2Saved: 0,
  role: "USER",
};

import { apiFetch, apiLogin } from "./api";

export const useAppStore = create<State>()(
  persist(
    (set, get) => ({
      user: null,
      rides: seedRides,
      bookings: seedBookings,
      verificationQueue: seedVerificationQueue,

      login: async (email, password) => {
        try {
          if (password) {
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", password);
            const data = await apiLogin("/auth/login", formData);
            
            // 🚀 SAVES ID_TOKEN: Bypasses 401 identity claim blocks on reload
            localStorage.setItem("access_token", data.id_token);
          }
          
          const profile = await apiFetch("/users/me").catch(() => null);
          if (profile) {
            set({ 
              user: { 
                ...defaultUser, 
                ...profile, 
                name: profile.full_name, 
                phone: profile.phone_number || "", 
                avatar: profile.avatar_url || "", 
                driverStatus: profile.driver_status || "none",
                ridesTaken: profile.rides_taken ?? 0,
                ridesOffered: profile.rides_offered ?? 0,
                moneySaved: profile.money_saved ?? 0,
                co2Saved: profile.co2_saved ?? 0
              } 
            });
          } else {
            set({ user: { ...defaultUser, email, phone: "" } });
          }
        } catch (e) {
          throw e;
        }
      },
      logout: () => {
        localStorage.removeItem("access_token");
        set({ user: null });
      },
      register: async (name, email, password, phone) => {
        try {
          if (password) {
            await apiFetch("/auth/register", {
              method: "POST",
              body: JSON.stringify({
                full_name: name,
                email,
                password,
                phone_number: phone || null
              })
            });
          }
        } catch (e) {
          throw e;
        }
      },
      confirmOTP: async (email, otp) => {
        try {
          await apiFetch("/auth/confirm", {
            method: "POST",
            body: JSON.stringify({ email, otp })
          });
        } catch (e) {
          throw e;
        }
      },
      forgotPassword: async (email) => {
        try {
          await apiFetch("/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email })
          });
        } catch (e) {
          throw e;
        }
      },
      resetPassword: async (email, otp, newPassword) => {
        try {
          await apiFetch("/auth/reset-password", {
            method: "POST",
            body: JSON.stringify({
              email,
              otp,
              new_password: newPassword
            })
          });
        } catch (e) {
          throw e;
        }
      },
      refreshProfile: async () => {
        try {
          const profile = await apiFetch("/users/me").catch(() => null);
          if (profile) {
            set({ 
              user: { 
                ...defaultUser, 
                ...profile, 
                name: profile.full_name, 
                phone: profile.phone_number || "", 
                avatar: profile.avatar_url || "", 
                driverStatus: profile.driver_status || "none",
                ridesTaken: profile.rides_taken ?? 0,
                ridesOffered: profile.rides_offered ?? 0,
                moneySaved: profile.money_saved ?? 0,
                co2Saved: profile.co2_saved ?? 0
              } 
            });
          }
          const dbBookings = await apiFetch("/bookings").catch(() => null);
          if (dbBookings) {
            set({ bookings: dbBookings });
          }
        } catch (e) {
          // Ignore
        }
      },
      updateProfile: (patch) =>
        set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),

      bookRide: async (ride, couponCode) => {
        try {
          await apiFetch("/bookings", {
            method: "POST",
            body: JSON.stringify({ ride_id: ride.id, coupon_code: couponCode })
          });
          const dbBookings = await apiFetch("/bookings").catch(() => null);
          if (dbBookings) {
            set((s) => ({
              bookings: dbBookings,
              user: s.user ? { ...s.user, ridesTaken: s.user.ridesTaken + 1 } : s.user,
            }));
          }
        } catch (e) {
          throw e;
        }
      },
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