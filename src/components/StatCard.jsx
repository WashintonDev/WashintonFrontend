import React from 'react';
import { Card, Statistic } from 'antd';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color, prefix }) => {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Card>
        <Statistic
          title={title}
          value={value}
          valueStyle={{ color }}
          prefix={React.cloneElement(icon, { style: { fontSize: '24px', marginRight: '8px' } })}
          suffix={prefix}
        />
      </Card>
    </motion.div>
  );
};

export default StatCard;