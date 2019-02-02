import React,{Component} from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import {orangeA200} from 'material-ui/styles/colors';

class SessionExpiredDialog extends Component {
  constructor(props){
    super(props);
    this.state = {
      open:false,
      isLoggedIn:false
    }

    this.show=()=>{
      this.setState({open:true});
    }

    this.dismiss = () =>{
      this.setState({open:false});
      window.location = "/login";
    }

    this.parent = props.parent;
  }

  render() {
    return (
      <div>
        <MuiThemeProvider>
          <Dialog
            key="sessionExpiredDialog"
            title="Session Expired"
            actions={
              <FlatButton
                label="Dismiss"
                primary={true}
                style={{color:orangeA200}}
                onClick={this.dismiss}
              />
            }
            modal={false}
            open={this.state.open}
            onRequestClose={this.dismiss}
          >
            Please login again.
          </Dialog>
        </MuiThemeProvider>
      </div>
    );
  }
}

export default SessionExpiredDialog;
