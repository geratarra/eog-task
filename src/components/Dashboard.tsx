import { Box, Card, CardContent, Container, Grid, makeStyles, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { useSelector } from 'react-redux';
import { createClient, defaultExchanges, Provider, subscriptionExchange, useQuery, useSubscription } from 'urql';
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

const newMeasurementSub = `
  subscription NewMeasurementSub {
    newMeasurement {
      metric
      value
      unit
      at
    }
  }
`;

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
  id: number;
  at: string;
  [key: string]: number | string;
}

const getColor = (index: number) => ['green', 'blue', 'red', 'black', 'pink', 'purple', 'orange'][index];

const useStyles = makeStyles({
  cardsConteiner: {
    paddingBottom: '2%',
  },
});

const filterNewMeasurement = (data: any, newMeasurement: MeasurementsChartItem, filters: string[]) => {
  const metricsToAdd: MeasurementsChartItem = {
    id: newMeasurement.id,
    at: newMeasurement.at,
  };
  filters.forEach((metric) => {
    metricsToAdd[metric] = newMeasurement[metric];
  });
  return [...data, metricsToAdd];
};

const createChartDataItems = (multipleMeasurementsResult: any[], limit: number) => {
  const chartDataItems: MeasurementsChartItem[] = [];

  if (multipleMeasurementsResult?.length !== 0) {
    let date;

    for (let i = 0; i < multipleMeasurementsResult?.length; i += 1) {
      for (let k = 0; k < limit; k += 1) {
        chartDataItems[k] = chartDataItems[k] || {};
        chartDataItems[k][multipleMeasurementsResult[i].metric] = multipleMeasurementsResult[i]?.measurements[k]?.value;
        date = new Date(multipleMeasurementsResult[i]?.measurements[k]?.at);
        chartDataItems[k].at = `${date.getUTCHours()}:${date.getUTCMinutes()}`;
        chartDataItems[k].milliseconds = multipleMeasurementsResult[i]?.measurements[k]?.at;
      }
    }
  }

  return chartDataItems;
};

const createMetricUnitsArray = (multipleMeasurementsResult: any[]) => {
  const auxMetricUnits: any[] = [];

  if (multipleMeasurementsResult?.length !== 0) {
    for (let i = 0; i < multipleMeasurementsResult?.length; i += 1) {
      auxMetricUnits.push({
        metric: multipleMeasurementsResult[i].metric,
        unit: multipleMeasurementsResult[i].measurements[0].unit,
        color: getColor(i),
      });
    }
  }

  return auxMetricUnits;
};

let batch: MeasurementsChartItem = {
  id: new Date().getTime(),
  at: '',
};

const Dashboard = () => {
  const classes = useStyles();
  const [newMeasurementsSubResult] = useSubscription({ query: newMeasurementSub });
  const [chartData, setChartData] = useState<MeasurementsChartItem[]>([]);
  const [metricUnits, setMetricUnits] = useState<any[]>([]);
  const { selectedMetrics } = useSelector(getSelectedMetrics);
  const multipleMeasurementsInput = selectedMetrics.map((metric) => {
    return { metricName: metric };
  });
  let { data: multipleMeasurementsResult } = useGetMultipleMeasurements(multipleMeasurementsInput);

  useEffect(() => {
    multipleMeasurementsResult = multipleMeasurementsResult?.getMultipleMeasurements;
    setMetricUnits(createMetricUnitsArray(multipleMeasurementsResult));
    setChartData(createChartDataItems(multipleMeasurementsResult, 200));
  }, [multipleMeasurementsResult]);

  useEffect(() => {
    if (newMeasurementsSubResult?.data) {
      const newMetric = newMeasurementsSubResult.data.newMeasurement;
      const date = new Date(newMetric?.at);
      if (!batch[newMetric.metric]) {
        batch[newMetric.metric] = newMetric.value;
        batch.milliseconds = newMetric.at;
        batch.at = `${date.getUTCHours()}:${date.getUTCMinutes()}`;
      } else {
        const newChartData = filterNewMeasurement(chartData, batch, selectedMetrics);
        if (newChartData.length !== chartData.length) setChartData(newChartData.slice());
        batch = { id: new Date().getTime(), at: '' };
      }
    }
  }, [newMeasurementsSubResult]);

  return (
    <Container maxWidth="lg">
      <Box>
        <Metrics />
      </Box>
      <Grid container spacing={2} className={classes.cardsConteiner}>
        {selectedMetrics.map((metric) => {
          return (
            <Grid key={`grid_${metric}`} xs={6} sm={3} md={2} item>
              <Card>
                <CardContent>
                  <Typography variant="h6">{metric}</Typography>
                  <Typography variant="h3">205.4</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
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
