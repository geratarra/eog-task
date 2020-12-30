import { Box, Container } from '@material-ui/core';
import React from 'react';
import MultipleSelect from './MultipleSelect';

export default () => {
  const metrics = ['flareTemp', 'injValveOpen', 'oilTemp', 'casingPressure', 'tubingPressure', 'waterTemp'];
  return (
    <Container maxWidth="lg">
      {/* <Box></Box> */}
      <Box>
        <MultipleSelect values={metrics} />
      </Box>
    </Container>
  );
};
