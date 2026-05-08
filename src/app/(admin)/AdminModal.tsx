import { X } from "lucide-react-native";
import React, { useEffect } from "react";
import { Controller, DefaultValues, FieldValues, Resolver, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType } from "zod";
import FormField from "./Formfield";

export type FieldOption<T = string> = {
    label: string;
    value: T;
};

export type FieldConfig<T = any> = {

    name: string;
    label: string;
    placeholder?: string;
    type?: "text" | "number" | "email" | "password" | "select" | "textarea";
    options?: FieldOption[];
    keyboardType?: "default" | "numeric" | "email-address";
};

interface AdminModalProps<T extends FieldValues> {
    visible: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    schema: ZodType<T>;
    fields: FieldConfig[];
    defaultValues?: DefaultValues<T>;
    onSubmit: (data: T) => void | Promise<void>;
    isLoading?: boolean;
    submitLabel?: string;
    children?: React.ReactNode;
}

export default function AdminModal<T extends FieldValues>({
    visible,
    onClose,
    title,
    subtitle,
    schema,
    fields,
    defaultValues,
    onSubmit,
    isLoading = false,
    submitLabel = "Save",
    children,
}: AdminModalProps<T>) {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<T>({
        resolver: zodResolver(schema as any) as Resolver<T>,
        defaultValues,
    });

    useEffect(() => {
        if (visible) reset(defaultValues);
    }, [visible, defaultValues, reset]);

    const handleClose = () => {
        reset();
        onClose();
    };
    const onError = (errors: any) => console.log("Validation Errors:", errors);
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            <Pressable
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)" }}
                onPress={handleClose}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
            >
                <View style={{
                    backgroundColor: "#0f0f0f",
                    borderTopLeftRadius: 28, borderTopRightRadius: 28,
                    borderTopWidth: 0.5, borderLeftWidth: 0.5, borderRightWidth: 0.5,
                    borderColor: "#1e1e1e",
                    maxHeight: "90%",
                }}>
                    {/* drag handle */}
                    <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
                        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#2a2a2a" }} />
                    </View>

                    {/* Modal header */}
                    <View style={{
                        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                        paddingHorizontal: 20, paddingVertical: 14,
                        borderBottomWidth: 0.5, borderBottomColor: "#1e1e1e",
                    }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: "#e8e8e8", fontSize: 18, fontFamily: "Titillium_700Bold" }}>
                                {title}
                            </Text>
                            {subtitle && (
                                <Text style={{ color: "#555", fontSize: 12, fontFamily: "Titillium_400Regular", marginTop: 2 }}>
                                    {subtitle}
                                </Text>
                            )}
                        </View>
                        <Pressable
                            onPress={handleClose}
                            style={{
                                width: 34, height: 34, borderRadius: 10,
                                backgroundColor: "#1a1a1a",
                                borderWidth: 0.5, borderColor: "#2a2a2a",
                                alignItems: "center", justifyContent: "center",
                                marginLeft: 12,
                            }}
                        >
                            <X size={16} color="#666" />
                        </Pressable>
                    </View>

                    {/* Fields */}
                    <ScrollView
                        style={{ paddingHorizontal: 20 }}
                        contentContainerStyle={{ paddingTop: 16, paddingBottom: 8 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {fields.map((field) => (
                            <Controller
                                key={field.name}
                                control={control}
                                name={field.name as any}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <FormField
                                        label={field.label}
                                        placeholder={field.placeholder}
                                        value={value !== undefined && value !== null ? String(value) : ""}
                                        onChangeText={(text) => {
                                            if (field.type === "number") {
                                                onChange(text === "" ? undefined : Number(text));
                                            } else {
                                                onChange(text);
                                            }
                                        }}
                                        onBlur={onBlur}
                                        error={(errors as any)[field.name]?.message as string}
                                        keyboardType={field.keyboardType ?? (field.type === "number" ? "numeric" : "default")}
                                        secureTextEntry={field.type === "password"}
                                        multiline={field.type === "textarea"}
                                        numberOfLines={field.type === "textarea" ? 4 : 1}
                                        options={field.options}
                                    />
                                )}
                            />
                        ))}
                        {children}
                    </ScrollView>

                    {/* Actions */}
                    <View style={{
                        paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32,
                        gap: 10, borderTopWidth: 0.5, borderTopColor: "#1e1e1e",
                    }}>
                        <Pressable
                            onPress={handleSubmit(onSubmit, (errors) => {
                                console.log("Validation Errors:", errors);
                            })}
                            style={({ pressed }) => ({
                                backgroundColor: pressed ? "#cc7626" : "#E7872E",
                                borderRadius: 16, height: 50,
                                alignItems: "center", justifyContent: "center",
                            })}
                        >
                            {isLoading
                                ? <ActivityIndicator size="small" color="#0a0a0a" />
                                : <Text style={{ color: "#0a0a0a", fontSize: 15, fontFamily: "Titillium_700Bold" }}>{submitLabel}</Text>
                            }
                        </Pressable>
                        <Pressable
                            onPress={handleClose}
                            style={({ pressed }) => ({
                                backgroundColor: pressed ? "#161616" : "#111",
                                borderWidth: 0.5, borderColor: "#2a2a2a",
                                borderRadius: 16, height: 48,
                                alignItems: "center", justifyContent: "center",
                            })}
                        >
                            <Text style={{ color: "#888", fontSize: 14, fontFamily: "Titillium_400Regular" }}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}