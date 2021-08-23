export interface MeasurementsChartItem {
  id: number;
  at: string;
  [key: string]: number | string;
}

export interface SelectedMetric {
  metric: string;
  lastMeasure?: number;
}
