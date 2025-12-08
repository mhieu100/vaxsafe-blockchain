import { blue, green, grey } from '@ant-design/colors';
import { ProFormSwitch } from '@ant-design/pro-components';
import { Alert, Card, Col, Collapse, Row, Space, Tag, Tooltip } from 'antd';
import { useEffect, useState } from 'react';

import { colorMethod, groupByPermission } from '@/utils/permission';

const ModuleApi = (props) => {
  const { form, listPermissions, singleRole, openModal } = props;
  const [debugMode, setDebugMode] = useState(false);
  const [forceRenderKey, setForceRenderKey] = useState(0);

  useEffect(() => {
    if (listPermissions?.length && singleRole?.id && openModal === true) {
      const userPermissions = groupByPermission(singleRole.permissions);

      const p = {};

      listPermissions.forEach((x) => {
        x.permissions?.forEach((y) => {
          const temp = userPermissions.find((z) => z.module === x.module);

          p[y.id] = false;

          if (temp) {
            const isExist = temp.permissions.find((k) => k.id === y.id);
            if (isExist) {
              p[y.id] = true;
            }
          }
        });

        if (x.permissions?.length > 0) {
          const allSelected = x.permissions.every((y) => {
            return p[y.id] === true;
          });
          p[x.module] = allSelected;
        } else {
          p[x.module] = false;
        }
      });

      form.setFieldsValue({
        name: singleRole.name,
        active: singleRole.active,
        description: singleRole.description,
        permissions: p,
      });

      setTimeout(() => {
        form.setFieldsValue({ permissions: p });
        setForceRenderKey((prev) => prev + 1);
      }, 50);
    }
  }, [
    form.setFieldsValue,
    listPermissions.forEach,
    listPermissions?.length,
    openModal,
    singleRole.active,
    singleRole.description,
    singleRole.name,
    singleRole.permissions,
    singleRole?.id,
  ]);

  const handleSingleCheck = (value, child, parent) => {
    const currentPermissions = form.getFieldValue('permissions') || {};

    const updatedPermissions = {
      ...currentPermissions,
      [child]: value,
    };

    const temp = listPermissions?.find((item) => item.module === parent);
    if (temp?.permissions) {
      const allTrue = temp.permissions.every((permission) => {
        return updatedPermissions[permission.id] === true;
      });
      updatedPermissions[parent] = allTrue;
    }

    form.setFieldsValue({ permissions: updatedPermissions });
  };

  const handleModuleCheck = (value, module) => {
    const currentPermissions = form.getFieldValue('permissions') || {};

    const updatedPermissions = {
      ...currentPermissions,
      [module]: value,
    };

    const temp = listPermissions?.find((item) => item.module === module);
    if (temp?.permissions) {
      temp.permissions.forEach((permission) => {
        updatedPermissions[permission.id] = value;
      });
    }

    form.setFieldsValue({ permissions: updatedPermissions });
  };

  const panels = listPermissions?.map((item, index) => ({
    key: `${index}-parent`,
    label: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <span>{item.module}</span>
        <div
          role="none"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.key === 'Enter' && e.stopPropagation()}
          style={{ marginRight: 10 }}
        >
          <ProFormSwitch
            key={`${item.module}-${forceRenderKey}`}
            name={['permissions', item.module]}
            fieldProps={{
              onChange: (v) => handleModuleCheck(v, item.module),
              checkedChildren: 'All',
              unCheckedChildren: 'None',
            }}
            tooltip="Select/Deselect all permissions in this module"
          />
        </div>
      </div>
    ),
    forceRender: true,
    children: (
      <Row gutter={[16, 16]}>
        {item.permissions?.map((value, i) => (
          <Col lg={12} md={12} sm={24} key={`${i}-child-${item.module}`}>
            <Card size="small" bodyStyle={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ProFormSwitch
                  name={['permissions', value.id]}
                  fieldProps={{
                    onChange: (v) => handleSingleCheck(v, value.id, item.module),
                  }}
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Tooltip title={value?.name}>
                  <p style={{ paddingLeft: 10, marginBottom: 3 }}>{value?.name || ''}</p>
                  <div style={{ display: 'flex' }}>
                    <p
                      style={{
                        paddingLeft: 10,
                        fontWeight: 'bold',
                        marginBottom: 0,
                        color: colorMethod(value?.method),
                      }}
                    >
                      {value?.method || ''}
                    </p>
                    <p style={{ paddingLeft: 10, marginBottom: 0, color: grey[5] }}>
                      {value?.apiPath || ''}
                    </p>
                  </div>
                </Tooltip>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    ),
  }));

  const [formPermissions, setFormPermissions] = useState({});

  useEffect(() => {
    const updateFormState = () => {
      const perms = form.getFieldValue('permissions') || {};
      setFormPermissions(perms);
    };

    updateFormState();

    const interval = setInterval(updateFormState, 100);
    return () => clearInterval(interval);
  }, [form]);

  const currentPermissions = formPermissions;

  return (
    <Card size="small" bordered={false}>
      {}
      <div
        style={{
          marginBottom: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space>
          <Tag color="blue" style={{ cursor: 'pointer' }} onClick={() => setDebugMode(!debugMode)}>
            {debugMode ? '🐛 Hide Debug' : '🐛 Show Debug'}
          </Tag>
        </Space>
      </div>

      {}
      {debugMode && (
        <Alert
          message="Debug Info"
          description={
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              <div style={{ marginBottom: 10 }}>
                <strong>Role ID:</strong> {singleRole?.id}
              </div>
              <div style={{ marginBottom: 10 }}>
                <strong>Role Name:</strong> {singleRole?.name}
              </div>
              <div style={{ marginBottom: 10 }}>
                <strong>Total Permissions in Form:</strong> {Object.keys(currentPermissions).length}
              </div>
              <div style={{ marginBottom: 10 }}>
                <strong>Module Switches:</strong>
                <div style={{ marginTop: 5 }}>
                  {listPermissions?.map((module) => {
                    const selectedCount =
                      module.permissions?.filter((p) => currentPermissions[p.id] === true).length ||
                      0;
                    const totalCount = module.permissions?.length || 0;
                    return (
                      <Tag
                        key={module.module}
                        color={currentPermissions[module.module] ? green[6] : grey[4]}
                      >
                        {module.module}: {currentPermissions[module.module] ? 'ALL' : 'NONE'} (
                        {selectedCount}/{totalCount})
                      </Tag>
                    );
                  })}
                </div>
              </div>
              <div>
                <strong>Permissions by Module:</strong>
                {listPermissions?.map((module) => (
                  <div
                    key={module.module}
                    style={{ marginTop: 10, padding: 8, background: '#f5f5f5', borderRadius: 4 }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: 5 }}>{module.module}:</div>
                    <div>
                      {module.permissions?.map((perm) => (
                        <Tag
                          key={perm.id}
                          color={currentPermissions[perm.id] ? blue[6] : grey[4]}
                          style={{ marginBottom: 4 }}
                        >
                          {perm.id}: {perm.name} ({currentPermissions[perm.id] ? 'ON' : 'OFF'})
                        </Tag>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
          type="info"
          style={{ marginBottom: 16 }}
        />
      )}

      <Collapse items={panels} />
    </Card>
  );
};

export default ModuleApi;
