import { Search } from "lucide-react-native";
import { useState } from "react";
import { TextInput, TextInputProps, View } from "react-native";

interface SearchBarProps extends TextInputProps {
    IconDi?: "left" | "right";
}

export default function SearchBar({
    value,
    onChangeText,
    placeholder = "Search...",
    className,
    IconDi = "left", // القيمة الافتراضية هي اليسار
    ...props
}: SearchBarProps) {
    const [isFocused, setIsFocused] = useState(false);

    // دالة مساعدة لرسم الأيقونة لتقليل تكرار الكود
    const SearchIcon = () => (
        <Search
            size={20}
            color={isFocused ? "#E7872E" : "#525252"}
            style={{ marginHorizontal: 4 }}
        />
    );

    return (
        <View className="w-full max-w-[500px] mx-auto my-2">
            <View
                className={`
                    flex flex-row items-center px-4 w-full rounded-2xl border bg-white
                    ${isFocused ? "border-[#E7872E]" : "border-slate-200"} 
                `}
                style={{ height: 55 }}
            >
                {/* إظهار الأيقونة على اليسار */}
                {IconDi === "left" && <SearchIcon />}

                <TextInput
                    className={`flex-1 text-slate-950 px-2 ${className}`}
                    {...props}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#94a3b8"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{
                        fontSize: 16,
                        includeFontPadding: false,
                        textAlignVertical: 'center',
                        outline: "none",
                    }}
                    returnKeyType="search"
                />

                {/* إظهار الأيقونة على اليمين */}
                {IconDi === "right" && <SearchIcon />}
            </View>
        </View>
    );
}