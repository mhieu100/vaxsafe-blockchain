import { CloudUploadOutlined, RobotOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Input, List, message, Space, Typography } from 'antd';
import { useState } from 'react';
import ragService from '@/services/rag.service';

const { TextArea } = Input;
const { Title, Text } = Typography;

const AiKnowledgePage = () => {
  const [ingestText, setIngestText] = useState('');
  const [loadingIngest, setLoadingIngest] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const handleIngest = async () => {
    if (!ingestText.trim()) {
      message.warning('Please enter some text to ingest.');
      return;
    }

    const documents = ingestText.split('\n').filter((line) => line.trim() !== '');

    if (documents.length === 0) return;

    setLoadingIngest(true);
    try {
      await ragService.ingest(documents);
      message.success(`Successfully ingested ${documents.length} documents.`);
      setIngestText('');
    } catch (error) {
      console.error(error);
      message.error('Failed to ingest documents.');
    } finally {
      setLoadingIngest(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoadingSearch(true);
    try {
      const results = await ragService.search(searchQuery);
      setSearchResults(results || []);
    } catch (error) {
      console.error(error);
      message.error('Failed to search documents.');
    } finally {
      setLoadingSearch(false);
    }
  };

  const [loadingSync, setLoadingSync] = useState(false);

  const handleSync = async () => {
    setLoadingSync(true);
    try {
      const response = await ragService.sync();
      message.success(response || 'Successfully synced vaccines from database.');
    } catch (error) {
      console.error(error);
      message.error('Failed to sync vaccines.');
    } finally {
      setLoadingSync(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>
          <RobotOutlined className="mr-2" /> AI Knowledge Base
        </Title>
        <Text type="secondary">
          Manage the knowledge base for the AI Chatbot. Ingest new information and verify retrieval.
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <Card title="Ingest New Knowledge" bordered={false} className="shadow-sm">
          <div className="mb-4">
            <Text type="secondary" className="block mb-2">
              Enter each piece of knowledge on a new line. The AI will use these snippets to answer
              user questions.
            </Text>
            <TextArea
              rows={10}
              value={ingestText}
              onChange={(e) => setIngestText(e.target.value)}
              placeholder="e.g. Hepatitis B vaccine should be given within 24 hours of birth.&#10;Common side effects include mild fever."
              className="mb-4"
            />
            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              onClick={handleIngest}
              loading={loadingIngest}
              block
            >
              Ingest Data
            </Button>
          </div>
        </Card>

        {}
        <Card title="Test Retrieval (Search)" bordered={false} className="shadow-sm">
          <div className="mb-4">
            <Text type="secondary" className="block mb-2">
              Test if the AI can find the relevant information for a given query.
            </Text>
            <Space.Compact style={{ width: '100%' }} className="mb-4">
              <Input
                placeholder="Enter search query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onPressEnter={handleSearch}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={loadingSearch}
              >
                Search
              </Button>
            </Space.Compact>

            <Divider orientation="left">Results</Divider>

            <List
              bordered
              dataSource={searchResults}
              renderItem={(item) => (
                <List.Item>
                  <Text>{item}</Text>
                </List.Item>
              )}
              locale={{ emptyText: 'No relevant documents found.' }}
              className="max-h-[400px] overflow-y-auto"
            />
          </div>
        </Card>

        {}
        <Card
          title="Database Synchronization"
          bordered={false}
          className="shadow-sm md:col-span-2 lg:col-span-1"
        >
          <div className="mb-4">
            <Text type="secondary" className="block mb-4">
              Automatically sync vaccine data from the main database to the AI Knowledge Base. This
              ensures the chatbot has the latest vaccine information.
            </Text>
            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              onClick={handleSync}
              loading={loadingSync}
              block
              className="bg-green-600 hover:bg-green-500"
            >
              Sync Vaccines from DB
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AiKnowledgePage;
