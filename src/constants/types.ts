

export interface EmittedData {
    type: string;
    message: string;
}


// --- Enums ---
export enum ReservationsStatus {
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    FULFILLED = 'FULFILLED',
    NO_SHOW = 'NO_SHOW'
}

export enum ParkingSessionStatus {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    EXITING = 'EXITING'
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    UNPAID_EXIT = 'UNPAID_EXIT',
    CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
    CASH = 'CASH',
    CARD = 'CARD',
    APPLICATION = 'APPLICATION',
    OTHER = 'OTHER'
}

// --- Interfaces (The Models) ---

export interface User {
    id: number;
    name: string;
    phone: string;
    email: string;
    uuid: string;
    role: 'ADMIN' | 'USER';
    NationalID: string;
    address: string;
    licenseNumber: string;
    paymentGatewayToken?: string | null;
    notificationToken?: string | null;
    licenseExpiry: Date | string;
    hasOutstandingDebt: boolean;
    createdAt: Date | string;
    Vehicles?: Vehicle[];
}

export interface Vehicle {
    id: number;
    plate: string;
    color: string;
    userId: number;
    hasOutstandingDebt: boolean;
    createdAt: Date | string;
}

export interface Reservation {
    id: number;
    userId: number;
    vehicleId: number;
    slotId: string;
    startTime: Date | string;
    endTime: Date | string;
    paymentType?: PaymentMethod | null;
    paymentIntentId?: string | null;
    isStacked: boolean;
    status: ReservationsStatus;
    createdAt: Date | string;
    // Relations
    user?: User;
    vehicle?: Vehicle;
    parkingSession?: ParkingSession;
}

export interface ParkingSession {
    id: number;
    userId: number;
    vehicleId: number;
    slotId: string;
    status: ParkingSessionStatus;
    entryTime: Date | string;
    exitTime?: Date | string | null;
    expectedExitTime: Date | string;
    overtimeStartTime?: Date | string | null;
    overtimeEndTime?: Date | string | null;
    paymentType?: PaymentMethod | null;
    isExtended: boolean;
    involvedInConflict: boolean;
    notes?: string | null;
    reservationId?: number | null;
    // Relations
    user?: User;
    vehicle?: Vehicle;
    paymentTransaction?: PaymentTransaction[];
}

export interface PaymentTransaction {
    id: number;
    parkingSessionId: number;
    amount: number;
    paymentMethod?: PaymentMethod | null;
    paidAt?: Date | string | null;
    transactionStatus: TransactionStatus;
    createdAt: Date | string;
}



export enum SlotStatus {
    AVAILABLE = 'available',
    OCCUPIED = 'occupied',
    RESERVED = 'reserved',
    MAINTENANCE = 'maintenance',
    DISABLED = 'disabled',
    CONFLICT = 'conflict',
    ASSIGNED = 'assigned'
}


export interface ISlotStats {
    total_uses_today: number;
    average_duration_minutes: number;
    last_cleaned?: string; // Date -> string
}

export interface ICurrentVehicle {
    plate_number?: string;
    occupied_since?: string; // Date -> string
    expected_exit?: string; // Date -> string
    reservation_id?: string;
}

export interface IConflictDetails {
    expected_plate: string;
    assigned_session_id?: string;
}

// 2. الواجهة الرئيسية للـ Slot
export interface IParkingSlot {
    _id: string;
    status: SlotStatus;
    current_vehicle?: ICurrentVehicle;
    conflict_details?: IConflictDetails;
    stats: ISlotStats;
    createdAt: string;
    updatedAt: string;
}
