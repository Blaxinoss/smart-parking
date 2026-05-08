import { TouchableOpacity, View } from 'react-native';
import { AlertTriangle, ChevronRight, CircleDollarSign } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { StyledText } from '@/components/ui/styledText';

interface DebtBannerProps {
    onPress?: () => void;
    home?: boolean
}

/**
 * DebtBanner — يتعرض لما user.hasOutstandingDebt === true
 * الباك إند لسه مش جاهز، فالـ onPress بيعمل "Not Implemented" حالياً.
 */
export default function DebtBanner({ onPress, home }: DebtBannerProps) {


    const HOME_VARIANT = {
        position: "absolute" as const,
        top: 25,
        left: 0,
        zIndex: 1000,
        elevation: 100,
        width: 280,
        marginHorizontal: 18,
        marginTop: 12,
        borderRadius: 18,
        overflow: 'hidden' as const,
        backgroundColor: "black",
        borderWidth: 1,
        borderColor: `${Colors.danger[900]}50`,
    };

    // 2. النسخة العادية (Standard Layout)
    const DEFAULT_VARIANT = {
        marginHorizontal: 18,
        marginTop: 12,
        borderRadius: 18,
        overflow: 'hidden' as const,
        backgroundColor: "black",
        borderWidth: 1,
        borderColor: `${Colors.danger[900]}50`,
    };

    // نختار النسخة بناءً على الـ boolean
    const finalStyle = home ? HOME_VARIANT : DEFAULT_VARIANT;
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            style={finalStyle}
        >
            {/* top stripe */}
            <View style={{ height: 3, backgroundColor: Colors.danger[900] }} />

            <View
                style={{
                    backgroundColor: `${Colors.danger[900]}14`,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    flexDirection: 'row',

                    alignItems: 'center',
                    gap: 12,
                }}
            >
                <View
                    style={{
                        height: 40,
                        width: 40,
                        borderRadius: 12,
                        backgroundColor: `${Colors.danger[900]}22`,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <AlertTriangle size={20} color={Colors.danger[700]} />
                </View>

                <View style={{ flex: 1 }}>
                    <StyledText
                        className="font-titillium-bold"
                        style={{ color: Colors.danger[700], fontSize: 14 }}
                    >
                        Outstanding Debt
                    </StyledText>
                    <StyledText style={{ color: Colors.danger[900], fontSize: 11, marginTop: 2 }}>
                        You have an unpaid balance. Settle it to resume parking.
                    </StyledText>
                </View>

                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        backgroundColor: Colors.danger[900],
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 10,
                    }}
                >
                    <CircleDollarSign size={13} color="#fff" />
                    <StyledText
                        className="font-titillium-bold"
                        style={{ color: '#fff', fontSize: 12 }}
                    >
                        Pay
                    </StyledText>
                    <ChevronRight size={12} color="#fff" />
                </View>
            </View>
        </TouchableOpacity>
    );
}