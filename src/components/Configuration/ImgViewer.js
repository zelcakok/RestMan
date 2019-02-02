import React, {Component} from 'react';
import FlatButton from 'material-ui/FlatButton';
import {orangeA200} from 'material-ui/styles/colors';
import Dialog from 'material-ui/Dialog';
class ImgViewer extends Component {
  constructor(props){
    super(props);
    this.state={
      show:false,
      src:props.src
    }
  }
  show=()=>{
    this.setState({show:true});
  }
  dismiss=()=>{
    this.setState({show:false});
  }
  render(){
    return (
      this.state.show?
        <Dialog
          contentStyle={{width:"70%", display: 'flex',flexWrap: 'wrap',overflowX: 'auto',justifyContent: 'space-around'}}
          open={this.state.show}
          modal={false}
          actions={<FlatButton label="Dismiss" primary={true} style={{color:orangeA200}} onClick={this.dismiss}/>}
          onRequestClose={this.dismiss}>
          <img style={{width:"100%", height:"auto"}} src={this.state.src} alt=""/>
        </Dialog> : null
    )
  }
}
export default ImgViewer;
