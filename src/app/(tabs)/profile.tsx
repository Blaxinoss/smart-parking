import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    View,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import {
    Save,
    LogOut,
    CreditCard,
    BadgeCheck,
    Mail,
    Phone,
    User,
    MapPin,
    IdCard,
    Car,
    ChevronRight,
    Settings2,
    Bell,
    Wallet,
    IdCardIcon,
} from 'lucide-react-native';
import { z } from 'zod';

import Colors from '@/constants/Colors';
import { StyledText } from '@/components/ui/styledText';
import InputFieldNaked from '@/components/ui/inputNaked';
import Button from '@/components/ui/buttonfg';
import DebtBanner from '@/screens/tabsScreens/DebtBanner';
import DebtModal from '@/screens/tabsScreens/DebtModal';
import { useUser, useUpdateUser } from '@/hooks/useUsers';
import { useNotifications } from '@/hooks/useNotifications';
import { auth } from '@/services/firebaseConfig';
import PaymentMethodModal from '@/screens/tabsScreens/PaymentMethodModal'

type ProfileDraft = {
    name: string;
    phone: string;
    address: string;
    licenseNumber: string;
};

type ProfileDraftErrors = Partial<Record<keyof ProfileDraft, string>>;

const ProfileZod = z.object({
    name: z.string().trim().min(3, 'Full name must be at least 3 characters.'),
    phone: z.string().trim().regex(/^[0-9+()\-\s]{7,}$/, 'Enter a valid phone number.').length(11, "Phone number must be 11 digit"),
    address: z.string().trim().min(5, 'Address must be at least 5 characters.'),
    licenseNumber: z.string().trim().min(3, 'License number must be at least 3 characters.'),
});

function mapProfileErrors(error: z.ZodError<ProfileDraft>): ProfileDraftErrors {
    const nextErrors: ProfileDraftErrors = {};

    for (const issue of error.issues) {
        const field = issue.path[0];
        if (field === 'name' || field === 'phone' || field === 'address' || field === 'licenseNumber') {
            nextErrors[field] = issue.message;
        }
    }

    return nextErrors;
}

function ActionRow({
    Icon,
    label,
    sublabel,
    onPress,
    danger = false,
    badge,
    children,
}: {
    Icon: any;
    label: string;
    sublabel?: string;
    onPress: () => void;
    danger?: boolean;
    badge?: number;
    children?: React.ReactNode
}) {
    return (
        <>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.75}
                className="flex-row items-center gap-3 px-4 py-3.5 bg-garage-950 rounded-2xl border border-garage-700"
            >
                <View
                    className="h-9 w-9 rounded-xl items-center justify-center"
                    style={{
                        backgroundColor: danger ? `${Colors.danger[900]}18` : `${Colors.main[900]}18`,
                    }}
                >
                    <Icon size={17} color={danger ? Colors.danger[700] : Colors.main[900]} />
                </View>

                <View className="flex-1">
                    <StyledText
                        className="font-titillium-bold text-sm"
                        style={{ color: danger ? Colors.danger[700] : Colors.garage[100] }}
                    >
                        {label}
                    </StyledText>
                    {sublabel && <StyledText className="text-garage-500 text-xs">{sublabel}</StyledText>}
                </View>

                {badge !== undefined && badge > 0 && (
                    <View
                        className="h-5 w-5 rounded-full items-center justify-center"
                        style={{ backgroundColor: Colors.danger[900] }}
                    >
                        <StyledText style={{ color: '#fff', fontSize: 10 }}>{badge}</StyledText>
                    </View>
                )}

                <ChevronRight size={15} color={Colors.garage[600]} />

            </TouchableOpacity>
            {children}
        </>
    );
}

function SectionHeader({ Icon, title }: { Icon: any; title: string }) {
    return (
        <View className="flex-row items-center gap-2 mb-3">
            <Icon size={15} color={Colors.main[900]} />
            <StyledText className="text-garage-200 text-sm font-titillium-bold uppercase tracking-wider">
                {title}
            </StyledText>
        </View>
    );
}

