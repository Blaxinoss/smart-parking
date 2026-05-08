import { Check, ChevronDown } from "lucide-react-native";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    Text,
    TextInput,
    TextInputProps,
    View,
} from "react-native";

interface Option {
    label: string;
    value: string | number;
}

interface FormFieldProps extends TextInputProps {
    label: string;
    error?: string;
    options?: Option[];
}

export default function FormField({
    label,
    error,
    options,
    value,
    onChangeText,
    ...props
}: FormFieldProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [selectOpen, setSelectOpen] = useState(false);

    const selectedOption = options?.find((o) => String(o.value) === String(value));

    const borderColor = error ? "#F97C7C" : isFocused ? "#E7872E" : "#1e1e1e";

    if (options) {
        return (
            <View style={{ marginBottom: 16 }}>
                <Text style={{
                    color: "#555", fontSize: 10, fontFamily: "Titillium_400Regular",
                    textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8,
                }}>
                    {label}
                </Text>

                <Pressable
                    onPress={() => setSelectOpen(true)}
                    style={{
                        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                        paddingHorizontal: 14, borderRadius: 14,
                        borderWidth: 0.5, borderColor,
                        backgroundColor: "#111", height: 50,
                    }}
                >
                    <Text style={{
                        color: selectedOption ? "#e8e8e8" : "#444",
                        fontFamily: "Titillium_400Regular", fontSize: 15,
                    }}>
                        {selectedOption ? selectedOption.label : props.placeholder ?? "Select..."}
                    </Text>
                    <ChevronDown size={16} color="#444" />
                </Pressable>

                {error && (
                    <Text style={{ color: "#F97C7C", fontSize: 11, marginTop: 4, fontFamily: "Titillium_400Regular" }}>{error}</Text>
                )}

                <Modal visible={selectOpen} transparent animationType="fade">
                    <Pressable
                        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", paddingHorizontal: 20 }}
                        onPress={() => setSelectOpen(false)}
                    >
                        <View style={{
                            backgroundColor: "#141414",
                            borderRadius: 20,
                            borderWidth: 0.5, borderColor: "#2a2a2a",
                            overflow: "hidden", maxHeight: 300,
                        }}>
                            <Text style={{
                                color: "#555", fontSize: 10, fontFamily: "Titillium_400Regular",
                                textTransform: "uppercase", letterSpacing: 1.5,
                                paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
                            }}>
                                {label}
                            </Text>
                            <FlatList
                                data={options}
                                keyExtractor={(item) => String(item.value)}
                                renderItem={({ item }) => {
                                    const isSelected = String(item.value) === String(value);
                                    return (
                                        <Pressable
                                            onPress={() => {
                                                onChangeText?.(String(item.value));
                                                setSelectOpen(false);
                                            }}
                                            style={({ pressed }) => ({
                                                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                                                paddingHorizontal: 16, paddingVertical: 14,
                                                borderTopWidth: 0.5, borderTopColor: "#1e1e1e",
                                                backgroundColor: pressed ? "#1a1a1a" : isSelected ? "#161616" : "transparent",
                                            })}
                                        >
                                            <Text style={{
                                                fontFamily: "Titillium_400Regular", fontSize: 15,
                                                color: isSelected ? "#E7872E" : "#ccc",
                                            }}>
                                                {item.label}
                                            </Text>
                                            {isSelected && <Check size={15} color="#E7872E" />}
                                        </Pressable>
                                    );
                                }}
                            />
                        </View>
                    </Pressable>
                </Modal>
            </View>
        );
    }

    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={{
                color: "#555", fontSize: 10, fontFamily: "Titillium_400Regular",
                textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8,
            }}>
                {label}
            </Text>

            <TextInput
                style={{
                    paddingHorizontal: 14,
                    borderRadius: 14,
                    borderWidth: 0.5,
                    borderColor,
                    backgroundColor: "#111",
                    color: "#e8e8e8",
                    fontFamily: "Titillium_400Regular",
                    fontSize: 15,
                    height: props.multiline ? undefined : 50,
                    minHeight: props.multiline ? 100 : undefined,
                    paddingTop: props.multiline ? 12 : 0,
                    textAlignVertical: props.multiline ? "top" : "center",
                    includeFontPadding: false,
                    outline: "none",
                } as any}
                placeholderTextColor="#333"
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                    setIsFocused(false);
                    props.onBlur?.({} as any);
                }}
                value={value}
                onChangeText={onChangeText}
                {...props}
            />

            {error && (
                <Text style={{ color: "#F97C7C", fontSize: 11, marginTop: 4, fontFamily: "Titillium_400Regular" }}>{error}</Text>
            )}
        </View>
    );
}