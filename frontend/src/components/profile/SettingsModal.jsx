import { Modal } from 'antd';

const SettingsModal = ({ open, setOpen, setSecurityModalVisible }) => {
  const handleCancel = () => {
    setOpen(false);
  };

  const handleSecurity = () => {
    setOpen(false);
    setSecurityModalVisible(true);
  };

  return (
    <Modal
      title="Settings"
      open={open}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="space-y-4">
        <button
          onClick={handleSecurity}
          className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100"
        >
          Change Password
        </button>
        <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100">
          Notification Settings
        </button>
        <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100">
          Privacy Settings
        </button>
      </div>
    </Modal>
  );
};

export default SettingsModal;
