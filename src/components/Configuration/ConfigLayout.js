import React, {Component} from 'react';
import DishConfig from './DishConfig';

class Content extends Component{
  render(){
    return(
      <div>
        <div style={{padding:"10px"}}><DishConfig/></div>
      </div>
    )
  }
}
class ConfigLayout extends Component {
  render(){
    return (
      <div style={{padding:"2%"}}>
        <Content/>
      </div>
    )
  }
}
export default ConfigLayout;
