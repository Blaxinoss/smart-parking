import { ReactElement, useState } from "react";
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
        container: "border-danger-900",
        label: "text-danger-900",
        input: "text-danger-900",
        placeholder: "text-danger-900",
    },
};

interface InputFieldProps extends TextInputProps {
    label?: string;
    placeholder?: string;
    errorMessage?: string;
    isError?: boolean;
    size?: keyof typeof sizes;
    value?: string;
    headerLabel?: string;
    onChangeText?: (text: string) => void;
    font?: string;
    IconDi?: "left" | "right";
    Icon?: LucideIcon | null;
    headerShown?: true | false,
    children?: React.ReactNode,
    isPicker?: boolean;
}



export default function InputFieldNaked({
    label = "Placeholder",
    placeholder = "",
    errorMessage,
    isError = false,
    value,
    onChangeText,
    className,
    children,
    isPicker = false,
    Icon = null,
    size = "md",
    IconDi = "right",
    headerShown = false,
    headerLabel = "",
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
        <View className="w-full max-w-[500px] mx-auto mb-4">
            <View
                className={`
                    flex flex-row justify-between items-center p-3 gap-1 w-full rounded-3xl border-2 bg-black
                    ${isError
                        ? "border-danger-900"
                        : isFocused
                            ? "border-main-900"
                            : "border-garage-700"} 
                `}
                style={{ height: "auto" }}
            >
                {/* Left Icon */}
                {Icon && IconDi === "left" && (
                    <Icon className="mx-2" color={isError ? "#ef4444" : isFocused ? "white" : "gray"} size={iconSizes[size]} />
                )}

                <View className="flex-col flex-1 ">
                    <View className="justify-center">
                        {headerLabel && (
                            <View style={{ height: 20, justifyContent: 'center' }}>
                                <StyledText
                                    className="ml-2 mb-4 font-titillium-bold"
                                    style={{
                                        height: 15,
                                        fontSize: 12,
                                        color: isError ? Colors.danger[900] : (isFocused ? "#E7872E" : "#525252"),
                                    }}
                                >
                                    {label}
                                </StyledText>
                            </View>
                        )}
                    </View>

                    <TextInput
                        className={`rounded-xl px-2 ${className}`}
                        {...props}
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={placeholder}
                        placeholderTextColor={currentState.placeholder}
                        showSoftInputOnFocus={!isPicker}
                        caretHidden={isPicker}
                        // --- التعديل الذي تم إرجاعه هنا ---
                        onFocus={() => setIsFocused(true)}
                        onBlur={(e) => {
                            setIsFocused(false)
                            if (props.onBlur) props.onBlur(e);

                        }}
                        // ---------------------------------
                        style={{
                            fontSize: 18,
                            includeFontPadding: false,
                            color: isError ? Colors.danger[900] : Colors.main[100],
                            textAlignVertical: 'center',
                            outline: "none"
                        }}
                    />
                </View>

                {children}

                {/* Right Icon */}
                {Icon && IconDi === "right" && (
                    <Icon color={isError ? "#ef4444" : isFocused ? "white" : "gray"} size={iconSizes[size]} />
                )}
            </View>

            {isError && errorMessage && (
                <View className="flex-row items-center mt-1 ml-4 gap-1">
                    <Text
                        className="text-danger-900 font-titillium-regular"
                        style={{ fontSize: 12, lineHeight: 16 }}
                    >
                        {errorMessage}
                    </Text>
                </View>
            )}
        </View>
    );
}