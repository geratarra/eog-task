import { createSlice, PayloadAction } from 'redux-starter-kit';
import { SelectedMetric } from './Interfaces';

type MetricsState = {
  metrics: string[];
  selectedMetrics: SelectedMetric[];
};

const initialState: MetricsState = {
  metrics: ['flareTemp', 'injValveOpen', 'oilTemp', 'casingPressure', 'tubingPressure', 'waterTemp'],
  selectedMetrics: [],
};

export type ApiErrorAction = {
  error: string;
};

const slice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {
    metricsReceived: (state, action: PayloadAction<string[]>) => {
      state.metrics = action.payload;
    },
    selectedMetrics: (state, action: PayloadAction<SelectedMetric[]>) => {
      state.selectedMetrics = action.payload;
    },
    // eslint-disable-next-line no-unused-vars
    metricsApiErrorReceived: (state, action: PayloadAction<ApiErrorAction>) => state,
  },
});

export const { reducer } = slice;
export const { actions } = slice;
