import { StyledText } from "@/components/ui/styledText";
import { useSlots } from "@/hooks/useSlots";

import { Image, View, ActivityIndicator } from "react-native";
import { FlatList } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
// استوردنا شوية أيقونات من اللي بتستخدمهم
import { MapPin, CarFront } from "lucide-react-native";
import { IParkingSlot, SlotStatus } from "@/constants/types";

const carImage = require('../../../assets/images/car.png');

// const Legend = () => (
//     <View className="flex-row justify-center gap-8 mb-6 border-b border-white/5 pb-4">
//         <View className="flex-row items-center gap-2">
//             <View className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
//             <StyledText className="text-gray-300 font-titillium-regular text-sm">Available</StyledText>
//         </View>
//         <View className="flex-row items-center gap-2">
//             <View className="w-3 h-3 rounded-full bg-main-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
//             <StyledText className="text-gray-300 font-titillium-regular text-sm">Occupied</StyledText>
//         </View>
//     </View>
// );

//  AVAILABLE = 'AVAILABLE',
//     OCCUPIED = 'occupied',
//     RESERVED = 'RESERVED',
//     CONFLICT = 'CONFLICT',
//     MAINTENANCE = 'MAINTENANCE'


export default function SlotsGrid({ SharedStyles }: { SharedStyles: any }) {
    const { data: slots, isLoading, isError } = useSlots();

    const freeSlotsLength = slots?.reduce((acc, curr) => {
        return curr.status === SlotStatus.AVAILABLE ? acc + 1 : acc;
    }, 0)


    return (
        <Animated.View
            style={[
                SharedStyles,
                { width: '92%', height: '80%', position: 'absolute', top: '7%', left: '4%', zIndex: 50, transformOrigin: "top right" }
            ]}
            className="rounded-[35px] bg-garage-950/85 border border-main-900/70 shadow-2xl "
        >
            <View className="flex-1 p-5">

                {/* 1. الهيدر الجديد */}
                <View className="items-center mb-4 mt-2 flex flex-row justify-center ">
                    <View className="bg-main-900/10 p-2 rounded-full  border border-main-900/20">
                        <MapPin size={20} color="#eab308" /* استبدل الكود بلون الـ main بتاعك */ />

                    </View>
                    <StyledText className="text-white font-titillium-bold text-2xl tracking-wide ml-3">
                        Live Garage Map
                    </StyledText>


                    <View
                        style={{ transform: [{ rotate: '-45deg' }, { translateX: -3 }, { translateY: -40 }] }}
                        className={`
                        absolute top-0 left-0  rounded-lg p-1
                        ${freeSlotsLength && freeSlotsLength > 0 ? 'bg-main-900 shadow-sm shadow-main-500' : 'bg-slate-700'} 
                    `}
                    >
                        <StyledText className="text-black font-titillium-semibold text-[10px] uppercase tracking-tighter">
                            {freeSlotsLength} / {slots?.length} FREE
                        </StyledText>
                    </View>

                </View>

                {/* 2. مفتاح الخريطة */}
                {/* <Legend /> */}

                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#4ade80" />
                        <StyledText className="text-green-400 mt-4 animate-pulse font-titillium-regular">
                            Syncing with sensors...
                        </StyledText>
                    </View>
                ) : (
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        numColumns={2}
                        data={slots}
                        keyExtractor={(item: IParkingSlot) => item._id}
                        renderItem={({ item, index }) => {
                            const isOccupied = item.status === SlotStatus.OCCUPIED;
                            const isReserved = item.status === SlotStatus.RESERVED;
                            const isAssigned = item.status === SlotStatus.ASSIGNED;
                            const isEmergency = item._id.startsWith('EMG');

                            // تحديد اللون الأساسي بناءً على الحالة
                            const getStatusColor = () => {
                                if (isOccupied) return 'border-main-900/40 bg-garage-900';
                                if (isReserved) return 'border-blue-500/50 bg-blue-950/20';
                                if (isAssigned) return 'border-purple-500/50 bg-purple-950/20';
                                if (isEmergency && !isOccupied && !isAssigned && !isReserved) return 'border-red-500/40 bg-red-950/20 border-dashed';
                                return 'border-green-500/30 bg-garage-900/40 border-dashed';
                            };

                            return (
                                <Animated.View
                                    entering={FadeInDown.delay(100 * index).springify()}
                                    className={`mb-4 overflow-hidden rounded-2xl flex-1 mx-2 relative border-2 ${getStatusColor()}`}
                                    style={{ height: 120 }}
                                >
                                    {/* Slot ID Badge */}
                                    <View className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/40 z-10">
                                        <StyledText className="font-titillium-bold text-[10px] text-white/70">
                                            {item._id}
                                        </StyledText>
                                    </View>

                                    <View className="flex-1 items-center justify-center">
                                        {isOccupied ? (
                                            <Image source={carImage} style={{ height: '70%', width: '85%', resizeMode: "contain" }} />
                                        ) : isReserved ? (
                                            <View className="items-center animate-pulse">
                                                <CarFront size={32} color="#3b82f6" opacity={0.5} />
                                                <StyledText className="text-blue-400 text-[10px] font-titillium-bold mt-1">RESERVED</StyledText>
                                            </View>
                                        ) : isAssigned ? (
                                            <View className="items-center">
                                                <CarFront size={32} color="#a855f7" opacity={0.5} />
                                                <StyledText className="text-purple-400 text-[10px] font-titillium-bold mt-1">INCOMING</StyledText>
                                            </View>
                                        ) : (
                                            <StyledText className="text-4xl font-black text-green-500/10">P</StyledText>
                                        )}
                                    </View>

                                    {/* Bottom Status Indicator */}
                                    <View className={`absolute bottom-0 w-full h-1.5 
                ${isOccupied ? 'bg-main-500' :
                                            isReserved ? 'bg-blue-500' :
                                                isAssigned ? 'bg-purple-500' :
                                                    isEmergency ? 'bg-red-500' : 'bg-green-500'}`}
                                    />
                                </Animated.View>
                            );
                        }}
                        ListEmptyComponent={() => (
                            <View className="flex-1 items-center justify-center p-10 mt-10">
                                <View className="bg-garage-800 p-5 rounded-full mb-4">
                                    <CarFront size={36} color="#4b5563" />
                                </View>
                                <StyledText className="text-gray-400 font-titillium-regular text-lg">
                                    No slots configured yet
                                </StyledText>
                            </View>
                        )}
                        contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
                    />
                )}
            </View>
        </Animated.View>
    );
}