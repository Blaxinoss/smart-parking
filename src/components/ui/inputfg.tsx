import { useState } from "react";
import { Text, TextInput, View } from "react-native";

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

interface InputFieldProps {
    label?: string;
    placeholder?: string;
    errorMessage?: string;
    isError?: boolean;
    value?: string;
    onChangeText?: (text: string) => void;
    font?: string;
}

export default function InputField({
    label = "Placeholder",
    placeholder = "Placeholder",
    errorMessage,
    isError = false,
    value,
    onChangeText,
    font = "titillium-regular",
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
        <View className="gap-1">
            <View className={`rounded-xl px-4 pt-2 pb-3 ${currentState.container}`}>
                {/* Label */}
                <Text
                    className={`text-xs font-${font} ${currentState.label}`}
                    style={{ fontSize: 12, lineHeight: 16 }}
                >
                    {label}
                </Text>

                {/* Input */}
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={currentState.placeholder}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`font-${font} ${currentState.input} p-0`}
                    style={{ fontSize: 16, lineHeight: 24 }}
                />
            </View>

            {/* Error Message */}
            {isError && errorMessage && (
                <Text
                    className="text-danger-900 font-titillium-regular"
                    style={{ fontSize: 12, lineHeight: 16 }}
                >
                    {errorMessage}
                </Text>
            )}
        </View>
    );
}