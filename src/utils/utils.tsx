// GraphQL
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { createClient, defaultExchanges, subscriptionExchange } from 'urql';

// App stuff
import { MeasurementsChartItem, Metric } from '../Features/Metrics/Interfaces';
import { API_URL, WS_URL } from './constants';

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
const setDifference = (setA: Set<String>, setB: Set<String>) => {
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
const filterNewMeasurement = (data: any, newMeasurement: MeasurementsChartItem, filters: Metric[]) => {
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
 * @param {number} limit Number to limit the data array to populate the chart.
 * @returns Data array in proper format to populate Recharts chart.
 */
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

/**
 * @param multipleMeasurementsResult Array measures returned from the API.
 * @returns Array of elements which contain metric name, unit and color used in the chart.
 */
const createMetricUnitsArray = (multipleMeasurementsResult: any[]) => {
  const auxMetricUnits: Metric[] = [];

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

/**
 * @param index Index of item corresponding to a color in the array.
 * @returns A color in string format.
 */
const getColor = (index: number) =>
  ['green', 'blue', 'red', 'black', 'pink', 'purple', 'orange'][index] ||
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

export { filterNewMeasurement, setDifference, graphqlClient, getColor, createMetricUnitsArray, createChartDataItems };
