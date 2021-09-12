import { Typography, TypographyVariant } from '@material-ui/core';
import React from 'react';

type TypographyColor = 'initial' | 'inherit' | 'primary' | 'secondary' | 'textPrimary' | 'textSecondary' | 'error';

interface AlertParagraphProps {
  headerVariant: TypographyVariant;
  color: TypographyColor;
  header: string;
  body: string;
  bodyVariant: TypographyVariant;
}

const AlertParagraph = ({ bodyVariant, headerVariant, color, header, body }: AlertParagraphProps) => {
  return (
    <div>
      <Typography variant={headerVariant} color={color}>
        {header}
      </Typography>
      <Typography variant={bodyVariant}>{body}</Typography>
    </div>
  );
};

export default AlertParagraph;
