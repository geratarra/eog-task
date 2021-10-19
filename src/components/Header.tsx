import React from 'react';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, styled } from '@material-ui/core';
import Weather from '../Features/Weather/Weather';

const WeatherContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  [theme.breakpoints.up('md')]: {
    justifyContent: 'end',
  },
  [theme.breakpoints.down('sm')]: {
    paddingBottom: '1rem',
  },
}));

const TitleContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'center',
    textAlign: 'center',
    paddingTop: '.6rem',
    paddingBottom: '.5rem',
  },
}));

const useStyles = makeStyles({
  title: {
    lineHeight: 'normal',
  },
});

export default () => {
  const classes = useStyles();

  // eslint-disable-next-line quotes
  const name = "Gerardo's";
  return (
    <AppBar position="static">
      <Toolbar>
        <Grid container>
          <Grid item xs={12} md={6}>
            <TitleContainer>
              <Typography variant="h6" color="inherit" className={classes.title}>
                {name}
                EOG React Visualization Assessment
              </Typography>
            </TitleContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <WeatherContainer>
              <Weather />
            </WeatherContainer>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};
