import Button from "@/components/ui/buttonfg";
import SearchBar from "@/components/ui/searchBar";
import { Pencil, Plus, Trash2, UserCircle } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { z } from "zod";
import {
    AdminUser,
    useAdminUsers,
    useCreateUser,
    useDeleteUser,
    useUpdateUser,
} from "../../services/useAdminApi";
import AdminModal, { FieldConfig } from "./AdminModal";

// 1. تحديث الـ Zod Schema لتشمل كل الحقول الإلزامية والاختيارية الجديدة تبعا للـ API
const userSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").optional(), // اختياري في الـ Edit وإلزامي في الـ Create
    phone: z.string().optional(),
    role: z.enum(["USER", "ADMIN"]), // أضفنا CAPTAIN لو متاح عندك
    National_Id: z.string().min(5, "National ID is required"),
    licenseNumber: z.string().optional(),
    licenseExpiry: z.string().optional(),
    address: z.string().optional(),

});

type UserForm = z.infer<typeof userSchema>;

// 2. تحديث الحقول الأساسية المشتركة (تضمين الحقول الجديدة)
const commonFields: FieldConfig[] = [
    { name: "name", label: "Full Name", placeholder: "John Doe" },
    { name: "email", label: "Email", placeholder: "john@example.com", type: "email", keyboardType: "email-address" },
    { name: "phone", label: "Phone Number", placeholder: "010xxxxxxxx", keyboardType: "numeric" },
    { name: "National_Id", label: "National ID", placeholder: "299xxxxxxxxxxx", keyboardType: "numeric" },
    { name: "address", label: "Address", placeholder: "24 St Studtgart", keyboardType: "default" },
    {
        name: "role",
        label: "Role",
        type: "select",
        options: [
            { label: "User", value: "USER" },
            { label: "Admin", value: "ADMIN" },
        ],
    },
    { name: "licenseNumber", label: "License Number (Optional)", placeholder: "LC-xxxxx", keyboardType: "default" },
    { name: "licenseExpiry", label: "License Expiry (Optional)", placeholder: "YYYY-MM-DD", keyboardType: "default" },
];

const createFields: FieldConfig[] = [
    ...commonFields.slice(0, 2), // حطينا الاسم والإيميل
    { name: "password", label: "Password", placeholder: "••••••••", type: "password" }, // حقل الباسورد مأمن
    ...commonFields.slice(2), // باقي الحقول
];

// حقول مخصصة للـ Edit (بدون الباسورد لأن التعديل ليه راوت تاني أو مش بـ PATCH العادي)
const editFields: FieldConfig[] = commonFields;

