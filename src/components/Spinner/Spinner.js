import React, {Component} from 'react';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import {orangeA200} from 'material-ui/styles/colors';
class Spinner extends Component{
  constructor(props){
    super(props);
    this.state = {
      show:true
    }
  }

  dismiss=()=>{
    this.setState({show:false});
  }

  render(){
    return(
      this.state.show?
      <div style={{position: 'relative'}}>
        <RefreshIndicator
          percentage={100}
          size={40}
          left={-20}
          top={10}
          status={'loading'}
          loadingColor={orangeA200}
          style={{marginLeft: '50%', marginTop:"50px", color:orangeA200}}
        />
      </div>:null
    )
  }
}
export default Spinner;
