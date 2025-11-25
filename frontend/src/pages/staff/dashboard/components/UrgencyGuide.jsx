import {
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Alert, Card, Col, Divider, Row, Space, Tag, Timeline, Typography } from 'antd';

const { Title, Text, Paragraph } = Typography;

const UrgencyGuide = () => {
  return (
    <Card
      title={
        <Space>
          <InfoCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <Title level={3} style={{ margin: 0 }}>
            Hướng Dẫn Phân Loại Mức Độ Ưu Tiên
          </Title>
        </Space>
      }
      style={{ marginBottom: 24 }}
    >
      <Alert
        message="Hệ thống tự động phát hiện và phân loại lịch hẹn cần xử lý"
        description="Các lịch hẹn được sắp xếp theo mức độ ưu tiên từ cao đến thấp để giúp nhân viên xử lý hiệu quả"
        type="info"
        showIcon
        icon={<ThunderboltOutlined />}
        style={{ marginBottom: 24 }}
      />

      <Title level={4}>📊 Các Mức Độ Ưu Tiên</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {/* Priority 1 - Type 1 */}
        <Col xs={24} lg={12}>
          <Card
            style={{
              border: '2px solid #ff4d4f',
              background: '#fff1f0',
            }}
            hoverable
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space>
                <Tag color="red" style={{ fontSize: 16, padding: '4px 12px' }}>
                  Priority 1
                </Tag>
                <Tag icon={<ExclamationCircleOutlined />} color="red">
                  CỰC KHẨN
                </Tag>
              </Space>

              <Title level={5} style={{ color: '#ff4d4f', margin: 0 }}>
                <ExclamationCircleOutlined /> Yêu Cầu Đổi Lịch Chờ Phê Duyệt
              </Title>

              <Paragraph style={{ marginBottom: 0 }}>
                <Text strong>Loại:</Text> RESCHEDULE_PENDING
              </Paragraph>

              <Paragraph>
                <Text strong>Mô tả:</Text> Bệnh nhân đã yêu cầu đổi lịch hẹn, cần thu ngân xem xét
                và phê duyệt ngay.
              </Paragraph>

              <Alert
                message="Hành động cần làm"
                description={
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    <li>Kiểm tra lý do đổi lịch</li>
                    <li>Xem ngày/giờ mong muốn</li>
                    <li>Phê duyệt hoặc từ chối yêu cầu</li>
                    <li>Phân công bác sĩ mới (nếu cần)</li>
                  </ul>
                }
                type="error"
                showIcon
              />
            </Space>
          </Card>
        </Col>

        {/* Priority 1 - Type 2: No Doctor within 24 hours */}
        <Col xs={24} lg={12}>
          <Card
            style={{
              border: '2px solid #ff4d4f',
              background: '#fff1f0',
            }}
            hoverable
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space>
                <Tag color="red" style={{ fontSize: 16, padding: '4px 12px' }}>
                  Priority 1
                </Tag>
                <Tag icon={<ExclamationCircleOutlined />} color="red">
                  CỰC KHẨN
                </Tag>
              </Space>

              <Title level={5} style={{ color: '#ff4d4f', margin: 0 }}>
                <WarningOutlined /> KHẨN CẤP: Chưa Có Bác Sĩ (≤ 24 Giờ)
              </Title>

              <Paragraph style={{ marginBottom: 0 }}>
                <Text strong>Loại:</Text> NO_DOCTOR
              </Paragraph>

              <Paragraph>
                <Text strong>Mô tả:</Text> Lịch hẹn diễn ra trong vòng 24 giờ tới nhưng chưa được
                phân công bác sĩ.
                <Text strong style={{ color: '#ff4d4f' }}>
                  {' '}
                  CẦN XỬ LÝ NGAY!
                </Text>
              </Paragraph>

              <Alert
                message="Hành động khẩn cấp"
                description={
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    <li>
                      <Text strong style={{ color: '#ff4d4f' }}>
                        Ưu tiên phân công bác sĩ NGAY LẬP TỨC
                      </Text>
                    </li>
                    <li>Kiểm tra lịch bác sĩ có sẵn trong khung giờ</li>
                    <li>Liên hệ bác sĩ xác nhận</li>
                    <li>Thông báo cho bệnh nhân nếu cần đổi lịch</li>
                  </ul>
                }
                type="error"
                showIcon
              />
            </Space>
          </Card>
        </Col>

        {/* Priority 2 */}
        <Col xs={24} lg={12}>
          <Card
            style={{
              border: '2px solid #ffa940',
              background: '#fff7e6',
            }}
            hoverable
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space>
                <Tag color="orange" style={{ fontSize: 16, padding: '4px 12px' }}>
                  Priority 2
                </Tag>
                <Tag icon={<CloseCircleOutlined />} color="orange">
                  KHẨN
                </Tag>
              </Space>

              <Title level={5} style={{ color: '#fa8c16', margin: 0 }}>
                <CloseCircleOutlined /> Lịch Quá Hạn Xử Lý
              </Title>

              <Paragraph style={{ marginBottom: 0 }}>
                <Text strong>Loại:</Text> OVERDUE
              </Paragraph>

              <Paragraph>
                <Text strong>Mô tả:</Text> Lịch hẹn đã quá thời gian dự định nhưng chưa được xử lý
                hoàn tất.
              </Paragraph>

              <Alert
                message="Hành động cần làm"
                description={
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    <li>Kiểm tra trạng thái hiện tại</li>
                    <li>Liên hệ bệnh nhân để xác nhận</li>
                    <li>Sắp xếp lại lịch hoặc hủy</li>
                    <li>Cập nhật trạng thái trong hệ thống</li>
                  </ul>
                }
                type="warning"
                showIcon
              />
            </Space>
          </Card>
        </Col>

        {/* Priority 3 */}
        <Col xs={24} lg={12}>
          <Card
            style={{
              border: '2px solid #faad14',
              background: '#fffbe6',
            }}
            hoverable
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space>
                <Tag color="gold" style={{ fontSize: 16, padding: '4px 12px' }}>
                  Priority 3
                </Tag>
                <Tag icon={<ClockCircleOutlined />} color="gold">
                  CAO
                </Tag>
              </Space>

              <Title level={5} style={{ color: '#faad14', margin: 0 }}>
                <ClockCircleOutlined /> Sắp Đến Giờ Hẹn
              </Title>

              <Paragraph style={{ marginBottom: 0 }}>
                <Text strong>Loại:</Text> COMING_SOON
              </Paragraph>

              <Paragraph>
                <Text strong>Mô tả:</Text> Lịch hẹn sẽ diễn ra trong vòng 4 giờ tới.
              </Paragraph>

              <Alert
                message="Hành động cần làm"
                description={
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    <li>Chuẩn bị vaccine và trang thiết bị</li>
                    <li>Xác nhận bệnh nhân sẽ đến</li>
                    <li>Kiểm tra thông tin lần cuối</li>
                    <li>Nhắc nhở bác sĩ</li>
                  </ul>
                }
                type="info"
                showIcon
              />
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Title level={4}>🔄 Quy Trình Xử Lý</Title>

      <Timeline
        mode="left"
        items={[
          {
            label: <Text strong>Bước 1</Text>,
            children: (
              <Space direction="vertical">
                <Text strong style={{ color: '#1890ff' }}>
                  Kiểm tra danh sách
                </Text>
                <Text type="secondary">Hệ thống tự động sắp xếp theo mức độ ưu tiên</Text>
              </Space>
            ),
            color: 'blue',
          },
          {
            label: <Text strong>Bước 2</Text>,
            children: (
              <Space direction="vertical">
                <Text strong style={{ color: '#52c41a' }}>
                  Xử lý Priority 1 trước
                </Text>
                <Text type="secondary">
                  Ưu tiên yêu cầu đổi lịch và lịch chưa có bác sĩ trong 24h
                </Text>
              </Space>
            ),
            color: 'green',
          },
          {
            label: <Text strong>Bước 3</Text>,
            children: (
              <Space direction="vertical">
                <Text strong style={{ color: '#faad14' }}>
                  Phân công bác sĩ
                </Text>
                <Text type="secondary">Đảm bảo tất cả lịch đều có bác sĩ phụ trách</Text>
              </Space>
            ),
            color: 'orange',
          },
          {
            label: <Text strong>Bước 4</Text>,
            children: (
              <Space direction="vertical">
                <Text strong style={{ color: '#722ed1' }}>
                  Cập nhật trạng thái
                </Text>
                <Text type="secondary">Chuyển trạng thái sang SCHEDULED sau khi hoàn tất</Text>
              </Space>
            ),
            color: 'purple',
          },
        ]}
      />

      <Divider />

      <Title level={4}>⚠️ Lưu Ý Quan Trọng</Title>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Alert
          message="Trạng thái lịch hẹn"
          description={
            <Space direction="vertical" size="small" style={{ marginTop: 8 }}>
              <div>
                <Tag color="orange">PENDING_SCHEDULE</Tag>
                <Text>Chờ xếp lịch - cần phân công ngày giờ và bác sĩ</Text>
              </div>
              <div>
                <Tag color="purple">PENDING_APPROVAL</Tag>
                <Text>Chờ phê duyệt - có yêu cầu đổi lịch cần xử lý</Text>
              </div>
              <div>
                <Tag color="blue">SCHEDULED</Tag>
                <Text>Đã xếp lịch - sẵn sàng thực hiện</Text>
              </div>
              <div>
                <Tag color="green">COMPLETED</Tag>
                <Text>Đã hoàn thành</Text>
              </div>
              <div>
                <Tag color="red">CANCELLED</Tag>
                <Text>Đã hủy</Text>
              </div>
            </Space>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Alert
          message="Tự động làm mới"
          description="Danh sách lịch hẹn cần xử lý gấp sẽ tự động làm mới mỗi 2 phút. Bạn cũng có thể nhấn nút 'Làm mới' để cập nhật ngay."
          type="success"
          showIcon
          icon={<ThunderboltOutlined />}
        />
      </Space>
    </Card>
  );
};

export default UrgencyGuide;
