import React, {useEffect, useState} from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Divider from '@material-ui/core/Divider';
import history from '../history';
import Typography from '@material-ui/core/Typography';
import AppBar from '../appBar';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import * as loadImage from 'blueimp-load-image';
import {useGeolocation} from './GPSBackground';
import {API_URL} from '../constants';
import Loading from '../Loading';

const styles = theme => ({
    root: {
      width: 300,
    },
    media: {
      height: 300,
    },
    appBarSpacer: theme.mixins.toolbar,
    btnWrapper: {
      position: 'relative',
      overflow: 'hidden',
      display: 'inline-block',
      margin: 'auto'
    },
    btn: {
      border: '2px solid gray',
      color: 'gray',
      backgroundColor: 'white',
      padding: '8px 20px',
      borderRadius: '8px',
      fontSize: '20px',
      fontWeight: 'bold'
    },
    file: {
      fontSize: '100px',
      position: 'absolute',
      left: '0',
      top: '0',
      opacity: '0'

    }
});

function MediaCard(props) {
    const {classes} = props;
    const state = useGeolocation();
    let user = JSON.parse(localStorage.getItem('user'));
    const [userAddress, setUserAddress] = useState("");
    const [open, setOpen] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [file, setFile] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const fileRef = React.useRef(null);

;    const handleClose = () => {
        setOpen(false);
    };

    function dataURItoBlob(dataURI) {
        var byteString = atob(dataURI.split(',')[1]);
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: 'image/jpeg' });
    }

    useEffect( () => {
        async function fetchData() {
            try {
                let address = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${state.latitude}&lon=${state.longitude}&accept-language=th`).then(res => res.json());
                setUserAddress(address.address);
            } catch (error) {
                console.log(error)
            }
        }
        if (state.latitude && state.longitude && !userAddress) fetchData();
    })

    const getPhoto = (e) => {
        console.log(e.target.files[0]);
        // resize(e.target.files[0], 1200, 1200, async function (resizedDataUrl) {
        //     let blob = dataURItoBlob(resizedDataUrl);
        //     let file = new File( [blob], 'selfie.jpg', { type: 'image/jpeg' } )
        //     setFile(file);
        // });
        loadImage(
            e.target.files[0],
            function (img) {
                // Create an empty canvas element
                var canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
            
                // Copy the image contents to the canvas
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
            
                // Get the data-URL formatted image
                // Firefox supports PNG and JPEG. You could check img.src to
                // guess the original format, but be aware the using "image/jpg"
                // will re-encode the image.
                var dataURL = canvas.toDataURL("image/png");
                let blob = dataURItoBlob(dataURL);
                let file = new File( [blob], 'selfie.jpg', { type: 'image/jpeg' } )
                setFile(file);
            },
            { maxWidth: 600, orientation: true} // Options
        );
        
    }

    function resize (file, maxWidth, maxHeight, fn) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (event) {
            var dataUrl = event.target.result;
    
            var image = new Image();
            image.src = dataUrl;
            image.onload = function () {
                var resizedDataUrl = resizeImage(image, maxWidth, maxHeight, 0.7);
                fn(resizedDataUrl);
            };
        };
    }
    
    function resizeImage(image, maxWidth, maxHeight, quality) {
        var canvas = document.createElement('canvas');
    
        var width = image.width;
        var height = image.height;
    
        if (width > height) {
            if (width > maxWidth) {
                height = Math.round(height * maxWidth / width);
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width = Math.round(width * maxHeight / height);
                height = maxHeight;
            }
        }
    
        canvas.width = width;
        canvas.height = height;
    
        var ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, width, height);
        return canvas.toDataURL("image/jpeg", quality);
    }
    
    async function submitData () {
        // alert(JSON.stringify(user));
        setLoading(true)
        let formData = new FormData();
        if(file && state.latitude && userAddress){
            formData.append("files.avatar", file);
            formData.append("data", JSON.stringify({
                "empID": user.empID,
                "lastName": user.lastName,
                "firstName": user.firstName,
                "birthday": new Date(user.birthday),
                "tel": user.tel,
                "email": user.email,
                "gender": user.gender,
                "latitude": state.latitude,
                "longitude": state.longitude,
                "address": Object.values(userAddress).splice(1).join (" "),
                "department": user.department,
                "company": user.company
            }));
            const rawResponse = await fetch(`${API_URL}/staff-locations`,{
                method: 'POST',
                body: formData
            });

            const content = await rawResponse.json();
            // alert(JSON.stringify(content));
            setLoading(false);
            if (content.statusCode && content.statusCode !== 200) {
                return setError(content.error)
            } else {
                return setOpen(true)
            }
            return content;
        } else {
            alert('Data is not complete');
            setLoading(false);
        }
    }

  if (loading) {return(<Loading />)} 
  else {
    return (
        <>
            <AppBar back={true} title={"Submit Checkin Data"}/>
            <div className={classes.appBarSpacer}/>
            <br />
            <Grid container 
                justify="center"
                alignItems="center"
            >
            <Card className={classes.root}>
            <CardActionArea>
                <div onClick={() => fileRef.current.click()} >
                <CardMedia
                    component="img"
                    className={classes.media}
                    image={file?URL.createObjectURL(file):"/aapico-checkin/images/placeholder.png"}
                    title="Profile"
                /></div>
                <input type="file" ref={fileRef} className={classes.file} accept="image/x-png,image/jpeg,image/gif,image/png" 
                    style={{visibility: 'hidden'}}
                    onChange={(event)=> { 
                        getPhoto(event) 
                    }}
                />
                <Divider />
                <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                    <strong>{user.firstName + ' ' + user.lastName}</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                    Address: <strong>{Object.values(userAddress).splice(1).join (" ")}</strong>
                    <br />
                    ID: {user.empID} | Tel: {user.tel} 
                    <br />
                    Gender: {user.gender} | Birthday: {new Date(user.birthday).toLocaleDateString()}
                    <br />
                    Email: {user.email}
                </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions style={{display: "flex", justifyContent: "space-between"}}>
                <Button size="small" color="primary" onClick={() => history.goBack()} >
                Go Back
                </Button>
                <Button size="small" color="primary" onClick={() => submitData()} >
                Submit
                </Button>
            </CardActions>
            </Card>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Check in information"}</DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {!error?"Successfully!!!":"Problems in submission"}
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button onClick={() => {
                        setOpen(false);
                        return !error?history.push('./checkin'):null;
                    }} color="primary" autoFocus>
                    OK
                </Button>
                </DialogActions>
            </Dialog>
            
            </Grid>
        </>
    )};          
}


export default withStyles(styles)(MediaCard);

