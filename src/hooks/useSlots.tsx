import { useQuery } from '@tanstack/react-query';
import { AxiosAPI } from '@/services/axiosApi';
import { IParkingSlot, User } from '@/constants/types';


// parkingTypes.ts


const fetchSlots = async () => {
    const response = await AxiosAPI.get<{ success: boolean, data: IParkingSlot[] }>('client/slots');
    return response.data.data;
};

export const useSlots = () => {

    return useQuery({
        queryKey: ["Slots"],
        queryFn: fetchSlots,
        staleTime: 1000 * 60 * 5,
        retry: 2,
    });
};