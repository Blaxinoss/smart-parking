

import { ActivityIndicator, Text, TouchableOpacity, View, FlatList, Pressable } from 'react-native';

import BottomSheet, { BottomSheetFlatList, BottomSheetScrollView, BottomSheetView, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StyledText } from '@/components/ui/styledText';
import { User, Vehicle } from '@/constants/types';
import { Icon } from '@/components/ui/icon';
import { Car, CarFront, ChevronRight, Clock, CreditCard, MapPin, Wallet } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Link, router } from 'expo-router';
import { Modal } from 'react-native';
import { AxiosAPI } from '@/services/axiosApi';
import Toast from 'react-native-toast-message';
import { PropsWithChildren, Ref, RefObject, useEffect, useRef, useState } from 'react';
import { useCancelReservation, useUserReservations } from '@/hooks/useReservations';
import { useUser } from '@/hooks/useUsers';
import { AxiosError } from 'axios';
import { useLocationHook } from '@/hooks/Locations';
import { isPointWithinRadius } from 'geolib'


interface ReservationResponse {
    id: string;
    userId: string;
    vehicleId: string;
    slotId: string;
    startTime: string;
    endTime: string;
    paymentIntentId: string | null;
    paymentType: 'CASH' | 'CARD';
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
    isStacked: boolean;
    createdAt: string;
}

interface cancelReservationFailure {
    requiresForceCancel: boolean,
    error: string
}


