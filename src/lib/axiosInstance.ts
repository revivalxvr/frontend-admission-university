import axios from 'axios';

function getTokenFromCookies(): string | null {
    const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
    return match ? match[2] : null;
}

//buat instance axios
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL
    
});

//interceptor untuk menambahkan token ke header setiap request
api.interceptors.request.use(
    (config) => {
        const token = getTokenFromCookies();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;