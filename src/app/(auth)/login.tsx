import { Link, useRouter } from "expo-router";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useState } from "react";
import { View } from "react-native";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { app } from "../../services/firebaseConfig";
import { Terminal, UserRoundKey } from "lucide-react-native";
import { StyledText } from "@/components/ui/styledText";
import Button from "@/components/ui/buttonfg";
import DismissKeyboardView from "@/components/ui/DismissKeyboardView";

import InputFieldNaked from "@/components/ui/inputNaked";

const auth = getAuth(app);

// التعديل 1: تأكد من أن المكون هو Default Export كما يطلب Expo Router
export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmitLogin = async () => {
        try {
            setErrorMsg('');
            await signInWithEmailAndPassword(auth, email, password);
            // no need to replace the onAuth will run the context and the layout will redirect
            // router.replace("/(tabs)");
        } catch (error: any) {
            setErrorMsg(error.message);
            setTimeout(() => {
                setErrorMsg('');
            }, 5000);
        }
    };

    // const handleGoogleLogin = async () => {
    //     setErrorMsg('');
    //     setLoading(true);

    //     try {
    //         await GoogleSignin.hasPlayServices();
    //         const signInResult = await GoogleSignin.signIn();

    //         // التعديل 2: طريقة استخراج الـ idToken الصحيحة في الإصدارات الأخيرة
    //         const idToken = signInResult.data?.idToken;

    //         if (!idToken) {
    //             throw new Error("No ID Token found");
    //         }

    //         const credential = GoogleAuthProvider.credential(idToken);
    //         const userCredential = await signInWithCredential(auth, credential);
    //         const user = userCredential.user;

    //         console.log("Login Success:", user.email);
    //         router.replace('/(tabs)');

    //     } catch (err: any) {
    //         if (err instanceof FirebaseError) {
    //             const errorCode = err.code;
    //             if (errorCode === 'auth/account-exists-with-different-credential') {
    //                 setErrorMsg('Account has registered with different credential');
    //             } else {
    //                 setErrorMsg(err.message);
    //             }
    //         } else if (err.code === statusCodes.SIGN_IN_CANCELLED) {
    //             setErrorMsg('Signing in was canceled');
    //         } else if (err.code === statusCodes.IN_PROGRESS) {
    //             setErrorMsg('Signing in is already in progress');
    //         } else {
    //             console.error("Unknown Error:", err);
    //             setErrorMsg("Unexpected Error happened");
    //         }
    //     } finally {
    //         setLoading(false);
    //         setTimeout(() => { setErrorMsg("") }, 3000);
    //     }
    // }

    return (
        <DismissKeyboardView>
            <View className="flex-1 p-6 justify-center bg-black"> {/* أضفت bg-black لتناسب ثيم الـ Input */}
                <StyledText className="text-3xl font-titillium-bold mb-8 text-center text-white">
                    Smart Parking
                </StyledText>

                <View className="gap-2"> {/* قللنا الـ gap لأن الـ InputField الجديد فيه margin داخلي للخطأ */}

                    {/* حقل الإيميل */}
                    <InputFieldNaked
                        headerLabel="Email Address"
                        label="Email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (errorMsg) setErrorMsg(''); // مسح الخطأ العام عند الكتابة
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        // التعديل الجديد:
                        isError={errorMsg.toLowerCase().includes('email') || errorMsg.toLowerCase().includes('user')}
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
                        // التعديل الجديد:
                        isError={errorMsg.toLowerCase().includes('password')}
                        errorMessage={errorMsg.toLowerCase().includes('password') ? errorMsg : ""}
                    />

                    <View className="mt-4 gap-4">
                        <Button
                            font="Titillium_Bold"
                            title={loading ? "Loading..." : "Login"}
                            onPress={handleSubmitLogin}
                        />

                        <Button
                            Icon={UserRoundKey}
                            title="Sign in with Google"
                        // onPress={handleGoogleLogin}
                        />
                    </View>

                    <View className="flex-row justify-center gap-1 mt-6">
                        <StyledText className="text-garage-500">{"Don't have an account yet?"}</StyledText>
                        <Link href="/(auth)/signup">
                            <StyledText className="text-main-900 font-titillium-bold">
                                Register
                            </StyledText>
                        </Link>
                    </View>
                </View>

                {/* عرض الخطأ العام (فقط لو مش تبع الإيميل أو الباسورد) */}
                {errorMsg !== '' && !errorMsg.toLowerCase().includes('email') && !errorMsg.toLowerCase().includes('password') && (
                    <Alert icon={Terminal} className="mt-6 border-destructive bg-garage-950">
                        <AlertTitle className="text-destructive">System Error</AlertTitle>
                        <AlertDescription className="text-white">
                            {errorMsg}
                        </AlertDescription>
                    </Alert>
                )}
            </View>
        </DismissKeyboardView>
    );
}