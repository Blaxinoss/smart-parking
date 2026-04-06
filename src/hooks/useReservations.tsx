import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosAPI } from '@/services/axiosApi';
import { Reservation } from '@/constants/types';
import Toast from 'react-native-toast-message';
import { AxiosError } from 'axios';

const fetchUserReservations = async () => {
    const response = await AxiosAPI.get<Reservation | null>('client/reservations/active');

    return response.data;
};
export const useUserReservations = () => {

    return useQuery({
        queryKey: ["userReservations"],
        queryFn: fetchUserReservations,
        retry: 2,
    });
};


interface cancelResponseSuccess {
    message: string,
    reservation: Reservation,
}

interface cancelReservationFailure {
    requiresForceCancel: boolean,
    error: string
}

interface cancelReservationParams {
    id: string;
    forceCancel: boolean;
}

export const useCancelReservation = () => {
    const queryClient = useQueryClient();
    return useMutation<cancelResponseSuccess, AxiosError<cancelReservationFailure>, cancelReservationParams>
        ({
            mutationFn: async ({ id, forceCancel }: { id: string, forceCancel?: boolean }) => {
                const { data } = await AxiosAPI.post<cancelResponseSuccess>(`client/reservations/${id}/cancel`, { forceCancel });
                return data;
            },

            onSuccess: (data) => {
                queryClient.setQueryData(['userReservations'], null);
                queryClient.invalidateQueries({ queryKey: ['userReservations'] });
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: data.message || 'Your reservation has been cancelled successfully',
                });
            },

            onError: (error: AxiosError<cancelReservationFailure>) => {

                const requiredForceCancel = error.response?.data.requiresForceCancel
                const errMessage = error.response?.data.error;


                if (requiredForceCancel) return; //?

                Toast.show({
                    type: 'error',
                    text1: `Couldn't cancel the reservation`,
                    text2: errMessage || 'Try again later',
                });
            }
        });
}

interface ReservationResponse {
    id: string;
    userId: string;
    vehicleId: string;
    slotId: string;
    startTime: string;
    endTime: string;
    isImmediate?: boolean;
    paymentIntentId: string | null;
    paymentType: 'CASH' | 'CARD';
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
    isStacked: boolean;
    createdAt: string;
}

// في useUserReservations.ts
export const useConfirmReservation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newReservation: any) => {
            const response = await AxiosAPI.post<ReservationResponse>('client/reservations', newReservation);
            return response.data;
        },

        onError: (err: any) => {
            Toast.show({
                type: 'error',
                text1: 'Reservation Failed',
                text2: err.response?.data?.error
            });
        },

        onSuccess: (data) => {
            // ✅ حط الـ data الجديدة في الـ cache مباشرة
            queryClient.setQueryData(["userReservations"], data);
            Toast.show({ type: 'success', text1: 'Reservation Accomplished! 🎉' });
        },

        // ❌ شيل onSettled دي تماماً
        // onSettled: () => {
        //     queryClient.invalidateQueries({ queryKey: ["userReservations"] });
        // },
    });
};