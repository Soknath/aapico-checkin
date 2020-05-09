import React from "react";
import Webcam from "react-webcam";
import {Button, Grid} from "@material-ui/core";

function WebcamComponent (props){
    const webcamRef = React.useRef(null);
    const capture = React.useCallback(
        () => {
        const imageSrc = webcamRef.current.getScreenshot();
        console.log(imageSrc);
        props.imageCallback(imageSrc);
        },
        [webcamRef]
    );
    return (
        <Grid container justify="center" direction="column">
            <Webcam
                audio={false}
                ref={webcamRef}
            />
            <Button variant="contained" color="primary" onClick={capture}>Capture Photo</Button>
        </Grid>
    )
} 

export default WebcamComponent;