import React from 'react';
import { Form, Input, Button } from 'antd';

const CustomForm = ({ onFinish, formItems }) => {
  return (
    <Form onFinish={onFinish}>
      {formItems.map((item) => (
        <Form.Item
          key={item.name}
          name={item.name}
          label={item.label}
          rules={item.rules}
        >
          {item.component}
        </Form.Item>
      ))}
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CustomForm;