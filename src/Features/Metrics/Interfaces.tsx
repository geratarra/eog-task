export type MeasurementsChartItem = {
  id: number;
  at: string;
  milliseconds: number;
} & {
  [key: string]: number | string;
};

export interface Metric {
  color: string;
  metric: string;
}

export interface MetricLine extends Metric {
  render: boolean;
  min: number;
  unit: string;
}

export interface LastMeasure extends Metric {
  lastMeasure: number | null;
  unit: string | null;
}

export interface Measure {
  at: number;
  metric: string;
  unit: string;
  value: number;
}

export interface MeasurementResponse {
  metric: string;
  measurements: Measure[];
}
