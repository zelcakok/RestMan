import React, {Component} from 'react';
import ThumbnailIcon from 'material-ui/svg-icons/device/wallpaper';
import ImgViewer from './ImgViewer';
class Thumbnail extends Component {
  constructor(props){
    super(props);
    this.state={
      src:props.src,
      diaShow:true
    }
    this.imgViewer=React.createRef();
  }
  componentDidMount=()=>{
    this.setState({showImg: window.innerWidth>1000? true: false});
  }
  showImg=()=>{
    this.imgViewer.current.show();
  }
  render(){
    return (
      <div><ThumbnailIcon onClick={this.showImg}/><ImgViewer ref={this.imgViewer} src={this.state.src}/></div>
    )
  }
}
export default Thumbnail;
