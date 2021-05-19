import React from 'react';
import { useSelector } from 'react-redux';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { IState } from '../store';

import { MeasurementsChartItem } from './Dashboard';

type MeasurementsChartProps = {
  data: MeasurementsChartItem[];
};

const getSelectedMetrics = (state: IState) => {
  const { selectedMetrics } = state.metrics;
  return {
    selectedMetrics,
  };
};

export default ({ data }: MeasurementsChartProps) => {
  const { selectedMetrics } = useSelector(getSelectedMetrics);

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
        <YAxis dx={-10} />
        <Tooltip />
        {selectedMetrics.map((metric) => (
          <Line dot={false} type="monotone" dataKey={metric} key={metric} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
