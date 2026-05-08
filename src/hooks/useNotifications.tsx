import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import Toast from 'react-native-toast-message';

import { AxiosAPI } from '@/services/axiosApi';
import { User } from '@/constants/types';

type NotificationPayload = {
    notificationAllowed: boolean;
};

type NotificationResponse = {
    user: User;
    message?: string;
    success?: boolean;
};

export const useNotifications = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ notificationAllowed }: NotificationPayload) => {
            const response = await AxiosAPI.put<NotificationResponse>('client/users/notification-allowed', {
                notificationAllowed,
            });

            return response.data.user;
        },
        onMutate: async ({ notificationAllowed }) => {
            await queryClient.cancelQueries({ queryKey: ['UserData'] });

            const previousUser = queryClient.getQueryData<User>(['UserData']);

            if (previousUser) {
                queryClient.setQueryData<User>(['UserData'], {
                    ...previousUser,
                    notificationAllowed,
                });
            }

            return { previousUser };
        },
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(['UserData'], updatedUser);

            Toast.show({
                type: 'success',
                text1: updatedUser.notificationAllowed ? 'Notifications enabled' : 'Notifications disabled',
                text2: updatedUser.notificationAllowed
                    ? 'Push alerts will be delivered to this account.'
                    : 'Push alerts are now turned off for this account.',
            });
        },
        onError: (error: AxiosError<{ message?: string; error?: string }>, _variables, context) => {
            if (context?.previousUser) {
                queryClient.setQueryData(['UserData'], context.previousUser);
            }

            const message = error.response?.data?.message || error.response?.data?.error || 'Could not update notification preference.';

            Toast.show({
                type: 'error',
                text1: 'Update failed',
                text2: message,
            });
        },
    });
};