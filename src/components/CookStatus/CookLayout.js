import React, {Component} from 'react';
import {GridList} from 'material-ui/GridList';
import Subheader from 'material-ui/Subheader';
import {Card, CardActions, CardHeader, CardMedia} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import {orangeA200} from 'material-ui/styles/colors';
import DBClient from '../Firebase/DBClient';
import ServeSingleIcon from 'material-ui/svg-icons/action/done';
import ServeMultiIcon from 'material-ui/svg-icons/action/done-all';
import Spinner from '../Spinner/Spinner';
import emptyLogo from '../images/sunset.svg';

const styles = {
  root: {
    padding: '10px',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    minHeight: "800px",
  },
  gridList: {
    width: "100%",
    height: "80%",
    overflowY: 'auto',
    marginTop: '2%',
    maxWidth: "800px"
  },
};

class CookContainer extends Component{
  constructor(props){
    super(props);
    this.state = {
      id:props.id,
      foodId:props.foodId,
      title:props.title,
      img:props.img,
      status:props.status,
      tableId:props.tableId,
      color:"#EEEEEE",
      labelColor:"#616161",
      label:"PENDING...",
      show:true
    }
    this.parent = props.parent;
    this.dbC = DBClient.getInstance();
  }

  setDone=(update=true)=>{
    if(!update) {
      this.setState({label:"DONE"});
      this.setState({color:"#0277BD"});
      this.setState({labelColor:"#FAFAFA"});
    }
    if(update) this.dbC.write("/CookPending/"+this.state.id+"/status", "finished");
    if(update) this.dbC.write("/OrderStatus/list/"+this.state.tableId+"/foods/"+this.state.foodId+"/status", "cook_finished");
  }

  setPending=(update=true)=>{
    if(!update) {
      this.setState({label:"PENDING..."});
      this.setState({color:"#EEEEEE"});
      this.setState({labelColor:"#616161"});
    }
    if(update) this.dbC.write("/CookPending/"+this.state.id+"/status", "pending");
    if(update) this.dbC.write("/OrderStatus/list/"+this.state.tableId+"/foods/"+this.state.foodId+"/status", "cook_pending");
  }

  setCooking=(update=true)=>{
    if(!update) {
      this.setState({label:"COOKING..."});
      this.setState({labelColor:"#FAFAFA"});
      this.setState({color:orangeA200});
    }
    if(update) this.dbC.write("/CookPending/"+this.state.id+"/status", "cooking");
    if(update) this.dbC.write("/OrderStatus/list/"+this.state.tableId+"/foods/"+this.state.foodId+"/status", "cook_cooking");
  }

  changeStatus=()=>{
    if(this.state.status==="pending") this.setCooking();
    else if(this.state.status==="cooking") this.setDone();
    else if(this.state.status==="finished") this.setPending();
    else this.setPending(); //For safe
  }

  initStatus=()=>{
    if(this.state.status==="pending") this.setPending(false);
    else if(this.state.status==="cooking") this.setCooking(false);
    else if(this.state.status==="finished") this.setDone(false);
  }

  componentDidMount=()=>{
    var instance = this;
    this.dbC.monitor("/CookPending/"+this.state.id, function(val){
      if(val!=null)
        instance.setState({status:val.status}, function(){
          instance.initStatus();
          if(instance.state.status==="finished")
            instance.parent.register(instance);
          else instance.parent.unregister(instance);
        });
    });
  }

  getItemInfo=()=>{
    return {
      foodId:this.state.foodId,
      title:this.state.title,
      img:this.state.img,
      status:"pending",
      tableId:this.state.tableId
    }
  }

  onClick=()=>{
    this.changeStatus();
  }

  remove=()=>{
    this.setState({show:false});
    var item = this.getItemInfo();
    this.dbC.append("/ServeQueue", item);
    var instance = this;
    setTimeout(function () {
      instance.dbC.wipe("/CookPending/"+instance.state.id);
    }, 100);
  }

