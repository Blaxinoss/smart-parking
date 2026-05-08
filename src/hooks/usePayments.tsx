import { PaymentTransaction } from '@/constants/types';
import { AxiosAPI } from '@/services/axiosApi';
import { useStripe } from '@stripe/stripe-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
type PaymentHistoryResponse = {
    success: boolean;
    data: PaymentTransaction[];
};

const fetchUserPayments = async () => {
    const response = await AxiosAPI.get<PaymentHistoryResponse>('client/transactions');
    return response.data.data;
};

export const usePaymentHistory = () => {
    return useQuery({
        queryKey: ['paymentHistory'],
        queryFn: fetchUserPayments,
        retry: 1,
    });

};


interface GetCheckoutLin {
    success: boolean;
    data: {
        url: string;
        reused: boolean;
    }
}

const fetchCheckoutLink = async (transactionId: number) => {
    const response = await AxiosAPI.post<GetCheckoutLin>('client/transactions/get-checkout-link', { transactionId });
    return response.data;
};


interface GetPaymentIntentResponse {
    success: boolean;
    data: {
        clientSecret: string;
    }
}

const fetchPaymentIntent = async (transactionId: number) => {
    // غيرنا اسم الراوت لـ get-payment-intent
    const response = await AxiosAPI.post<GetPaymentIntentResponse>('client/transactions/get-payment-intent', { transactionId });
    return response.data;
};

export const usePayTransaction = () => {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const queryClient = useQueryClient();
    const returnUrl = Linking.createURL('stripe-redirect');
    return useMutation({
        mutationFn: fetchPaymentIntent,
        onSuccess: async (data) => {
            if (data.success && data.data.clientSecret) {

                const { error: initError } = await initPaymentSheet({
                    paymentIntentClientSecret: data.data.clientSecret,
                    merchantDisplayName: 'Smart Parking System',
                    returnURL: returnUrl
                    // appearance: { colors: { background: '#1a1a1a' } } // ظبط ألوانك
                });

                if (initError) {
                    Alert.alert("Failed to Initialize payment modal", initError.message);
                    return;
                }

                // 2. إظهار الشاشة لليوزر
                const { error: presentError } = await presentPaymentSheet();

                if (presentError) {
                    if (presentError.code === 'Canceled') {
                        console.log('Payment canceled by user');
                    } else {
                        Alert.alert("payment failed", presentError.message);
                    }
                } else {
                    // الدفع نجح! 🎉
                    Alert.alert("success", "payment has been done successfully");

                    // نحدث البيانات في الشاشة عشان الكارت يختفي
                    queryClient.invalidateQueries({ queryKey: ['paymentHistory'] });
                }

            } else {
                Alert.alert("Sorry!", "Payment couldn't be done");
            }
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || "Error while connecting to the server";
            Alert.alert("error", errorMessage);
        }
    });
};