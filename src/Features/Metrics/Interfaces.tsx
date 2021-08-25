export interface MeasurementsChartItem {
  id: number;
  at: string;
  [key: string]: number | string;
}

export interface Metric {
  metric: string;
  lastMeasure?: number;
  unit?: string;
  color?: string;
}
