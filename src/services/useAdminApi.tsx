import { IAlert, IParkingSlot, PaymentTransaction, SlotStatus, TransactionStatus, User, Vehicle } from "@/constants/types";
import { AxiosAPI } from "@/services/axiosApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Toast from "react-native-toast-message";

type ToastOpts = { type?: string; text1?: string; text2?: string };

function showToast(opts: ToastOpts) {
    // always attempt native toast (no-op on web for this lib if not patched)
    try {
        Toast.show(opts as any);
    } catch (e) {
        // ignore
    }

    // web fallback: render our WebToast and also call alert() as a last-resort visibility
    try {
        if (typeof window !== "undefined") {

            // also call native browser alert for guaranteed visibility (optional)
            // keep concise: only show alert for errors to avoid spam
            if (opts.type === "error") {

                alert((opts.text1 ?? "") + (opts.text2 ? "\n" + opts.text2 : ""));
            }
        }
    } catch (e) {
        // ignore
    }
    // Simplified catch blocks
    try {
        Toast.show(opts as any);
    } catch {
        // ignore
    }

    // web fallback: render our WebToast and also call alert() as a last-resort visibility
    if (typeof window !== "undefined") {



        alert((opts.text1 ?? "") + (opts.text2 ? "\n" + opts.text2 : ""));

    }
}

type ApiListResponse<T> = {
    data: T;
};

const getAdminData = async <T,>(path: string) => {
    const response = await AxiosAPI.get<ApiListResponse<T>>(path);
    return response.data.data;
};

// ─── Types (extend as needed) ─────────────────────────────────────────────────
export type AdminUser = {
    id: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    phone?: string;
    address?: string;
    NationalID?: string;
    licenseNumber?: string | null;
    licenseExpiry?: string | null;
    debt?: number;
    notificationAllowed?: boolean;
};

export type ParkingSlot = {
    id: string;
    status: SlotStatus;
    floorLevel?: number;
};

export type ParkingSession = {
    id: number;
    userId: string;
    slotId: string;
    startTime: string;
    endTime?: string;
    totalCost?: number;
    status: "ACTIVE" | "COMPLETED" | "CANCELLED";
    user?: User;
    vehicle?: Vehicle;
    paymentTransaction?: PaymentTransaction[];
};

export type Reservation = {
    id: number;
    userId: string;
    slotId: string;
    startTime: string;
    endTime: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
    user?: { name: string; email: string };
    vehicle?: { plate: string };
};



export type Device = {
    _id: string;
    deviceId: string;
    name: string;
    type: "SENSOR" | "CAMERA" | "GATE";
    status: "online" | "offline";  // ✅ lowercase يتطابق مع الـ model
    slotId?: string | null;
    lastSeen?: string;
    cpuTemp?: number;
};

export type Gate = {
    id: string;
    name: string;
    type: "ENTRY" | "EXIT";
    status: "OPEN" | "CLOSED";
    createdAt: string;
    updatedAt: string;
};
export type CreateUserPayload = Omit<AdminUser, "id" | "debt"> & {
    password?: string;
    National_Id: string;
}

// ─── USERS ────────────────────────────────────────────────────────────────────
export const useAdminUsers = () =>
    useQuery({ queryKey: ["adminUsers"], queryFn: () => getAdminData<AdminUser[]>("/admin/users") });

export const useCreateUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateUserPayload) =>
            AxiosAPI.post<ApiListResponse<AdminUser>>("/admin/users/create_user", data).then(r => r.data.data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminUsers"] }); showToast({ type: "success", text1: "User created" }); },
        onError: (e: AxiosError) => showToast({ type: "error", text1: e.message, text2: (e.response?.data as any)?.error }),
    });
};

export const useUpdateUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: Partial<AdminUser> & { id: string }) =>
            AxiosAPI.patch<ApiListResponse<AdminUser>>(`/admin/users/${id}`, data).then(r => r.data.data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminUsers"] }); showToast({ type: "success", text1: "User updated" }); },
        onError: (e: AxiosError) => showToast({ type: "error", text1: e.message, text2: (e.response?.data as any)?.error }),
    });
};

export const useDeleteUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => AxiosAPI.delete<ApiListResponse<unknown>>(`/admin/users/${id}`).then(r => r.data.data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminUsers"] }); showToast({ type: "success", text1: "User deleted" }); },
        onError: (e: AxiosError) => showToast({ type: "error", text1: e.message, text2: (e.response?.data as any)?.error }),
    });
};

