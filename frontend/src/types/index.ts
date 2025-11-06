export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'ADMIN' | 'TECHNICIAN';
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  studentId?: string;
  phone?: string;
  location?: string;
  wallet?: Wallet;
}

export interface Wallet {
  id: string;
  balance: number;
  currency: string;
}

export interface Bike {
  id: string;
  type: 'STANDARD' | 'E_BIKE';
  status: 'AVAILABLE' | 'RESERVED' | 'IN_RIDE' | 'MAINTENANCE';
  batteryPct?: number;
  lat?: number;
  lng?: number;
  dock?: Dock;
}

export interface Dock {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  active: boolean;
}

export interface Reservation {
  id: string;
  userId: string;
  bikeId: string;
  startAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'COMPLETED';
  bike: Bike;
}

export interface Ride {
  id: string;
  userId: string;
  bikeId: string;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  distance?: number;
  cost?: number;
  bike: Bike;
  startDock?: Dock;
  endDock?: Dock;
}

export interface Transaction {
  id: string;
  type: 'TOPUP' | 'HOLD' | 'CHARGE' | 'REFUND' | 'PENALTY';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}