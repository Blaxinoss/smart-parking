import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosAPI } from '@/services/axiosApi';
import { Vehicle } from '@/constants/types';
import { AxiosError } from 'axios';
import Toast from 'react-native-toast-message';

// ─── Fetch ────────────────────────────────────────────────────────────────────

const fetchVehicles = async (): Promise<Vehicle[]> => {
    const response = await AxiosAPI.get<{ data: Vehicle[] }>('client/vehicles');
    return response.data.data;
};

export const useVehicles = () =>
    useQuery({
        queryKey: ['vehicles'],
        queryFn: fetchVehicles,
        retry: 2,
    });

// ─── Add ──────────────────────────────────────────────────────────────────────

interface AddVehiclePayload {
    plate: string;
    color: string;
}

export const useAddVehicle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: AddVehiclePayload) => {
            const response = await AxiosAPI.post<{ data: Vehicle }>('client/vehicles', payload);
            return response.data.data;
        },
        onSuccess: (newVehicle) => {
            queryClient.setQueryData<Vehicle[]>(['vehicles'], (old = []) => [...old, newVehicle]);
            queryClient.invalidateQueries({ queryKey: ['UserData'] });
            Toast.show({ type: 'success', text1: 'Vehicle added', text2: `Plate ${newVehicle?.plate} registered successfully.` });
        },
        onError: (error: AxiosError<{ message?: string; error?: string }>) => {
            const message = error.response?.data?.message || error.response?.data?.error || 'Could not add vehicle.';
            Toast.show({ type: 'error', text1: 'Failed to add vehicle', text2: message });
        },
    });
};

// ─── Update ───────────────────────────────────────────────────────────────────

interface UpdateVehiclePayload {
    id: number;
    plate?: string;
    color?: string;
}

export const useUpdateVehicle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...payload }: UpdateVehiclePayload) => {
            const response = await AxiosAPI.put<{ data: Vehicle }>(`client/vehicles/${id}`, payload);
            return response.data.data;
        },
        onSuccess: (updated) => {
            queryClient.setQueryData<Vehicle[]>(['vehicles'], (old = []) =>
                old.map((v) => (v.id === updated?.id ? updated : v))
            );
            queryClient.invalidateQueries({ queryKey: ['UserData'] });
            Toast.show({ type: 'success', text1: 'Vehicle updated' });
        },
        onError: (error: AxiosError<{ message?: string; error?: string }>) => {
            const message = error.response?.data?.message || error.response?.data?.error || 'Could not update vehicle.';
            Toast.show({ type: 'error', text1: 'Update failed', text2: message });
        },
    });
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const useDeleteVehicle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const res = await AxiosAPI.delete<{ success: boolean, deletedCar: Vehicle }>(`client/vehicles/${id}`);
            return res.data.deletedCar;
        },
        onSuccess: (data, id) => {
            queryClient.setQueryData<Vehicle[]>(['vehicles'], (old = []) =>
                old.filter((v) => v.id !== id)
            );
            queryClient.invalidateQueries({ queryKey: ['UserData'] });
            Toast.show({ type: 'success', text1: 'Vehicle removed' });
        },
        onError: (error: AxiosError<{ message?: string; error?: string }>) => {
            const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Could not remove vehicle.';
            console.log(error.message)
            Toast.show({ type: 'error', text1: 'Delete failed', text2: message });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] })
        }
    });
};