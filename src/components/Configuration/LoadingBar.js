import React, {Component} from 'react';
import LinearProgress from 'material-ui/LinearProgress';
class LoadingBar extends Component {
  constructor(props){
    super(props);
    this.state = {
      show:true,
      width:props.width,
      resultMsg:props.resultMsg
    }
  }
  dismiss=()=>{
    this.setState({show:false});
  }
  render(){
    return(
      this.state.show?
      <div>
        <LinearProgress
          style={{width:this.state.width, float:"none", margin:"auto"}}
          mode="indeterminate"
          ref={this.progress}/>
      </div>
      :<div>{this.state.resultMsg}</div>
    )
  }
}
export default LoadingBar;
