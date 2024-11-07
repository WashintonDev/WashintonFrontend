import React from 'react';
import { Modal } from 'antd';

const CustomModal = (props) => {
    console.log('CustomModal props:', props);
    return <Modal {...props} open={props.open} />;
};

export default CustomModal;