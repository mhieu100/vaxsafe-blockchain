/* eslint-disable import/no-extraneous-dependencies */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { callFetchAccount } from '../config/api.auth';

const useAccountStore = create(
  persist(
    (set) => ({
      // State
      isAuthenticated: false,
      isLoading: true,
      user: {
        id: '',
        fullName: '',
        email: '',
        role: '',
        centerId: null,
        centerName: '',
        phone: '',
        birthday: '',
        gender: '',
        address: '',
        identityNumber: '',
        bloodType: '',
        heightCm: null,
        weightKg: null,
        occupation: '',
        lifestyleNotes: '',
        insuranceNumber: '',
        avatar: '',
      },

      // Actions
      setUserLoginInfo: (userData) =>
        set({
          isAuthenticated: true,
          isLoading: false,
          user: {
            id: userData.id,
            fullName: userData.fullName,
            email: userData.email,
            role: userData.role,
            centerId: userData.centerId,
            centerName: userData.centerName,
            phone: userData.phone || '',
            birthday: userData.birthday || '',
            gender: userData.gender || '',
            address: userData.address || '',
            identityNumber: userData.identityNumber || '',
            bloodType: userData.bloodType || '',
            heightCm: userData.heightCm || null,
            weightKg: userData.weightKg || null,
            occupation: userData.occupation || '',
            lifestyleNotes: userData.lifestyleNotes || '',
            insuranceNumber: userData.insuranceNumber || '',
            avatar: userData.avatar || '',
          },
        }),

      logout: () => {
        // Clear all localStorage items
        localStorage.removeItem('access_token');
        localStorage.removeItem('account-storage');

        set({
          isAuthenticated: false,
          user: {
            id: '',
            fullName: '',
            email: '',
            role: '',
            centerId: null,
            centerName: '',
            phone: '',
            birthday: '',
            gender: '',
            address: '',
            identityNumber: '',
            bloodType: '',
            heightCm: null,
            weightKg: null,
            occupation: '',
            lifestyleNotes: '',
            insuranceNumber: '',
            avatar: '',
          },
        });
      },

      fetchAccount: async () => {
        set({ isLoading: true });
        try {
          const response = await callFetchAccount();
          if (response.data) {
            set({
              isAuthenticated: true,
              isLoading: false,
              user: {
                id: response.data.id,
                fullName: response.data.fullName,
                email: response.data.email,
                role: response.data.role,
                centerId: response.data.centerId,
                centerName: response.data.centerName,
                phone: response.data.phone || '',
                birthday: response.data.birthday || '',
                gender: response.data.gender || '',
                address: response.data.address || '',
                identityNumber: response.data.identityNumber || '',
                bloodType: response.data.bloodType || '',
                heightCm: response.data.heightCm || null,
                weightKg: response.data.weightKg || null,
                occupation: response.data.occupation || '',
                lifestyleNotes: response.data.lifestyleNotes || '',
                insuranceNumber: response.data.insuranceNumber || '',
                avatar: response.data.avatar || '',
              },
            });
          }
        } catch {
          set({ isAuthenticated: false, isLoading: false });
        }
      },

      updateUserInfo: (userData) =>
        set((state) => ({
          user: {
            ...state.user,
            ...userData,
          },
        })),
    }),
    {
      name: 'account-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: {
          id: state.user.id,
          email: state.user.email,
          role: state.user.role,
          fullName: state.user.fullName,
        },
      }),
    }
  )
);

export { useAccountStore };
export default useAccountStore;
