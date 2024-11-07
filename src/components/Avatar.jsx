import React from 'react';
import { Avatar } from 'antd';

const CustomAvatar = ({ src, size, icon, alt }) => {
  return <Avatar src={src} size={size} icon={icon} alt={alt} />;
};

export default CustomAvatar;