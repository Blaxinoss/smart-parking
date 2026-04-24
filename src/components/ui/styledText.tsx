import { ReactNode } from "react";
import { Text, TextProps, View } from "react-native";

interface StyledTextProps extends TextProps {
    children: ReactNode;
    className?: string;
    leftIcon?: ReactNode;  // الأيقونة اللي على الشمال
    rightIcon?: ReactNode; // الأيقونة اللي على اليمين
    containerClassName?: string; // عشان لو عايز تدي ستايل للـ View الخارجي
}
export const StyledText = ({
    children,
    className,
    leftIcon,
    rightIcon,
    containerClassName,
    ...props
}: StyledTextProps) => {
    return (
        <View className={`flex-row items-center ${containerClassName}`}>
            {leftIcon && <View className="mr-2">{leftIcon}</View>}

            <Text
                // ضفنا flex-shrink هنا عشان يخلي الكلام ينزل سطر جديد وميزقش الشاشة
                className={`flex-shrink text-garage-100 font-titillium ${className} mt-1`}
                style={{ height: "auto" }}
                {...props}
            >
                {children}
            </Text>

            {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </View>
    );
};