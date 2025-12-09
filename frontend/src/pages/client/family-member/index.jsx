import { Card, Col, Empty, Row, Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  callGetFamilyBookingHistoryGrouped, // Updated import
  callGetFamilyMemberDetail,
} from '@/services/family.service';
import FamilyMemberSidebar from './components/FamilyMemberSidebar';
import FamilyMemberTabs from './components/FamilyMemberTabs';

const FamilyMemberPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { familyMemberId: stateId } = location.state || {};
  const familyMemberId = id || stateId;

  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    if (!familyMemberId) {
      navigate('/profile');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [memberRes, historyRes] = await Promise.all([
          callGetFamilyMemberDetail(familyMemberId),
          callGetFamilyBookingHistoryGrouped(familyMemberId), // Updated call
        ]);

        if (memberRes.data) {
          setMember(memberRes.data);
        }

        if (historyRes.data) {
          setHistory(historyRes.data);
        }
      } catch (error) {
        console.error('Fetch error', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [familyMemberId, navigate]);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={6}>
              <Card className="rounded-3xl shadow-sm border border-slate-100 h-[400px]">
                <div className="flex flex-col items-center p-6 space-y-6">
                  <Skeleton.Avatar active size={80} shape="circle" />
                  <div className="w-full space-y-4">
                    <Skeleton
                      active
                      paragraph={{ rows: 2 }}
                      title={{ width: '60%', className: 'mx-auto' }}
                    />
                    <Skeleton active paragraph={{ rows: 3 }} title={false} />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={18}>
              <div className="space-y-6">
                <Row gutter={[24, 24]}>
                  {[1, 2, 3].map((i) => (
                    <Col xs={24} md={8} key={i}>
                      <Card className="rounded-2xl shadow-sm border border-slate-100 h-32 flex items-center">
                        <Skeleton active paragraph={{ rows: 1 }} title={{ width: 100 }} />
                      </Card>
                    </Col>
                  ))}
                </Row>
                <Card className="rounded-3xl shadow-sm border border-slate-100 h-[400px]">
                  <div className="p-6">
                    <Skeleton active paragraph={{ rows: 6 }} />
                  </div>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }

  if (!member) return <Empty description="Member not found" />;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={6}>
            <FamilyMemberSidebar
              member={member}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </Col>

          <Col xs={24} lg={18}>
            <FamilyMemberTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              member={member}
              history={history}
              familyMemberId={familyMemberId}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default FamilyMemberPage;
