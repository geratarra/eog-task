import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { MeasurementsChartItem } from './Dashboard';

type MeasurementsChartProps = {
  data: MeasurementsChartItem[];
  metricUnits: any[];
};

interface CustomTooltipInterface {
  active?: boolean;
  payload?: any[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipInterface) => {
  if (active && payload && payload.length) {
    const date = new Date(payload[0].payload.milliseconds).toUTCString();
    const metricPelements: JSX.Element[] = [];
    payload.forEach((point) => {
      const metricLabel = `${point.name}: ${point.value}`;
      metricPelements.push(
        <p style={{ margin: '0px 0px' }} key={point.name}>
          {metricLabel}
        </p>,
      );
    });
    return (
      <div style={{ backgroundColor: 'white', padding: '1% 5% 8%', borderRadius: '5px' }}>
        <p>{`${date}`}</p>
        {metricPelements.map((metric) => metric)}
      </div>
    );
  }

  return null;
};

CustomTooltip.defaultProps = {
  active: false,
  payload: [],
};

export default ({ data, metricUnits }: MeasurementsChartProps) => {
  metricUnits.forEach((unit) => {
    unit.render = false;
    const metricByUnit = data?.map((metric) => {
      return metric[unit.metric];
    });
    unit.min = metricByUnit.reduce((acc, curr) => (acc < curr ? acc : curr));
  });

  metricUnits.forEach((unit) => {
    const metricsByUnit = metricUnits.filter((metric: { [x: string]: any }) => {
      return metric.unit === unit.unit;
    });

    const min =
      metricsByUnit?.length > 1
        ? metricsByUnit?.reduce((acc, curr) => {
            return acc.min < curr.min ? acc : curr;
          })
        : metricsByUnit[0];

    const yAxisToHide = metricUnits.find((metric) => {
      return metric.metric === min.metric && metric.unit === min.unit;
    });
    if (yAxisToHide) yAxisToHide.render = true;
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 15,
        }}
        data={data}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis interval="preserveStart" dataKey="at" dy={5} tickSize={4} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Tooltip />
        {metricUnits?.map((item, index) => (
          <Line
            stroke={item.color}
            dot={false}
            yAxisId={index}
            isAnimationActive={false}
            type="monotone"
            dataKey={item.metric}
            key={`${item.metric}XAxis`}
          />
        ))}
        {metricUnits?.map((item, index) => (
          <YAxis
            hide={!item.render}
            tickCount={10}
            label={{ value: item.unit, angle: -90, position: 'insideTopLeft' }}
            yAxisId={index}
            dx={-5}
            key={`${item.metric}YAxis`}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
