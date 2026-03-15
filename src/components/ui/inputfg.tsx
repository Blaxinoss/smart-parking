import { useState } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";
import { StyledText } from "./styledText";
import Colors from "@/constants/Colors";
import { LucideIcon } from "lucide-react-native";
import { iconSizes, sizes } from "../../constants/reusables";


const states = {
    default: {
        container: "bg-garage-900 border-[1px] border-garage-700",
        label: "text-garage-500",
        input: "text-garage-50",
        placeholder: "#525252",
    },
    focused: {
        container: "bg-garage-900 border-[1px] border-main-900",
        label: "text-main-900",
        input: "text-garage-50",
        placeholder: "#525252",
    },
    filled: {
        container: "bg-garage-900 border-[1px] border-garage-700",
        label: "text-garage-500",
        input: "text-garage-50",
        placeholder: "#525252",
    },
    error: {
        container: "bg-garage-900 border-[1px] border-danger-900",
        label: "text-danger-900",
        input: "text-danger-900",
        placeholder: "#525252",
    },
};

interface InputFieldProps extends TextInputProps {
    label?: string;
    placeholder?: string;
    errorMessage?: string;
    isError?: boolean;
    size?: keyof typeof sizes;
    value?: string;
    onChangeText?: (text: string) => void;
    font?: string;
    IconDi?: "left" | "right";
    Icon?: LucideIcon;
}



export default function InputField({
    label = "Placeholder",
    placeholder = "Placeholder",
    errorMessage,
    isError = false,
    value,
    onChangeText,
    className,
    Icon,
    size = "md",
    IconDi,
    font = "titillium-regular",
    ...props
}: InputFieldProps) {
    const [isFocused, setIsFocused] = useState(false);

    const getState = () => {
        if (isError) return states.error;
        if (isFocused) return states.focused;
        if (value) return states.filled;
        return states.default;
    };

    const currentState = getState();

    return (
        <View className={`gap-1 w-full max-w-[500px] mx-auto border-2 rounded-2xl ${isFocused ? "border-main-900" : "border-transparent"}`}>
            <View className={`rounded-xl border border-transparent ${currentState.container} flex-col justify-center px-4 py-3`}>

                {/* Label */}
                {Icon && IconDi === "left" && (
                    <Icon size={iconSizes[size]} />
                )}

                {label && (
                    <StyledText

                        className={`text-xs font-titillium-bold ${currentState.label} py-3`}
                        style={{
                            fontSize: 15, lineHeight: 14,
                            animationDuration: 300,
                        }}
                    >
                        {label}
                    </StyledText>
                )}

                <View className="flex-row items-center">
                    <TextInput
                        className={`rounded-xl p-2 bg-garage-950 ${className}`}
                        {...props}
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={placeholder}
                        placeholderTextColor={currentState.placeholder}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        underlineColorAndroid="transparent"
                        selectionColor="#E7872E"
                        cursorColor="#E7872E"


                        style={{
                            fontSize: 16,
                            includeFontPadding: false,
                            flex: 1,
                            color: Colors.main[100],

                            outlineStyle: "solid",
                            outlineColor: "#525252ff",
                            outlineWidth: 0.2,
                            // @ts-ignore
                        }}
                    />
                </View>

                {Icon && IconDi === "right" && (
                    <Icon size={iconSizes[size]} />
                )}



            </View>

            {/* Error Message */}
            {isError && errorMessage && (
                <Text
                    className="text-danger-900 font-titillium-regular bg-garage-950"
                    style={{ fontSize: 12, lineHeight: 16 }}
                >
                    {errorMessage}
                </Text>
            )}
        </View>
    );
}