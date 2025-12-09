import { Breadcrumb, Col, Row, Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { callGetBySlug } from '@/services/vaccine.service';
import DescriptionVaccineSection from './components/DescriptionVaccineSection';
import VaccineInfoSection from './components/VaccineInfoSection';

const VaccineDetailPage = () => {
  const { id } = useParams();

  const [vaccine, setVaccine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleGetVaccine = async (slug) => {
      try {
        setLoading(true);
        const response = await callGetBySlug(slug);
        setVaccine(response.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      handleGetVaccine(id);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <section className="bg-blue-50 flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border-b border-gray-100 py-4">
              <Skeleton.Input active size="small" style={{ width: 200 }} />
            </div>

            <div className="container mx-auto px-4 py-8">
              <Row gutter={[48, 32]}>
                <Col xs={24} lg={16}>
                  <div className="mb-6">
                    <Skeleton
                      active
                      paragraph={{ rows: 1 }}
                      title={{ width: '90%', style: { height: 40, marginBottom: 16 } }}
                    />

                    <div className="flex gap-4 mt-4">
                      <Skeleton.Button active size="small" shape="round" style={{ width: 100 }} />
                      <Skeleton.Button active size="small" shape="round" style={{ width: 120 }} />
                      <Skeleton.Button active size="small" shape="round" style={{ width: 80 }} />
                    </div>
                  </div>

                  <div className="w-full aspect-video rounded-xl overflow-hidden mb-8 bg-gray-100">
                    <Skeleton.Image active className="!w-full !h-full" />
                  </div>

                  <Skeleton active paragraph={{ rows: 12 }} />
                </Col>

                <Col xs={24} lg={8}>
                  <div className="space-y-8">
                    <div className="rounded-xl overflow-hidden">
                      <Skeleton.Button active block style={{ height: 300 }} />
                    </div>

                    <div>
                      <Skeleton
                        active
                        paragraph={{ rows: 0 }}
                        title={{ width: 150, style: { marginBottom: 16 } }}
                      />
                      <div className="flex flex-col gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex gap-4">
                            <Skeleton.Image active style={{ width: 96, height: 80 }} />
                            <div className="flex-1">
                              <Skeleton active paragraph={{ rows: 2 }} title={false} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <section className="bg-blue-50 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-100">
            <div className="container mx-auto px-4 py-4">
              <Breadcrumb
                items={[
                  {
                    title: <Link to="/">Home</Link>,
                  },
                  {
                    title: <Link to="/vaccine">Vaccines</Link>,
                  },
                  { title: vaccine?.name },
                ]}
              />
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            {vaccine && (
              <>
                <VaccineInfoSection vaccine={vaccine} />
                <DescriptionVaccineSection vaccine={vaccine} />
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default VaccineDetailPage;
