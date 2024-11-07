import React from 'react';
import { Modal } from 'antd';

const CustomModal = ({ visible, onCancel, onOk, title, children }) => {
  return (
    <Modal visible={visible} onCancel={onCancel} onOk={onOk} title={title}>
      {children}
    </Modal>
  );
};

export default CustomModal;