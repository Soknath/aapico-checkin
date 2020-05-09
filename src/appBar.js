import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InfoIcon from '@material-ui/icons/Info';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import EventNoteIcon from '@material-ui/icons/EventNote';
import Switch from '@material-ui/core/Switch';
import Dialog from './infoDialog';
import history from './history';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  rightSwitch: {
    marginLeft: 'auto',
    color: '#FFFFFF'
  }
}));

export default function DenseAppBar(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [mapView, setMapView] = React.useState({
    mapView: false
  });

  const handleChange = (event) => {
    setMapView(event.target.checked);
    props.onSelectMap(mapView);  
  };

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };

  const handleClickBack = () => {
      history.push("/checkin");
  }

  const handleClose = value => {
    setOpen(false);
  };

  let deferredPrompt; // Allows to show the install prompt
  let setupButton;
  window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
      console.log("beforeinstallprompt fired");
      if (setupButton === undefined) {
          setupButton = document.getElementById("setup_button");
      }
      // Show the setup button
      setupButton.style.display = "inline";
      setupButton.disabled = false;
  });

  const installApp = () => {
      // Show the prompt
      deferredPrompt.prompt();
      setupButton.disabled = true;
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice
          .then((choiceResult) => {
              if (choiceResult.outcome === 'accepted') {
                  console.log('PWA setup accepted');
                  // hide our user interface that shows our A2HS button
                  setupButton.style.display = 'none';
              } else {
                  console.log('PWA setup rejected');
              }
              deferredPrompt = null;
          });
  }

  window.addEventListener('appinstalled', (evt) => {
      console.log("appinstalled fired", evt);
  });

  return (
    <div className={classes.root}>
      <AppBar position="fixed">
        <Toolbar>
        {/* get back button from history */}
        {/* {props.info?
          <IconButton onClick={handleClickOpen} edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <InfoIcon />
          </IconButton>
        :null} */}
        {props.back?
          <IconButton onClick={handleClickBack} edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <ChevronLeftIcon />
          </IconButton>
        :null}
        <img src="/aapico-checkin/images/Logo4.png" height="42" />
        <Button id="setup_button" onClick={()=>installApp()}>Installer</Button>
        {props.company?
          <div className={classes.rightSwitch}>
          <FormControlLabel
            control={<Switch
                checked={mapView}
                onChange={handleChange}
                name="mapView"
              />}
              label={mapView?"List":"Map"}
          />
          </div>
        :null}
        {props.history?
          <Button onClick={() => props.drawerOpen()} className={classes.rightSwitch} startIcon={<EventNoteIcon />} >
            <p>{localStorage.getItem('user')?'ID: ' + JSON.parse(localStorage.getItem('user')).empID:null}</p>
          </Button>
        :null}
        </Toolbar>
      </AppBar>
      <Dialog open={open} onClose={handleClose}/>
    </div>
  );
}