export default function ProfileScreen() {
    const { data: user, isLoading, isRefetching } = useUser();
    const updateUserMutation = useUpdateUser();
    const notificationMutation = useNotifications();
    const [modalVisible, setModalVisible] = useState(false);
    const [modalCardsVisible, setModalCardsVisible] = useState(false);


    const [draft, setDraft] = useState<ProfileDraft>({
        name: '',
        phone: '',
        address: '',
        licenseNumber: '',
    });
    const [errors, setErrors] = useState<ProfileDraftErrors>({});

    useEffect(() => {
        if (!user) return;
        setDraft({
            name: user.name || '',
            phone: user.phone || '',
            address: user.address || '',
            licenseNumber: user.licenseNumber || '',
        });
    }, [user]);

    const isDirty = useMemo(() => {
        if (!user) return false;
        return (
            draft.name !== (user.name || '') ||
            draft.phone !== (user.phone || '') ||
            draft.address !== (user.address || '') ||
            draft.licenseNumber !== (user.licenseNumber || '')
        );
    }, [draft, user]);

    const initials = useMemo(() => {
        if (!user?.name) return 'U';
        return user.name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part: string) => part[0]?.toUpperCase())
            .join('');
    }, [user?.name]);

    const updateDraftField = (field: keyof ProfileDraft, value: string) => {
        setDraft((previous) => ({ ...previous, [field]: value }));
        setErrors((previous) => {
            if (!previous[field]) return previous;
            const nextErrors = { ...previous };
            delete nextErrors[field];
            return nextErrors;
        });
    };

    const handleSaveProfile = () => {
        if (updateUserMutation.isPending) return;

        const result = ProfileZod.safeParse(draft);
        if (!result.success) {
            setErrors(mapProfileErrors(result.error));
            Alert.alert('Fix the highlighted fields', 'Please review the form and try again.');
            return;
        }

        setErrors({});
        updateUserMutation.mutate({
            name: result.data.name,
            phone: result.data.phone,
            address: result.data.address,
            licenseNumber: result.data.licenseNumber,
        });
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-garage-950">
                <ActivityIndicator size="large" color={Colors.main[900]} />
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1 items-center justify-center bg-garage-950 px-6">
                <StyledText className="text-garage-100 text-xl font-titillium-bold mb-2">
                    Profile unavailable
                </StyledText>
                <StyledText className="text-garage-400 text-center">
                    We could not load your profile right now.
                </StyledText>
            </View>
        );
    }

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await auth.signOut();
                    router.replace('/(auth)/login');
                },
            },
        ]);
    };

    return (
        <ScrollView
            className="flex-1 bg-garage-950"
            contentContainerStyle={{
                paddingTop: 20,
                paddingBottom: 120,
                marginTop: 25,
                gap: 14,
            }}
            showsVerticalScrollIndicator={false}
        >

            <DebtModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onPayNow={() => {
                    setModalVisible(false);
                    router.push('/(profile)/Card');
                }}
            />


            <PaymentMethodModal
                visible={modalCardsVisible}
                onClose={() => setModalCardsVisible(false)} onAddCard={function (): void {
                    throw new Error('Function not implemented.');
                }} />

            {user.hasOutstandingDebt && (
                <DebtBanner onPress={() => Alert.alert('Not Implemented', 'Debt payment is coming soon.')} />
            )}

            <View className="mx-4 bg-garage-900 rounded-3xl border border-garage-700 overflow-hidden">
                <View className="h-2 bg-main-900" />

                <View className="px-5 pt-5 pb-4">
                    <View className="flex-row items-center gap-4">
                        <View
                            className="h-16 w-16 rounded-2xl items-center justify-center border-2"
                            style={{
                                backgroundColor: `${Colors.main[900]}22`,
                                borderColor: `${Colors.main[900]}55`,
                            }}
                        >
                            <StyledText
                                className="font-titillium-bold"
                                style={{ color: Colors.main[900], fontSize: 24 }}
                            >
                                {initials}
                            </StyledText>
                        </View>

                        <View className="flex-1">
                            <StyledText className="text-garage-50 text-xl font-titillium-bold leading-6">
                                {user.name}
                            </StyledText>
                            <View className="flex-row items-center gap-2 mt-1">
                                <View
                                    className="px-2 py-0.5 rounded-full border"
                                    style={{
                                        borderColor: `${Colors.main[900]}50`,
                                        backgroundColor: `${Colors.main[900]}18`,
                                    }}
                                >
                                    <StyledText
                                        className="text-[10px] font-titillium-bold"
                                        style={{ color: Colors.main[900] }}
                                    >
                                        {user.role}
                                    </StyledText>
                                </View>
                                {user.hasOutstandingDebt && (
                                    <View
                                        className="px-2 py-0.5 rounded-full border"
                                        style={{
                                            borderColor: `${Colors.danger[900]}50`,
                                            backgroundColor: `${Colors.danger[900]}18`,
                                        }}
                                    >
                                        <StyledText
                                            className="text-[10px] font-titillium-bold"
                                            style={{ color: Colors.danger[700] }}
                                        >
                                            DEBT
                                        </StyledText>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    <View
                        className="flex-row items-center gap-2 mt-4 px-3 py-2.5 rounded-xl border"
                        style={{ backgroundColor: `${Colors.garage[950]}`, borderColor: Colors.garage[700] }}
                    >
                        <Mail size={14} color={Colors.garage[400]} />
                        <StyledText className="text-garage-300 text-sm flex-1">{user.email}</StyledText>
                    </View>
                </View>

                <View className="flex-row border-t border-garage-800" style={{ backgroundColor: Colors.garage[950] }}>
                    <View className="flex-1 items-center py-3 border-r border-garage-800">
                        <StyledText className="text-garage-50 text-xl font-titillium-bold">
                            {user.Vehicles?.length || 0}
                        </StyledText>
                        <StyledText className="text-garage-500 text-[10px] uppercase">Vehicles</StyledText>
                    </View>
                    <View className="flex-1 items-center py-3">
                        <StyledText
                            className="text-lg font-titillium-bold"
                            style={{
                                color: user.hasOutstandingDebt ? Colors.danger[700] : Colors.main[700],
                            }}
                        >
                            {user.hasOutstandingDebt ? 'Owed' : 'Clear'}
                        </StyledText>
                        <StyledText className="text-garage-500 text-[10px] uppercase">Debt</StyledText>
                    </View>
                </View>
            </View>

            <View className="mx-4 bg-garage-900 rounded-3xl p-4 border border-garage-700">
                <SectionHeader Icon={BadgeCheck} title="Personal Info" />

                <InputFieldNaked
                    headerLabel="full-name"
                    label="Full Name"
                    Icon={User}
                    IconDi="left"
                    value={draft.name}
                    onChangeText={(value) => updateDraftField('name', value)}
                    placeholder="Enter your full name"
                    isError={Boolean(errors.name)}
                    errorMessage={errors.name}
                />
                <InputFieldNaked
                    headerLabel="phone"
                    label="Phone"
                    keyboardType="phone-pad"
                    Icon={Phone}
                    IconDi="left"
                    value={draft.phone}
                    onChangeText={(value) => updateDraftField('phone', value)}
                    placeholder="Enter your phone"
                    isError={Boolean(errors.phone)}
                    errorMessage={errors.phone}
                />
                <InputFieldNaked
                    headerLabel="address"
                    label="Address"
                    Icon={MapPin}
                    IconDi="left"
                    value={draft.address}
                    onChangeText={(value) => updateDraftField('address', value)}
                    placeholder="Enter your address"
                    isError={Boolean(errors.address)}
                    errorMessage={errors.address}
                />
                <InputFieldNaked
                    headerLabel="license"
                    label="License Number"
                    Icon={IdCard}
                    IconDi="left"
                    value={draft.licenseNumber}
                    onChangeText={(value) => updateDraftField('licenseNumber', value)}
                    placeholder="Enter your license number"
                    isError={Boolean(errors.licenseNumber)}
                    errorMessage={errors.licenseNumber}
                />

                <View className="bg-garage-950 border border-garage-700 rounded-2xl px-4 py-3 mb-3">
                    <StyledText leftIcon={IdCardIcon} className="text-garage-500 text-[10px] uppercase mb-1">
                        National ID
                    </StyledText>
                    <StyledText className="text-garage-100 font-titillium-bold">{user.NationalID}</StyledText>
                </View>

                <Button
                    title={updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                    Icon={Save}
                    theme={isDirty ? 'primary' : 'primary_dull'}
                    onPress={() => {
                        if (!isDirty) return;
                        handleSaveProfile();
                    }}
                />
            </View>

            <View className="mx-4 bg-garage-900 rounded-3xl p-4 border border-garage-700">
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-2">
                        <Car size={15} color={Colors.main[900]} />
                        <StyledText className="text-garage-200 text-sm font-titillium-bold uppercase tracking-wider">
                            My Vehicles
                        </StyledText>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/vehicles')}
                        className="flex-row items-center gap-1 px-3 py-1.5 rounded-xl"
                        style={{ backgroundColor: `${Colors.main[900]}20` }}
                    >
                        <StyledText className="text-[11px] font-titillium-bold" style={{ color: Colors.main[900] }}>
                            Manage
                        </StyledText>
                        <ChevronRight size={12} color={Colors.main[900]} />
                    </TouchableOpacity>
                </View>

                {user.Vehicles?.length ? (
                    user.Vehicles.slice(0, 2).map((vehicle: any) => (
                        <View
                            key={vehicle.id}
                            className="flex-row items-center justify-between bg-garage-950 border border-garage-700 rounded-xl px-4 py-3 mb-2"
                        >
                            <View className="flex-row items-center gap-3">
                                <Car size={16} color={Colors.garage[400]} />
                                <StyledText className="text-garage-50 font-titillium-bold tracking-widest">
                                    {vehicle.plate}
                                </StyledText>
                            </View>
                            <StyledText className="text-garage-500 text-xs">{vehicle.color}</StyledText>
                        </View>
                    ))
                ) : (
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/vehicles')}
                        className="bg-garage-950 border border-dashed border-garage-700 rounded-xl px-4 py-4 items-center"
                        activeOpacity={0.7}
                    >
                        <StyledText className="text-garage-500 text-xs">No vehicles yet - tap to add one</StyledText>
                    </TouchableOpacity>
                )}

                {(user.Vehicles?.length || 0) > 2 && (
                    <StyledText className="text-garage-500 text-xs text-center mt-1">
                        +{(user.Vehicles?.length || 0) - 2} more - tap Manage to see all
                    </StyledText>
                )}
            </View>

            <View className="mx-4 bg-garage-900 rounded-3xl p-4 border border-garage-700 gap-2">
                <SectionHeader Icon={Settings2} title="Account" />

                <ActionRow
                    Icon={CreditCard}
                    label="Manage Payment Card"
                    sublabel="Stripe · saved cards"
                    onPress={() => setModalCardsVisible(true)}
                />

                <ActionRow
                    Icon={Wallet}
                    label="Outstanding Debts"
                    sublabel={user.hasOutstandingDebt ? 'Action required' : 'All clear'}
                    onPress={() => setModalVisible(true)}
                    badge={user.hasOutstandingDebt ? 1 : 0}
                />

                <ActionRow
                    Icon={Bell}
                    label="Notifications"
                    sublabel="Push preference"
                    onPress={() => { }}
                >
                    <View className='px-2 pb-2'>
                        <View className='flex-row gap-2 rounded-2xl border border-garage-700 bg-garage-950 p-2'>
                            <TouchableOpacity
                                className={`flex-1 items-center rounded-xl py-3 ${user.notificationAllowed ? 'bg-main-900' : 'bg-garage-800'}`}
                                activeOpacity={0.8}
                                disabled={notificationMutation.isPending}
                                onPress={() => {
                                    if (notificationMutation.isPending || user.notificationAllowed) return;
                                    notificationMutation.mutate({ notificationAllowed: true });
                                }}
                            >
                                <StyledText className={`text-sm font-titillium-bold ${user.notificationAllowed ? 'text-garage-50' : 'text-garage-300'}`}>
                                    ON
                                </StyledText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className={`flex-1 items-center rounded-xl py-3 ${!user.notificationAllowed ? 'bg-danger-900' : 'bg-garage-800'}`}
                                activeOpacity={0.8}
                                disabled={notificationMutation.isPending}
                                onPress={() => {
                                    if (notificationMutation.isPending || !user.notificationAllowed) return;
                                    notificationMutation.mutate({ notificationAllowed: false });
                                }}
                            >
                                <StyledText className={`text-sm font-titillium-bold ${!user.notificationAllowed ? 'text-garage-50' : 'text-garage-300'}`}>
                                    OFF
                                </StyledText>
                            </TouchableOpacity>
                        </View>

                        <StyledText className="mt-2 text-center text-[11px] text-garage-500">
                            {notificationMutation.isPending
                                ? 'Saving preference...'
                                : user.notificationAllowed
                                    ? 'Notifications are currently enabled'
                                    : 'Notifications are currently disabled'}
                        </StyledText>
                    </View>

                </ActionRow>

                <View className="h-px bg-garage-800 my-1" />

                <ActionRow Icon={LogOut} label="Sign Out" onPress={handleSignOut} danger />
            </View>

            {(isRefetching || updateUserMutation.isPending) && (
                <StyledText className="text-garage-500 text-center text-xs pb-2">
                    Syncing account data...
                </StyledText>
            )}
        </ScrollView>
    );
}