import axios from 'axios'
import { auth } from './firebaseConfig'
import { ngrok } from '@/constants/constants'


export const AxiosAPI = axios.create({
    baseURL: `${ngrok}/api`,

    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    }

})


AxiosAPI.interceptors.request.use(
    async (config) => {


        const user = auth.currentUser;

        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`
        }
        return config

    },
    (err) => {
        return err
    }
)