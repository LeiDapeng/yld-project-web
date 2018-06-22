import React, { Component } from 'react';
import { Card } from 'antd';

export default class Welcome extends Component {
    render() {
        return (
          <div>
            <Card title="欢迎使用易联达项目人员管理系统" extra={<a href="#">More</a>} style={{ width: 400 }}>
              <p>初始版本</p>
              <p>如有BUG请提交至韩旭</p>
              <p>hanxu@elianda.com</p>
            </Card>
          </div>
        );
      }
}
