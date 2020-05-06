import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import AlarmOnIcon from '@material-ui/icons/AlarmOn';
import ErrorIcon from '@material-ui/icons/Error';
import Loading from '../Loading';
import moment from 'moment';

import {API_URL} from '../constants';

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
});
const anchor = 'right';

export default function SwipeableTemporaryDrawer(props) {
  const classes = useStyles();
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: true,
  });
  const [loading, setLoading] = useState(false);
  const user = localStorage.getItem('user');
  const [data, setData] = useState(null);
  const startOfMonth = moment().startOf('month').format();
  useEffect(() => {
    if (user){
      setLoading(true);
      fetch(`${API_URL}/staff-locations?empID=${JSON.parse(user).empID}&createdAt_gte=${startOfMonth}&_sort=createdAt:DESC`)
        .then(res => res.json())
        .then(response => {
          console.log(response)
          setData(response);
          setLoading(false);
        })
        .catch(error => console.log(error));
    } else {
      alert ('No user profile found')
    }
  }, []);

  const toggleDrawer = (anchor, open) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, [anchor]: open });
    if(!open) {
        props.drawerClose();
    }
  };

  const list = (anchor) => (
    <div
      className={clsx(classes.list, {
        [classes.fullList]: anchor === 'top' || anchor === 'bottom',
      })}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        {data?data.map((text, index) => (
          <>
          <ListItem button key={text} onClick={()=> props.callBack(text)}>
            <ListItemAvatar>
              <Avatar alt={text.firstName} src={API_URL+text.avatar.url} />
            </ListItemAvatar>
            <ListItemText primary={new Date(text.createdAt).toLocaleDateString()+"-"+new Date(text.createdAt).toLocaleTimeString()} secondary={text.address}/>
          </ListItem>
          <Divider variant="inset" component="li" />
          </>
        )):
          <ListItem button key={"error"}>
            <ListItemIcon><ErrorIcon /></ListItemIcon>
            <ListItemText primary={"no record found"} />
          </ListItem>
        }
      </List>
      
    </div>
  );
  if (loading) {
    return (<Loading />)
  } else {
    return (
      <div>
          <React.Fragment key={anchor}>
            <SwipeableDrawer
              anchor={anchor}
              open={state[anchor]}
              onClose={toggleDrawer(anchor, false)}
              onOpen={toggleDrawer(anchor, true)}
            >
              {list('right')}
            </SwipeableDrawer>
          </React.Fragment>
      </div>
    );
  }
}