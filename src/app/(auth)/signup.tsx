import { Link, useRouter } from "expo-router";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StyledText } from "@/components/ui/styledText";
import Button from "@/components/ui/buttonfg";
import { app } from "../../services/firebaseConfig";
import { Terminal } from "lucide-react-native";
import DismissKeyboardView from "@/components/ui/DismissKeyboardView";
import InputFieldNaked from "@/components/ui/inputNaked";
import { View } from "react-native";

const auth = getAuth(app);

export default function Signup() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleCreation = async () => {
        try {
            if (confirmPassword !== password) {
                setErrorMsg("Password doesn't match");
                return;
            }

            setErrorMsg('');

            await createUserWithEmailAndPassword(auth, email, password);

            router.replace("/(auth)/login");
        } catch (error: any) {
            setErrorMsg(error.message);
            setTimeout(() => {
                setErrorMsg('');
            }, 5000);
        }
    };

    return (

        <DismissKeyboardView>
            <View className="flex-1 p-6 justify-center bg-black">
                <StyledText className="text-3xl font-titillium-bold mb-8 text-center text-white">
                    Create Account
                </StyledText>

                <View className="gap-2">
                    {/* حقل الإيميل */}
                    <InputFieldNaked
                        headerLabel="Email Address"
                        label="Email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (errorMsg) setErrorMsg('');
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        textContentType="emailAddress"
                        autoComplete="email"
                        // فحص إذا كان الخطأ يخص الإيميل
                        isError={errorMsg.toLowerCase().includes('email')}
                        errorMessage={errorMsg.toLowerCase().includes('email') ? errorMsg : ""}
                    />

                    {/* حقل كلمة المرور */}
                    <InputFieldNaked
                        headerLabel="Security"
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (errorMsg) setErrorMsg('');
                        }}
                        secureTextEntry
                        textContentType="password"
                        autoComplete="password"
                        // فحص إذا كان الخطأ يخص الباسورد (وليس التأكيد)
                        isError={errorMsg.toLowerCase().includes('password') && !errorMsg.toLowerCase().includes('confirm')}
                        errorMessage={errorMsg.toLowerCase().includes('password') && !errorMsg.toLowerCase().includes('confirm') ? errorMsg : ""}
                    />

                    {/* حقل تأكيد كلمة المرور */}
                    <InputFieldNaked
                        headerLabel="Verify Password"
                        label="Confirm Password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            if (errorMsg) setErrorMsg('');
                        }}
                        secureTextEntry
                        textContentType="password"
                        autoComplete="password"
                        // فحص إذا كان الخطأ يخص التطابق أو التأكيد
                        isError={errorMsg.toLowerCase().includes('match') || errorMsg.toLowerCase().includes('confirm')}
                        errorMessage={errorMsg.toLowerCase().includes('match') || errorMsg.toLowerCase().includes('confirm') ? errorMsg : ""}
                    />

                    <View className="mt-4">
                        <Button
                            size="lg"
                            font="Titillium_Bold"
                            title={"Create Account"}
                            onPress={handleCreation}
                        />
                    </View>

                    <View className="flex-row justify-center gap-1 mt-6">
                        <StyledText className="text-garage-500">Already have an account?</StyledText>
                        <Link href="/(auth)/login">
                            <StyledText className="text-main-900 font-titillium-bold">
                                Login
                            </StyledText>
                        </Link>
                    </View>
                </View>

                {/* عرض Alert فقط للأخطاء العامة (مثل مشاكل الاتصال) */}
                {errorMsg !== '' &&
                    !errorMsg.toLowerCase().includes('email') &&
                    !errorMsg.toLowerCase().includes('password') &&
                    !errorMsg.toLowerCase().includes('match') && (
                        <Alert icon={Terminal} className="mt-6 border-destructive bg-garage-950">
                            <AlertTitle className="text-destructive">Error</AlertTitle>
                            <AlertDescription className="text-white">
                                {errorMsg}
                            </AlertDescription>
                        </Alert>
                    )}
            </View>
        </DismissKeyboardView>
    );

}
