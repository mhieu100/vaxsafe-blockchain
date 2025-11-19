import { useEffect, useState } from 'react'
import { Card, Col, Collapse, Row, Tooltip, Alert, Space, Tag } from 'antd';
import { ProFormSwitch } from '@ant-design/pro-components';

import { grey, blue, green } from '@ant-design/colors';


import { colorMethod, groupByPermission } from '../../config/utils';


const ModuleApi = (props) => {
  const { form, listPermissions, singleRole, openModal } = props;
  const [debugMode, setDebugMode] = useState(false);
  const [forceRenderKey, setForceRenderKey] = useState(0);

  useEffect(() => {
    if (listPermissions?.length && singleRole?.id && openModal === true) {
      //current permissions of role
      const userPermissions = groupByPermission(singleRole.permissions);

      const p = {};

      listPermissions.forEach(x => {
        // First, set all individual permissions
        x.permissions?.forEach(y => {
          const temp = userPermissions.find(z => z.module === x.module);

          p[y.id] = false;

          if (temp) {
            const isExist = temp.permissions.find(k => k.id === y.id);
            if (isExist) {
              p[y.id] = true;
            }
          }
        });

        // Then check if all permissions in this module are selected
        // Based on what we just set in the p object
        if (x.permissions?.length > 0) {
          const allSelected = x.permissions.every(y => {
            return p[y.id] === true;
          });
          p[x.module] = allSelected;
        } else {
          // If module has no permissions, switch should be OFF
          p[x.module] = false;
        }
      });

      // Debug: Log the permissions object before setting
      console.log('🐛 Setting initial permissions:', p);
      console.log('🐛 Module switches:', {
        ROLE: p['ROLE'],
        FILE: p['FILE'],
        APPOINTMENT: p['APPOINTMENT'],
        VACCINE: p['VACCINE'],
        PERMISSION: p['PERMISSION'],
        USER: p['USER'],
        AUTH: p['AUTH']
      });

      form.setFieldsValue({
        name: singleRole.name,
        active: singleRole.active,
        description: singleRole.description,
        permissions: p
      });

      // Force update form after a short delay to ensure switches sync
      setTimeout(() => {
        form.setFieldsValue({ permissions: p });
        setForceRenderKey(prev => prev + 1); // Force re-render
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSingleCheck = (value, child, parent) => {
    // Get current form values
    const currentPermissions = form.getFieldValue('permissions') || {};

    // Update the individual permission switch
    const updatedPermissions = {
      ...currentPermissions,
      [child]: value
    };

    // Then check if all permissions in this module are now selected
    const temp = listPermissions?.find(item => item.module === parent);
    if (temp?.permissions) {
      // Check if all permissions will be true AFTER this change
      const allTrue = temp.permissions.every(permission => {
        return updatedPermissions[permission.id] === true;
      });
      updatedPermissions[parent] = allTrue;
    }

    // Update all permissions at once
    form.setFieldsValue({ permissions: updatedPermissions });
  }

  const handleModuleCheck = (value, module) => {
    // Get current form values
    const currentPermissions = form.getFieldValue('permissions') || {};

    // Update the module-level switch
    const updatedPermissions = {
      ...currentPermissions,
      [module]: value
    };

    // Find all permissions in this module and set them to the same value
    const temp = listPermissions?.find(item => item.module === module);
    if (temp?.permissions) {
      temp.permissions.forEach(permission => {
        updatedPermissions[permission.id] = value;
      });
    }

    // Update all permissions at once
    form.setFieldsValue({ permissions: updatedPermissions });
  }



  // Convert the data structure for use with `items` prop
  const panels = listPermissions?.map((item, index) => ({
    key: `${index}-parent`,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span>{item.module}</span>
        <div onClick={(e) => e.stopPropagation()} style={{ marginRight: 10 }}>
          <ProFormSwitch
            key={`${item.module}-${forceRenderKey}`}
            name={['permissions', item.module]}
            fieldProps={{
              onChange: (v) => handleModuleCheck(v, item.module),
              checkedChildren: 'All',
              unCheckedChildren: 'None'
            }}
            tooltip="Select/Deselect all permissions in this module"
          />
        </div>
      </div>
    ),
    forceRender: true,
    children: (
      <Row gutter={[16, 16]}>
        {
          item.permissions?.map((value, i) => (
            <Col lg={12} md={12} sm={24} key={`${i}-child-${item.module}`}>
              <Card size='small' bodyStyle={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ProFormSwitch
                    name={['permissions', value.id]}
                    fieldProps={{
                      onChange: (v) => handleSingleCheck(v, value.id, item.module)
                    }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Tooltip title={value?.name}>
                    <p style={{ paddingLeft: 10, marginBottom: 3 }}>{value?.name || ''}</p>
                    <div style={{ display: 'flex' }}>
                      <p style={{ paddingLeft: 10, fontWeight: 'bold', marginBottom: 0, color: colorMethod(value?.method) }}>{value?.method || ''}</p>
                      <p style={{ paddingLeft: 10, marginBottom: 0, color: grey[5] }}>{value?.apiPath || ''}</p>
                    </div>
                  </Tooltip>
                </div>
              </Card>
            </Col>
          ))
        }
      </Row>
    )
  }));

  // Watch form changes for debug display
  const [formPermissions, setFormPermissions] = useState({});

  // Update form permissions state whenever form changes
  useEffect(() => {
    const updateFormState = () => {
      const perms = form.getFieldValue('permissions') || {};
      setFormPermissions(perms);
    };

    // Initial load
    updateFormState();

    // Subscribe to form changes (if your form supports it)
    const interval = setInterval(updateFormState, 100);
    return () => clearInterval(interval);
  }, [form, openModal]);

  // Get current permissions for debug display
  const currentPermissions = formPermissions;

  return (
    <>
      <Card size='small' bordered={false}>
        {/* Debug Toggle */}
        <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Tag color="blue" style={{ cursor: 'pointer' }} onClick={() => setDebugMode(!debugMode)}>
              {debugMode ? '🐛 Hide Debug' : '🐛 Show Debug'}
            </Tag>
          </Space>
        </div>

        {/* Debug Panel */}
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
                    {listPermissions?.map(module => {
                      const selectedCount = module.permissions?.filter(p => currentPermissions[p.id] === true).length || 0;
                      const totalCount = module.permissions?.length || 0;
                      return (
                        <Tag key={module.module} color={currentPermissions[module.module] ? green[6] : grey[4]}>
                          {module.module}: {currentPermissions[module.module] ? 'ALL' : 'NONE'} ({selectedCount}/{totalCount})
                        </Tag>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <strong>Permissions by Module:</strong>
                  {listPermissions?.map(module => (
                    <div key={module.module} style={{ marginTop: 10, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: 5 }}>{module.module}:</div>
                      <div>
                        {module.permissions?.map(perm => (
                          <Tag key={perm.id} color={currentPermissions[perm.id] ? blue[6] : grey[4]} style={{ marginBottom: 4 }}>
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
    </>
  )
}

export default ModuleApi