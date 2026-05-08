import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosAPI } from '@/services/axiosApi';
import { User } from '@/constants/types';
import { AxiosError } from 'axios';
import Toast from 'react-native-toast-message';

const fetchUser = async () => {
    const response = await AxiosAPI.get<{ user: User }>('client/users');
    return response.data.user;
};

export const useUser = () => {

    return useQuery({
        queryKey: ["UserData"],
        queryFn: fetchUser,
        retry: 2,
    });
};

type UpdateUserPayload = Partial<Pick<User, 'name' | 'phone' | 'address' | 'licenseNumber'>>;

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: UpdateUserPayload) => {
            const response = await AxiosAPI.put<{ user: User }>('client/users', payload);
            return response.data.user;
        },
        //very critical even if it's the same user 
        //but are you sure that calling the put route 
        // will return all the data related to the user with the vehicles and so on ?
        // no right then 
        onSuccess: (updatedUser) => {
            queryClient.setQueryData<User>(['UserData'], (previousUser) => {
                if (!previousUser) return updatedUser;

                return {
                    ...previousUser,
                    ...updatedUser,
                };
            });
            Toast.show({
                type: 'success',
                text1: 'Profile updated',
                text2: 'Your account details were saved successfully.'
            });
        },
        onError: (error: AxiosError<{ message?: string; error?: string }>) => {
            const message = error.response?.data?.message || error.response?.data?.error || 'Could not update profile right now.';
            Toast.show({
                type: 'error',
                text1: 'Update failed',
                text2: message
            });
        }
    });
};