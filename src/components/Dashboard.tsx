import { Box, Card, CardContent, Container, Grid, makeStyles, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { useSelector } from 'react-redux';
import { createClient, defaultExchanges, Provider, subscriptionExchange, useQuery, useSubscription } from 'urql';
import Metrics from '../Features/Metrics/Metrics';
import { IState } from '../store';
import MeasurementsChart from './MeasurementsChart';
import { MeasurementsChartItem, SelectedMetric } from '../Features/Metrics/Interfaces';
import { filterNewMeasurement, setDifference } from '../utils/utils';

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

const getColor = (index: number) => ['green', 'blue', 'red', 'black', 'pink', 'purple', 'orange'][index];

const useStyles = makeStyles({
  cardsConteiner: {
    paddingBottom: '1%',
  },
  cardContent: {
    padding: '5%',
    paddingRight: '10%',
  },
});

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
    return { metricName: metric.metric };
  });
  const [selectedMetricsWithLastMeasure, setSelectedMetricsWithLastMeasure] = useState<SelectedMetric[]>([
    ...selectedMetrics,
  ]);
  let { data: multipleMeasurementsResult } = useGetMultipleMeasurements(multipleMeasurementsInput);

  useEffect(() => {
    if (selectedMetrics.length < selectedMetricsWithLastMeasure.length) {
      const selectedMetricsStrings = selectedMetrics.map((metric) => metric.metric);
      const selectedMetricsWithLastMeasureStrings = selectedMetricsWithLastMeasure.map((metric) => metric.metric);
      const selectedMetricsSet = new Set(selectedMetricsStrings);
      const selectedMetricsWithLastMeasureSet = new Set(selectedMetricsWithLastMeasureStrings);
      const removedElementAsSet = setDifference(selectedMetricsWithLastMeasureSet, selectedMetricsSet);
      const removedMetric = [...removedElementAsSet][0];
      setSelectedMetricsWithLastMeasure(
        selectedMetricsWithLastMeasure.filter((metric) => metric.metric !== removedMetric),
      );
    }
  }, [selectedMetrics]);

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

        const newMetricSelectedMatch = selectedMetrics.find((metric) => metric.metric === newMetric.metric);
        const currentMetricLastMeasure = selectedMetricsWithLastMeasure.find(
          (metric) => metric.metric === newMetric.metric,
        );

        if (newMetricSelectedMatch) {
          if (currentMetricLastMeasure) {
            const indexOfCurrentLastMeasure = selectedMetricsWithLastMeasure.indexOf(currentMetricLastMeasure);
            const selectedMetricsWithLastMeasureReplacement = [...selectedMetricsWithLastMeasure];
            selectedMetricsWithLastMeasureReplacement.splice(indexOfCurrentLastMeasure, 1, {
              lastMeasure: newMetric.value,
              metric: newMetric.metric,
            });
            setSelectedMetricsWithLastMeasure(selectedMetricsWithLastMeasureReplacement);
          } else {
            setSelectedMetricsWithLastMeasure([
              ...selectedMetricsWithLastMeasure,
              { lastMeasure: newMetric.value, metric: newMetric.metric },
            ]);
          }
        }
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
        {selectedMetricsWithLastMeasure.map((metric) => {
          return (
            <Grid key={`grid_${metric.metric}`} xs={6} sm={4} md={3} item>
              <Card>
                <CardContent className={classes.cardContent}>
                  <Typography variant="h6">{metric.metric}</Typography>
                  <Typography variant="h3">{metric.lastMeasure}</Typography>
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
