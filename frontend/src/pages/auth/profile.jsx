import { useEffect, useState } from 'react';
import { Tabs, notification, Card } from 'antd';
import { CalendarOutlined, WalletOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useAccount, useBalance } from 'wagmi';
import ModalProfile from '../../components/modal/modal.profile';
import { fetchAccount } from '../../redux/slice/accountSlide';
import { callMyAppointments } from '../../config/api.auth';
import { callCancelAppointment } from '../../config/api.appointment';

import UserInfoCard from './profile/UserInfoCard';
import WalletCard from './profile/WalletCard';
import AppointmentHistory from './profile/AppointmentHistory';
import Web3 from 'web3';
import TransactionHistory from './profile/TransactionHistory';
import useLoadingData from '../../utils/withLoadingData';

const { TabPane } = Tabs;

const ProfilePage = () => {
  const { address } = useAccount();
  const web3Instance = new Web3(window.ethereum);
  const user = useSelector((state) => state.account.user);
  const dispatch = useDispatch();

  const [openModal, setOpenModal] = useState(false);
  const { data } = useBalance({ address });
  const formattedValue = data?.formatted ? Number(data.formatted) : 0;

  // Use the loading data hook for appointments
  const {
    loading: loadingAppointments,
    data: appointments,
    fetchData: fetchAppointments,
  } = useLoadingData(
    async () => {
      const response = await callMyAppointments();
      return response.data;
    },
    {
      errorMessage: 'Không thể tải lịch sử đăng ký',
      timeout: 1000,
    }
  );

  const reloadData = () => {
    if (user?.walletAddress && !user.walletAddress.includes(address)) {
      dispatch(fetchAccount(address));
    }
  };

  const reloadAppointment = () => {
    fetchAppointments();
  };

  useEffect(() => {
    if (user?.walletAddress && !user.walletAddress.includes(address)) {
      reloadData();
    }
  }, [user?.walletAddress, address]);

  const handleCancel = async (id) => {
    if (id) {
      const res = await callCancelAppointment(id);
      if (res) {
        reloadAppointment();
        message.success('Appointment cancelled successfully');
      } else {
        notification.error({
          message: res.error,
          description: res.message,
        });
      }
    }
  };

  const [sender, setSender] = useState([]);
  const [receiver, setReceiver] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);

  useEffect(() => {
    fetchAppointments();

    const fetchTransactions = async (address) => {
      const sender = await getSenderByAddress(address);
      const receiver = await getReceiverByAddress(address);
      const allTransactions = await getAllTransactions();
      setSender(sender);
      setReceiver(receiver);
      setAllTransactions(allTransactions);
    };

    if (address) {
      fetchTransactions(address);
    }
  }, [address]);

  async function getAllTransactions() {
    const latestBlock = await web3Instance.eth.getBlockNumber();

    let txs = [];

    for (let i = 0; i <= latestBlock; i++) {
      let block = await web3Instance.eth.getBlock(i, true);
      if (block && block.transactions) {
        let filteredTx = block.transactions
          .filter((tx) => typeof tx !== 'string')
          .filter(
            (tx) =>
              tx.value && web3Instance.utils.fromWei(tx.value, 'ether') > 0
          )
          .map((tx) => ({
            ...tx,
            value: `${web3Instance.utils.fromWei(tx.value, 'ether')} ETH`,
            key: tx.hash,
          }));
        txs.push(...filteredTx);
      }
    }

    return txs;
  }

  async function getSenderByAddress(address) {
    const latestBlock = await web3Instance.eth.getBlockNumber();

    let txs = [];

    for (let i = 0; i <= latestBlock; i++) {
      let block = await web3Instance.eth.getBlock(i, true);
      if (block && block.transactions) {
        let filteredTx = block.transactions
          .filter((tx) => typeof tx !== 'string')
          .filter(
            (tx) =>
              tx.value && web3Instance.utils.fromWei(tx.value, 'ether') > 0
          )
          .filter((tx) => tx.from?.toLowerCase() === address.toLowerCase())
          .map((tx) => ({
            ...tx,
            value: `${web3Instance.utils.fromWei(tx.value, 'ether')} ETH`,
            key: tx.hash,
          }));
        txs.push(...filteredTx);
      }
    }

    return txs;
  }

  async function getReceiverByAddress(address) {
    const latestBlock = await web3Instance.eth.getBlockNumber();

    let txs = [];

    for (let i = 0; i <= latestBlock; i++) {
      let block = await web3Instance.eth.getBlock(i, true);
      if (block && block.transactions) {
        let filteredTx = block.transactions
          .filter((tx) => typeof tx !== 'string')
          .filter(
            (tx) =>
              tx.value && web3Instance.utils.fromWei(tx.value, 'ether') > 0
          )
          .filter((tx) => tx.to?.toLowerCase() === address.toLowerCase())
          .map((tx) => ({
            ...tx,
            value: `${web3Instance.utils.fromWei(tx.value, 'ether')} ETH`,
            key: tx.hash,
          }));
        txs.push(...filteredTx);
      }
    }

    return txs;
  }

  const getRole = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'PATIENT':
        return 'Người dùng';
      case 'DOCTOR':
        return 'Bác sĩ';
      case 'CASHIER':
        return 'Nhân viên thu ngân';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-sm text-gray-500">
          Quản lý thông tin và lịch sử tiêm chủng của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <UserInfoCard
            user={user}
            onEdit={() => setOpenModal(true)}
            getRole={getRole}
          />
          <WalletCard address={address} balance={formattedValue} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3">
          <Card>
            <Tabs defaultActiveKey="1">
              {user?.role === 'PATIENT' && (
                <TabPane
                  tab={
                    <span>
                      <CalendarOutlined />
                      Lịch sử đăng ký tiêm chủng
                    </span>
                  }
                  key="2"
                >
                  <AppointmentHistory
                    appointments={appointments}
                    loadingAppointments={loadingAppointments}
                    handleCancel={handleCancel}
                  />
                </TabPane>
              )}
              <TabPane
                tab={
                  <span>
                    <WalletOutlined />
                    Lịch sử giao dịch
                  </span>
                }
                key="3"
              >
                <TransactionHistory
                  allTransactions={allTransactions}
                  sender={sender}
                  receiver={receiver}
                />
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </div>

      <ModalProfile
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadData={reloadData}
        user={user}
      />
    </div>
  );
};

export default ProfilePage;
