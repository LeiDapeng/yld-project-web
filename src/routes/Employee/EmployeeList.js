import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Badge,
  Divider,
  Popconfirm,
} from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './TableList.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['0', '1', '2'];
const status = ['初级', '中级', '高级'];

const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleUpdate, handleModalVisible, selectedRows, modalTitle, operFlag } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      if(operFlag == 'add') {
        handleAdd(fieldsValue);
      } else {
        handleUpdate(fieldsValue);
      }
      
    });
  };
  return (
    <Modal
      title={modalTitle}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="姓名">
        {form.getFieldDecorator('staffName', {
          rules: [{ required: true, message: '请输入人员姓名' }], initialValue:selectedRows.staffName,
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="毕业时间">
        {form.getFieldDecorator('updateDate',{
          rules: [{ required: true, message: '请输入毕业时间' }], initialValue:moment(selectedRows.guaduationDate==null?'19980101':selectedRows.guaduationDate, 'YYYYMMDD'),
        })(<DatePicker style={{ width: '100%' }} format="YYYYMMDD" placeholder="请输入日期" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="级别">
        {form.getFieldDecorator('lvl', {
          rules: [{ required: true, message: '请选择级别' }], initialValue:selectedRows.lvl,
        })(
        <Select style={{ width: '100%' }}>
          <Option value="0">初级</Option>
          <Option value="1">中级</Option>
          <Option value="2">高级</Option>
        </Select>
        )}
      </FormItem>
    </Modal>
  );
});

@connect(({ employee,loading }) => ({
  employee,
  loading: loading.models.employee,
}))
@Form.create()
export default class EmployeeList extends PureComponent {
  state = {
    modalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    modalTitle: '',
    operFlag:'',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'employee/fetch',
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'employee/fetch',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'employee/fetch',
    });
  };

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  };

  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;

    var key = selectedRows.map(row => row.uuid).join(',');

    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'employee/delete',
          key,
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'employee/fetch',
        payload: values,
      });
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleAdd = fields => {
    this.props.dispatch({
      type: 'employee/add',
      fields,
      callback: (response) => {
        if(response.flag == true) {
          message.success('添加成功');
        } else {
          message.error('添加失败,错误信息：' + response.errorMsg);
        }
        this.setState({
          modalVisible: false,
        });
        
        this.handleFormReset();
      },
    });
  };
  handleUpdate = fields => {
    this.props.dispatch({
      type: 'employee/update',
      fields,
      callback: (response) => {
        if(response.flag == true) {
          message.success('更新成功');
        } else {
          message.error('更新失败,错误信息：' + response.errorMsg);
        }
        this.setState({
          modalVisible: false,
        });
        
        this.handleFormReset();
      },
    });
  };
  handleDelete = key => {
    this.props.dispatch({
      type: 'employee/delete',
      key,
      callback: (response) => {
        if(response.flag == true) {
          message.success('删除成功');
        } else {
          message.error('删除失败,错误信息：' + response.errorMsg);
        }
        this.setState({
          modalVisible: false,
        });
        
        this.handleFormReset();
      },
    });
  };
  /*
  新增/更新时，弹出Modal框的方法
  rows更新时选中的行
  flag操作标志，新增/删除，add/update
   */
  handleDo = (rows,flag) => {
    if(flag == 'update') {
      this.setState({
        modalTitle: '修改人员',
        modalVisible: true,
        selectedRows: rows,
        operFlag: flag,
      });
    } else {
      this.setState({
        modalTitle: '添加人员',
        modalVisible: true,
        selectedRows: {},
        operFlag: flag,
      });
    }
  };


  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="员工姓名">
              {getFieldDecorator('staffName')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="毕业时间">
              {getFieldDecorator('guaduationDate')(
                <DatePicker style={{ width: '100%' }} placeholder="请输入日期" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
          <div style={{ overflow: 'hidden' }}>
            <span style={{ float: 'left', marginBottom: 24 }}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
            </span>
          </div>
          </Col>
        </Row>

      </Form>
    );
  }

  renderForm() {
    return this.renderAdvancedForm();
  }

  render() {
    const { employee: { data }, loading } = this.props;
    const { selectedRows, modalVisible, modalTitle, operFlag } = this.state;

    const columns = [
      {
        title: '员工ID',
        dataIndex: 'uuid',
      },
      {
        title: '员工姓名',
        dataIndex: 'staffName',
      },
      {
        title: '毕业时间',
        dataIndex: 'guaduationDate',
      },
      {
        title: '级别',
        dataIndex: 'lvl',
        filters: [
          {
            text: status[0],
            value: 0,
          },
          {
            text: status[1],
            value: 1,
          },
          {
            text: status[2],
            value: 2,
          },
        ],
        onFilter: (value, record) => record.status.toString() === value,
        render(val) {
          return <Badge status={statusMap[val]} text={status[val]} />;
        },
      },
      {
        title: '工龄',
        dataIndex: 'workAge',
      },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
            <Popconfirm title="确定要修改？" onConfirm={() => this.handleDo(record,'update')}>
              <a href="javascript:;">修改</a>
            </Popconfirm>
            <Divider type="vertical" />
            <Popconfirm title="确定要删除？" onConfirm={() => this.handleDelete(record.uuid)}>
              <a href="javascript:;">删除</a>
            </Popconfirm>
          </Fragment>
        ),
      },
    ];



    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
      </Menu>
    );

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
      handleUpdate : this.handleUpdate,
    };

    return (
      <PageHeaderLayout title="查询表格">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleDo(null,'add')}>
                添加人员
              </Button>
              {selectedRows.length > 0 && (
                <span>
                  <Dropdown overlay={menu}>
                    <Button>
                      批量操作 <Icon type="down" />
                    </Button>
                  </Dropdown>
                </span>
              )}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              rowKey="uuid"
            />
          </div>
        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible} selectedRows={selectedRows} modalTitle={modalTitle} operFlag={operFlag}/>
      </PageHeaderLayout>
    );
  }
}