export default function UsersSection() {
    const { data: users, isLoading } = useAdminUsers();
    const createUser = useCreateUser();
    const updateUser = useUpdateUser();
    const deleteUser = useDeleteUser();

    // تحديث الستايلات لتشمل الرول الجديد
    const ROLE_STYLES: Record<"USER" | "ADMIN" | "CAPTAIN", { color: string; bg: string; border: string }> = {
        USER: { color: "#9ca3af", bg: "rgba(156,163,175,0.12)", border: "rgba(156,163,175,0.25)" },
        ADMIN: { color: "#E7872E", bg: "rgba(231,135,46,0.14)", border: "rgba(231,135,46,0.35)" },
        CAPTAIN: { color: "#38bdf8", bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.3)" },
    };

    const [search, setSearch] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<any | null>(null); // جلعناه مرن حسب الـ API الجديد

    const filtered = (users ?? []).filter(
        (user) =>
            user.name?.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (user: AdminUser) => {

        if (confirm(`Delete User ${user.name} ?`)) {
            deleteUser.mutate(user.id)
        }
    };
    return (
        <View style={{ flex: 1, backgroundColor: "#0a0a0a", paddingHorizontal: 16, paddingTop: 16 }}>
            {/* Header Card */}
            <View
                style={{
                    backgroundColor: "#111",
                    borderWidth: 0.5,
                    borderColor: "#1e1e1e",
                    borderRadius: 20,
                    padding: 16,
                    marginBottom: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={{ color: "#e8e8e8", fontSize: 18, fontFamily: "Titillium_700Bold" }}>Users</Text>
                    <Text style={{ color: "#555", fontSize: 11, fontFamily: "Titillium_400Regular", marginTop: 2 }}>
                        Create, edit, and remove accounts with advanced roles
                    </Text>
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

            {/* Search Bar Container */}
            <View
                style={{
                    backgroundColor: "#111",
                    borderWidth: 0.5,
                    borderColor: "#1e1e1e",
                    borderRadius: 16,
                    padding: 12,
                    marginBottom: 12,
                }}
            >
                <SearchBar bgOutter="bg-black" className="text-white" value={search} onChangeText={setSearch} placeholder="Search users by name or email..." />
            </View>

            {isLoading ? (
                <ActivityIndicator color="#E7872E" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={{ paddingBottom: 100, gap: 8 }}
                    ListEmptyComponent={
                        <View style={{ backgroundColor: "#111", borderWidth: 0.5, borderColor: "#1e1e1e", borderStyle: "dashed", borderRadius: 18, padding: 24 }}>
                            <Text style={{ color: "#d0d0d0", fontSize: 14, fontFamily: "Titillium_700Bold" }}>No users found</Text>
                            <Text style={{ color: "#444", fontSize: 12, fontFamily: "Titillium_400Regular", marginTop: 4 }}>
                                Try a different search or add a new account.
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => {
                        const roleStyle = ROLE_STYLES[item.role as keyof typeof ROLE_STYLES] || ROLE_STYLES.USER;
                        return (
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    backgroundColor: "#111",
                                    borderWidth: 1,
                                    borderColor: "#1f1f1f",
                                    borderRadius: 18,
                                    paddingHorizontal: 12,
                                    paddingVertical: 10,
                                }}
                            >
                                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#0a0a0a", borderWidth: 1, borderColor: "#2a2a2a", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                                    <UserCircle size={22} color="#E7872E" />
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: "#f1f1f1", fontSize: 14, fontFamily: "Titillium_700Bold" }}>{item.name}</Text>
                                    <Text style={{ color: "#888", fontSize: 12, marginTop: 1 }}>{item.email}</Text>

                                    <View style={{ flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                                        {/* Role Badge */}
                                        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: roleStyle.bg, borderWidth: 1, borderColor: roleStyle.border }}>
                                            <Text style={{ color: roleStyle.color, fontSize: 10, fontFamily: "Titillium_700Bold" }}>{item.role}</Text>
                                        </View>

                                        {/* Debt Badge */}
                                        {item.debt && item.debt > 0 ? (
                                            <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: "rgba(249,124,124,0.12)", borderWidth: 1, borderColor: "rgba(249,124,124,0.3)" }}>
                                                <Text style={{ color: "#F97C7C", fontSize: 10, fontFamily: "Titillium_700Bold" }}>Debt: ${item.debt}</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                </View>

                                <Pressable onPress={() => setEditTarget(item)} style={{ padding: 6, marginRight: 4 }}>
                                    <Pencil size={13} color="#666" />
                                </Pressable>
                                <Pressable onPress={() => handleDelete(item)} style={{ padding: 6 }}>
                                    <Trash2 size={13} color="#F97C7C" />
                                </Pressable>
                            </View>
                        );
                    }}
                />
            )}

            {/* 📥 مودال إنشاء مستخدم جديد (مع حقل الباسورد وحقول الرخصة والرقم القومي) */}
            <AdminModal<UserForm>
                visible={createOpen}
                onClose={() => setCreateOpen(false)}
                title="Create User"
                subtitle="Add a new verified account to the system"
                schema={userSchema}
                fields={createFields}
                defaultValues={{ role: "USER", National_Id: "", licenseNumber: "", licenseExpiry: "" }}
                onSubmit={(data) => {
                    createUser.mutate(data, { onSuccess: () => setCreateOpen(false) });
                }}
                isLoading={createUser.isPending}
                submitLabel="Create User"
            />

            {/* 📝 مودال تعديل مستخدم الحالي */}
            <AdminModal<UserForm>
                visible={!!editTarget}
                onClose={() => setEditTarget(null)}
                title="Edit User"
                subtitle={editTarget?.email}
                schema={userSchema}
                fields={editFields}
                defaultValues={editTarget ? {
                    name: editTarget.name,
                    email: editTarget.email,
                    phone: editTarget.phone || "",
                    role: editTarget.role,
                    National_Id: editTarget.NationalID || "", // طابقنا المسمى مع الداتابيز prisma
                    licenseNumber: editTarget.licenseNumber || "",
                    licenseExpiry: editTarget.licenseExpiry ? editTarget.licenseExpiry.split('T')[0] : "" // قطع الوقت للحصول على الـ Date فقط YYYY-MM-DD
                } : undefined}
                onSubmit={(data) => {
                    if (!editTarget) return;
                    // بنشيل الباسورد في التعديل عشان ميبعتش نص فاضي يبوظ الفايربيز
                    const { password, ...updatePayload } = data;
                    updateUser.mutate({ id: editTarget.id, ...updatePayload }, { onSuccess: () => setEditTarget(null) });
                }}
                isLoading={updateUser.isPending}
                submitLabel="Save Changes"
            />
        </View>
    );
}