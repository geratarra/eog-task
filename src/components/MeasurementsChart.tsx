import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { MeasurementsChartItem } from './Dashboard';

type MeasurementsChartProps = {
  data: MeasurementsChartItem[];
  metricUnits: any[];
};

export default ({ data, metricUnits }: MeasurementsChartProps) => {
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
        <XAxis interval="preserveEnd" dataKey="date" angle={-25} dy={15} tickSize={4} tick={{ fontSize: 12 }} />
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
        {metricUnits.map((item, index) => (
          <YAxis
            label={{ value: item.metric, angle: -90, position: 'insideTopLeft' }}
            yAxisId={index}
            dx={-5}
            key={`${item.metric}YAxis`}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
