import React from 'react';
import { Switch } from 'antd';

const CustomSwitch = ({ checked, onChange }) => {
  return (
    <Switch checked={checked} onChange={onChange} />
  );
};

export default CustomSwitch;