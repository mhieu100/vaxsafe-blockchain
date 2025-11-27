import { Button, Result } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <Result
      status="404"
      title={t('errors.404.title')}
      subTitle={t('errors.404.subtitle')}
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          {t('errors.404.backHome')}
        </Button>
      }
    />
  );
};

export default NotFound;
