import React from 'react';

export default () => {
  <FormControl className={classes.formControl}>
    <InputLabel id="demo-mutiple-name-label">Name</InputLabel>
    <Select
      labelId="demo-mutiple-name-label"
      id="demo-mutiple-name"
      multiple
      value={personName}
      onChange={handleChange}
      input={<Input />}
      MenuProps={MenuProps}
    >
      {names.map((name) => (
        <MenuItem key={name} value={name} style={getStyles(name, personName, theme)}>
          {name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>;
};
