import {
    Keyboard,
    Platform,
    TouchableWithoutFeedback,
    View,
} from "react-native";

export default function DismissKeyboardView({ children }: React.PropsWithChildren) {
    return (
        <TouchableWithoutFeedback onPress={() => {
            if (Platform.OS !== "web") {
                Keyboard.dismiss()
            }
        }}>
            <View style={{ flex: 1 }}>
                {children}
            </View>
        </TouchableWithoutFeedback>
    );
}
