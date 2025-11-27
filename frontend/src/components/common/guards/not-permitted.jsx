import { Button, Result } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const NotPermitted = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <Result
      status="403"
      title={t('errors.403.title')}
      subTitle={t('errors.403.subtitle')}
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          {t('errors.403.backHome')}
        </Button>
      }
    />
  );
};

export default NotPermitted;
