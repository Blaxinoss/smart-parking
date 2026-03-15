import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from './_layout';

import InputFieldNaked from '@/components/ui/inputNaked';
import { StyledText } from '@/components/ui/styledText';
import Button from '@/components/ui/buttonfg';
import { User, Phone, MapPin, IdCard, Calendar, IdCardLanyard } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker'
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { useState } from 'react';

// 1. تعريف القوانين (Schema) بره الكومبوننت لأداء أفضل
const UserInfoSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(100),
    phone: z.string().regex(/^01[0125]\d{8}$/, "Invalid Egyptian phone number"),
    nationalId: z.string().length(14, "National ID must be exactly 14 digits"),
    address: z.string().min(5, "Address is too short"),
    licenseNumber: z.string().min(5, "Invalid license number"), // عدلت الطول هنا ليكون منطقي
    licenseExpiry: z.date({
        error: "Please select a valid date"
    }).refine(date => date > new Date(), "License must not be expired"),
});

export default function UserInfoStep() {
    const router = useRouter();
    const { data, updateData } = useOnboarding();

    // State لتخزين رسائل الخطأ لكل حقل
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // 2. دالة الفحص عند الخروج من الحقل (onBlur)
    const validateField = (fieldName: string, value: any) => {
        const TargetedField = UserInfoSchema.pick({ [fieldName]: true } as any);
        const result = TargetedField.safeParse({ [fieldName]: value });

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
    };

    const handleNext = () => {
        const result = UserInfoSchema.safeParse(data);

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
        router.push('/(onboard)/vehicle');
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    className="w-full max-w-[500px] mx-auto flex-1"
                    contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
                >
                    <StyledText className="text-3xl font-titillium-bold text-main-900">Welcome!</StyledText>
                    <StyledText className="text-garage-500 mb-10">Provide us with some more information to create your account (1/4)</StyledText>

                    {/* Full Name */}
                    <InputFieldNaked
                        label="Full name"
                        placeholder="Ahmed Saeed"
                        headerLabel='Name'
                        value={data.name}
                        onChangeText={(txt) => updateData({ name: txt })}
                        onBlur={() => validateField('name', data.name)}
                        isError={!!fieldErrors.name}
                        errorMessage={fieldErrors.name}
                        Icon={User}
                    />

                    {/* Phone Number */}
                    <InputFieldNaked
                        label="Phone Number"
                        placeholder="010..."
                        keyboardType="phone-pad"
                        headerLabel='Phone'
                        value={data.phone}
                        onChangeText={(txt) => updateData({ phone: txt })}
                        onBlur={() => validateField('phone', data.phone)}
                        isError={!!fieldErrors.phone}
                        errorMessage={fieldErrors.phone}
                        Icon={Phone}
                    />

                    {/* National ID */}
                    <InputFieldNaked
                        label="National ID"
                        placeholder="14-digit number"
                        headerLabel='National Id'
                        keyboardType="number-pad"
                        value={data.nationalId}
                        onChangeText={(txt) => updateData({ nationalId: txt })}
                        onBlur={() => validateField('nationalId', data.nationalId)}
                        isError={!!fieldErrors.nationalId}
                        errorMessage={fieldErrors.nationalId}
                        Icon={IdCard}
                    />

                    {/* Address */}
                    <InputFieldNaked
                        label="Address"
                        placeholder="Alexandria, Egypt"
                        headerLabel='Address'
                        value={data.address}
                        onChangeText={(txt) => updateData({ address: txt })}
                        onBlur={() => validateField('address', data.address)}
                        isError={!!fieldErrors.address}
                        errorMessage={fieldErrors.address}
                        Icon={MapPin}
                    />

                    {/* Driving License Number */}
                    <InputFieldNaked
                        label="Driving License Number"
                        placeholder="License ID"
                        headerLabel='Driving License Number'
                        value={data.licenseNumber}
                        onChangeText={(txt) => updateData({ licenseNumber: txt })}
                        onBlur={() => validateField('licenseNumber', data.licenseNumber)}
                        isError={!!fieldErrors.licenseNumber}
                        errorMessage={fieldErrors.licenseNumber}
                        Icon={IdCardLanyard}
                    />

                    {/* License Expiry Date Section */}
                    <View className="relative ">
                        {Platform.OS !== 'web' ? (
                            <>
                                <InputFieldNaked
                                    isPicker={true}
                                    headerLabel='License Expiry Date'
                                    value={data.licenseExpiry?.toLocaleDateString()}
                                    Icon={Calendar}
                                    isError={!!fieldErrors.licenseExpiry}
                                    errorMessage={fieldErrors.licenseExpiry}
                                />
                                <View style={{ position: 'absolute', left: 10, bottom: fieldErrors.licenseExpiry ? 62 : 37 }}>
                                    {/* <DateTimePicker
                                        mode='date'
                                        value={data.licenseExpiry || new Date()}
                                        minimumDate={new Date()}
                                        onChange={(event, date) => {
                                            if (date) {
                                                updateData({ licenseExpiry: date });
                                                validateField('licenseExpiry', date);
                                            }
                                        }}
                                        style={{ width: 120 }}
                                    /> */}
                                </View>
                            </>
                        ) : (
                            <View className="relative">
                                <InputFieldNaked
                                    isPicker={true}
                                    headerLabel='License Expiry Date'
                                    value={data.licenseExpiry?.toLocaleDateString()}
                                    Icon={Calendar}
                                    isError={!!fieldErrors.licenseExpiry}
                                    errorMessage={fieldErrors.licenseExpiry}
                                />
                                <input
                                    type="date"
                                    onChange={(e) => {
                                        const d = new Date(e.target.value);
                                        updateData({ licenseExpiry: d });
                                        validateField('licenseExpiry', d);
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: 0, left: 0, right: 0, bottom: 0,
                                        opacity: 0, cursor: 'pointer', width: '95%'
                                    }}
                                />
                            </View>
                        )}
                    </View>

                    <Button
                        title="Next Step"
                        theme="primary"
                        onPress={handleNext}
                        className="mt-6"
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}