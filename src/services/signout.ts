import { FirebaseApp } from "firebase/app";
import { Auth } from "firebase/auth";

export const signOut = async (auth: Auth) => {
    await auth.signOut();
}