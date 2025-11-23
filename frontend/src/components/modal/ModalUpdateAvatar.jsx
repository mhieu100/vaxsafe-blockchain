import { Modal, message } from 'antd';

const ModalUpdateAvatar = ({ open, setOpen }) => {
  const handleCancel = () => {
    setOpen(false);
  };

  const handleOk = () => {
    message.info('Avatar update feature coming soon');
    setOpen(false);
  };

  return (
    <Modal
      title="Update Avatar"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <p>Upload new avatar feature coming soon...</p>
    </Modal>
  );
};

export default ModalUpdateAvatar;