  render(){
    return (
      this.state.show?
      <Card
        className="card"
        onClick={this.onClick}
        style={{margin:"2%", cursor:"pointer"}}>
        <CardMedia>
          <img className="cardImage" src={this.state.img} alt="" />
        </CardMedia>
        <CardHeader
          title={this.state.title}
          subtitle={`Table ${this.state.tableId}`}
        />
        <CardActions style={{backgroundColor:this.state.color}}>
          <FlatButton
            style={{textAlign:"right", width:"100%", height:"100%", color:this.state.labelColor}}
            label={this.state.label}/>
        </CardActions>
      </Card>:null
    );
  }
}

/**
 * A simple example of a scrollable `GridList` containing a [Subheader](/#/components/subheader).
 */
class CookContent extends Component {
  constructor(props){
    super(props);
    this.dbC = DBClient.getInstance();
    this.state = {
      pendingItems:null,
      show:false
    }
    this.spinner = props.spinner;
    this.appBarRef = props.appBarRef;
    this.items=[];
  }

  monitorCookPending=()=>{
    var instance = this;
    return new Promise(resolve=>(
      this.dbC.monitor("/CookPending", function(val){
        instance.setState({pendingItems:val});
        instance.spinner.current.dismiss();
        if(val==null){
          instance.appBarRef.current.setState({btnAppBarName:" "});
          instance.appBarRef.current.setState({btnIcon:""});
        }
        resolve();
      })
    ))
  }

  async componentDidMount(){
    this.appBarRef.current.setState({btnAppBarName:" "});
    this.appBarRef.current.setState({btnIcon:""});

    this.appBarRef.current.setState({onBtnClick:()=>{
      // eslint-disable-next-line
      Object.keys(this.items).map((id)=>{
        if(this.items[id].state.status==="finished"){
          this.items[id].remove();
          delete this.items[id];
        }
      });
      this.appBarRef.current.setState({btnAppBarName:" "});
      this.appBarRef.current.setState({btnIcon:""});
    }});
    await this.monitorCookPending();
    this.setState({show:true});
  }

  register=(item)=>{
    this.items[item.state.id]=item;
    // console.log("Push: ", this.items);
    this.appBarRef.current.setState({btnAppBarName:`SERVE (${Object.keys(this.items).length})`});
    this.appBarRef.current.setState({btnIcon:Object.keys(this.items).length===1?<ServeSingleIcon/>:<ServeMultiIcon/>});
  }

  unregister=(item)=>{
    delete this.items[item.state.id];
    // console.log("Pop: ", this.items);
    if(Object.keys(this.items).length<1) {
      this.appBarRef.current.setState({btnAppBarName:" "});
      this.appBarRef.current.setState({btnIcon:""});
    } else {
      this.appBarRef.current.setState({btnAppBarName:`SERVE (${Object.keys(this.items).length})`});
      this.appBarRef.current.setState({btnIcon:Object.keys(this.items).length===1?<ServeSingleIcon/>:<ServeMultiIcon/>});
    }
  }

  render() {
    if(this.state.pendingItems==null) return (
      this.state.show?
      <div
        style={{textAlign:"center", marginTop:"150px", color:"#546E7A"}}>
        <img style={{width:"100px", height:"auto"}} src={emptyLogo} alt=""/><br/>
        Lucky~ Let's take some rest~
      </div>
      :null
    );
    var instance = this;
    // console.log(window.innerWidth);
    return (
      this.state.show?
      <div style={styles.root}>
        <GridList
          cols={window.innerWidth < 1000? 2 : 3}
          cellHeight="auto"
          style={styles.gridList}>

          <Subheader style={{fontSize:"20px", fontWeight:"bold"}}>Pending item(s)</Subheader>
          {
              Object.keys(this.state.pendingItems).map((id)=>(
                <CookContainer
                  key={id}
                  id={id}
                  foodId={this.state.pendingItems[id].foodId}
                  title={this.state.pendingItems[id].title}
                  img={this.state.pendingItems[id].img}
                  status={this.state.pendingItems[id].status}
                  tableId={this.state.pendingItems[id].tableId}
                  parent={instance}/>
              ))
          }
        </GridList>
      </div>:null
    );
  }
}

class CookLayout extends Component{
  constructor(props){
    super(props);
    this.appBarRef = props.appBarRef;
    this.spinner = React.createRef();
  }

  render(){
    return (
      <div>
        <Spinner ref={this.spinner}/>
        <CookContent spinner={this.spinner} appBarRef={this.appBarRef}/>
      </div>
    )
  }
}

export default CookLayout;
