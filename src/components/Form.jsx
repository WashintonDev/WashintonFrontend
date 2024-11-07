import React from 'react';
import { Form } from 'antd';

const CustomForm = (props) => {
    return <Form {...props} />;
};

CustomForm.useForm = Form.useForm;

export default CustomForm;