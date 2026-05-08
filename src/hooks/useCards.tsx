import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosAPI } from '@/services/axiosApi';
import Toast from 'react-native-toast-message';

// 1. تايب كارت واحد بس (زي ما سترايب بتبعته جوه الـ Array)
export interface StripeCardItem {
    id: string;
    card: {
        brand: string;
        last4: string;
        exp_month: number;
        exp_year: number;
        funding: string;
    };
}

// 2. تايب الرد الكامل بتاع الـ API
export interface GetCardsResponse {
    success: boolean;
    data: StripeCardItem[]; // هنا بنقوله إن الـ data عبارة عن مصفوفة من الكروت
}

const fetchUserCards = async () => {
    // Axios بيرجع الـ response جواه الـ data بتاعتنا
    const response = await AxiosAPI.get<GetCardsResponse>('client/users/cards');

    // بنرجع response.data.data اللي هي Array من الـ StripeCardItem
    return response.data.data;
};

const deleteCardApi = async (paymentMethodId: string) => {
    // افترضت إن الراوت بتاعك بيبدأ بـ client/users زي ما عملنا في الـ GET
    const response = await AxiosAPI.delete(`/client/users/cards/${paymentMethodId}`);
    return response.data;
};



export const useCards = () => {
    return useQuery({
        queryKey: ['userCards'],
        queryFn: fetchUserCards,
        retry: 1,
    });
};


export const useDeleteCard = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCardApi,
        onSuccess: (data) => {
            // سحر React Query: بنقوله روح هات الكروت من تاني عشان نحدث الـ UI
            queryClient.invalidateQueries({ queryKey: ['userCards'] });

            Toast.show({
                type: 'success',
                text1: 'deleted successfully',
                text2: data.message || 'card was deleted successfully!',
            });
        },
        onError: (error: any) => {
            // بنمسك الإيرور اللي راجع من الباك إند (لو الكارت هو الوحيد مثلاً)
            const errorMessage = error.response?.data?.message || 'couldn\'t delete the card';
            Toast.show({
                type: 'error',
                text1: 'sorry!',
                text2: errorMessage,
            });
        },
    });
};