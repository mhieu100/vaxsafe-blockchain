import React from 'react';
import { Card, Badge, Tag, Progress, Button, Tooltip, message } from 'antd';
import {
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  CopyOutlined,
  EyeOutlined,
  LinkOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  formatCurrency,
  formatTxHash,
  copyToClipboard,
  getVaccineTheme
} from '../../services/nftPassport.service';

const NFTCertificateCard = ({ certificate, onViewDetail }) => {
  const theme = getVaccineTheme(certificate.vaccine);
  const lastAppointment = certificate.appointments[certificate.appointments.length - 1];
  const completedDoses = certificate.appointments.filter(apt => apt.status === 'COMPLETED').length;

  const handleCopyTxHash = async () => {
    const success = await copyToClipboard(certificate.transactionHash);
    if (success) {
      message.success('Transaction hash đã được copy!');
    } else {
      message.error('Không thể copy transaction hash');
    }
  };

  const handleViewOnBlockchain = () => {
    window.open(`http://localhost:7545/tx/${certificate.transactionHash}`, '_blank');
  };

  return (
    <Card
      hoverable
      className="nft-certificate-card h-full"
      style={{
        background: `linear-gradient(135deg, ${theme.bgGradient})`,
        border: '2px solid transparent',
        borderImage: `linear-gradient(135deg, ${theme.gradient}) 1`,
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
      bodyStyle={{ padding: '20px' }}
    >
      {/* Header with NFT Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="text-4xl"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}
          >
            {theme.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Tag color="purple" className="font-mono text-xs">
                NFT #{certificate.tokenId}
              </Tag>
              {certificate.status === 'COMPLETED' && (
                <Badge
                  status="success"
                  text={
                    <span className="text-xs font-semibold text-green-600">
                      Hoàn thành
                    </span>
                  }
                />
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Minted: {dayjs(certificate.mintDate).format('DD/MM/YYYY HH:mm')}
            </div>
          </div>
        </div>
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={onViewDetail}
            className="hover:scale-110 transition-transform"
          />
        </Tooltip>
      </div>

      {/* Vaccine Name */}
      <div className="mb-4">
        <h3
          className="text-xl font-bold mb-1"
          style={{ color: theme.color }}
        >
          {certificate.vaccine}
        </h3>
        <div className="text-sm text-gray-600">
          Mã vaccine: <span className="font-mono">{certificate.vaccineCode}</span>
        </div>
        <div className="text-sm text-gray-600">
          Nhà sản xuất: {certificate.manufacturer}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Tiến độ tiêm chủng
          </span>
          <span className="text-sm font-bold" style={{ color: theme.color }}>
            {completedDoses}/{certificate.totalDoses} liều
          </span>
        </div>
        <Progress
          percent={certificate.completionRate}
          strokeColor={{
            '0%': theme.color,
            '100%': theme.color,
          }}
          size="small"
          showInfo={false}
        />
      </div>

      {/* Appointment Info */}
      <div className="space-y-2 mb-4 p-3 bg-white/50 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <CalendarOutlined className="text-blue-500" />
          <span className="text-gray-600">Lần tiêm cuối:</span>
          <span className="font-semibold">
            {dayjs(lastAppointment.scheduledDate).format('DD/MM/YYYY')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <EnvironmentOutlined className="text-red-500" />
          <span className="text-gray-600">{lastAppointment.center}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <SafetyCertificateOutlined className="text-green-500" />
          <span className="text-gray-600">{lastAppointment.doctor}</span>
        </div>
      </div>

      {/* Blockchain Info */}
      <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-purple-700 flex items-center gap-1">
            <LinkOutlined />
            Blockchain Verification
          </span>
          <Tag color="purple" className="text-xs">
            Block #{certificate.blockNumber}
          </Tag>
        </div>
        <div className="flex items-center justify-between">
          <Tooltip title={certificate.transactionHash}>
            <code className="text-xs text-gray-700 font-mono">
              {formatTxHash(certificate.transactionHash)}
            </code>
          </Tooltip>
          <div className="flex gap-1">
            <Tooltip title="Copy TX Hash">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={handleCopyTxHash}
                className="hover:text-blue-500"
              />
            </Tooltip>
            <Tooltip title="View on Blockchain">
              <Button
                type="text"
                size="small"
                icon={<LinkOutlined />}
                onClick={handleViewOnBlockchain}
                className="hover:text-purple-500"
              />
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Financial Info */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <span className="text-sm font-semibold text-gray-700">Tổng chi phí</span>
        <span className="text-lg font-bold text-green-600">
          {formatCurrency(certificate.totalAmount)}
        </span>
      </div>

      {/* View Detail Button */}
      <Button
        type="primary"
        block
        className="mt-4"
        style={{
          background: `linear-gradient(135deg, ${theme.gradient})`,
          border: 'none',
          height: '40px',
          fontWeight: 'bold',
        }}
        onClick={onViewDetail}
      >
        Xem Chi Tiết NFT Certificate
      </Button>
    </Card>
  );
};

export default NFTCertificateCard;
