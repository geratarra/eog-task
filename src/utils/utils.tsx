import { MeasurementsChartItem, SelectedMetric } from '../Features/Metrics/Interfaces';

/**
 *
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
 * @param {SelectedMetric[]} filters Currently selected metrics.
 * @returns Measures array included latest measure from Subscription.
 */
const filterNewMeasurement = (data: any, newMeasurement: MeasurementsChartItem, filters: SelectedMetric[]) => {
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

export { filterNewMeasurement, setDifference };
