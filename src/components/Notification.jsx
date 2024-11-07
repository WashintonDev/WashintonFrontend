import { notification } from 'antd';

const CustomNotification = {
    success: (props) => notification.success(props),
    error: (props) => notification.error(props),
    info: (props) => notification.info(props),
    warning: (props) => notification.warning(props),
};

export default CustomNotification;