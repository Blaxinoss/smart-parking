

import { ActivityIndicator, Text, TouchableOpacity, View, FlatList, Pressable, Button } from 'react-native';

import BottomSheet, { BottomSheetFlatList, BottomSheetScrollView, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StyledText } from '@/components/ui/styledText';
import { User, Vehicle } from '@/constants/types';
import { Icon } from '@/components/ui/icon';
import { Car, ChevronRight, Clock, CreditCard, MapPin, Wallet, Zap } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Link, router } from 'expo-router';
import { PropsWithChildren, Ref, RefObject, useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUsers';
import { useConfirmReservation } from '@/hooks/useReservations';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSocket } from '@/hooks/SocketContext';



// ده اللي راجع من السيرفر (Prisma Object)
interface ReservationResponse {
  id: string;
  userId: string;
  vehicleId: string;
  slotId: string;
  startTime: string; // Prisma بترجع الـ Date كـ ISO String في الـ JSON
  endTime: string;
  paymentIntentId: string | null;
  paymentType: 'CASH' | 'CARD';
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  isStacked: boolean;
  createdAt: string;
}



export const Reserver = ({ bottomSheetRef }: { bottomSheetRef: RefObject<BottomSheet | null> }) => {


  const [plateNumber, setPlateNumber] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(new Date().getTime() + 60 * 60 * 1000));
  const [paymentType, setPaymentType] = useState<'CARD' | 'CASH'>('CARD');
  const [isReservingNow, setIsReservingNow] = useState(false)
  const { data: user, isLoading } = useUser();
  const socket = useSocket();


  const { mutate: handleConfirmReservation, isPending, isSuccess } = useConfirmReservation()


  useEffect(() => {
    if (!socket) return;
    // بنستمع لحدث معين
    socket.on("custom_pong", (data) => {
      console.log("Server says:", data.message);
    });

    // تنظيف الـ Listener لما اليوزر يطلع من الشاشة دي بالذات
    return () => {
      socket.off("custom_pong");
    };
  }, [socket]);

  const sendPing = () => {
    if (socket) {
      console.log("sent ping")
      socket.emit("custom_ping"); // بنبعت الحدث للسيرفر
    }
  };


  if (isLoading || isPending) {
    return <SafeAreaView><ActivityIndicator></ActivityIndicator></SafeAreaView>
  }


  return (


    <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150, paddingTop: 10 }}>

      {/* 1. Sleek Header */}
      <View className="mb-4 flex-row items-center justify-between bg-garage-950 p-4 rounded-2xl">
        <View>
          <StyledText className='font-titillium-bold text-2xl text-white mb-1'>Main Garage</StyledText>
          <View className="flex-row items-center gap-1">
            <MapPin size={14} color={Colors.garage[400]} />
            <StyledText className='font-titillium-light text-sm text-garage-400'>Ahmed Qmaha St. Alexandria</StyledText>
          </View>
        </View>
        <View className="h-12 w-12 bg-main-900/10 rounded-full items-center justify-center">
          <Car size={24} color={Colors.main[900]} />
        </View>
      </View>

      {/* 2. Vehicle Selection (Pill Tags) */}
      <View className="mb-4">
        <StyledText className="text-garage-400 text-xs tracking-widest uppercase mb-3 font-titillium-bold">Select Vehicle</StyledText>
        <BottomSheetScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
        >
          {user?.Vehicles?.map((item: Vehicle, index: number) => {
            const isSelected = plateNumber === item.plate;
            return (
              <TouchableOpacity
                key={item.plate || index} // مهم جداً الـ key
                onPress={() => setPlateNumber(item.plate)}
                className={`px-4 py-3 rounded-2xl flex-col items-center flex ${isSelected ? "bg-garage-800/50 border-2 border-main-900" : "bg-garage-950"
                  }`}
              >
                <Icon as={Car} size={18} color={isSelected ? Colors.main[950] : Colors.garage[400]} />
                <StyledText className={`font-titillium-bold text-base ${isSelected ? "text-white" : "text-garage-300"}`}>
                  {item.plate}
                </StyledText>
              </TouchableOpacity>
            );
          })}
        </BottomSheetScrollView>
      </View>
      {/* 3. Time Selection (Unified Timeline Card) */}
      <View className="mb-4">
        <StyledText className="text-garage-400 text-xs tracking-widest uppercase mb-3 font-titillium-bold">Duration</StyledText>
        <View className="bg-garage-950 rounded-3xl overflow-hidden border-2 border-garage-600/80">

          {/* Start Time Row */}
          <View className="p-4 border-b border-garage-800/50">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-3">
                <View className="p-2 bg-garage-800 rounded-full">
                  <Clock size={16} color={Colors.garage[200]} />
                </View>
                <StyledText className="text-garage-100 text-base font-titillium-bold">Entry</StyledText>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setIsReservingNow(!isReservingNow);
                  setStartTime(new Date());
                }}
                className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${isReservingNow ? 'bg-main-900 border-main-800' : 'bg-garage-800 border-white/10'}`}
              >
                <Zap size={14} color={isReservingNow ? 'white' : Colors.garage[400]} />
                <StyledText className={`font-titillium-bold text-xs ${isReservingNow ? 'text-white' : 'text-garage-400'}`}>
                  NOW
                </StyledText>
              </TouchableOpacity>
            </View>

            {isReservingNow ? (
              <View className="py-3 px-4 bg-main-900/10 rounded-2xl border border-dashed border-main-900/30 flex-row items-center justify-center gap-2 mt-1">
                <View className="h-2 w-2 rounded-full bg-main-500 animate-pulse" />
                <StyledText className="text-main-400 font-titillium-bold text-sm tracking-wider uppercase">
                  Immediate Access Available
                </StyledText>
              </View>
            ) : (
              <View className="items-end">
                <DateTimePicker
                  mode="datetime"
                  value={startTime}
                  onChange={(e, d) => d && setStartTime(d)}
                  themeVariant="dark"
                />
              </View>
            )}
          </View>

          {/* End Time Row */}
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center gap-3">
              <View className="p-2 bg-main-900/20 rounded-full">
                <Clock size={16} color={Colors.main[900]} />
              </View>
              <StyledText className="text-main-400 text-base font-titillium-bold">Exit</StyledText>
            </View>
            <DateTimePicker
              mode="datetime"
              value={endTime}
              onChange={(e, d) => d && setEndTime(d)}
              themeVariant="dark"
              accentColor={Colors.main[900]}
            />
          </View>

        </View>
      </View>

      {/* 4. Payment Method Section */}
      <View className="mb-5">
        <StyledText className="text-garage-400 text-xs tracking-widest uppercase mb-3 font-titillium-bold">Payment</StyledText>

        {/* Toggle Buttons: جرب خليهم TouchableOpacity بدل Pressable لتوحيد الـ Interop */}
        <View className="flex-row bg-garage-950 rounded-2xl mb-4 border-2 border-garage-600/80 overflow-hidden">
          <TouchableOpacity
            onPress={() => setPaymentType('CARD')}
            className={`flex-1 py-4 flex-row justify-center items-center gap-2 ${paymentType === 'CARD' ? 'bg-garage-800' : ''}`}
          >
            <CreditCard size={18} color={paymentType === 'CARD' ? Colors.main[950] : Colors.garage[500]} />
            <StyledText className={`font-titillium-bold ${paymentType === 'CARD' ? 'text-white' : 'text-garage-500'}`}>Card</StyledText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPaymentType('CASH')}
            className={`flex-1 py-4 flex-row justify-center items-center gap-2 ${paymentType === 'CASH' ? 'bg-garage-800' : ''}`}
          >
            <Wallet size={18} color={paymentType === 'CASH' ? Colors.main[950] : Colors.garage[500]} />
            <StyledText className={`font-titillium-bold ${paymentType === 'CASH' ? 'text-white' : 'text-garage-500'}`}>cash</StyledText>
          </TouchableOpacity>
        </View>

        <View >
          {paymentType === 'CARD' ? (
            user?.paymentGatewayToken ? (
              <View className="flex-row items-center justify-between p-4 bg-main-900/10 rounded-2xl border border-main-900/30">
                <View className="flex-row items-center gap-3">
                  <CreditCard size={20} color={Colors.main[900]} />
                  <StyledText className="text-main-100 font-titillium-bold">**** {user.paymentGatewayToken.slice(-4)}</StyledText>
                </View>
                <ChevronRight size={20} color={Colors.main[900]} />
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => { router.push('/(profile)/Card') }}
                className="flex-row items-center justify-center py-5 bg-garage-950 rounded-2xl border border-dashed border-garage-700"
              >
                <StyledText className="text-garage-300 mr-2">No card linked.</StyledText>
                <StyledText className="text-main-950 font-titillium-bold">Add a Card</StyledText>
              </TouchableOpacity>
            )
          ) : (
            /* لما يختار كاش بنعرض View بسيط بنفس الارتفاع تقريباً */
            <View className="p-5 bg-garage-950/30 rounded-2xl border border-garage-800 items-center">
              <StyledText className="text-garage-500 text-xs">Payment will be collected at the exit.</StyledText>
            </View>
          )}
        </View>
      </View>

      {/* 5. Giant CTA Button */}
      <TouchableOpacity
        className="bg-main-900 py-4 rounded-full items-center justify-center flex-row gap-2"
        onPress={() => {
          handleConfirmReservation({
            plateNumber,
            startTime,
            endTime,
            paymentTypeDecision: paymentType,
            paymentMethodId: "pm_1T71qaQVzgGqWHEyRCRJigsd",
            isImmediate: isReservingNow ? true : false
          })
        }}
      >
        <StyledText className="text-white font-titillium-bold text-lg">Confirm Reservation</StyledText>
        <ChevronRight size={20} color="white" />
      </TouchableOpacity>

    </BottomSheetScrollView>
  )
}