// ─── SLOTS ────────────────────────────────────────────────────────────────────
export const useAdminSlots = () =>
    useQuery({ queryKey: ["adminSlots"], queryFn: () => getAdminData<IParkingSlot[]>("/admin/slots") });

export const useCreateSlot = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<IParkingSlot>) => AxiosAPI.post<ApiListResponse<any>>("/admin/slots", data).then(r => r.data.data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminSlots"] }); showToast({ type: "success", text1: "Slot created" }); },
        onError: (e: AxiosError) => showToast({ type: "error", text1: e.message, text2: (e.response?.data as any)?.error }),
    });
};

export const useUpdateSlot = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ slotId, newId, status, type }: {
            slotId: string;
            newId?: string;
            status?: string;
            type?: string;
        }) =>
            AxiosAPI.patch<ApiListResponse<IParkingSlot>>(
                `/admin/slots/${slotId}`,
                { id: newId, status, type }
            ).then(r => r.data.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["adminSlots"] });
            showToast({ type: "success", text1: "Slot updated" });
        },
        onError: (e: AxiosError) => showToast({ type: "error", text1: e.message, text2: (e.response?.data as any)?.error }),
    });
}

export const useDeleteSlot = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => AxiosAPI.delete<ApiListResponse<IParkingSlot>>(`/admin/slots/${id}`).then(r => r.data.data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminSlots"] }); showToast({ type: "success", text1: "Slot deleted" }); },
        onError: (e: AxiosError) => showToast({ type: "error", text1: e.message, text2: (e.response?.data as any)?.error }),
    });
};

// ─── SESSIONS ─────────────────────────────────────────────────────────────────
export const useAdminSessions = () =>
    useQuery({ queryKey: ["adminSessions"], queryFn: () => getAdminData<ParkingSession[]>("/admin/sessions") });

export const useForceCancel = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) =>
            AxiosAPI.post(`/admin/sessions/${id}/force-cancel`).then(r => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["adminSessions"] });
            showToast({ type: "success", text1: "Session cancelled" });
        },
        onError: (e: AxiosError) =>
            showToast({ type: "error", text1: (e.response?.data as any)?.error }),
    });


};

export const useEditSession = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            AxiosAPI.put(`/admin/sessions/${id}`, data).then(r => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["adminSessions"] });
            showToast({ type: "success", text1: "Session updated successfully" });
        },
        onError: (e: any) =>
            showToast({ type: "error", text1: e.response?.data?.error || "Error updating session" }),
    });
};

export const useCompleteCashPayment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) =>
            AxiosAPI.post(`/admin/sessions/${id}/complete-cash-payment`).then(r => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["adminSessions"] });
            showToast({ type: "success", text1: "Cash payment confirmed" });
        },
        onError: (e: AxiosError) =>
            showToast({ type: "error", text1: (e.response?.data as any)?.error }),
    });
};

// ─── RESERVATIONS ─────────────────────────────────────────────────────────────
export const useAdminReservations = () =>
    useQuery({ queryKey: ["adminReservations"], queryFn: () => getAdminData<Reservation[]>("/admin/reservations") });

export const useCancelReservation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) =>
            AxiosAPI.put<ApiListResponse<Reservation>>(`/admin/reservations/${id}`, {
                status: "CANCELLED",
            }).then(r => r.data.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["adminReservations"] });
            showToast({ type: "success", text1: "Reservation cancelled" });
        },
        onError: (e: AxiosError) => showToast({ type: "error", text1: e.message, text2: (e.response?.data as any)?.error }),
    });
};

export const useUpdateReservation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: Partial<Reservation> & { id: number }) =>
            AxiosAPI.put<ApiListResponse<Reservation>>(`/admin/reservations/${id}`, data).then(r => r.data.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["adminReservations"] });
            showToast({ type: "success", text1: "Reservation updated" });
        },
        onError: (e: AxiosError) => showToast({ type: "error", text1: e.message, text2: (e.response?.data as any)?.error }),
    });
};
// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
export const useAdminTransactions = () =>
    useQuery({ queryKey: ["adminTransactions"], queryFn: () => getAdminData<PaymentTransaction[]>("/admin/transactions") });

