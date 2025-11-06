import { create } from 'zustand';
import { Bike, Reservation, Ride } from '../types';

interface BikeState {
  bikes: Bike[];
  currentReservation: Reservation | null;
  currentRide: Ride | null;
  fetchBikes: () => Promise<void>;
  fetchCurrentReservation: () => Promise<void>;
  reserveBike: (bikeId: string, duration: number) => Promise<void>;
  unlockBike: (bikeId: string) => Promise<string>;
  startRide: (reservationId: string) => Promise<void>;
  endRide: (rideId: string, endDockId?: string, lat?: number, lng?: number) => Promise<void>;
  sendHeartbeat: (rideId: string, lat: number, lng: number) => Promise<{ duration: number; estimatedCost: number }>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useBikeStore = create<BikeState>((set, get) => ({
  bikes: [],
  currentReservation: null,
  currentRide: null,

  fetchBikes: async () => {
    const response = await fetch(`${API_URL}/api/bikes`, {
      credentials: 'include'
    });
    const { bikes } = await response.json();
    set({ bikes });
  },

  fetchCurrentReservation: async () => {
    try {
      const response = await fetch(`${API_URL}/api/bikes/current-reservation`, {
        credentials: 'include'
      });
      if (response.ok) {
        const { reservation } = await response.json();
        set({ currentReservation: reservation });
      }
    } catch (error) {
      console.error('Failed to fetch current reservation:', error);
    }
  },

  reserveBike: async (bikeId: string, duration: number) => {
    const response = await fetch(`${API_URL}/api/bikes/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ bikeId, duration })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const { reservation } = await response.json();
    set({ currentReservation: reservation });
    get().fetchBikes(); // Refresh bikes list
  },

  unlockBike: async (bikeId: string) => {
    const response = await fetch(`${API_URL}/api/bikes/${bikeId}/unlock`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const { unlockCode } = await response.json();
    return unlockCode;
  },

  startRide: async (reservationId: string) => {
    const response = await fetch(`${API_URL}/api/rides/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reservationId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const { ride } = await response.json();
    set({ currentRide: ride, currentReservation: null });
  },

  sendHeartbeat: async (rideId: string, lat: number, lng: number) => {
    const response = await fetch(`${API_URL}/api/rides/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ rideId, lat, lng })
    });

    const data = await response.json();
    return data;
  },

  endRide: async (rideId: string, endDockId?: string, lat?: number, lng?: number) => {
    const response = await fetch(`${API_URL}/api/rides/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ rideId, endDockId, lat, lng })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    set({ currentRide: null });
  }
}));