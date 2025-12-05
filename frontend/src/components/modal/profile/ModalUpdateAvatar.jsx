import { CameraOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Modal, message, Upload } from 'antd';
import { useState } from 'react';
import { callUploadSingleFile } from '@/services/file.service';
import { callUpdateAvatar } from '@/services/profile.service';
import { useAccountStore } from '@/stores/useAccountStore';

const ModalUpdateAvatar = ({ open, setOpen }) => {
  const user = useAccountStore((state) => state.user);
  const updateUserInfo = useAccountStore((state) => state.updateUserInfo);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleUpload = async (file) => {
    try {
      setUploading(true);

      // Step 1: Upload file to /files
      const uploadRes = await callUploadSingleFile(file, 'user');
      if (!uploadRes?.data?.fileName) {
        throw new Error('Upload failed: no file URL returned');
      }

      const avatarUrl = uploadRes.data.fileName;

      // Step 2: Update avatar via /auth/avatar
      const updateRes = await callUpdateAvatar(avatarUrl);

      console.log(updateRes);

      // The backend returns the avatar URL string directly in the response body
      // Axios wraps this in a 'data' property
      // So updateRes should be the avatar URL string if using the service correctly
      // But let's check what the service returns.
      // profile.service.js returns response.data.

      if (!updateRes) {
        throw new Error('Update avatar failed');
      }

      // Step 3: Update avatar in store directly (no page reload)
      updateUserInfo({ avatar: avatarUrl });

      message.success('Cập nhật ảnh đại diện thành công!');
      setOpen(false);
    } catch (error) {
      message.error(error?.message || 'Không thể cập nhật ảnh đại diện');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setRemoving(true);

      const defaultAvatar = `${import.meta.env.VITE_API_BASE_URL}/storage/user/default.png`;

      // Update avatar to default image
      const updateRes = await callUpdateAvatar(defaultAvatar);
      if (!updateRes) {
        throw new Error('Xóa ảnh đại diện thất bại');
      }

      // Update avatar in store directly (no page reload)
      updateUserInfo({ avatar: defaultAvatar });

      message.success('Đã xóa ảnh đại diện!');
      setOpen(false);
    } catch (error) {
      message.error(error?.message || 'Không thể xóa ảnh đại diện');
    } finally {
      setRemoving(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Chỉ được tải lên file ảnh!');
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Kích thước ảnh phải nhỏ hơn 5MB!');
        return Upload.LIST_IGNORE;
      }
      handleUpload(file);
      return false; // Prevent auto upload
    },
    showUploadList: false,
  };

  return (
    <Modal
      title="Cập nhật ảnh đại diện"
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      className="avatar-modal"
    >
      <div className="text-center !py-6">
        <Avatar size={120} src={user?.avatar} icon={<UserOutlined />} className="mb-6" />
        <div className="!space-y-4 !mt-3">
          <Upload {...uploadProps}>
            <Button
              type="primary"
              icon={<CameraOutlined />}
              block
              loading={uploading}
              disabled={uploading || removing}
            >
              {uploading ? 'Đang tải lên...' : 'Tải ảnh mới'}
            </Button>
          </Upload>
          <Button
            icon={<DeleteOutlined />}
            block
            onClick={handleRemove}
            loading={removing}
            disabled={uploading || removing || !user?.avatar}
          >
            Xóa ảnh hiện tại
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalUpdateAvatar;
