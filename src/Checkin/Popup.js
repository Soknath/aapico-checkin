import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import {API_URL} from '../constants';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    color: 'black',
    maxWidth: 320
  }
}));

export default function MediaControlCard(props) {
  const classes = useStyles();
  const link = props.info.avatar.formats?props.info.avatar.formats.thumbnail.url:props.info.avatar.url;
  return (
    <Grid container alignItems="flex-start" className={classes.root} spacing={2}>
    <Grid item xs={2} 
        style={{margin: "auto"}}
    >
        <Avatar
            src={API_URL + link}
            alt={props.info.firstName}
        />
    </Grid>
    <Grid item xs={10}>
        <Typography component="subtitle" variant="subtitle">
            {props.info.address}
        </Typography>
        <br />
        <small>{new Date(props.info.createdAt).toLocaleString()}</small>
    </Grid>
    </Grid>
  );
}