// إضافة الـ Mutation الخاص بتغيير الحالة (مثلاً لتأكيد الدفع وفتح البوابة)
export const useUpdateTransactionStatus = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: TransactionStatus }) =>
            AxiosAPI.patch<{ success: boolean; data: PaymentTransaction }>(
                `/admin/transactions/${id}/status`,
                { transactionStatus: status }
            ).then(r => r.data.data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ["adminTransactions"] });

            const actionMsg = variables.status === TransactionStatus.COMPLETED
                ? "Payment Confirmed & Gate Opened!"
                : `Transaction marked as ${variables.status}`;

            showToast({ type: "success", text1: actionMsg });
        },
        onError: (e: AxiosError) => {
            showToast({
                type: "error",
                text1: "Failed to update transaction",
                text2: (e.response?.data as any)?.message || e.message
            });
        },
    });
};
// ─── ALERTS ───────────────────────────────────────────────────────────────────
export const useAdminAlerts = () =>
    useQuery({ queryKey: ["adminAlerts"], queryFn: () => getAdminData<IAlert[]>("/admin/alerts") });

export const useResolveAlert = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => AxiosAPI.patch<ApiListResponse<IAlert>>(`/admin/alerts/${id}/resolve`).then(r => r.data.data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminAlerts"] }); showToast({ type: "success", text1: "Alert resolved" }); },
        onError: (e: AxiosError) => showToast({ type: "error", text1: e.message, text2: (e.response?.data as any)?.error }),
    });
};

// ─── DEVICES ──────────────────────────────────────────────────────────────────

export const useAdminDevices = () =>
    useQuery({
        queryKey: ["adminDevices"],
        queryFn: () => getAdminData<Device[]>("/admin/devices"),
    });

export const useCreateDevice = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Omit<Device, "_id" | "deviceId" | "lastSeen" | "cpuTemp">) =>
            AxiosAPI.post<ApiListResponse<Device>>("/admin/devices", data).then(r => r.data.data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminDevices"] }); showToast({ type: "success", text1: "Device created" }); },
        onError: (e: AxiosError) => showToast({ type: "error", text1: e.message, text2: (e.response?.data as any)?.error }),
    });
};
export const useUpdateDevice = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: Omit<Partial<Device>, "id"> & { id: string }) =>
            AxiosAPI.patch<ApiListResponse<Device>>(`/admin/devices/${id}`, data).then(r => r.data.data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminDevices"] }); showToast({ type: "success", text1: "Device updated" }); },
        onError: (e: AxiosError) => showToast({ type: "error", text1: e.message, text2: (e.response?.data as any)?.error }),
    });
};

export const useDeleteDevice = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) =>
            AxiosAPI.delete<ApiListResponse<Device>>(`/admin/devices/${id}`).then(r => r.data.data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminDevices"] }); showToast({ type: "success", text1: "Device deleted" }); },
        onError: (e: AxiosError) => showToast({ type: "error", text1: e.message, text2: (e.response?.data as any)?.error }),
    });
};

// ─── GATES ────────────────────────────────────────────────────────────────────
export const useAdminGates = () =>
    useQuery({
        queryKey: ["adminGates"],
        queryFn: () => getAdminData<Gate[]>("/admin/gates"),
    });
export const useUpdateGate = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: Partial<Gate> & { id: string }) =>
            AxiosAPI.patch<ApiListResponse<Gate>>(`/admin/gates/${id}`, data).then(r => r.data.data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminGates"] }); showToast({ type: "success", text1: "Gate updated" }); },
        onError: (e: AxiosError) => showToast({ type: "error", text1: e.message, text2: (e.response?.data as any)?.error }),
    });
};

export const useForceGateCommand = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ command, userId, gateId, type }: {
            command: "OPEN" | "CLOSE";
            gateId: string;
            reason: "ADMIN_OVERRIDE",
            type: "enter" | "exit";
            userId?: string;
        }) => AxiosAPI.post(`/admin/gates/force-command`, { command, userId, gateId, type }).then(r => r.data),
        onSuccess: (_, variables) => {
            showToast({ type: "success", text1: `Gate ${variables.command} command sent` });
            qc.invalidateQueries({ queryKey: ["adminGates"] });
        },
        onError: (e: AxiosError) =>
            showToast({ type: "error", text1: e.message, text2: (e.response?.data as any)?.error }),

    });
};