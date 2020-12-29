import React, { ReactChildren, ReactChild } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  wrapper: {
    height: '100vh',
  },
});

interface WrapperProps {
  children: ReactChild | ReactChildren;
}

const Wrapper = ({ children }: WrapperProps) => {
  const classes = useStyles();
  return <div className={classes.wrapper}>{children}</div>;
};

export default Wrapper;
