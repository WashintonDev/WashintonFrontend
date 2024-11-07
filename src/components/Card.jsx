import React from 'react';
import { Card } from 'antd';

const CustomCard = ({ title, children, style }) => {
  return (
    <Card title={title} style={style}>
      {children}
    </Card>
  );
};

export default CustomCard;