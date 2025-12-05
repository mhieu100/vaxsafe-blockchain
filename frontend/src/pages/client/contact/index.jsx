import {
  EnvironmentFilled,
  GlobalOutlined,
  PhoneOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Empty, Input, List, Row, Select, Skeleton, Typography } from 'antd';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { callFetchCenter } from '@/services/center.service';

// Create custom icon
const createCustomIcon = () => {
  const iconMarkup = renderToStaticMarkup(
    <div
      style={{
        color: '#1890ff',
        fontSize: '24px',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
      }}
    >
      <EnvironmentFilled />
    </div>
  );

  return L.divIcon({
    html: iconMarkup,
    className: 'custom-marker-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

const customIcon = createCustomIcon();

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Component to update map view when center changes
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center?.latitude && center.longitude) {
      map.setView([center.latitude, center.longitude], 15);
    }
  }, [center, map]);
  return null;
};

const ContactPage = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [filterCity, setFilterCity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Default center (Hanoi)
  const defaultPosition = [21.0285, 105.8542];

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const res = await callFetchCenter('size=100'); // Fetch all centers
      if (res?.data?.result) {
        // Mock coordinates if missing (for demo purposes)
        const centersWithCoords = res.data.result.map((c, index) => ({
          ...c,
          latitude: c.latitude || 21.0285 + (Math.random() - 0.5) * 0.1,
          longitude: c.longitude || 105.8542 + (Math.random() - 0.5) * 0.1,
          city: index % 2 === 0 ? 'Hanoi' : 'Ho Chi Minh', // Mock city
        }));
        setCenters(centersWithCoords);
        if (centersWithCoords.length > 0) {
          setSelectedCenter(centersWithCoords[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCenters = centers.filter((center) => {
    const matchCity = filterCity === 'all' || center.city === filterCity;
    const matchSearch =
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCity && matchSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <section className="bg-blue-50 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 py-8 mb-8 rounded-xl mt-6 shadow-sm">
            <div className="container mx-auto px-4 text-center">
              <Title level={2} className="text-blue-700 uppercase mb-2">
                Tra cứu trung tâm tiêm chủng VaxSafe gần nhất!
              </Title>
              <Text type="secondary">
                Tìm kiếm địa điểm tiêm chủng thuận tiện nhất cho bạn và gia đình.
              </Text>
            </div>
          </div>

          <div className="container mx-auto px-4 pb-12">
            <Row gutter={[24, 24]}>
              {/* Left Column: List & Filter */}
              <Col xs={24} lg={8}>
                <Card className="shadow-sm rounded-xl border-0 h-full flex flex-col">
                  <div className="mb-4 space-y-3">
                    <Select
                      defaultValue="all"
                      style={{ width: '100%' }}
                      onChange={(value) => setFilterCity(value)}
                      size="large"
                    >
                      <Option value="all">Tất cả tỉnh thành</Option>
                      <Option value="Hanoi">Hà Nội</Option>
                      <Option value="Ho Chi Minh">TP. Hồ Chí Minh</Option>
                    </Select>
                    <Input
                      placeholder="Tìm theo tên, địa chỉ..."
                      prefix={<SearchOutlined />}
                      size="large"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                    {loading ? (
                      <Skeleton active paragraph={{ rows: 5 }} />
                    ) : filteredCenters.length > 0 ? (
                      <List
                        dataSource={filteredCenters}
                        renderItem={(item) => (
                          <button
                            type="button"
                            tabIndex={0}
                            className={`p-4 mb-3 rounded-lg border cursor-pointer transition-all ${
                              selectedCenter?.centerId === item.centerId
                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedCenter(item)}
                            onKeyDown={(e) => e.key === 'Enter' && setSelectedCenter(item)}
                          >
                            <Text strong className="text-blue-700 block text-lg mb-1">
                              {item.name}
                            </Text>
                            <Paragraph className="text-gray-600 text-sm mb-2">
                              {item.address}
                            </Paragraph>
                            <div className="flex items-center justify-between mt-2">
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  item.address
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 text-xs hover:underline flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <GlobalOutlined /> Xem trên Google Maps
                              </a>
                              <Button
                                size="small"
                                type="primary"
                                ghost
                                icon={<EnvironmentFilled />}
                                onClick={() => setSelectedCenter(item)}
                              >
                                Tìm trên bản đồ
                              </Button>
                            </div>
                          </button>
                        )}
                      />
                    ) : (
                      <Empty description="Không tìm thấy trung tâm nào" />
                    )}
                  </div>
                </Card>
              </Col>

              {/* Right Column: Map */}
              <Col xs={24} lg={16}>
                <Card
                  className="shadow-sm rounded-xl border-0 h-[700px] overflow-hidden relative"
                  styles={{ body: { height: '100%', padding: 0 } }}
                >
                  <MapContainer
                    center={defaultPosition}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {selectedCenter && <MapUpdater center={selectedCenter} />}

                    {filteredCenters.map((center) => (
                      <Marker
                        key={center.centerId}
                        position={[
                          center.latitude || defaultPosition[0],
                          center.longitude || defaultPosition[1],
                        ]}
                        icon={customIcon}
                        eventHandlers={{
                          click: () => {
                            setSelectedCenter(center);
                          },
                        }}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-bold text-blue-700 mb-1">{center.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{center.address}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <PhoneOutlined /> {center.phoneNumber}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>

                  {/* Floating Info Card for Selected Center on Map (Mobile friendly) */}
                  {selectedCenter && (
                    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white p-4 rounded-xl shadow-lg z-[1000] border border-gray-100 animate-fade-in-up">
                      <h3 className="font-bold text-blue-700 text-lg mb-1">
                        {selectedCenter.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">{selectedCenter.address}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <PhoneOutlined className="text-blue-500" />
                          <span className="font-medium">{selectedCenter.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          <span className="text-green-600 font-medium">
                            {selectedCenter.workingHours}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
