import { Card, CardContent, Grid, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { LastMeasure } from '../Features/Metrics/Interfaces';

type MeasureCardProps = {
  measure: LastMeasure;
};

const useStyles = makeStyles({
  cardsConteiner: {
    paddingBottom: '1%',
  },
  cardContent: {
    padding: '5%',
    paddingRight: '10%',
  },
});

const MeasureCard = ({ measure }: MeasureCardProps) => {
  const classes = useStyles();

  return (
    <Grid key={`grid_${measure.metric}`} xs={6} sm={4} md={3} item>
      <Card>
        <CardContent className={classes.cardContent}>
          <Typography variant="h6">{`${measure.metric} (${measure.unit})`}</Typography>
          <Typography style={{ color: `${measure.color}` }} variant="h3">
            {measure.lastMeasure}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default MeasureCard;
