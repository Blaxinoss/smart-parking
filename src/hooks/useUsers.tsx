import { useQuery } from '@tanstack/react-query';
import { AxiosAPI } from '@/services/axiosApi';
import { User } from '@/constants/types';

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