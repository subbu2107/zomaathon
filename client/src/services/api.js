import axios from 'axios';

const getBaseURL = () => {
    let url = import.meta.env.VITE_API_URL;
    if (!url) return 'http://localhost:5000/api';
    
    // Ensure protocol
    if (!url.startsWith('http')) {
        url = `https://${url}`;
    }
    
    // Ensure /api suffix
    return url.endsWith('/api') ? url : `${url}/api`;
};

const API = axios.create({
    baseURL: getBaseURL(),
});

// Add a request interceptor to include the JWT token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;
