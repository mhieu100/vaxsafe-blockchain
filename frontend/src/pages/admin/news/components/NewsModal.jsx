import {
  FooterToolbar,
  ModalForm,
  ProCard,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Col, Form, Input, message, notification, Row } from 'antd';
import { useEffect, useState } from 'react';

import { callCreateNews, callGetNewsCategories, callUpdateNews } from '@/services/news.service';

import '@/styles/reset.css';

const { TextArea } = Input;

const ModalNews = (props) => {
  const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
  const [form] = Form.useForm();
  const [animation, setAnimation] = useState('open');
  const [categories, setCategories] = useState([]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await callGetNewsCategories();
        if (res?.data) {
          const categoryOptions = res.data.map((cat) => ({
            label: cat.replace(/_/g, ' '),
            value: cat,
          }));
          setCategories(categoryOptions);
        }
      } catch (_error) {}
    };
    fetchCategories();
  }, []);

  const handleReset = async () => {
    form.resetFields();
    setDataInit(null);

    setAnimation('close');
    await new Promise((r) => setTimeout(r, 400));
    setOpenModal(false);
    setAnimation('open');
  };

  const submitNews = async (valuesForm) => {
    const {
      title,
      shortDescription,
      content,
      category,
      author,
      isFeatured,
      isPublished,
      tags,
      source,
      thumbnailImage,
      coverImage,
    } = valuesForm;

    const newsData = {
      title,
      shortDescription,
      content,
      category,
      author: author || '',
      isFeatured: isFeatured || false,
      isPublished: isPublished || false,
      tags: tags || '',
      source: source || '',
      thumbnailImage: thumbnailImage || '',
      coverImage: coverImage || '',
    };

    if (dataInit?.id) {
      const res = await callUpdateNews(dataInit.id, newsData);
      if (res.data) {
        message.success('Cập nhật tin tức thành công');
        handleReset();
        reloadTable();
      } else {
        notification.error({
          message: 'Đã xảy ra lỗi',
          description: res.message,
        });
      }
    } else {
      const res = await callCreateNews(newsData);
      if (res.data) {
        message.success('Tạo tin tức thành công');
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
    } else if (openModal && !dataInit) {
      // Reset form when creating new
      form.resetFields();
    }
  }, [dataInit, openModal, form]);

  return (
    <>
      {openModal && (
        <ModalForm
          title={dataInit?.id ? 'Cập nhật Tin tức' : 'Tạo mới Tin tức'}
          open={openModal}
          modalProps={{
            onCancel: () => {
              handleReset();
            },
            afterClose: () => handleReset(),
            destroyOnHidden: true,
            footer: null,
            keyboard: false,
            maskClosable: false,
            className: `modal-company ${animation}`,
            rootClassName: `modal-company-root ${animation}`,
            width: 1000,
          }}
          scrollToFirstError={true}
          preserve={false}
          form={form}
          onFinish={submitNews}
          submitter={{
            render: (_, dom) => <FooterToolbar>{dom}</FooterToolbar>,
            submitButtonProps: {
              size: 'large',
            },
            resetButtonProps: {
              size: 'large',
            },
          }}
        >
          <ProCard
            title="Thông tin cơ bản"
            bordered
            headerBordered
            collapsible
            style={{ marginBlockEnd: 16 }}
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <ProFormText
                  label="Tiêu đề"
                  name="title"
                  rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                  placeholder="Nhập tiêu đề tin tức"
                />
              </Col>

              <Col span={24}>
                <ProFormTextArea
                  label="Mô tả ngắn"
                  name="shortDescription"
                  rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn!' }]}
                  placeholder="Nhập mô tả ngắn về nội dung"
                  fieldProps={{
                    rows: 3,
                  }}
                />
              </Col>

              <Col span={12}>
                <ProFormSelect
                  label="Danh mục"
                  name="category"
                  rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                  options={categories}
                  placeholder="Chọn danh mục"
                />
              </Col>

              <Col span={12}>
                <ProFormText label="Tác giả" name="author" placeholder="Nhập tên tác giả" />
              </Col>

              <Col span={12}>
                <ProFormText label="Nguồn" name="source" placeholder="Nguồn tin tức" />
              </Col>

              <Col span={12}>
                <ProFormText
                  label="Tags"
                  name="tags"
                  placeholder="Nhập tags (phân cách bằng dấu phẩy)"
                />
              </Col>
            </Row>
          </ProCard>

          <ProCard
            title="Nội dung"
            bordered
            headerBordered
            collapsible
            style={{ marginBlockEnd: 16 }}
          >
            <Form.Item
              label="Nội dung HTML"
              name="content"
              rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
            >
              <TextArea
                rows={10}
                placeholder="Nhập nội dung HTML của tin tức (có thể sử dụng các thẻ HTML như <h2>, <p>, <ul>, <li>, ...)"
              />
            </Form.Item>
          </ProCard>

          <ProCard
            title="Hình ảnh"
            bordered
            headerBordered
            collapsible
            style={{ marginBlockEnd: 16 }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <ProFormText
                  label="Thumbnail Image URL"
                  name="thumbnailImage"
                  placeholder="http://localhost:8080/storage/news/thumbnail.jpg"
                />
              </Col>

              <Col span={12}>
                <ProFormText
                  label="Cover Image URL"
                  name="coverImage"
                  placeholder="http://localhost:8080/storage/news/cover.jpg"
                />
              </Col>
            </Row>
          </ProCard>

          <ProCard
            title="Cài đặt"
            bordered
            headerBordered
            collapsible
            style={{ marginBlockEnd: 16 }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <ProFormSwitch
                  label="Nổi bật"
                  name="isFeatured"
                  checkedChildren="Có"
                  unCheckedChildren="Không"
                />
              </Col>

              <Col span={12}>
                <ProFormSwitch
                  label="Xuất bản"
                  name="isPublished"
                  checkedChildren="Công khai"
                  unCheckedChildren="Nháp"
                />
              </Col>
            </Row>
          </ProCard>
        </ModalForm>
      )}
    </>
  );
};

export default ModalNews;
