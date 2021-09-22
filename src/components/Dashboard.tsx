import { Box, CircularProgress, Container, Grid, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Provider, useQuery, useSubscription } from 'urql';
import Metrics from '../Features/Metrics/Metrics';
import { IState } from '../store';
import MeasurementsChart from './MeasurementsChart';
import { MeasurementsChartItem, MetricLine } from '../Features/Metrics/Interfaces';
import { createChartDataItems, createMetricUnitsArray, filterNewMeasurement, graphqlClient } from '../utils/utils';
import MeasureCard from './MeasureCard';
import AlertParagraph from './AlertParagraph';
import useSelectedMetricsWithLastMeasure from '../utils/CustomHooks';

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

const useGetMultipleMeasurements = (input: { metricName: string }[]) => {
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
});

let batch: MeasurementsChartItem = {
  id: new Date().getTime(),
  at: '',
  milliseconds: 0,
};

const Dashboard = () => {
  const classes = useStyles();
  const [newMeasurementsSubResult] = useSubscription({ query: newMeasurementSub });
  const [chartData, setChartData] = useState<MeasurementsChartItem[]>([]);
  const [metricUnits, setMetricUnits] = useState<MetricLine[]>([]);
  const { selectedMetrics } = useSelector(getSelectedMetrics);
  const multipleMeasurementsInput = selectedMetrics.map((metric) => {
    return { metricName: metric.metric };
  });
  const [selectedMetricsWithLastMeasure, setSelectedMetricsWithLastMeasure] = useSelectedMetricsWithLastMeasure(
    selectedMetrics,
  );
  const {
    data: measurementsResponse,
    fetching: fetchingMeasurements,
    error: measurementsError,
  } = useGetMultipleMeasurements(multipleMeasurementsInput);
  let multipleMeasurementsResult = measurementsResponse;
  const { data: subscriptionResponse, error: subscriptionError } = newMeasurementsSubResult;

  useEffect(() => {
    multipleMeasurementsResult = multipleMeasurementsResult?.getMultipleMeasurements;
    setMetricUnits(createMetricUnitsArray(multipleMeasurementsResult));

    setChartData(createChartDataItems(multipleMeasurementsResult, 1000));
  }, [multipleMeasurementsResult]);

  useEffect(() => {
    if (subscriptionResponse) {
      const newMetric = subscriptionResponse.newMeasurement;
      const date = new Date(newMetric?.at);

      if (!batch[newMetric.metric]) {
        batch[newMetric.metric] = newMetric.value;
        batch.milliseconds = newMetric.at;
        batch.at = `${date.getUTCHours()}:${date.getUTCMinutes()}`;

        const newMetricInCurrentSelection = selectedMetrics.find((metric) => metric.metric === newMetric.metric);
        const currentMetricLastMeasure = selectedMetricsWithLastMeasure.find(
          (metric) => metric.metric === newMetric.metric,
        );

        if (newMetricInCurrentSelection) {
          if (currentMetricLastMeasure) {
            const indexOfCurrentLastMeasure = selectedMetricsWithLastMeasure.indexOf(currentMetricLastMeasure);
            const selectedMetricsWithLastMeasureReplacement = [...selectedMetricsWithLastMeasure];
            selectedMetricsWithLastMeasureReplacement.splice(indexOfCurrentLastMeasure, 1, {
              lastMeasure: newMetric.value,
              metric: newMetric.metric,
              unit: newMetric.unit,
              color: currentMetricLastMeasure.color,
            });
            setSelectedMetricsWithLastMeasure(selectedMetricsWithLastMeasureReplacement);
          } else {
            setSelectedMetricsWithLastMeasure([
              ...selectedMetricsWithLastMeasure,
              {
                lastMeasure: newMetric.value,
                metric: newMetric.metric,
                unit: newMetric.unit,
                color: newMetricInCurrentSelection.color,
              },
            ]);
          }
        }
      } else {
        const newChartData = filterNewMeasurement(chartData, batch, selectedMetrics);
        if (newChartData.length !== chartData.length) setChartData(newChartData.slice());
        batch = { id: new Date().getTime(), at: '', milliseconds: 0 };
      }
    }
  }, [subscriptionResponse]);

  const chart = measurementsError ? (
    <AlertParagraph
      bodyVariant="body1"
      body={measurementsError.message}
      color="error"
      headerVariant="h6"
      header="Error while getting multiple measurements:"
    />
  ) : (
    <MeasurementsChart metricUnits={metricUnits} data={chartData} />
  );

  const showLoading = fetchingMeasurements ? <CircularProgress /> : chart;

  const subscriptionLayout = subscriptionError ? (
    <AlertParagraph
      bodyVariant="body1"
      body={subscriptionError.message}
      color="error"
      headerVariant="h6"
      header="Error while getting real time last measures:"
    />
  ) : (
    <Grid container spacing={2} className={classes.cardsConteiner}>
      {selectedMetricsWithLastMeasure.map((measure) => {
        return <MeasureCard measure={measure} key={measure.metric} />;
      })}
    </Grid>
  );

  return (
    <Container maxWidth="lg">
      <Metrics />
      {subscriptionLayout}
      <Box pt={2} pb={3} alignItems="center" justifyContent="center" display="flex">
        {selectedMetrics.length !== 0 && showLoading}
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
