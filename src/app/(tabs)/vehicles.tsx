import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';
import { Car, Plus, Trash2, Pencil, X, Check, ShieldAlert, Gauge } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import { StyledText } from '@/components/ui/styledText';
import InputFieldNaked from '@/components/ui/inputNaked';
import Button from '@/components/ui/buttonfg';
import { useVehicles, useAddVehicle, useUpdateVehicle, useDeleteVehicle } from '@/hooks/useVehicles';
import { Vehicle } from '@/constants/types';

// ─── Color Dot ────────────────────────────────────────────────────────────────

const COLOR_PRESETS = [
    { label: 'White', hex: '#FFFFFF' },
    { label: 'Black', hex: '#1a1a1a' },
    { label: 'Silver', hex: '#C0C0C0' },
    { label: 'Red', hex: '#DC2626' },
    { label: 'Blue', hex: '#2563EB' },
    { label: 'Gray', hex: '#6B7280' },
    { label: 'Green', hex: '#16A34A' },
    { label: 'Gold', hex: '#D97706' },
];

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
    return (
        <View className="flex-row flex-wrap gap-2 mt-1 mb-3 px-1">
            {COLOR_PRESETS.map((c) => (
                <TouchableOpacity
                    key={c.hex}
                    onPress={() => onChange(c.label)}
                    className="items-center gap-1"
                    activeOpacity={0.7}
                >
                    <View
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: c.hex,
                            borderWidth: value === c.label ? 2.5 : 1,
                            borderColor: value === c.label ? Colors.main[900] : Colors.garage[700],
                        }}
                    />
                    <StyledText
                        style={{
                            fontSize: 9,
                            color: value === c.label ? Colors.main[900] : Colors.garage[500],
                        }}
                    >
                        {c.label}
                    </StyledText>
                </TouchableOpacity>
            ))}
        </View>
    );
}

// ─── Vehicle Card ─────────────────────────────────────────────────────────────

function VehicleCard({
    vehicle,
    onEdit,
    onDelete,
}: {
    vehicle: Vehicle;
    onEdit: (v: Vehicle) => void;
    onDelete: (id: number) => void;
}) {
    const colorHex = COLOR_PRESETS.find((c) => c.label === vehicle.color)?.hex || Colors.garage[700];

    return (
        <View className="bg-garage-900 border border-garage-700 rounded-2xl overflow-hidden">
            {/* color stripe */}
            <View style={{ height: 3, backgroundColor: colorHex }} />

            <View className="p-4">
                <View className="flex-row items-start justify-between">
                    <View className="flex-row items-center gap-3">
                        <View
                            className="h-12 w-12 rounded-xl items-center justify-center"
                            style={{ backgroundColor: `${Colors.main[900]}18` }}
                        >
                            <Car size={22} color={Colors.main[900]} />
                        </View>
                        <View>
                            <StyledText
                                className="text-garage-50 text-xl font-titillium-bold tracking-widest"
                            >
                                {vehicle.plate}
                            </StyledText>
                            <View className="flex-row items-center gap-1.5 mt-0.5">
                                <View
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: 5,
                                        backgroundColor: colorHex,
                                        borderWidth: 1,
                                        borderColor: Colors.garage[600],
                                    }}
                                />
                                <StyledText className="text-garage-400 text-xs">{vehicle.color}</StyledText>
                            </View>
                        </View>
                    </View>

                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => onEdit(vehicle)}
                            className="h-9 w-9 rounded-xl items-center justify-center border border-garage-700 bg-garage-950"
                            activeOpacity={0.7}
                        >
                            <Pencil size={15} color={Colors.garage[400]} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onDelete(vehicle.id)}
                            className="h-9 w-9 rounded-xl items-center justify-center border border-danger-900/30 bg-danger-900/10"
                            activeOpacity={0.7}
                        >
                            <Trash2 size={15} color={Colors.danger[900]} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="mt-3 pt-3 border-t border-garage-800 flex-row items-center justify-between">
                    <StyledText className="text-garage-600 text-[10px]">ID: {vehicle.id}</StyledText>
                    <View
                        className="px-2 py-0.5 rounded-full border"
                        style={{
                            borderColor: `${Colors.main[700]}55`,
                            backgroundColor: `${Colors.main[700]}18`,
                        }}
                    >
                        <StyledText className="text-[10px] font-titillium-bold" style={{ color: Colors.main[700] }}>
                            ACTIVE
                        </StyledText>
                    </View>
                </View>
            </View>
        </View>
    );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

interface VehicleFormModalProps {
    visible: boolean;
    editTarget: Vehicle | null;
    onClose: () => void;
}

