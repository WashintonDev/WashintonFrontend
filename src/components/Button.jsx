import React from 'react';
import { Button } from 'antd';

const CustomButton = ({ type, onClick, children }) => {
  return (
    <Button type={type} onClick={onClick}>
      {children}
    </Button>
  );
};

export default CustomButton;