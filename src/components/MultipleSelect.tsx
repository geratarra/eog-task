import { InputLabel, FormControl, Select, Input, MenuItem, makeStyles, Chip } from '@material-ui/core';
import React, { useState } from 'react';

type MultipleSelectProps = {
  values: string[];
  changeCallback: Function;
};

const useStyles = makeStyles({
  formControl: {
    minWidth: 180,
    backgroundColor: 'white',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
});

const MultipleSelect = ({ values = ['No metrics'], changeCallback }: MultipleSelectProps) => {
  const [multipleSelectValue, setMultipleSelectValue] = useState<string[]>([]);
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setMultipleSelectValue(event.target.value as string[]);
    changeCallback(event.target.value as string[]);
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
        renderValue={(selected) => (
          <div className={classes.chips}>
            {(selected as string[]).map((value) => (
              <Chip key={value} label={value} className={classes.chip} />
            ))}
          </div>
        )}
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
