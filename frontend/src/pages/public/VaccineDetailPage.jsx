import { HomeOutlined, MenuOutlined } from '@ant-design/icons';
import { Breadcrumb, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DescriptionVaccineSection from '../../components/vaccine-detail/DescriptionVaccineSection';
import VaccineInfoSection from '../../components/vaccine-detail/VaccineInfoSection';
import { callGetBySlug } from '../../services/vaccine.service';

const VaccineDetailPage = () => {
  const navigate = useNavigate();
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
        // Error loading vaccine
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
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      <div className="mb-6">
        <Breadcrumb
          className="cursor-pointer"
          items={[
            {
              title: <HomeOutlined />,
              onClick: () => navigate('/'),
            },
            {
              title: <MenuOutlined />,
              onClick: () => navigate('/vaccine'),
            },
            {
              title: vaccine?.name,
            },
          ]}
        />
      </div>
      {vaccine && (
        <>
          <VaccineInfoSection vaccine={vaccine} />
          <DescriptionVaccineSection vaccine={vaccine} />
        </>
      )}
    </div>
  );
};

export default VaccineDetailPage;
