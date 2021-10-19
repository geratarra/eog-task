// GraphQL
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { createClient, defaultExchanges, subscriptionExchange } from 'urql';

// App stuff
import { MeasurementResponse, MeasurementsChartItem, Metric, MetricLine } from '../Features/Metrics/Interfaces';
import { API_URL, Color, WS_URL } from './constants';

const subscriptionClient = new SubscriptionClient(WS_URL, {
  reconnect: true,
});

const graphqlClient = createClient({
  url: API_URL,
  exchanges: [
    ...defaultExchanges,
    subscriptionExchange({
      forwardSubscription: (operation) => subscriptionClient.request(operation),
    }),
  ],
});

/**
 * @returns Difference/Complement between setA and setB.
 */
const setDifference = (setA: Set<string>, setB: Set<string>) => {
  const difference = new Set(setA);
  setB.forEach((elem) => {
    difference.delete(elem);
  });
  return difference;
};

/**
 *
 * @param data Measures array.
 * @param newMeasurement New measure coming from Subscription.
 * @param {Metric[]} filters Currently selected metrics.
 * @returns Measures array included latest measure from Subscription.
 */
const filterNewMeasurement = (
  data: MeasurementsChartItem[],
  newMeasurement: MeasurementsChartItem,
  filters: Metric[],
) => {
  const measureToAdd: MeasurementsChartItem = {
    id: newMeasurement.id,
    at: newMeasurement.at,
    milliseconds: newMeasurement.milliseconds,
  };
  // Add new measure for every selected metric.
  filters.forEach((selectedMetric) => {
    measureToAdd[selectedMetric.metric] = newMeasurement[selectedMetric.metric];
  });
  return [...data, measureToAdd];
};

/**
 * @param multipleMeasurementsResult Array measures returned from the API.
 * @param {number} limit This paramater is used to limit the number of points to render in the chart. Rendering all points
 * coming frmo the API makes the chart looks non-aesthetic since they are too many.
 * @returns Data array in proper format to populate Recharts chart.
 */
// eslint-disable-next-line no-unused-vars
const createChartDataItems = (multipleMeasurementsResult: MeasurementResponse[], limit: number) => {
  const chartDataItems: MeasurementsChartItem[] = [];

  if (multipleMeasurementsResult?.length !== 0) {
    let date;
    let count = 0;

    for (let i = 0; i < multipleMeasurementsResult?.length; i += 1) {
      for (
        let k =
          multipleMeasurementsResult[i].measurements.length - limit > 0
            ? multipleMeasurementsResult[i].measurements.length - limit
            : multipleMeasurementsResult[i].measurements.length - limit;
        k < multipleMeasurementsResult[i].measurements.length;
        k += 1
      ) {
        chartDataItems[count] = chartDataItems[count] || {};
        chartDataItems[count][multipleMeasurementsResult[i].metric] =
          multipleMeasurementsResult[i].measurements[k].value;
        date = new Date(multipleMeasurementsResult[i].measurements[k].at);
        chartDataItems[count].at = `${date.getUTCHours()}:${date.getUTCMinutes()}`;
        chartDataItems[count].milliseconds = multipleMeasurementsResult[i].measurements[k].at;
        count += 1;
      }
      count = 0;
    }
  }

  return chartDataItems;
};

/**
 * @param multipleMeasurementsResult Array measures returned from the API.
 * @returns Array of elements which contain metric name, unit and color used in the chart.
 */
const createMetricUnitsArray = (multipleMeasurementsResult: MeasurementResponse[]) => {
  const auxMetricUnits: MetricLine[] = [];

  if (multipleMeasurementsResult?.length !== 0) {
    for (let i = 0; i < multipleMeasurementsResult?.length; i += 1) {
      // eslint-disable-next-line no-debugger
      //   debugger;
      auxMetricUnits.push({
        metric: multipleMeasurementsResult[i].metric,
        unit: multipleMeasurementsResult[i].measurements[0].unit,
        color: getColor(multipleMeasurementsResult[i].metric),
        min: 0,
        render: true,
      });
    }
  }

  return auxMetricUnits;
};

/**
 * @param metric Color's metric.
 * @returns A color in string format.
 */
const getColor = (metric: string) => {
  return Color[metric as keyof typeof Color] || `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

export { filterNewMeasurement, setDifference, graphqlClient, getColor, createMetricUnitsArray, createChartDataItems };
