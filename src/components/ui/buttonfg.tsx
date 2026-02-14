import { LucideIcon } from "lucide-react-native";
import { Pressable, Text } from "react-native";

const variants = {
    primary: "bg-main-900",
    primary_orangeDark: "bg-main-950 border-[3px] border-garage-800",
    primary_shine: "bg-main-700",
    primary_white: "bg-garage-50",
    primary_whiteB: "bg-garage-50 border-[3px] border-garage-800",
    primary_dull: "bg-garage-800",
    primary_cool: "bg-transparent border-[1px] border-main-900",
    primary_orangeLight: "bg-main-950 border-[3px] border-garage-800",
    primary_dullNbg: "bg-transparent border-[1px] border-garage-700",
    primary_sharpSilver: "bg-transparent border-[3px] border-garage-400",
    primary_black: "bg-black border-[1px] border-garage-800",
};

const variantText: Record<keyof typeof variants, string> = {
    primary: "text-garage-50",
    primary_orangeDark: "text-garage-50",
    primary_shine: "text-garage-50",
    primary_white: "text-garage-900",
    primary_whiteB: "text-garage-900",
    primary_dull: "text-garage-500",
    primary_cool: "text-main-900",
    primary_orangeLight: "text-garage-50",
    primary_dullNbg: "text-garage-50",
    primary_sharpSilver: "text-garage-50",
    primary_black: "text-garage-700",
};


const colors = {
    main: {
        900: '#E7872E',
    },
    garage: {
        50: '#FAFAFA',
        500: '#7C7C7C',
        700: '#525252',
        900: '#161616',
    },
};

const sizes = {
    sm: "px-4 py-2",
    md: "px-5 py-3",
    lg: "px-6 py-4",
};

const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
};

const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
}

const variantIconColor: Record<keyof typeof variants, string> = {
    primary: colors.garage[50],             // text-garage-50
    primary_orangeDark: colors.garage[50],  // text-garage-50
    primary_shine: colors.garage[50],       // text-garage-50
    primary_white: colors.garage[900],      // text-garage-900
    primary_whiteB: colors.garage[900],     // text-garage-900
    primary_dull: colors.garage[500],       // text-garage-500
    primary_cool: colors.main[900],         // text-main-900
    primary_orangeLight: colors.garage[50], // text-garage-50
    primary_dullNbg: colors.garage[50],     // text-garage-50
    primary_sharpSilver: colors.garage[50], // text-garage-50
    primary_black: colors.garage[700],      // text-garage-700
};

interface BaseButtonProps {
    theme?: keyof typeof variants;
    size?: keyof typeof sizes;
    font?: string;
    IconDi?: "left" | "right";
    onPress?: () => void;
    className?: string;
}

type ButtonProps = BaseButtonProps & (
    | { text: string; Icon?: LucideIcon } // حالة النص إلزامي والأيقونة اختيارية
    | { Icon: LucideIcon; text?: string } // حالة الأيقونة إلزامية والنص اختياري
);

export default function Button({
    text,
    theme = "primary",
    size = "md",
    font = "titillium-semibold",
    Icon,
    IconDi = "left",
    className,
    ...props

}: ButtonProps) {
    return (
        <Pressable
            {...props}
            className={`rounded-xl ${variants[theme]} ${sizes[size]} flex flex-row gap-2 items-center ${IconDi === "left" ? "flex-row" : "flex-row-reverse"} ${className}`}>
            {Icon && IconDi === "left" && (
                <Icon size={iconSizes[size]} color={variantIconColor[theme]} />
            )}

            {text && (
                <Text className={`${variantText[theme]} font-${font}`}>
                    {text}
                </Text>
            )}

            {Icon && IconDi === "right" && (
                <Icon size={iconSizes[size]} color={variantIconColor[theme]} />
            )}
        </Pressable>
    );
}