import { Modal, message } from 'antd';

const ModalUpdatePassword = ({ open, setOpen }) => {
  const handleCancel = () => {
    setOpen(false);
  };

  const handleOk = () => {
    message.info('Password update feature coming soon');
    setOpen(false);
  };

  return (
    <Modal
      title="Update Password"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <p>Change password feature coming soon...</p>
    </Modal>
  );
};

export default ModalUpdatePassword;
