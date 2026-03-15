import { View, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { AxiosAPI } from '@/services/axiosApi';
import { StyledText } from '@/components/ui/styledText';
import Button from '@/components/ui/buttonfg';
import { CreditCard } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router'; // ضفنا الراوتر هنا
import { auth } from '@/services/firebaseConfig';
import Colors from '@/constants/Colors';
import { useAuth } from '@/hooks/Auth';
import { useQueryClient } from '@tanstack/react-query';
// import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';

export default function PaymentStep() {
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();

    const router = useRouter();
    const submitDataToBackend = async (skipPayment: boolean) => {
        setIsLoading(true);
        try {

            if (skipPayment === true) {
                // const { data: stripeData } = await AxiosAPI.post('client/users/create-setup-intent');
                // const clientSecret = stripeData.clientSecret;
                // const clientSecret = "FakeclientId";

                // const { error: initError } = await initPaymentSheet({
                //     setupIntentClientSecret: clientSecret,
                //     merchantDisplayName: 'Smart Parking System',
                //     appearance: {
                //         colors: { background: Colors.garage[700] },
                //         applyLiquidGlass: true,
                //     }
                // });

                // if (initError) throw new Error(`Stripe Init Error: ${initError.message}`);

                // const { error: presentError } = await presentPaymentSheet();

                // // اللقطة كلها هنا: هندلة الـ Cancel
                // if (presentError) {
                //     if (presentError.code === 'Canceled') {
                //         Toast.show({
                //             type: 'info',
                //             text1: 'ملاحظة',
                //             text2: 'تم إلغاء إضافة البطاقة. يمكنك المحاولة مرة أخرى أو التخطي.',
                //         });
                //         return;
                //     } else {
                //         throw new Error(`Stripe Error: ${presentError.message}`);
                //     }
                // }


                // 3. النهاية السعيدة (لو كمل الفيزا بنجاح أو داس Skip)
                Toast.show({
                    type: 'success',
                    text1: 'Welcome Aboard! 🎉',
                    text2: skipPayment
                        ? 'تم إنشاء حسابك. يمكنك إضافة بطاقة لاحقاً.'
                        : 'تم إنشاء حسابك وحفظ البطاقة بنجاح.',
                });
            }
            else {
                // 3. النهاية السعيدة (لو كمل الفيزا بنجاح أو داس Skip)
                Toast.show({
                    type: 'success',
                    text1: 'Welcome Aboard! 🎉 , Mocking adding',
                    text2: skipPayment
                        ? 'تم إنشاء حسابك. يمكنك إضافة بطاقة لاحقاً.'
                        : 'تم إنشاء حسابك وحفظ البطاقة بنجاح.',
                });
            }
            router.replace('/(tabs)');
            await queryClient.invalidateQueries({ queryKey: ["UserData"] });


        } catch (error: any) {
            console.error(error.response?.data || error.message);
            const backendErrorMessage = error.response?.data?.message || error.message || "حدث خطأ أثناء التسجيل.";

            Toast.show({
                type: 'error',
                text1: 'Oops! Something went wrong ⚠️',
                text2: backendErrorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-black px-5 pt-10 justify-center">
            <View className="mb-8 text-center items-center">
                <CreditCard size={60} color="#E7872E" className="mb-4" />
                <StyledText className="text-3xl font-titillium-bold text-main-900">Payment Method</StyledText>
                <StyledText className="text-garage-500 mt-2 text-center">
                    Add a payment method now or skip and add later (3/3)
                </StyledText>
            </View>
            <Button title='Sign out' onPress={async () => {
                await auth.signOut();

            }}></Button>


            {isLoading ? (
                <ActivityIndicator size="large" color="#E7872E" />
            ) : (
                <View className="mt-8 gap-4 w-full">
                    <Button
                        title="Add a card"
                        theme="primary"
                        onPress={() => submitDataToBackend(false)}
                    />
                    <Button
                        title="Skip"
                        theme="primary_dullNbg"
                        onPress={() => submitDataToBackend(true)}
                    />
                </View>
            )}
        </View>
    );
}