export const OnGoingReservation = ({ bottomSheetRef }: { bottomSheetRef: RefObject<BottomSheet | null> }) => {
    const { data: reservation } = useUserReservations();
    const { data: user } = useUser()
    const { mutate: cancelRes, isPending, isError, isSuccess } = useCancelReservation();
    const [showPenaltyModal, setShowPenaltyModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");


    const handleCancel = (isForce = false) => {
        if (!reservation) return;

        cancelRes(
            { id: String(reservation.id), forceCancel: isForce },
            {
                onSuccess: () => {
                    setShowPenaltyModal(false);

                },
                onError: (error: AxiosError<cancelReservationFailure>) => {
                    if (error.response?.data?.requiresForceCancel) {
                        setShowPenaltyModal(true);
                    }
                }
            }
        );
    };


    useEffect(() => {
        if (!reservation) return;
        let flag = false
        let end = new Date(reservation.startTime).getTime();

        const timer = setInterval(() => {
            const now = new Date().getTime();
            let distance = end - now;
            if (distance <= 0 && flag === false) {
                flag = true
                end += 10 * 60 * 1000
                distance = end - now;
            }

            else if (distance <= 0 && flag) {
                setTimeLeft("Expired");
                clearInterval(timer);
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(
                `${flag ? "Tolerance Overtime " : ""}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        }, 1000);

        return () => clearInterval(timer);
    }, [reservation]);


    if (isPending) return <ActivityIndicator color={Colors.main[900]} className="py-10" />;
    if (!reservation) return null;
    return (
        <BottomSheetView className="px-6 pb-12">
            <View className="mb-6 flex-row justify-between items-end">
                <View>
                    <StyledText className="text-garage-400 text-sm font-titillium-light">Welcome back,</StyledText>
                    <StyledText className="text-white text-2xl font-titillium-bold">{user?.name}</StyledText>
                </View>
                <View className="items-end">
                    <StyledText className="text-main-900 font-titillium-bold text-lg">{timeLeft}</StyledText>
                    <StyledText className="text-garage-500 text-[10px] uppercase">Time remaining</StyledText>
                </View>
            </View>

            {/* 2. كارت الحجز الرئيسي (Ticket Style) */}
            <View className="bg-garage-800/60 rounded-[35px] overflow-hidden border border-white/5 shadow-2xl">
                {/* الجزء العلوي: رقم الموقف والحالة */}
                <View className="bg-main-900/10 p-6 flex-row justify-between items-center border-b border-white/5">
                    <View className=''>
                        <StyledText style={{ height: "75%" }} className=" text-main-900 text-5xl font-titillium-bold border-2 border-main-950 rounded-2xl p-3 bg-garage-950/50 tracking-tighter">{reservation.slotId}</StyledText>
                        <StyledText className="text-main-900/60 text-[10px] uppercase font-bold">Assigned Slot</StyledText>
                    </View>
                    <View className="items-end">
                        <View className={`px-3 py-1 rounded-full mb-1 ${reservation.isStacked ? 'bg-danger-900/20 border border-danger-900/30' : 'bg-green-500/20 border border-green-500/30'}`}>
                            <StyledText className={`text-[10px] font-bold ${reservation.isStacked ? 'text-danger-500' : 'text-green-500'}`}>
                                {reservation.isStacked ? 'STACKED PARKING' : 'REGULAR SLOT'}
                            </StyledText>
                        </View>
                        <StyledText className="text-garage-400 text-[10px]">ID: #{reservation.id.toString().padStart(4, '0')}</StyledText>
                    </View>
                </View>

                {/* الجزء السفلي: بيانات العربية والوقت */}
                <View className="p-6">
                    {/* Vehicle Plate Row */}
                    <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-row items-center gap-3">
                            <View className="bg-garage-900 p-3 rounded-2xl">
                                <Car size={20} color={reservation.vehicle?.color || Colors.main[900]} />
                            </View>
                            <View>
                                <StyledText className="text-garage-500 text-[10px] uppercase font-bold">Plate Number</StyledText>
                                <StyledText className="text-white text-xl font-titillium-bold tracking-widest">
                                    {reservation.vehicle?.plate}
                                </StyledText>
                            </View>
                        </View>
                        <View className="h-10 w-[1px] bg-garage-700" />
                        <View className="items-end">
                            <StyledText className="text-garage-500 text-[10px] uppercase font-bold">Payment</StyledText>
                            <View className="flex-row items-center gap-1">
                                {reservation.paymentType === 'CARD' ? <CreditCard size={14} color="#989898" /> : <Wallet size={14} color="#989898" />}
                                <StyledText className="text-garage-200 font-titillium-bold">{reservation.paymentType}</StyledText>
                            </View>
                        </View>
                    </View>

                    {/* Timeline Container */}
                    <View className="bg-garage-950/50 rounded-2xl p-4 flex-row justify-between items-center border border-white/5">
                        <View>
                            <StyledText className="text-garage-500 text-[9px] uppercase mb-1">Entry</StyledText>
                            <StyledText className="text-garage-100 font-titillium-bold">
                                {new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </StyledText>
                        </View>
                        <View className="flex-1 px-4 flex-row items-center">
                            <View className="h-[2px] flex-1 bg-main-900/30 rounded-full" />
                            <Clock size={12} color={Colors.main[900]} className="mx-2" />
                            <View className="h-[2px] flex-1 bg-garage-800 rounded-full" />
                        </View>
                        <View className="items-end">
                            <StyledText className="text-garage-500 text-[9px] uppercase mb-1">Exit Time</StyledText>
                            <StyledText className="text-garage-100 font-titillium-bold">
                                {new Date(reservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </StyledText>
                        </View>
                    </View>
                </View>
            </View>

            <View className="mt-8 gap-4">
                <View className="flex-row gap-4 px-4 mt-6">
                    {/* الزرار الأساسي: Start Navigation */}
                    <TouchableOpacity
                        onPress={() => { bottomSheetRef.current?.snapToIndex(0) }}
                        activeOpacity={0.7}
                        className="flex-1 bg-main-900 py-4 rounded-[22px] items-center flex-row justify-center gap-2 shadow-xl shadow-main-900/40 border border-main-800"
                    >
                        <MapPin size={20} color="black" />
                        <StyledText
                            className="text-black font-titillium-bold text-[15px]">
                            Navigate
                        </StyledText>
                    </TouchableOpacity>

                    {/* الزرار الفرعي: Already There */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        className="flex-1 bg-garage-800/50 py-4 rounded-[22px] items-center flex-row justify-center gap-2 border border-white/10 shadow-lg"
                    >
                        <CarFront size={20} color="#eab308" />
                        <StyledText className="text-main-500 font-titillium-semibold text-[15px]">
                            Arrived?
                        </StyledText>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    onPress={() => handleCancel(false)}
                    disabled={isPending}
                    className="py-4 items-center justify-center"
                >
                    <StyledText style={{ color: isPending && !showPenaltyModal ? Colors.garage[900] : Colors.danger[950] }} className={`font-titillium-bold text-md`}>
                        {isPending && !showPenaltyModal ? 'Cancelling...' : 'Release My Reservation'}
                    </StyledText>
                </TouchableOpacity>
            </View>


            <Modal
                animationType="fade"
                transparent={true}
                visible={showPenaltyModal}
                onRequestClose={() => setShowPenaltyModal(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/80 px-6">
                    <View className="bg-garage-900 p-6 rounded-3xl w-full border border-white/10 shadow-2xl">
                        <StyledText style={{ color: Colors.danger[900] }} className=" text-xl font-titillium-bold mb-2">
                            Late Cancellation
                        </StyledText>
                        <StyledText className="text-garage-300 mb-8 leading-5 text-sm">
                            The free cancellation period has ended. Cancelling now will incur a penalty fee from your card. Do you wish to proceed?
                        </StyledText>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                className="flex-1 py-4 bg-garage-800 rounded-xl items-center"
                                onPress={() => setShowPenaltyModal(false)}
                            >
                                <StyledText className="text-white font-titillium-bold">Keep it</StyledText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 py-4 bg-danger-900 rounded-xl items-center flex-row justify-center gap-2"
                                onPress={() => handleCancel(true)}
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <StyledText className="text-white font-titillium-bold">Pay & Cancel</StyledText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


        </BottomSheetView>
    );
};