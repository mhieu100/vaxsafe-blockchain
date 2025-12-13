import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const verifyRecord = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/public/verify-vaccine/${id}`);
        return response.data;
    } catch (error) {
        console.error("Verification failed:", error);
        throw error;
    }
};
