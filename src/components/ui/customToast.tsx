import { View } from 'react-native';
import { ToastConfig, ToastProps } from 'react-native-toast-message';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react-native';
import { StyledText } from './styledText';

// بنبني شكل لكل نوع (Success, Error, Info)
export const toastConfig: ToastConfig = {
    success: ({ text1, text2 }: any) => (
        <View className="flex-row items-center bg-[#1A1A1A] px-4 py-3 rounded-2xl w-[90%] border border-green-500/50 shadow-lg">
            <CheckCircle2 color="#22c55e" size={24} />
            <View className="ml-3 flex-1">
                <StyledText className="text-white font-titillium-bold text-base">{text1}</StyledText>
                {text2 && <StyledText className="text-gray-400 text-sm mt-0.5">{text2}</StyledText>}
            </View>
        </View>
    ),

    error: ({ text1, text2 }: any) => (
        <View className="flex-row items-center bg-[#1A1A1A] px-4 py-3 rounded-2xl w-[90%] border border-red-500/50 shadow-lg">
            <AlertCircle color="#ef4444" size={24} />
            <View className="ml-3 flex-1">
                <StyledText className="text-white font-titillium-bold text-base">{text1}</StyledText>
                {text2 && <StyledText className="text-gray-400 text-sm mt-0.5">{text2}</StyledText>}
            </View>
        </View>
    ),

    info: ({ text1, text2 }: any) => (
        <View className="flex-row items-center bg-[#1A1A1A] px-4 py-3 rounded-2xl w-[90%] border border-blue-500/50 shadow-lg">
            <Info color="#3b82f6" size={24} />
            <View className="ml-3 flex-1">
                <StyledText className="text-white font-titillium-bold text-base">{text1}</StyledText>
                {text2 && <StyledText className="text-gray-400 text-sm mt-0.5">{text2}</StyledText>}
            </View>
        </View>
    )
};