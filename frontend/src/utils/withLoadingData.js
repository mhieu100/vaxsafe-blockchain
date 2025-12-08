import { message } from 'antd';
import { useState } from 'react';

const useLoadingData = (
  fetchFunction,
  {
    onSuccess = () => {},
    onError = () => {},
    errorMessage = 'Không thể tải dữ liệu',
    timeout = 1000,
  } = {}
) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const fetchData = async (...args) => {
    try {
      setLoading(true);

      const startTime = Date.now();

      const result = await fetchFunction(...args);

      const fetchTime = Date.now() - startTime;

      if (fetchTime < timeout) {
        await new Promise((resolve) => setTimeout(resolve, timeout - fetchTime));
      }

      setData(result);

      onSuccess(result);

      return result;
    } catch (error) {
      message.error(error?.message || errorMessage);

      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    data,
    fetchData,
  };
};

export default useLoadingData;
