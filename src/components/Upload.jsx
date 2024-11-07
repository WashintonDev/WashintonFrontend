import React from 'react';
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const CustomUpload = ({ action, fileList, onChange }) => {
  return (
    <Upload action={action} fileList={fileList} onChange={onChange}>
      <Button icon={<UploadOutlined />}>Upload</Button>
    </Upload>
  );
};

export default CustomUpload;