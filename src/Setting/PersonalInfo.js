import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {Button, Paper, Grid, withStyles, 
  RadioGroup, TextField,
  Radio,
  FormControlLabel,
  InputAdornment
} from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import * as yup from "yup";
const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/

const schema = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  tel: yup.string().matches(phoneRegExp, 'Phone number is not valid'),
  email: yup.string().email(),
  empID: yup.string().required(),
  birthday: yup.string().required()
});

const styles = theme => ({
  button: { background: 'black' },
  margin: {
      margin: theme.spacing.unit * 2,
  },
  container: {
      padding: theme.spacing.unit * 2,
      maxWidth: 400,
      margin: 'auto'
  }
});

function Register(props) {
  const { handleSubmit, errors, control } = useForm({validationSchema: schema,
  defaultValues: {
    firstName: '',
    lastName: '',
    tel: '',
    email: '',
    gender: 'male',
    empID: '',
    birthday: new Date()
  }});
  const { classes } = props;
  console.log(errors);
  
  // The first commit of Material-UI
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const onSubmit = data => {
    console.log(data);
  }
  const handleDateChange = date => {
    setSelectedDate(date);
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
    <Paper className={classes.container}> 
    <br />
    <Grid container justify="center" >
        <PersonIcon color="primary" style={{ fontSize: 60 }}  />
    </Grid>
    <br />
    <form onSubmit={handleSubmit(onSubmit)}>
    <Grid container justify="center" spacing={2}>
    <Grid item xs={6}>
        <Controller as={
          <TextField
            label='First Name'
            variant='outlined'
            margin='normal'
            InputLabelProps={{
              shrink: true
            }}
            required
            size="small"
          />
          } 
          type="text" name="firstName" control={control}/>
          
    </Grid>
    <Grid item xs={6}>
        <Controller as={
          <TextField
            label='Last Name'
            variant='outlined'
            margin='normal'
            InputLabelProps={{
              shrink: true
            }}
            required
            size="small"
          />
          } 
          type="text" name="lastName" control={control}/>
    </Grid> 
    <Grid item xs={6}>
        <Controller as={
          <TextField
            label='Mobile Number'
            variant='outlined'
            margin='normal'
            InputLabelProps={{
              shrink: true
            }}
            fullWidth
            size="small"
            error={!!errors.tel}
            helperText={!!errors.tel?errors.tel.message:""}
          />
          } type="tel" name="tel" control={control}  
          />
        </Grid> 
        <Grid item xs={6}>
        <Controller as={
            <TextField
              label='Email'
              variant='outlined'
              margin='normal'
              InputLabelProps={{
                shrink: true
              }}
              fullWidth
              size="small"
              error={!!errors.email}
              helperText={!!errors.email?errors.email.message:""}
            />
            } 
            type="text" name="email" control={control} />
        </Grid> 
        <Grid item xs={12}>
        <Controller
            as={
              <RadioGroup aria-label="gender" row defaultValue="male" >
                <FormControlLabel
                  value="female"
                  control={<Radio />}
                  label="Female"
                />
                <FormControlLabel
                  value="male"
                  control={<Radio />}
                  label="Male"
                />
              </RadioGroup>
            }
            name="RadioGroup"
            control={control}
            defaultValue="male"
          />
        </Grid> 
        <Grid item xs={6}>
        <Controller as={
          <TextField
            label='Employee ID'
            InputLabelProps={{
              shrink: true
            }}
            required
            fullWidth
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  <FingerprintIcon />
                </InputAdornment>
              ),
            }}
          />
          } 
          type="text" name="empID" control={control}/>
      </Grid> 
      <Grid item xs={6}>
        <Controller as={
          <KeyboardDatePicker
            id="date-picker-dialog"
            label="Birthday"
            format="MM/dd/yyyy"
            value={selectedDate}
            onChange={handleDateChange}
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
            size="small"
            fullWidth
          />
          } 
          name="birthday" defaultValue={selectedDate} control={control}/>
      </Grid>
      <hr />
      <Grid container justify="flex-end" spacing={2}>
        <Grid item>
            <Button type="submit" variant="contained" color="secondary" style={{ textTransform: "none" }}size="small" >Verify & Create Account</Button>
        </Grid>
      </Grid>
      {/* <input type="submit" /> */}
      </Grid>
      </form>
    </Paper>
    </MuiPickersUtilsProvider>
  );
}

export default withStyles( styles )(Register);