import { query, addEmployee, deleteEmployee, updateEmployee } from '../services/employee_api';
export default {
  namespace: "employee",
  state: {
    data: {
      list: [],
      pagination: {},
    },
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(query, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *add({ fields, callback }, { call, put }) {
      const response = yield call(addEmployee, fields);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) {
        callback(response);
      }
    },
    *delete({ key, callback }, { call, put }) {
      const response = yield call(deleteEmployee, key);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) {
        callback(response);
      }
    },
    *update({ fields, callback }, { call, put }) {
      const response = yield call(updateEmployee, fields);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) {
        callback(response);
      }
    },
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};

