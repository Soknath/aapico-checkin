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
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {API_URL} from '../constants';
import Loading from '../Loading';
import {
    BrowserView,
    MobileView,
    isBrowser,
    isMobile
  } from "react-device-detect";
import WebCam from './Webcam';

const healths = ["healthy", "Sick (fever or cough or cold)", "Sick Covid-19"];
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
    const [health, setHealth] = React.useState("healthy");
    const [webCam, setWebcam] = React.useState(false);

    const handleClose = () => {
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

    // https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${state.latitude}&lon=${state.longitude}&accept-language=th
    useEffect( () => {
        async function fetchData() {
            try {
                let address = await fetch(`https://search.map.powermap.in.th/api/v2/map/reverse_geocode?lat=${state.latitude}&lng=${state.longitude}&sort=d&&access_token=b378c575291af30a29f59919fd7e7e4c012d45c4`).then(res => res.json());
                console.log(address);
                setUserAddress(`${address.data[0].tambon_e}, ${address.data[0].amphoe_e}, ${address.data[0].province_e},  ${address.data[0].postcode}`);
            } catch (error) {
                console.log(error)
            }
        }
        
        if (state.latitude && state.longitude && !userAddress){
            fetchData();
        }
    })

    const handleChangeHealth = health => {
        setHealth(health.target.value);
    };

    const getPhoto = (e) => {
        console.log(e.target.files[0]);
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
                var dataURL = canvas.toDataURL();
                let blob = dataURItoBlob(dataURL);
                let file = new File( [blob], 'selfie.jpg', { type: 'image/jpeg' } )
                resize(file, 1200, 1200, async function (resizedDataUrl) {
                    let blob = dataURItoBlob(resizedDataUrl);
                    let fileResize = new File( [blob], 'selfie.jpg', { type: 'image/jpeg' } )
                    setFile(fileResize);
                });
                setFile(file);
            },
            {orientation: true} // Options
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
                "tel": user.tel,
                "email": user.email,
                "gender": user.gender,
                "latitude": state.latitude,
                "longitude": state.longitude,
                "address": userAddress,
                "department": user.department,
                "company": user.company,
                "healthStatus": health
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
        } else {
            if (!file) {
                alert('Picture not found.');
                setLoading(false);
            }
            else {
                alert('Location not found.');
                setLoading(false);
            }
        }
    }
    const getImage= (image) => {
        setWebcam(false);
        let blob = dataURItoBlob(image);
        let file = new File( [blob], 'selfie.jpg', { type: 'image/jpeg' } )
        resize(file, 1200, 1200, async function (resizedDataUrl) {
            let blob = dataURItoBlob(resizedDataUrl);
            let fileResize = new File( [blob], 'selfie.jpg', { type: 'image/jpeg' } )
            setFile(fileResize);
        });
        setFile(file);
        console.log(image);
    }

    if (loading) return <Loading />
    if (webCam) return <WebCam imageCallback={getImage}/>
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
                <div onClick={() => {
                    if (isMobile) return fileRef.current.click();
                    return setWebcam(true);
                }}
                >
                <CardMedia
                    component="img"
                    className={classes.media}
                    image={file?URL.createObjectURL(file):"/aapico-checkin/images/placeholder.png"}
                    title="Profile"
                /></div>
                <input type="file" ref={fileRef} className={classes.file} accept="image/*" 
                    style={{visibility: 'hidden'}}
                    onChange={(event)=> { 
                        getPhoto(event) 
                    }}
                    capture="user"
                />
                <Divider />
                <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                    <strong>{user.firstName + ' ' + user.lastName}</strong>
                </Typography>
                <FormControl variant="outlined" className={classes.formControl} fullWidth size="small" >
                    <InputLabel id="demo-simple-select-outlined-label">Health Status</InputLabel>
                    <Select
                        labelId="demo-simple-select-outlined-label"
                        id="demo-simple-select-outlined"
                        value={health}
                        onChange={handleChangeHealth}
                        label="Health Status"
                    >
                        {healths.map((health, index) => (
                        <MenuItem value={health} key={index}>{health}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Typography variant="body2" color="textSecondary" component="p">
                    Address: <strong>{userAddress}</strong>
                    <br />
                    ID: {user.empID} | Tel: {user.tel} 
                    <br />
                    Email: {user.email}
                    <br />
                </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions style={{display: "flex", justifyContent: "space-between"}}>
                <Button size="small" color="primary" onClick={() => history.push('/checkin')} >
                Go Back
                </Button>
                <Button size="small" variant="contained" color="primary" onClick={() => submitData()} >
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
    );
}          


export default withStyles(styles)(MediaCard);

