import React, {Component} from 'react';
import FlatButton from 'material-ui/FlatButton';
import {orangeA200} from 'material-ui/styles/colors';
import Dialog from 'material-ui/Dialog';
class ErrDialog extends Component{
  constructor(props){
    super(props);
    this.state={
      show:false,
      msg:props.msg
    }
  }
  show=(msg)=>{
    this.setState({msg:msg===null?this.state.msg:msg}, ()=>(
      this.setState({show:true})
    ))
  }
  componentWillUnmount=()=>{

  }
  dismiss=()=>{
    this.setState({show:false});
  }
  render(){
    return(
      <Dialog
        open={this.state.show}
        title="Error"
        modal={false}
        actions={<FlatButton label="Dismiss" primary={true} style={{color:orangeA200}} onClick={this.dismiss}/>}
        onRequestClose={this.dismiss}>{this.state.msg}</Dialog>
    )
  }
}
export default ErrDialog;