function VehicleFormModal({ visible, editTarget, onClose }: VehicleFormModalProps) {
    const isEdit = !!editTarget;

    const [plate, setPlate] = useState(editTarget?.plate || '');
    const [color, setColor] = useState(editTarget?.color || '');

    const addMutation = useAddVehicle();
    const updateMutation = useUpdateVehicle();

    const isPending = addMutation.isPending || updateMutation.isPending;

    // sync form when editTarget changes
    useState(() => {
        setPlate(editTarget?.plate || '');
        setColor(editTarget?.color || '');
    });

    const handleSubmit = async () => {
        if (!plate.trim()) return;

        if (isEdit && editTarget) {
            await updateMutation.mutateAsync({ id: editTarget.id, plate: plate.trim(), color });
        } else {
            await addMutation.mutateAsync({ plate: plate.trim(), color });
        }
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 justify-end"
            >
                <View
                    style={{
                        backgroundColor: Colors.garage[900],
                        borderTopLeftRadius: 28,
                        borderTopRightRadius: 28,
                        borderTopWidth: 1,
                        borderLeftWidth: 1,
                        borderRightWidth: 1,
                        borderColor: Colors.garage[700],
                        paddingBottom: 40,
                    }}
                >
                    {/* header */}
                    <View className="flex-row items-center justify-between px-5 pt-5 pb-4">
                        <View>
                            <StyledText className="text-garage-50 text-xl font-titillium-bold">
                                {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
                            </StyledText>
                            <StyledText className="text-garage-500 text-xs mt-0.5">
                                {isEdit ? 'Update plate or color' : 'Register your car to start parking'}
                            </StyledText>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            className="h-9 w-9 rounded-full items-center justify-center bg-garage-800"
                        >
                            <X size={18} color={Colors.garage[400]} />
                        </TouchableOpacity>
                    </View>

                    <View className="h-px bg-garage-800 mx-5 mb-5" />

                    <View className="px-5">
                        <StyledText className="text-garage-500 text-xs uppercase mb-2 ml-1">
                            Plate Number
                        </StyledText>
                        <InputFieldNaked
                            headerLabel="plate"
                            label="Plate Number"
                            value={plate}
                            onChangeText={(t) => setPlate(t.toUpperCase())}
                            placeholder="e.g. ABC 1234"
                            autoCapitalize="characters"
                            Icon={Gauge}
                            IconDi="left"
                        />

                        <StyledText className="text-garage-500 text-xs uppercase mb-2 ml-1">
                            Color
                        </StyledText>
                        <ColorPicker value={color} onChange={setColor} />

                        {/* manual input fallback */}
                        <InputFieldNaked
                            headerLabel="color"
                            label="Or type color"
                            value={color}
                            onChangeText={setColor}
                            placeholder="e.g. Pearl White"
                        />

                        <View className="flex-row gap-3 mt-2">
                            <View className="flex-1">
                                <Button
                                    title="Cancel"
                                    theme="primary_dullNbg"
                                    onPress={onClose}
                                />
                            </View>
                            <View className="flex-1">
                                <Button
                                    title={isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Vehicle'}
                                    theme={plate.trim() ? 'primary' : 'primary_dull'}
                                    Icon={Check}
                                    IconDi="right"
                                    onPress={handleSubmit}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function VehiclesScreen() {
    const { data: vehicles = [], isLoading } = useVehicles();
    const deleteMutation = useDeleteVehicle();

    const [modalVisible, setModalVisible] = useState(false);
    const [editTarget, setEditTarget] = useState<Vehicle | null>(null);

    const openAdd = () => {
        setEditTarget(null);
        setModalVisible(true);
    };

    const openEdit = (vehicle: Vehicle) => {
        setEditTarget(vehicle);
        setModalVisible(true);
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            'Remove Vehicle',
            'Are you sure you want to remove this vehicle from your account?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => deleteMutation.mutate(id),
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-garage-950">
                <ActivityIndicator size="large" color={Colors.main[900]} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-garage-950">
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 18,
                    paddingTop: 20,
                    paddingBottom: 120,
                    marginTop: 25,

                    gap: 12,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header card */}
                <View className="bg-garage-900 rounded-3xl border border-garage-700 overflow-hidden">
                    <View className="h-2 bg-main-900" />
                    <View className="px-5 py-5 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                            <View
                                className="h-11 w-11 rounded-2xl items-center justify-center"
                                style={{ backgroundColor: `${Colors.main[900]}20` }}
                            >
                                <Car size={20} color={Colors.main[900]} />
                            </View>
                            <View>
                                <StyledText className="text-garage-50 text-xl font-titillium-bold">
                                    My Vehicles
                                </StyledText>
                                <StyledText className="text-garage-500 text-xs">
                                    {vehicles.length} car{vehicles.length !== 1 ? 's' : ''} registered
                                </StyledText>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={openAdd}
                            className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl"
                            style={{ backgroundColor: Colors.main[900] }}
                            activeOpacity={0.8}
                        >
                            <Plus size={16} color="#fff" />
                            <StyledText className="text-white font-titillium-bold text-sm">Add</StyledText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* info tip */}
                <View
                    className="flex-row items-start gap-2 px-4 py-3 rounded-2xl border"
                    style={{
                        backgroundColor: `${Colors.main[900]}12`,
                        borderColor: `${Colors.main[900]}30`,
                    }}
                >
                    <ShieldAlert size={15} color={Colors.main[700]} style={{ marginTop: 2 }} />
                    <StyledText className="text-garage-400 text-xs flex-1 leading-5">
                        Only registered plates can be used to make a parking reservation.
                    </StyledText>
                </View>

                {/* Empty state */}
                {vehicles.length === 0 && (
                    <View className="bg-garage-900 border border-garage-700 rounded-2xl p-8 items-center gap-3">
                        <View
                            className="h-16 w-16 rounded-2xl items-center justify-center"
                            style={{ backgroundColor: `${Colors.main[900]}18` }}
                        >
                            <Car size={28} color={Colors.garage[600]} />
                        </View>
                        <StyledText className="text-garage-300 text-base font-titillium-bold">
                            No vehicles yet
                        </StyledText>
                        <StyledText className="text-garage-500 text-xs text-center">
                            Add your first car to start making reservations
                        </StyledText>
                        <Button
                            title="Add Vehicle"
                            Icon={Plus}
                            theme="primary"
                            onPress={openAdd}
                            className="mt-2"
                        />
                    </View>
                )}

                {/* Vehicle list */}
                {vehicles.map((vehicle) => (
                    <VehicleCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </ScrollView>

            <VehicleFormModal
                visible={modalVisible}
                editTarget={editTarget}
                onClose={() => setModalVisible(false)}
            />
        </View>
    );
}