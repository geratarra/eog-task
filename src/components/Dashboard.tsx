import { Box, Container } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { useSelector } from 'react-redux';
import { createClient, defaultExchanges, Provider, subscriptionExchange, useQuery } from 'urql';
import Metrics from '../Features/Metrics/Metrics';
import { IState } from '../store';
import MeasurementsChart from './MeasurementsChart';

const subscriptionClient = new SubscriptionClient('ws://react.eogresources.com/graphql', {
  reconnect: true,
});

const client = createClient({
  url: 'https://react.eogresources.com/graphql',
  exchanges: [
    ...defaultExchanges,
    subscriptionExchange({
      forwardSubscription: (operation) => subscriptionClient.request(operation),
    }),
  ],
});

// const newMeasurementSub = `
//   subscription NewMeasurementSub {
//     newMeasurement {
//       metric
//       value
//       unit
//       at
//     }
//   }
// `;

const getSelectedMetrics = (state: IState) => {
  const { selectedMetrics } = state.metrics;
  return {
    selectedMetrics,
  };
};

const getMultipleMeasurementsQuery = `
  query ($input: [MeasurementQuery]) {
    getMultipleMeasurements(input: $input) {
      metric
      measurements {
        metric
        unit
        value
        at
      }
    }
  }
`;

const useGetMultipleMeasurements = (input: { metricName: String }[]) => {
  const [getMultipleMeasurementsQueryResult] = useQuery({
    query: getMultipleMeasurementsQuery,
    variables: {
      input,
    },
  });
  return getMultipleMeasurementsQueryResult;
};

export interface MeasurementsChartItem {
  date: string;
  id: number;
  [key: string]: number | string;
}

const randomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

const Dashboard = () => {
  //   const [newMeasurementsSubResult] = useSubscription({ query: newMeasurementSub });
  const [chartData, setChartData] = useState<MeasurementsChartItem[]>([]);
  const [metricUnits, setMetricUnits] = useState<any[]>([]);
  const { selectedMetrics } = useSelector(getSelectedMetrics);
  const multipleMeasurementsInput = selectedMetrics.map((metric) => {
    return { metricName: metric };
  });
  const { data: multipleMeasurementsResult } = useGetMultipleMeasurements(multipleMeasurementsInput);
  //   let metricUnits: any[] = [];

  useEffect(() => {
    const chartDataItems: MeasurementsChartItem[] = [];
    const multipleMeasurementsData = multipleMeasurementsResult
      ? multipleMeasurementsResult.getMultipleMeasurements
      : [];

    if (multipleMeasurementsData.length !== 0) {
      let date;

      const auxMetricUnits: any[] = [];
      setMetricUnits([]);

      for (let i = 0; i < multipleMeasurementsData.length; i += 1) {
        auxMetricUnits.push({
          metric: multipleMeasurementsData[i].metric,
          unit: multipleMeasurementsData[i].measurements[0].unit,
          color: randomColor(),
        });
        for (let k = 0; k < 1000; k += 1) {
          chartDataItems[k] = chartDataItems[k] || {};
          chartDataItems[k].id = k;
          chartDataItems[k][multipleMeasurementsData[i].metric] = multipleMeasurementsData[i]?.measurements[k]?.value;
          date = new Date(multipleMeasurementsData[i]?.measurements[k]?.at);
          chartDataItems[k].date = `${date.getHours()}:${date.getMinutes()}`;
        }
      }

      setMetricUnits(auxMetricUnits);
      setChartData(chartDataItems);
    }
  }, [multipleMeasurementsResult]);

  return (
    <Container maxWidth="lg">
      <Box>
        <Metrics />
      </Box>
      {/* <Grid container spacing={2}>
        {selectedMetrics.map((metric) => {
          return (
            <Grid key={metric.metric} xs={6} sm={3} md={2} item>
              <Card>
                <CardContent>
                  <CardContent>
                    <Typography>{metric.metric}</Typography>
                    <Typography>{metric.value}</Typography>
                  </CardContent>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid> */}
      <Box pb={10}>
        {selectedMetrics.length !== 0 && <MeasurementsChart metricUnits={metricUnits} data={chartData} />}
      </Box>
    </Container>
  );
};

export default () => {
  return (
    <Provider value={client}>
      <Dashboard />
    </Provider>
  );
};
