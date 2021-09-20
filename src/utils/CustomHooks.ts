import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { LastMeasure, Metric } from '../Features/Metrics/Interfaces';

import { setDifference } from './utils';

export default function useSelectedMetricsWithLastMeasure(
  selectedMetrics: Metric[],
): [LastMeasure[], Dispatch<SetStateAction<LastMeasure[]>>] {
  const [selectedMetricsWithLastMeasure, setSelectedMetricsWithLastMeasure] = useState<LastMeasure[]>(
    selectedMetrics.map((metric) => {
      return {
        metric: metric.metric,
        lastMeasure: null,
        unit: null,
        color: metric.color,
      };
    }),
  );

  useEffect(() => {
    // We need to listen changes from selectedMetrics to remove Cards when user unselect a metric.
    if (selectedMetrics.length < selectedMetricsWithLastMeasure.length) {
      const selectedMetricsStrings = selectedMetrics.map((metric) => metric.metric);
      const selectedMetricsWithLastMeasureStrings = selectedMetricsWithLastMeasure.map((metric) => metric.metric);
      const selectedMetricsSet = new Set(selectedMetricsStrings);
      const selectedMetricsWithLastMeasureSet = new Set(selectedMetricsWithLastMeasureStrings);
      const removedElementAsSet = setDifference(selectedMetricsWithLastMeasureSet, selectedMetricsSet);
      const metricToRemove = [...removedElementAsSet][0];
      setSelectedMetricsWithLastMeasure(
        selectedMetricsWithLastMeasure.filter((metric) => metric.metric !== metricToRemove),
      );
    }
  }, [selectedMetrics]);

  return [selectedMetricsWithLastMeasure, setSelectedMetricsWithLastMeasure];
}
