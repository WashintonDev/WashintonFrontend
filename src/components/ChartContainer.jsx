import React from 'react';
import { Card, Select, Typography } from 'antd';
import { Bar, Line, Pie, Radar, Scatter } from '@ant-design/plots';
import { ResponsiveTreeMap } from '@nivo/treemap';
import { motion } from 'framer-motion';

const { Title } = Typography;
const { Option } = Select;

const ChartContainer = ({ title, data, selectedChart, setSelectedChart }) => {
  const chartConfigs = {
    bar: {
      data,
      isStack: true,
      xField: 'quantity',
      yField: 'batch_name',
      seriesField: 'product_name',
      label: {
        position: 'middle',
        layout: [
          { type: 'interval-adjust-position' },
          { type: 'interval-hide-overlap' },
          { type: 'adjust-color' },
        ],
      },
      interactions: [{ type: 'active-region' }],
      state: {
        active: {
          style: {
            shadowColor: 'black',
            shadowBlur: 10,
          },
        },
      },
    },
    line: {
      data,
      xField: 'batch_name',
      yField: 'quantity',
      seriesField: 'product_name',
      yAxis: {
        min: 0, // Ensure the y-axis starts at 0
        label: {
          formatter: (v) => `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`),
        },
      },
      color: ['#1979C9', '#D62A0D', '#FAA219'],
    },
    pie: {
      appendPadding: 10,
      data,
      angleField: 'value',
      colorField: 'product_name',
      radius: 0.8,
      label: {
        type: 'outer',
        content: '{name} {percentage}',
      },
      interactions: [
        { type: 'pie-legend-active' },
        { type: 'element-active' },
      ],
    },
    radar: {
      data,
      xField: 'batch_name',
      yField: 'quantity',
      seriesField: 'product_name',
      xAxis: {
        line: null,
        tickLine: null,
      },
      yAxis: {
        label: false,
        grid: {
          alternateColor: 'rgba(0, 0, 0, 0.04)',
        },
      },
      point: {
        size: 2,
      },
      area: {},
    },
    scatter: {
      data,
      xField: 'quantity',
      yField: 'value',
      colorField: 'product_name',
      size: 5,
      shape: 'circle',
      pointStyle: {
        fillOpacity: 0.8,
        stroke: '#bbb',
      },
    },
    treemap: {
      data: {
        name: 'root',
        children: data.map((item) => ({
          name: item.product_name,
          value: item.quantity,
        })),
      },
      identity: 'name',
      value: 'value',
      valueFormat: '.02s',
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      labelSkipSize: 12,
      labelTextColor: { from: 'color', modifiers: [['darker', 1.2]] },
      parentLabelPosition: 'left',
      parentLabelTextColor: { from: 'color', modifiers: [['darker', 2]] },
      borderColor: { from: 'color', modifiers: [['darker', 0.1]] },
    },
  };

  const renderChart = () => {
    switch (selectedChart) {
      case 'bar':
        return <Bar {...chartConfigs.bar} />;
      case 'line':
        return <Line {...chartConfigs.line} />;
      case 'pie':
        return <Pie {...chartConfigs.pie} />;
      case 'radar':
        return <Radar {...chartConfigs.radar} />;
      case 'scatter':
        return <Scatter {...chartConfigs.scatter} />;
      case 'treemap':
        return (
          <div style={{ height: 400 }}>
            <ResponsiveTreeMap {...chartConfigs.treemap} />
          </div>
        );
      default:
        return <Bar {...chartConfigs.bar} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <Card style={{ marginTop: '24px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4}>{title}</Title>
          <Select defaultValue={selectedChart} style={{ width: 120 }} onChange={setSelectedChart}>
            <Option value="bar">Bar Chart</Option>
            <Option value="line">Line Chart</Option>
            <Option value="pie">Pie Chart</Option>
            <Option value="radar">Radar Chart</Option>
            <Option value="scatter">Scatter Plot</Option>
            <Option value="treemap">Tree Map</Option>
          </Select>
        </div>
        {renderChart()}
      </Card>
    </motion.div>
  );
};

export default ChartContainer;