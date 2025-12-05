import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { usePatientProfile, useUpdatePatientProfile } from '@/hooks/useProfile';

const PatientProfileForm = () => {
  const { data: profileData, isLoading, error } = usePatientProfile();
  const updateProfile = useUpdatePatientProfile();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm();

  // Reset form when profile data is loaded
  useEffect(() => {
    if (profileData?.data) {
      reset(profileData.data);
    }
  }, [profileData, reset]);

  const onSubmit = async (data) => {
    console.log('Submitting profile update:', data);
    const { birthday, identityNumber, ...payload } = data;
    try {
      await updateProfile.mutateAsync(payload);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleCancel = () => {
    reset(profileData?.data);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Failed to load profile: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Patient Profile</h2>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit, (errors) => console.error('Form errors:', errors))}>
        {/* Common User Fields */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  {...register('fullName', { required: 'Full name is required' })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  disabled
                  {...register('email')}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                />
                <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  disabled={!isEditing}
                  {...register('phone', {
                    validate: (value) => {
                      if (!value) return true;
                      return /^[0-9]{9,11}$/.test(value) || 'Phone must be 9-11 digits';
                    },
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  disabled={!isEditing}
                  {...register('gender')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
                <input
                  type="date"
                  disabled
                  {...register('birthday')}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                />
                <p className="text-gray-500 text-xs mt-1">Birthday cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  {...register('address')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Patient Specific Fields */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Medical Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identity Number
                </label>
                <input
                  type="text"
                  disabled
                  {...register('identityNumber')}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                />
                <p className="text-gray-500 text-xs mt-1">Identity number cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                <select
                  disabled={!isEditing}
                  {...register('bloodType')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                >
                  <option value="">Select blood type</option>
                  <option value="A_POSITIVE">A+</option>
                  <option value="A_NEGATIVE">A-</option>
                  <option value="B_POSITIVE">B+</option>
                  <option value="B_NEGATIVE">B-</option>
                  <option value="AB_POSITIVE">AB+</option>
                  <option value="AB_NEGATIVE">AB-</option>
                  <option value="O_POSITIVE">O+</option>
                  <option value="O_NEGATIVE">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  disabled={!isEditing}
                  {...register('heightCm', {
                    min: { value: 0, message: 'Height must be positive' },
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
                {errors.heightCm && (
                  <p className="text-red-500 text-sm mt-1">{errors.heightCm.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  disabled={!isEditing}
                  {...register('weightKg', {
                    min: { value: 0, message: 'Weight must be positive' },
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
                {errors.weightKg && (
                  <p className="text-red-500 text-sm mt-1">{errors.weightKg.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  {...register('occupation')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Number
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  {...register('insuranceNumber')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lifestyle Notes
                </label>
                <textarea
                  disabled={!isEditing}
                  rows={3}
                  {...register('lifestyleNotes')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    disabled={!isEditing}
                    {...register('consentForAIAnalysis')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    I consent to AI analysis of my medical data
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={updateProfile.isPending}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isDirty || updateProfile.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PatientProfileForm;
