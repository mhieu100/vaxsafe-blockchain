import {
    BlockOutlined,
    CodeSandboxOutlined,
    DatabaseOutlined,
    DeploymentUnitOutlined,
    FileTextOutlined,
    MedicineBoxOutlined,
    ReloadOutlined,
    SafetyCertificateOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Badge,
    Button,
    Card,
    Col,
    List,
    Row,
    Space,
    Statistic,
    Tabs,
    Tag,
    Typography,
    message,
} from 'antd';
import { useEffect, useState } from 'react';
import socketService from '@/services/socket.service';

const { Title, Text } = Typography;

const MonitorPage = () => {
    const [connected, setConnected] = useState(false);
    const [stats, setStats] = useState({
        totalBlocks: 0,
        lastBlockNumber: '-',
        totalTransactions: 0,
        totalIdentities: 0,
        totalVaccineRecords: 0,
        connectedClients: 0,
    });

    const [blocks, setBlocks] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const socket = socketService.connect();

        const handleConnect = () => {
            setConnected(true);
            socketService.getStats();
            message.success('Connected to Blockchain Monitor');
        };

        const handleDisconnect = () => {
            setConnected(false);
            message.error('Disconnected from Blockchain Monitor');
        };

        const handleStats = (newStats) => {
            setStats(newStats);
        };

        const handleNewBlock = (block) => {
            setBlocks((prev) => {
                const exists = prev.some(
                    (b) => b.number === block.number && b.hash === block.hash
                );
                if (exists) return prev;
                const newList = [block, ...prev];
                return newList.slice(0, 20);
            });
        };

        const handleTransaction = (tx) => {
            setTransactions((prev) => {
                const newList = [tx, ...prev];
                return newList.slice(0, 20);
            });
        };

        const handleEvent = (event) => {
            setEvents((prev) => {
                const newList = [event, ...prev];
                return newList.slice(0, 20);
            });
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socketService.onBlockchainStats(handleStats);
        socketService.onNewBlock(handleNewBlock);
        socketService.onContractTransaction(handleTransaction);
        socketService.onContractEvent(handleEvent);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socketService.offBlockchainStats(handleStats);
            socketService.offNewBlock(handleNewBlock);
            socketService.offContractTransaction(handleTransaction);
            socketService.offContractEvent(handleEvent);
            socketService.disconnect();
        };
    }, []);

    const handleRefresh = () => {
        socketService.getStats();
        message.info('Refreshing stats...');
    };

    const handleClear = () => {
        setBlocks([]);
        setTransactions([]);
        setEvents([]);
        message.info('Events cleared');
    };

    const getEventIcon = (eventType) => {
        const icons = {
            IdentityCreated: <UserOutlined />,
            DocumentLinked: <FileTextOutlined />,
            RecordCreated: <MedicineBoxOutlined />,
            RecordIPFSUpdated: <ReloadOutlined />,
        };
        return icons[eventType] || <DeploymentUnitOutlined />;
    };

    const formatEventDetails = (event) => {
        const { data, type } = event;
        if (type === 'IdentityCreated') {
            return (
                <Space direction="vertical" size={0}>
                    <Text>
                        <strong>Identity Hash:</strong> {data.identityHash}
                    </Text>
                    <Text>
                        <strong>DID:</strong> {data.did}
                    </Text>
                    <Text>
                        <strong>Type:</strong> {data.idType}
                    </Text>
                </Space>
            );
        }
        if (type === 'RecordCreated') {
            return (
                <Space direction="vertical" size={0}>
                    <Text>
                        <strong>Record ID:</strong> {data.recordId}
                    </Text>
                    <Text>
                        <strong>Vaccine:</strong> {data.vaccineName} (Dose #{data.doseNumber})
                    </Text>
                    <Text>
                        <strong>Site:</strong> {data.site}
                    </Text>
                </Space>
            );
        }
        return <Text code>{JSON.stringify(data)}</Text>;
    };

    const items = [
        {
            key: 'blocks',
            label: 'New Blocks',
            children: (
                <List
                    dataSource={blocks}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <BlockOutlined className="text-blue-500 text-xl" />
                                    </div>
                                }
                                title={
                                    <Space>
                                        <Text strong>Block #{item.number}</Text>
                                        <Tag color="success">{item.transactionCount} txs</Tag>
                                    </Space>
                                }
                                description={
                                    <Space direction="vertical" size={0}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {new Date(item.timestamp).toLocaleString()}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            Hash: {item.hash.substring(0, 20)}...
                                        </Text>
                                    </Space>
                                }
                            />
                        </List.Item>
                    )}
                    locale={{ emptyText: 'Waiting for new blocks...' }}
                />
            ),
        },
        {
            key: 'transactions',
            label: 'Transactions',
            children: (
                <List
                    dataSource={transactions}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={
                                    <div className="p-2 bg-green-50 rounded-lg">
                                        <CodeSandboxOutlined className="text-green-500 text-xl" />
                                    </div>
                                }
                                title={
                                    <Space>
                                        <Text strong>Transaction</Text>
                                        {item.contractType && (
                                            <Tag color="blue">{item.contractType}</Tag>
                                        )}
                                        <Tag color={item.status ? 'success' : 'error'}>
                                            {item.status ? 'Success' : 'Failed'}
                                        </Tag>
                                    </Space>
                                }
                                description={
                                    <Space direction="vertical" size={0}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {new Date(item.timestamp).toLocaleString()}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            Hash: {item.hash.substring(0, 20)}...
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            From: {item.from.substring(0, 20)}...
                                        </Text>
                                    </Space>
                                }
                            />
                        </List.Item>
                    )}
                    locale={{ emptyText: 'Waiting for transactions...' }}
                />
            ),
        },
        {
            key: 'events',
            label: 'Contract Events',
            children: (
                <List
                    dataSource={events}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={
                                    <div className="p-2 bg-purple-50 rounded-lg">
                                        <span className="text-purple-500 text-xl">
                                            {getEventIcon(item.type)}
                                        </span>
                                    </div>
                                }
                                title={
                                    <Space>
                                        <Text strong>{item.type}</Text>
                                        {item.contract && <Tag color="purple">{item.contract}</Tag>}
                                    </Space>
                                }
                                description={
                                    <Space direction="vertical" size={4}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            Block #{item.blockNumber}
                                        </Text>
                                        <div className="bg-gray-50 p-2 rounded text-xs">
                                            {formatEventDetails(item)}
                                        </div>
                                    </Space>
                                }
                            />
                        </List.Item>
                    )}
                    locale={{ emptyText: 'Waiting for contract events...' }}
                />
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={2} style={{ marginBottom: 0 }}>
                        Blockchain Monitor
                    </Title>
                    <Text type="secondary">Real-time monitoring of Ganache blockchain</Text>
                </div>
                <Space>
                    <Badge
                        status={connected ? 'success' : 'error'}
                        text={connected ? 'Connected' : 'Disconnected'}
                    />
                    <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                        Refresh
                    </Button>
                    <Button onClick={handleClear}>Clear Events</Button>
                </Space>
            </div>

            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Total Blocks"
                            value={stats.totalBlocks}
                            prefix={<BlockOutlined />}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Last: #{stats.lastBlockNumber}
                        </Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={5}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Total Transactions"
                            value={stats.totalTransactions}
                            prefix={<CodeSandboxOutlined />}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            On-chain transactions
                        </Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={5}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Total Identities"
                            value={stats.totalIdentities}
                            prefix={<UserOutlined />}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            VaxSafe identities
                        </Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={5}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Vaccine Records"
                            value={stats.totalVaccineRecords}
                            prefix={<MedicineBoxOutlined />}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Records on blockchain
                        </Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={5}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Connected Clients"
                            value={stats.connectedClients}
                            prefix={<DeploymentUnitOutlined />}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Active connections
                        </Text>
                    </Card>
                </Col>
            </Row>

            <Row gutter={24}>
                <Col span={24}>
                    <Card
                        title={
                            <Space>
                                <DatabaseOutlined />
                                <span>Live Events</span>
                            </Space>
                        }
                        bordered={false}
                        className="shadow-sm"
                    >
                        <Tabs defaultActiveKey="blocks" items={items} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default MonitorPage;
