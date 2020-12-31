import { Box, Card, CardContent, Container, Grid, Typography } from '@material-ui/core';
import React from 'react';
import MultipleSelect from './MultipleSelect';

interface Metric {
  metric: string;
  value: number;
  unit: string;
}

export default () => {
  const metrics = ['flareTemp', 'injValveOpen', 'oilTemp', 'casingPressure', 'tubingPressure', 'waterTemp'];

  const selectedValuesHandler = (values: string[]) => {
    console.log('values from dashboard', values);
  };

  const selectedMetris: Metric[] = [
    {
      metric: 'oilTemp',
      value: 96.08,
      unit: 'F',
    },
    {
      metric: 'anotherTemp',
      value: 96.08,
      unit: 'F',
    },
    {
      metric: 'waterTemp',
      value: 96.08,
      unit: 'F',
    },
  ];
  return (
    <Container maxWidth="lg">
      <Grid direction="row" spacing={2} container>
        <Grid md={8} item>
          <Grid container spacing={2}>
            {selectedMetris.map((metric) => {
              return (
                <Grid key={metric.metric} xs={6} item>
                  <Card>
                    <CardContent>
                      <CardContent>
                        <Typography>{metric.metric}</Typography>
                        <Typography>{metric.value}</Typography>
                      </CardContent>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
        <Grid xs={12} sm={12} md={4} item>
          <Box display="flex" flexDirection="row" justifyContent="flex-end">
            <MultipleSelect values={metrics} changeCallback={selectedValuesHandler} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};
