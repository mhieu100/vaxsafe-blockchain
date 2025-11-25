import { CheckSquareOutlined } from '@ant-design/icons';
import {
  FooterToolbar,
  ModalForm,
  ProCard,
  ProFormDigit,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Col, Form, message, notification, Row } from 'antd';
import { useEffect, useState } from 'react';

import { callCreateVaccine, callUpdateVaccine } from '../../config/api.vaccine';

import '../../styles/reset.scss';

const ModalVaccine = (props) => {
  const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
  const [form] = Form.useForm();
  const [value, setValue] = useState('');
  const [animation, setAnimation] = useState('open');

  const handleReset = async () => {
    form.resetFields();
    setValue('');
    setDataInit(null);

    setAnimation('close');
    await new Promise((r) => setTimeout(r, 400));
    setOpenModal(false);
    setAnimation('open');
  };

  const submitVaccine = async (valuesForm) => {
    const {
      name,
      manufacturer,
      country,
      image,
      price,
      stock,
      descriptionShort,
      description,
      dosesRequired,
      duration,
      injection,
      preserve,
      contraindications,
    } = valuesForm;

    // Prepare data matching backend VaccineRequest
    // Slug will be auto-generated in backend from name
    const vaccineData = {
      name,
      manufacturer,
      country,
      image: image || '',
      price: parseInt(price, 10),
      stock: parseInt(stock, 10),
      descriptionShort: descriptionShort || '',
      description: description || value,
      dosesRequired: parseInt(dosesRequired, 10),
      duration: parseInt(duration, 10),
      injection: injection || [],
      preserve: preserve || [],
      contraindications: contraindications || [],
    };

    if (dataInit?.id) {
      const res = await callUpdateVaccine(dataInit.id, vaccineData);
      if (res.data) {
        message.success('Cập nhật vaccine thành công');
        handleReset();
        reloadTable();
      } else {
        notification.error({
          message: 'Đã xảy ra lỗi',
          description: res.message,
        });
      }
    } else {
      const res = await callCreateVaccine(vaccineData);
      if (res.data) {
        message.success('Tạo vaccine thành công');
        handleReset();
        reloadTable();
      } else {
        notification.error({
          message: 'Đã xảy ra lỗi',
          description: res.message,
        });
      }
    }
  };

  useEffect(() => {
    if (openModal && dataInit?.id) {
      // Set form values when editing
      form.setFieldsValue({
        ...dataInit,
      });
      setValue(dataInit.description || '');
    } else if (openModal && !dataInit) {
      // Reset form when creating new
      form.resetFields();
      setValue('');
    }
  }, [dataInit, openModal, form]);

  return (
    <>
      {openModal && (
        <ModalForm
          title={dataInit?.id ? 'Cập nhật Vaccine' : 'Tạo mới Vaccine'}
          open={openModal}
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
            width: 900,
          }}
          scrollToFirstError={true}
          preserve={false}
          form={form}
          onFinish={submitVaccine}
          submitter={{
            render: (_, dom) => <FooterToolbar>{dom}</FooterToolbar>,
            submitButtonProps: {
              icon: <CheckSquareOutlined />,
            },
            searchConfig: {
              resetText: 'Hủy',
              submitText: <>{dataInit?.id ? 'Cập nhật' : 'Tạo mới'}</>,
            },
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <ProFormText
                label="Tên vaccine"
                name="name"
                rules={[{ required: true, message: 'Vui lòng không để trống' }]}
                placeholder="Nhập tên vaccine..."
              />
            </Col>
            <Col span={12}>
              <ProFormText
                label="Nhà sản xuất"
                name="manufacturer"
                rules={[{ required: true, message: 'Vui lòng không để trống' }]}
                placeholder="Nhà sản xuất..."
              />
            </Col>
            <Col span={12}>
              <ProFormText
                label="Quốc gia"
                name="country"
                rules={[{ required: true, message: 'Vui lòng không để trống' }]}
                placeholder="Quốc gia sản xuất..."
              />
            </Col>
            <Col span={12}>
              <ProFormText label="Hình ảnh (URL)" name="image" placeholder="URL hình ảnh..." />
            </Col>
            <Col span={12}>
              <ProFormDigit
                label="Giá (VNĐ)"
                name="price"
                rules={[{ required: true, message: 'Vui lòng không để trống' }]}
                placeholder="Giá..."
                fieldProps={{
                  formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                  parser: (value) => value.replace(/\$\s?|(,*)/g, ''),
                }}
              />
            </Col>
            <Col span={12}>
              <ProFormDigit
                label="Số lượng tồn kho"
                name="stock"
                min={0}
                rules={[{ required: true, message: 'Vui lòng không để trống' }]}
                placeholder="Số lượng..."
              />
            </Col>
            <Col span={12}>
              <ProFormDigit
                label="Số liều cần thiết"
                name="dosesRequired"
                min={1}
                rules={[{ required: true, message: 'Vui lòng không để trống' }]}
                placeholder="Số liều..."
              />
            </Col>
            <Col span={24}>
              <ProFormDigit
                label="Thời hạn hiệu lực (ngày)"
                name="duration"
                min={0}
                rules={[{ required: true, message: 'Vui lòng không để trống' }]}
                placeholder="Số ngày hiệu lực..."
              />
            </Col>

            <ProCard
              title="Mô tả ngắn"
              headStyle={{ color: '#d81921' }}
              style={{ marginBottom: 20 }}
              headerBordered
              size="small"
              bordered
            >
              <Col span={24}>
                <ProFormTextArea
                  name="descriptionShort"
                  placeholder="Nhập mô tả ngắn gọn..."
                  rows={3}
                />
              </Col>
            </ProCard>

            <ProCard
              title="Mô tả chi tiết"
              headStyle={{ color: '#d81921' }}
              style={{ marginBottom: 20 }}
              headerBordered
              size="small"
              bordered
            >
              <Col span={24}>
                <ProFormTextArea
                  name="description"
                  placeholder="Nhập mô tả chi tiết vaccine..."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  rows={6}
                />
              </Col>
            </ProCard>
          </Row>
        </ModalForm>
      )}
    </>
  );
};

export default ModalVaccine;
