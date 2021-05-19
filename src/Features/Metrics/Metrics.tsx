import React, { useEffect } from 'react';
import { Provider, createClient, useQuery } from 'urql';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress, makeStyles } from '@material-ui/core';
import { actions } from './reducer';
import { IState } from '../../store';
import MultipleSelect from '../../components/MultipleSelect';

const useStyles = makeStyles({
  selectContainer: {
    marginBottom: 10,
  },
});

const client = createClient({
  url: 'https://react.eogresources.com/graphql',
});

const getMetricsQuery = `
query {
  getMetrics
}
`;

const getMetrics = (state: IState) => {
  const { metrics } = state.metrics;
  return {
    metrics,
  };
};

const Metrics = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { metrics } = useSelector(getMetrics);

  const selectedValuesHandler = (values: string[]) => {
    dispatch(actions.selectedMetrics(values));
  };

  const [result] = useQuery({
    query: getMetricsQuery,
  });
  const { fetching, data, error } = result;

  useEffect(() => {
    if (error) {
      dispatch(actions.metricsApiErrorReceived({ error: error.message }));
      return;
    }
    if (!data) return;
    dispatch(actions.metricsReceived(data.getMetrics));
  }, [dispatch, data, error]);

  if (fetching) return <CircularProgress />;
  return (
    <Box className={classes.selectContainer}>
      <MultipleSelect values={metrics} changeCallback={selectedValuesHandler} />
    </Box>
  );
};

export default () => {
  return (
    <Provider value={client}>
      <Metrics />
    </Provider>
  );
};
