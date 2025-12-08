import { CameraOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Modal, message, Upload } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { callUploadSingleFile } from '@/services/file.service';
import { callUpdateAvatar } from '@/services/profile.service';
import { useAccountStore } from '@/stores/useAccountStore';

const ModalUpdateAvatar = ({ open, setOpen }) => {
  const { t } = useTranslation(['client']);
  const user = useAccountStore((state) => state.user);
  const updateUserInfo = useAccountStore((state) => state.updateUserInfo);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleUpload = async (file) => {
    try {
      setUploading(true);

      const uploadRes = await callUploadSingleFile(file, 'user');
      if (!uploadRes?.data?.fileName) {
        throw new Error('Upload failed: no file URL returned');
      }

      const avatarUrl = uploadRes.data.fileName;

      const updateRes = await callUpdateAvatar(avatarUrl);

      console.log(updateRes);

      if (!updateRes) {
        throw new Error('Update avatar failed');
      }

      updateUserInfo({ avatar: avatarUrl });

      message.success(t('client:profile.updateAvatarSuccess'));
      setOpen(false);
    } catch (error) {
      message.error(error?.message || t('client:profile.updateAvatarFailed'));
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setRemoving(true);

      const defaultAvatar = `${import.meta.env.VITE_API_BASE_URL}/storage/user/default.png`;

      const updateRes = await callUpdateAvatar(defaultAvatar);
      if (!updateRes) {
        throw new Error('Xóa ảnh đại diện thất bại');
      }

      updateUserInfo({ avatar: defaultAvatar });

      message.success(t('client:profile.removeAvatarSuccess'));
      setOpen(false);
    } catch (error) {
      message.error(error?.message || t('client:profile.removeAvatarFailed'));
    } finally {
      setRemoving(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error(t('client:profile.onlyImage'));
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error(t('client:profile.imageSizeLimit'));
        return Upload.LIST_IGNORE;
      }
      handleUpload(file);
      return false;
    },
    showUploadList: false,
  };

  return (
    <Modal
      title={t('client:profile.updateAvatarTitle')}
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
              {uploading ? t('client:profile.uploading') : t('client:profile.uploadNewPhoto')}
            </Button>
          </Upload>
          <Button
            icon={<DeleteOutlined />}
            block
            onClick={handleRemove}
            loading={removing}
            disabled={uploading || removing || !user?.avatar}
          >
            {t('client:profile.removeCurrentPhoto')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalUpdateAvatar;
