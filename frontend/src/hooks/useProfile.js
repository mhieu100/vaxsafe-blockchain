import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import profileService from '@/services/profile.service';

/**
 * Custom hook to fetch and manage user profile
 * @param {string} role - User role (patient, doctor, cashier, admin)
 * @returns {Object} Query result with profile data
 */
export const useProfile = (role) => {
  return useQuery({
    queryKey: ['profile', role],
    queryFn: () => Promise.resolve(null), // GET methods removed as per requirement
    enabled: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Custom hook to update user profile
 * @param {string} role - User role (patient, doctor, cashier, admin)
 * @returns {Object} Mutation object
 */
export const useUpdateProfile = (role) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => profileService.updateProfile(role, data),
    onSuccess: (data) => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries(['profile', role]);

      // Update user info in auth query if exists
      queryClient.invalidateQueries(['auth', 'user']);

      toast.success(data.message || 'Profile updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    },
  });
};

/**
 * Hook for patient profile
 */
export const usePatientProfile = () => {
  return useQuery({
    queryKey: ['profile', 'patient'],
    queryFn: () => Promise.resolve(null), // GET methods removed
    enabled: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdatePatientProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileService.updatePatientProfile,
    onSuccess: (_data) => {
      queryClient.invalidateQueries(['profile', 'patient']);
      queryClient.invalidateQueries(['auth', 'user']);
      toast.success('Patient profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};

/**
 * Hook for doctor profile
 */
export const useDoctorProfile = () => {
  return useQuery({
    queryKey: ['profile', 'doctor'],
    queryFn: () => Promise.resolve(null), // GET methods removed
    enabled: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateDoctorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileService.updateDoctorProfile,
    onSuccess: (_data) => {
      queryClient.invalidateQueries(['profile', 'doctor']);
      queryClient.invalidateQueries(['auth', 'user']);
      toast.success('Doctor profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};

/**
 * Hook for cashier profile
 */
export const useCashierProfile = () => {
  return useQuery({
    queryKey: ['profile', 'cashier'],
    queryFn: () => Promise.resolve(null), // GET methods removed
    enabled: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateCashierProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileService.updateCashierProfile,
    onSuccess: (_data) => {
      queryClient.invalidateQueries(['profile', 'cashier']);
      queryClient.invalidateQueries(['auth', 'user']);
      toast.success('Cashier profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};

/**
 * Hook for admin profile
 */
export const useAdminProfile = () => {
  return useQuery({
    queryKey: ['profile', 'admin'],
    queryFn: () => Promise.resolve(null), // GET methods removed
    enabled: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileService.updateAdminProfile,
    onSuccess: (_data) => {
      queryClient.invalidateQueries(['profile', 'admin']);
      queryClient.invalidateQueries(['auth', 'user']);
      toast.success('Admin profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};
