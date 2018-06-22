import request from '../utils/request';

export async function query(params) {
  return request('/employee/query', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function addEmployee(params) {
  return request('/employee/add', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function deleteEmployee(key) {
  return request('/employee/delete', {
    method: 'POST',
    body: {
      'uuid':key,
    },
  });
}

export async function updateEmployee(params) {
  return request('/employee/update', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}