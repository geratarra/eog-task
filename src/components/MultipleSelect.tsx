import { InputLabel, FormControl, Select, Input, MenuItem, makeStyles } from '@material-ui/core';
import React, { useState } from 'react';

type MultipleSelectProps = {
  values: string[];
};

const useStyles = makeStyles({
  formControl: {
    minWidth: 120,
  },
});

const MultipleSelect = ({ values = ['No metrics'] }: MultipleSelectProps) => {
  const [multipleSelectValue, setMultipleSelectValue] = useState<string[]>([]);
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setMultipleSelectValue(event.target.value as string[]);
  };

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="mutiple-metric-label">Select metric...</InputLabel>
      <Select
        labelId="mutiple-metric-label"
        id="mutiple-metric"
        multiple
        value={multipleSelectValue}
        onChange={handleChange}
        input={<Input />}
      >
        {values.map((value: string) => (
          <MenuItem key={value} value={value}>
            {value}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MultipleSelect;
