import Button from "@/components/ui/buttonfg";
import SearchBar from "@/components/ui/searchBar";
import Colors from "@/constants/Colors";
import { Pencil, Plus, Trash2, UserCircle } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { z } from "zod";
import AdminModal, { FieldConfig } from "./AdminModal";
import {
    AdminUser,
    useAdminUsers,
    useCreateUser,
    useDeleteUser,
    useUpdateUser,
} from "./useAdminApi";

const userSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    role: z.enum(["USER", "ADMIN"]),
});

type UserForm = z.infer<typeof userSchema>;

const fields: FieldConfig[] = [
    { name: "name", label: "Full Name", placeholder: "John Doe" },
    { name: "email", label: "Email", placeholder: "john@example.com", type: "email", keyboardType: "email-address" },
    { name: "phone", label: "Phone", placeholder: "+1 234 567 8900", keyboardType: "numeric" },
    {
        name: "role",
        label: "Role",
        type: "select",
        options: [
            { label: "User", value: "USER" },
            { label: "Admin", value: "ADMIN" },
        ],
    },
];

export default function UsersSection() {
    const { data: users, isLoading } = useAdminUsers();
    const createUser = useCreateUser();
    const updateUser = useUpdateUser();
    const deleteUser = useDeleteUser();

    const [search, setSearch] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<AdminUser | null>(null);

    const filtered = (users ?? []).filter(
        (user) =>
            user.name?.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (user: AdminUser) => {
        Alert.alert("Delete User", `Delete \"${user.name}\"?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteUser.mutate(user.id) },
        ]);
    };

    return (
        <View className="flex-1 bg-main-50 px-4 pt-4">
            <View className="rounded-[28px] bg-garage-950 px-4 py-4 mb-4 border border-garage-800">
                <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                        <Text className="text-main-50 text-2xl font-titillium_bold">Users</Text>
                        <Text className="text-garage-300 text-xs font-titillium mt-0.5">Create, edit, and remove accounts</Text>
                    </View>
                    <Button
                        title="New"
                        Icon={Plus}
                        size="sm"
                        onPress={() => setCreateOpen(true)}
                        className="w-auto px-4"
                        theme="primary"
                    />
                </View>
            </View>

            <View className="bg-white border border-garage-200 rounded-[24px] px-4 py-4 mb-4 shadow-sm">
                <SearchBar value={search} onChangeText={setSearch} placeholder="Search users..." />
            </View>

            {isLoading ? (
                <ActivityIndicator color={Colors.main[900]} className="mt-8" />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View className="rounded-[24px] border border-dashed border-garage-200 bg-white p-6 mt-4">
                            <Text className="text-garage-950 font-titillium_bold text-base">No users found</Text>
                            <Text className="text-garage-500 text-sm font-titillium mt-1">Try a different search or add a new account.</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View className="flex-row items-center bg-white border border-garage-200 rounded-[24px] px-4 py-3 mb-2 shadow-sm">
                            <View className="w-10 h-10 rounded-2xl bg-main-50 items-center justify-center mr-3 border border-main-100">
                                <UserCircle size={22} color={Colors.main[900]} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-garage-950 font-titillium_bold text-sm">{item.name}</Text>
                                <Text className="text-garage-500 text-xs font-titillium">{item.email}</Text>
                                <View className="flex-row gap-2 mt-1">
                                    <View className={`px-2 py-0.5 rounded-full ${item.role === "ADMIN" ? "bg-main-50 border border-main-100" : "bg-garage-100"}`}>
                                        <Text className={`text-[10px] font-titillium ${item.role === "ADMIN" ? "text-main-900" : "text-garage-600"}`}>{item.role}</Text>
                                    </View>
                                    {item.debt && item.debt > 0 ? (
                                        <View className="px-2 py-0.5 rounded-full bg-danger-50 border border-danger-100">
                                            <Text className="text-danger-700 text-[10px] font-titillium">Debt: ${item.debt}</Text>
                                        </View>
                                    ) : null}
                                </View>
                            </View>
                            <Pressable onPress={() => setEditTarget(item)} className="p-2 mr-1">
                                <Pencil size={16} color={Colors.garage[500]} />
                            </Pressable>
                            <Pressable onPress={() => handleDelete(item)} className="p-2">
                                <Trash2 size={16} color={Colors.danger[700]} />
                            </Pressable>
                        </View>
                    )}
                />
            )}

            <AdminModal<UserForm>
                visible={createOpen}
                onClose={() => setCreateOpen(false)}
                title="Create User"
                subtitle="Add a new user to the system"
                schema={userSchema}
                fields={fields}
                defaultValues={{ role: "USER" }}
                onSubmit={(data) => {
                    createUser.mutate(data, { onSuccess: () => setCreateOpen(false) });
                }}
                isLoading={createUser.isPending}
                submitLabel="Create User"
            />

            <AdminModal<UserForm>
                visible={!!editTarget}
                onClose={() => setEditTarget(null)}
                title="Edit User"
                subtitle={editTarget?.email}
                schema={userSchema}
                fields={fields}
                defaultValues={editTarget ? { name: editTarget.name, email: editTarget.email, phone: editTarget.phone, role: editTarget.role } : undefined}
                onSubmit={(data) => {
                    if (!editTarget) return;
                    updateUser.mutate({ id: editTarget.id, ...data }, { onSuccess: () => setEditTarget(null) });
                }}
                isLoading={updateUser.isPending}
                submitLabel="Save Changes"
            />
        </View>
    );
}