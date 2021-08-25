import { Box, Card, CardContent, Container, Grid, makeStyles, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Provider, useQuery, useSubscription } from 'urql';
import Metrics from '../Features/Metrics/Metrics';
import { IState } from '../store';
import MeasurementsChart from './MeasurementsChart';
import { MeasurementsChartItem, Metric } from '../Features/Metrics/Interfaces';
import {
  createChartDataItems,
  createMetricUnitsArray,
  filterNewMeasurement,
  graphqlClient,
  setDifference,
} from '../utils/utils';

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

const useStyles = makeStyles({
  cardsConteiner: {
    paddingBottom: '1%',
  },
  cardContent: {
    padding: '5%',
    paddingRight: '10%',
  },
});

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
  const [selectedMetricsWithLastMeasure, setSelectedMetricsWithLastMeasure] = useState<Metric[]>([...selectedMetrics]);
  let { data: multipleMeasurementsResult } = useGetMultipleMeasurements(multipleMeasurementsInput);

  useEffect(() => {
    // We need to listen changes in selected metrics to update Cards components with last measures.
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
    setChartData(createChartDataItems(multipleMeasurementsResult, 400));
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
              unit: newMetric.unit,
            });
            setSelectedMetricsWithLastMeasure(selectedMetricsWithLastMeasureReplacement);
          } else {
            setSelectedMetricsWithLastMeasure([
              ...selectedMetricsWithLastMeasure,
              { lastMeasure: newMetric.value, metric: newMetric.metric, unit: newMetric.unit },
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
                  <Typography variant="h6">{`${metric.metric} (${metric.unit})`}</Typography>
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
    <Provider value={graphqlClient}>
      <Dashboard />
    </Provider>
  );
};
