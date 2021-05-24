import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { MeasurementsChartItem } from './Dashboard';

type MeasurementsChartProps = {
  data: MeasurementsChartItem[];
  metricUnits: any[];
};

export default ({ data, metricUnits }: MeasurementsChartProps) => {
  metricUnits.forEach((unit) => {
    const metricByUnit = data.map((metric) => {
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
        <XAxis interval={120} dataKey="date" angle={-25} dy={15} tickSize={4} tick={{ fontSize: 12 }} />
        <Tooltip />
        {metricUnits.map((item, index) => (
          <Line
            stroke={item.color}
            dot={false}
            yAxisId={index}
            type="monotone"
            dataKey={item.metric}
            key={`${item.metric}XAxis`}
          />
        ))}
        {metricUnits.map((item, index) => {
          return (
            <YAxis
              hide={!item.render}
              tickCount={10}
              label={{ value: item.unit, angle: -90, position: 'insideTopLeft' }}
              yAxisId={index}
              dx={-5}
              key={`${item.metric}YAxis`}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
};
