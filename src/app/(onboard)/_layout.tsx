import { toastConfig } from "@/components/ui/customToast";
import { useAuth } from "@/hooks/Auth";
import { Stack } from "expo-router";
import { createContext, useContext, useState } from "react";
import Toast from "react-native-toast-message";

// تعريف كل الحقول المطلوبة للباك إند
type OnboardingData = {
    name: string;
    phone: string;
    nationalId: string;
    address: string;
    licenseNumber: string;
    licenseExpiry: Date | null;
    plate: string;
    color: string;
};

const OnboardingContext = createContext<{
    data: OnboardingData;
    updateData: (fields: Partial<OnboardingData>) => void;
}>({
    data: {
        name: '', phone: '', nationalId: '', address: '',
        licenseNumber: '', licenseExpiry: null, plate: '', color: ''
    },
    updateData: () => { },
});

export const useOnboarding = () => useContext(OnboardingContext);

export default function BoardLayout() {
    const [data, setData] = useState<OnboardingData>({
        name: '', phone: '', nationalId: '', address: '',
        licenseNumber: '', licenseExpiry: new Date(), plate: '', color: ''
    });


    const updateData = (fields: Partial<OnboardingData>) => {
        setData((prev) => ({ ...prev, ...fields }));
    };
    return (
        <OnboardingContext.Provider value={{ data, updateData }}>
            <Stack screenOptions={{ headerShown: false }} />

        </OnboardingContext.Provider>
    );
}