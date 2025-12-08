import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { callFetchAccount } from '../services/auth.service';

const useAccountStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      isLoading: true,
      isActive: true,
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

      setUserLoginInfo: (userData) =>
        set({
          isAuthenticated: true,
          isLoading: false,
          isActive: userData.isActive !== undefined ? userData.isActive : true,
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
        localStorage.removeItem('token');

        set({
          isAuthenticated: false,
          isActive: true,
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
            const hasProfile = response.data.phone && response.data.address;

            set({
              isAuthenticated: true,
              isLoading: false,
              isActive: hasProfile,
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
          } else {
            set({ isLoading: false, isAuthenticated: false });
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
