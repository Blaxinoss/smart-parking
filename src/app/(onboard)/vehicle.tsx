import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from './_layout';
import InputFieldNaked from '@/components/ui/inputNaked';
import { StyledText } from '@/components/ui/styledText';
import Button from '@/components/ui/buttonfg';
import { Car, Palette } from 'lucide-react-native';
import z from 'zod';
import { useState } from 'react';
import { useAuth } from '@/hooks/Auth';
import { AxiosAPI } from '@/services/axiosApi';
import Toast from 'react-native-toast-message';

export default function VehicleStep() {
    const router = useRouter();
    const { data, updateData } = useOnboarding();
    const { firebaseUser } = useAuth();
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const VehicleZod = z.object({
        plate: z.string().regex(/^\s*([A-Za-z\u0600-\u06FF]\s+){1,3}[A-Za-z\u0600-\u06FF]\s*\d{3,4}\s*$/,
            "License Number must be separated letters but non-separate numbers"
        ),
        color: z.string().max(15)
    })



    const verifyZodVehicle = (fieldName: string, value: string) => {

        const wantedSchema = VehicleZod.pick({ [fieldName]: true } as any);

        const result = wantedSchema.safeParse(({ [fieldName]: value }));

        if (!result.success) {
            const msg = result.error.issues[0]?.message;
            setFieldErrors(prev => ({ ...prev, [fieldName]: msg }));
        } else {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }

    }


    const submitDataToBackend = async () => {

        const result = VehicleZod.safeParse(data);

        if (!result.success) {
            const errors: any = {};
            result.error.issues.forEach((err) => {
                if (err.path[0]) {
                    errors[err.path[0] as string] = err.message;
                }
            });
            setFieldErrors(errors);
            return;
        }
        setIsLoading(true);
        try {
            const idToken = await firebaseUser?.getIdToken();
            const userEmail = firebaseUser?.email;

            await AxiosAPI.post('public/users/signup', {
                name: data.name,
                phone: data.phone,
                email: userEmail,
                NationalID: data.nationalId,
                address: data.address,
                licenseNumber: data.licenseNumber,
                licenseExpiry: data.licenseExpiry,
                idToken: idToken
            });

            await AxiosAPI.post('public/users/vehicle', {
                plate: data.plate,
                color: data.color
            });


            Toast.show({
                type: 'success',
                text1: 'Your account has been created successfully',
                text2: "Your account has been registered successfully, , Continue with payment! 🎉"
            });


            router.push('/(onboard)/payment');


        } catch (error: any) {
            console.error(error.response?.data || error.message);
            const backendErrorMessage = error.response?.data?.message || error.message || "error happened while registering";

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

        <View className="flex-1 bg-black px-5 pt-10">
            {isLoading ? (
                <ActivityIndicator size="large" color="#E7872E" />
            ) : (
                <>
                    <View className="mb-8 mt-10">
                        <StyledText className="text-3xl font-titillium-bold text-main-900">Your Car</StyledText>
                        <StyledText className="text-garage-500 mt-2">Enter your car details (2/4)</StyledText>
                    </View>

                    <InputFieldNaked
                        label="License Number"
                        headerLabel='License Number'
                        placeholder="A B C 123"
                        value={data.plate}
                        onBlur={() => verifyZodVehicle('plate', data.plate)}
                        onChangeText={(txt) => updateData({ plate: txt })}
                        isError={!!fieldErrors.plate}
                        errorMessage={fieldErrors.plate}
                        Icon={Car}
                    />

                    <InputFieldNaked
                        label="Car Color"
                        headerLabel='Car Color'
                        placeholder="White"
                        value={data.color}
                        onChangeText={(txt) => updateData({ color: txt })}
                        onBlur={() => verifyZodVehicle('color', data.color)}

                        isError={!!fieldErrors.color}
                        errorMessage={fieldErrors.color}
                        Icon={Palette}
                    />

                    <View className="mt-8 gap-4">
                        <Button
                            title="Next"
                            theme="primary"
                            onPress={submitDataToBackend}
                        />
                        <Button
                            title="Back"
                            theme="primary_cool"
                            onPress={() => router.back()}
                        />
                    </View>
                </>
            )}
        </View>

    );
}