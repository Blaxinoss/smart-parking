import { useRouter } from "expo-router";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { View, TextInput } from "react-native"; // عملنا اسم مستعار للـ TextInput الأصلي
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // مكونات المكتبة
import { Text, Button } from "react-native";
import { app } from "../../services/firebaseConfig"; // تأكد من مسار ملف الفايربيز بتاعك
import { Terminal } from "lucide-react-native";

const auth = getAuth(app);

const Login = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmitLogin = async () => {
        try {
            setErrorMsg('');
            const data = await signInWithEmailAndPassword(auth, email, password);
            console.log(data);
            router.replace("/(tabs)");
        } catch (error: any) {
            setErrorMsg(error.message);
            setTimeout(() => {
                setErrorMsg('');
            }, 5000);
        }
    };

    return (
        <View className="flex-1 p-6 justify-center bg-background">
            <Text className="text-2xl font-bold mb-6 text-center">Smart Parking</Text>

            <View className="gap-4">
                <View>
                    <Text className="mb-2">Email</Text>
                    <TextInput
                        placeholder="example@gmail.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View>
                    <Text className="mb-2">Password</Text>
                    <TextInput
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <Button title="Login" onPress={handleSubmitLogin}>

                </Button>
                <Button title="Sign up" onPress={() => {
                    router.replace('/(auth)/signup')
                }}>

                </Button>
            </View>

            {errorMsg !== '' && (
                <Alert icon={Terminal} className="mt-6 border-destructive ">
                    <AlertTitle className="text-destructive">خطأ في الدخول</AlertTitle>
                    <AlertDescription>
                        {errorMsg}
                    </AlertDescription>
                </Alert>
            )}
        </View>
    );
}

export default Login;