/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import queryString from 'query-string';
import { sfLike } from 'spring-filter-query-builder';
import { Badge, Button, Space, Tag, Typography } from 'antd';
import { CloseCircleOutlined, EditOutlined } from '@ant-design/icons';

import DataTable from '../../components/data-table';
import ModalAppointment from '../../components/modal/modal.appointment';
import {
  callFetchAppointment,
  callFetchAppointmentOfCenter,
} from '../../config/api.appointment';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointment } from '../../redux/slice/appointmentSlice';
import { getColorStatus } from '../../utils/status';

const { Text } = Typography;

const AppointmentPage = () => {
  const tableRef = useRef();

  const isFetching = useSelector((state) => state.appointment.isFetching);
  const meta = useSelector((state) => state.appointment.meta);
  const appointments = useSelector((state) => state.appointment.result);
  const dispatch = useDispatch();

  const reloadTable = () => {
    tableRef?.current?.reload();
  };

  console.log(appointments);

  const [dataInit, setDataInit] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 50,
      align: 'center',
      render: (text, record, index) => index + 1,
      hideInSearch: true,
    },
    {
      title: 'Vaccine',
      dataIndex: 'vaccineName',
    },
    {
      title: 'Bệnh nhân',
      dataIndex: 'patientName',
    },
    {
      title: 'Trung tâm',
      dataIndex: 'centerName',
    },
    {
      title: 'Ngày tiêm',
      dataIndex: 'scheduledDate',
    },
    {
      title: 'Giờ tiêm',
      dataIndex: 'scheduledTime',
    },
    {
      title: 'Bác sĩ',
      dataIndex: 'doctorName',
      render: (text) => {
        return text ? (
          <Badge color="green" text={text} />
        ) : (
          <Badge color="red" text="Cập nhật" />
        );
      },
    },
    {
      title: 'Thu Ngân',
      dataIndex: 'cashierName',
      render: (text) => {
        return text ? (
          <Badge color="green" text={text} />
        ) : (
          <Badge color="red" text="Cập nhật" />
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (text) => {
        return <Tag color={getColorStatus(text)}>{text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      render: (_value, entity) =>
        entity.status === 'PENDING' ? (
          <Space>
            <EditOutlined
              onClick={() => {
                setOpenModal(true);
                setDataInit(entity);
              }}
            />
          </Space>
        ) : null,
    },
  ];

  const buildQuery = (params, sort) => {
    const clone = { ...params };
    const q = {
      page: params.current,
      size: params.pageSize,
      filter: '',
    };

    if (clone.vaccineName)
      q.filter = `${sfLike('vaccineName', clone.vaccineName)}`;
    if (clone.centerName) {
      q.filter = clone.vaccineName
        ? q.filter + ' and ' + `${sfLike('centerName', clone.centerName)}`
        : `${sfLike('centerName', clone.centerName)}`;
    }

    if (!q.filter) delete q.filter;

    return queryString.stringify(q);
  };

  return (
    <>
      <DataTable
        actionRef={tableRef}
        headerTitle="Danh sách lịch hẹn"
        rowKey="id"
        loading={isFetching}
        columns={columns}
        dataSource={appointments}
        request={async (params, sort, filter) => {
          const query = buildQuery(params, sort, filter);
          dispatch(fetchAppointment({ query }));
        }}
        scroll={{ x: true }}
        pagination={{
          current: meta.page,
          pageSize: meta.pageSize,
          showSizeChanger: true,
          total: meta.total,
          showTotal: (total, range) => {
            return (
              <div>
                {range[0]}-{range[1]} trên tổng số {total} dòng
              </div>
            );
          },
        }}
        rowSelection={false}
      />
      <ModalAppointment
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />
    </>
  );
};

export default AppointmentPage;
