import React, {Component} from 'react';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import {Card, CardActions, CardText, CardMedia} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Logo from './logo.png';

import Authenticator from '../Firebase/Authenticator';
import App from '../../App';

class LogInButton extends Component {
  state = {
    open: false
  }

  handleOpen = () => {
    this.setState({open: true});
  }

  handleClose = () => {
    this.setState({open: false});
  }

  handleLogout = () => {
    window.location = "/login";
  }

  checkEmail = (email) => {
    var emailPos = email.indexOf("@");
    var dotPos = email.indexOf(".");
    return emailPos > 0 &&
           dotPos < email.length-1 &&
           emailPos < dotPos &&
           dotPos - emailPos > 1;
  }

  checkPassword = (password) => {
    return password.length > 1;
  }

  formChecking(email, password){
    if(this.checkEmail(email) && this.checkPassword(password)) return true;
    else return false;
  }

  async onSubmit(){
    var email = document.getElementById("txtEmail").value;
    var password = document.getElementById("txtPassword").value;
    if(this.formChecking(email, password) &&
       await Authenticator.login(email, password)) {
         window.location = "/";
         App.setLoggedIn();
    }
    else this.handleOpen();
  }

  render() {
    const actions = [
      <FlatButton
        label="Dismiss"
        primary={true}
        onClick={this.handleClose}
      />
    ];

    return (
      <div>
        <FlatButton onClick={this.onSubmit.bind(this)} primary={true} label="Login In" style={{width: "100%", color:"white", backgroundColor:"#FFCA28"}} />
        <Dialog
          title="Login Failure"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          Invalid information
        </Dialog>
      </div>
    );
  }
}

//Define component here
class LoginLayout extends Component {
  constructor(props){
    super(props);
    this.state = { emailErrMsg: '', pwErrMsg: ''}
  }

  checkEmail(email){
    var emailPos = email.indexOf("@");
    var dotPos = email.indexOf(".");
    return emailPos > 0 &&
           dotPos < email.length-1 &&
           emailPos < dotPos &&
           dotPos - emailPos > 1;
  }

  checkPassword(password){
    return password.length > 1;
  }

  onEmailBlur(event){
    if(!this.checkEmail(event.target.value))
      this.setState({ emailErrMsg: 'Invalid email format' })
    else this.setState({ emailErrMsg: '' })
  }

  onPasswordBlur(event){
    if(!this.checkPassword(event.target.value))
      this.setState({pwErrMsg: 'Password is required'})
    else this.setState({pwErrMsg: ''})
  }

  formChecking(email, password){
    if(this.checkEmail(email) && this.checkPassword(password)) return true;
    else return false;
  }

  render() {
    return (
      <div style={{padding:"20px", width:"80%",maxWidth:"600px", float:"none", margin:"auto", marginTop:"10%"}}>
        <Card>
          <CardMedia mediaStyle={{width:"30%", float:"none", margin:"auto", marginBottom:"5%"}}>
            <img src={Logo} alt=""/>
          </CardMedia>
          <CardText>
            <div style={{fontSize:"20px", fontWeight:"bold"}}>Login to RestMan<hr/></div>
            <div style={{margin: "auto", float: "none"}}>
              <TextField
                id="txtEmail"
                errorText= {this.state.emailErrMsg}
                onBlur={this.onEmailBlur.bind(this)}
                hintText="Email Address"
                style={{width:"90%", marginLeft:"5%"}} /><br/>
              <TextField
                id="txtPassword"
                type="password"
                ref="password"
                errorText= {this.state.pwErrMsg}
                onBlur={this.onPasswordBlur.bind(this)}
                floatingLabelText="Password"
                style={{width:"90%", marginLeft:"5%"}} />
            </div>
          </CardText>
          <CardActions style={{textAlign: "center"}}>
            <LogInButton/>
          </CardActions>
        </Card>
      </div>
    );
  }
}

export default LoginLayout;
