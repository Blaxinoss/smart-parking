import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosAPI } from '@/services/axiosApi';
import { ParkingSession, Reservation } from '@/constants/types';
import Toast from 'react-native-toast-message';
import { AxiosError } from 'axios';

const fetchUserSessions = async () => {
    const response = await AxiosAPI.get<{ data: ParkingSession }>('client/sessions/active');
    return response.data.data;
};


export const useUserSessions = () => {

    return useQuery({
        queryKey: ["userSessions"],
        queryFn: fetchUserSessions,
        retry: 2,
    });
};
export const useExtendUserSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ sessionId, minutes }: { sessionId: number, minutes: number }) => {
            const response = await AxiosAPI.post(`client/sessions/${sessionId}/extend`, {
                extendForMinutes: minutes
            });
            return response.data;
        },
        onSuccess(data) {
            const { message, newExpectedExitTime } = data;

            queryClient.invalidateQueries({ queryKey: ["userSessions"] });

            Toast.show({
                type: 'success',
                text1: message || 'Success',
                text2: `Extended successfully to ${new Date(newExpectedExitTime).toLocaleTimeString()}`
            });
        },
        onError: (error: AxiosError<any>) => {
            const serverMessage = error.response?.data?.message || error.response?.data?.error || 'Unknown error';

            Toast.show({
                type: 'error',
                text1: 'Extending Session Failed',
                text2: serverMessage
            });

            console.log("Extension Error Details:", error.response?.data);
        }
    });
};

