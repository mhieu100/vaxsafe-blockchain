import {
  ModalForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormTimePicker,
} from '@ant-design/pro-components';
import { Col, Form, Row } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccountStore } from '../../stores/useAccountStore';

import '../../styles/reset.scss';

import { callAddAppointmentMetaMark } from '../../config/api.appointment';
import { callFetchCenter } from '../../config/api.center';

const ModalOrder = (props) => {
  const _navigate = useNavigate();
  const [displayCenter, setDisplayCenter] = useState(null);
  const [animation, setAnimation] = useState('open');
  const { openModal, setOpenModal, vaccine } = props;
  const [form] = Form.useForm();
  const user = useAccountStore((state) => state.user);

  const handleReset = async () => {
    form.resetFields();

    setAnimation('close');
    await new Promise((r) => setTimeout(r, 400));
    setOpenModal(false);
    setAnimation('open');
  };

  const submitOrder = async (valuesForm) => {
    const { date, time, center, paymentType } = valuesForm;

    if (paymentType === 'METAMASK') {
      const res = await callAddAppointmentMetaMark(vaccine.vaccineId, user.id, center, date, time);
      console.log(res);
    }
  };

  const paymentType = [{ type: 'METAMASK', name: 'MetaMask' }];

  useEffect(() => {
    fetchCenter();
  }, [fetchCenter]);

  const fetchCenter = async () => {
    const res = await callFetchCenter();
    if (res?.data) {
      setDisplayCenter(res.data.result);
    }
  };

  return (
    <>
      {openModal && (
        <ModalForm
          title="Book Vaccination Appointment"
          open={openModal}
          scrollToFirstError={true}
          preserve={false}
          form={form}
          submitter={{
            searchConfig: {
              submitText: 'Book Appointment',
              resetText: 'Cancel',
            },
          }}
          onFinish={submitOrder}
          modalProps={{
            onCancel: () => {
              handleReset();
            },
            afterClose: () => handleReset(),
            destroyOnClose: true,
            footer: null,
            keyboard: false,
            maskClosable: false,
            className: `modal-company ${animation}`,
            rootClassName: `modal-company-root ${animation}`,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <ProFormDatePicker
                colProps={{ xl: 12, md: 24 }}
                width="md"
                label="Vaccination Date"
                name="date"
                placeholder="Select vaccination date"
                rules={[
                  {
                    required: true,
                    message: 'Please select a vaccination date!',
                  },
                  {
                    validator: (_, value) => {
                      if (value?.isBefore(new Date(), 'day')) {
                        return Promise.reject('Vaccination date cannot be in the past!');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              />
            </Col>
            <Col span={12}>
              <ProFormTimePicker
                colProps={{ xl: 12, md: 24 }}
                width="md"
                label="Vaccination Time"
                name="time"
                placeholder="Select vaccination time"
                fieldProps={{
                  format: 'HH:mm',
                }}
                rules={[
                  {
                    required: true,
                    message: 'Please select a vaccination time!',
                  },
                ]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                colProps={{ xl: 12, md: 24 }}
                width="md"
                name="center"
                label="Vaccination Center"
                placeholder="Select vaccination center"
                rules={[
                  {
                    required: true,
                    message: 'Please select a vaccination location!',
                  },
                ]}
                options={displayCenter?.map((center) => {
                  return {
                    label: center.name,
                    value: center.centerId,
                  };
                })}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                colProps={{ xl: 12, md: 24 }}
                width="md"
                name="paymentType"
                label="Payment Method"
                placeholder="Select payment method"
                rules={[
                  {
                    required: true,
                    message: 'Please select a payment method!',
                  },
                ]}
                options={paymentType?.map((item) => {
                  return {
                    label: item.name,
                    value: item.type,
                  };
                })}
              />
            </Col>
          </Row>
        </ModalForm>
      )}
    </>
  );
};
export default ModalOrder;
