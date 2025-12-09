import {
  ClockCircleOutlined,
  EnvironmentFilled,
  GlobalOutlined,
  PhoneOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Empty, Input, Row, Skeleton, Tag, Typography } from 'antd';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { callFetchCenter } from '@/services/center.service';

const createCustomIcon = () => {
  const iconMarkup = renderToStaticMarkup(
    <div
      style={{
        color: '#1890ff',
        fontSize: '32px',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
      }}
    >
      <EnvironmentFilled />
    </div>
  );

  return L.divIcon({
    html: iconMarkup,
    className: 'custom-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const customIcon = createCustomIcon();

const { Title, Text } = Typography;

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center?.latitude && center.longitude) {
      map.setView([center.latitude, center.longitude], 15, {
        animate: true,
      });
    }
  }, [center, map]);
  return null;
};

const ContactPage = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Default to Da Nang coordinates
  const defaultPosition = [16.0544, 108.2022];

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const res = await callFetchCenter('size=100');
      if (res?.data?.result) {
        setCenters(res.data.result);
        if (res.data.result.length > 0) {
          setSelectedCenter(res.data.result[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCenters = centers.filter((center) => {
    const term = searchTerm.toLowerCase();
    return (
      center.name?.toLowerCase().includes(term) || center.address?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <section className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Title level={2} className="text-blue-700 uppercase mb-2">
              Hệ thống trung tâm tiêm chủng
            </Title>
            <Text className="text-gray-500 text-lg">
              Tra cứu địa điểm, số điện thoại và giờ làm việc của các trung tâm gần bạn
            </Text>
          </div>
        </div>
      </section>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Row gutter={[24, 24]} className="h-[calc(100vh-250px)] min-h-[600px]">
          {/* Sidebar List */}
          <Col xs={24} lg={8} className="h-full flex flex-col">
            <Card
              className="shadow-md rounded-xl border-0 h-full flex flex-col overflow-hidden"
              bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <div className="p-4 border-b border-gray-100 bg-white z-10">
                <Input
                  placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  size="large"
                  className="rounded-lg"
                  allowClear
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="mt-2 text-xs text-gray-400">
                  Tìm thấy {filteredCenters.length} trung tâm
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-gray-50">
                {loading ? (
                  <div className="p-4">
                    <Skeleton active avatar paragraph={{ rows: 3 }} />
                    <Skeleton active avatar paragraph={{ rows: 3 }} className="mt-4" />
                    <Skeleton active avatar paragraph={{ rows: 3 }} className="mt-4" />
                  </div>
                ) : filteredCenters.length > 0 ? (
                  <div className="space-y-3">
                    {filteredCenters.map((item) => (
                      <div
                        key={item.centerId}
                        className={`bg-white p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                          selectedCenter?.centerId === item.centerId
                            ? 'border-blue-500 ring-1 ring-blue-500 shadow-sm'
                            : 'border-gray-100'
                        }`}
                        onClick={() => setSelectedCenter(item)}
                      >
                        <div className="flex gap-3">
                          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/64?text=Center';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <EnvironmentFilled style={{ fontSize: '24px' }} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`font-bold text-base truncate mb-1 ${selectedCenter?.centerId === item.centerId ? 'text-blue-600' : 'text-gray-800'}`}
                            >
                              {item.name}
                            </h4>
                            <p className="text-gray-500 text-sm line-clamp-2 mb-2">
                              {item.address}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {item.workingHours && (
                                <Tag
                                  icon={<ClockCircleOutlined />}
                                  color="default"
                                  className="text-xs m-0 border-0 bg-gray-100 text-gray-600"
                                >
                                  {item.workingHours}
                                </Tag>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
                    <Empty description="Không tìm thấy trung tâm nào phù hợp" />
                  </div>
                )}
              </div>
            </Card>
          </Col>

          {/* Map Section */}
          <Col xs={24} lg={16} className="h-full">
            <Card
              className="shadow-md rounded-xl border-0 h-full overflow-hidden relative"
              bodyStyle={{ height: '100%', padding: 0 }}
            >
              <div className="absolute inset-0 z-0">
                <MapContainer
                  center={defaultPosition}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {selectedCenter && <MapUpdater center={selectedCenter} />}

                  {filteredCenters.map(
                    (center) =>
                      center.latitude &&
                      center.longitude && (
                        <Marker
                          key={center.centerId}
                          position={[center.latitude, center.longitude]}
                          icon={customIcon}
                          eventHandlers={{
                            click: () => {
                              setSelectedCenter(center);
                            },
                          }}
                        >
                          {/* Removing Popup here to avoid clutter, using the overlay card instead */}
                        </Marker>
                      )
                  )}
                </MapContainer>
              </div>

              {/* Overlay Selected Center Info */}
              {selectedCenter && (
                <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-white rounded-xl shadow-2xl z-[1000] border border-gray-100 overflow-hidden animate-fade-in-up">
                  <div className="relative h-32 bg-gray-100">
                    {selectedCenter.image ? (
                      <img
                        src={selectedCenter.image}
                        alt={selectedCenter.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200">
                        <EnvironmentFilled style={{ fontSize: '48px' }} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Tag color="blue" className="m-0 shadow-sm border-0 font-semibold">
                        Đang hoạt động
                      </Tag>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-blue-800 text-xl mb-2">{selectedCenter.name}</h3>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-3">
                        <EnvironmentFilled className="text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-gray-600 font-medium text-sm leading-tight">
                          {selectedCenter.address}
                        </span>
                      </div>

                      {selectedCenter.phoneNumber && (
                        <div className="flex items-center gap-3">
                          <PhoneOutlined className="text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 font-semibold">
                            {selectedCenter.phoneNumber}
                          </span>
                        </div>
                      )}

                      {selectedCenter.workingHours && (
                        <div className="flex items-center gap-3">
                          <ClockCircleOutlined className="text-orange-500 flex-shrink-0" />
                          <span className="text-gray-600 text-sm">
                            {selectedCenter.workingHours}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                      <Button
                        type="primary"
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedCenter.name} ${selectedCenter.address}`)}`}
                        target="_blank"
                        icon={<GlobalOutlined />}
                        block
                      >
                        Chỉ đường
                      </Button>
                      <Button
                        block
                        onClick={() =>
                          window.open(`tel:${selectedCenter.phoneNumber?.replace(/\s/g, '')}`)
                        }
                      >
                        Gọi điện
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ContactPage;
