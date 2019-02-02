import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Card, CardActions, CardMedia, CardTitle} from 'material-ui/Card';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import PaymentIcon from 'material-ui/svg-icons/action/payment';
import WaitingIcon from 'material-ui/svg-icons/social/notifications-active';
import OrderInfoIcon from 'material-ui/svg-icons/action/info-outline';
import {orangeA200} from 'material-ui/styles/colors';
import Spinner from '../Spinner/Spinner';
import Dialog from 'material-ui/Dialog';
import {GridList} from 'material-ui/GridList';
import Subheader from 'material-ui/Subheader';
import MenuLayout from './MenuLayout';
import OrderInfoLayout from './OrderInfoLayout';
import DBClient from '../Firebase/DBClient';


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

const dialogStyle = {
  width:'80%',
  maxWidth: '350px',
  color: 'orange'
}

class Table {
  constructor(id, foods="",status="empty",numCustomer=0){
    this.tableId=id;
    this.foods=foods;
    this.status=status;
    this.numCustomer=numCustomer;
  }
}

/*
  Status: empty, calling, ordered, delivered
*/
class TableContent extends Component {

  static imgUrl="http://www.clker.com/cliparts/0/1/9/7/12657987251322660982dining-table.png";

  constructor(props){
    super(props);
    this.state = {
      status:props.status==null? "empty":props.status,
      numCustomer:props.numCustomer==null? 0:props.numCustomer,
      foods:props.foods,
      tableId:props.tableId,
      diaShow:false,
      tmp:0
    }
    this.parent = props.parent;
    this.dbC = DBClient.getInstance();
  }

  getTableContent=(foods)=>{
    return new Table(
      this.state.tableId,
      foods,
      this.state.status,
      this.state.numCustomer
    )
  }

  updateTableContent=()=>{
    this.dbC.write("/OrderStatus/list/"+this.state.tableId, this.getTableContent());
  }

  componentDidMount=()=>{
    var instance = this;
    this.setState({tmp:this.state.numCustomer});
    this.dbC.monitor("/OrderStatus/list/"+this.state.tableId, function(val){
      instance.setState({foods:val.foods, status:val.status, numCustomer:val.numCustomer});
      if(val.status==="calling") instance.parent.setCalling(instance.state.tableId);
      else instance.parent.removeCalling(instance.state.tableId);
    });
  }

  updateTableStatus=(status, foods)=>{
    this.setState({status:status}, ()=> {
      this.dbC.write("/OrderStatus/list/"+this.state.tableId, this.getTableContent(foods));
    })
  }

  selNumCustomers=(event, index, value)=>{
    this.setState({tmp:value});
  }

  saveNumCustomers=(event)=>{
    if(this.state.tmp > 0){
      this.setState({status:"occupied", numCustomer:this.state.tmp, diaShow:false}, function(){
        this.updateTableContent();
      });
    } else this.setState({diaShow:false});
  }

  handlePayment=()=>{
    this.setState({status:"empty", numCustomer:0, tmp:0, diaShow:false}, function(){
      this.updateTableContent();
    });
  }

  showDialog=()=>{
    if(this.state.status==="calling"){
      var el = <MuiThemeProvider><MenuLayout tableId={this.state.tableId} handler={this}/></MuiThemeProvider>
      ReactDOM.render(el, document.getElementById("msg"));
    } else this.setState({diaShow:true});
  }

  dismissDialog=()=>{
    this.setState({diaShow:false});
    if(this.state.tmp !== this.state.numCustomer) this.setState({tmp:0});
  }

  render(){
    const paymentActions = [
      <FlatButton
        label="Dismiss"
        primary={true}
        style={{color:orangeA200}}
        onClick={this.dismissDialog}
      />,
    ];
    const items = [];
    for (let i = 0; i <=4; i++ ) {
      items.push(<MenuItem value={i} key={i} primaryText={ i!==0? i<=1?`${i} Customer`:`${i} Customers` : "No Customer"} />);
    }
    return (
      <Card className="card" onClick={this.state.status!=="empty"?this.showDialog:null}>
        <CardTitle>
          Table {this.state.tableId}
        </CardTitle>
        <CardMedia
          overlay={this.state.status==="occupied"?<CardTitle style={{textAlign:"left"}} title={`Occupied: ${this.state.numCustomer}`} /> : null}>
          <img style={{padding:"30px"}} src={TableContent.imgUrl} alt=""/>
        </CardMedia>
        <CardActions style={{backgroundColor:this.state.color}}>
          {
            this.state.status==="empty"?
              <FlatButton
                style={{color:"gray", marginBottom:"5px", width:"100%", textAlign:"right"}}
                label="empty" disabled/>:
            this.state.status==="calling"?
              <FlatButton
                style={{color:orangeA200, marginBottom:"5px", width:"100%", textAlign:"right"}}
                icon={<WaitingIcon/>}
                label="Calling"/>:
            this.state.status==="ordered"?
              <FlatButton
                style={{color:orangeA200, marginBottom:"5px", width:"100%", textAlign:"right"}}
                icon={<OrderInfoIcon/>}
                label="CHECK ORDER"/>:
              <FlatButton
                style={{color:orangeA200, marginBottom:"5px", width:"100%", textAlign:"right"}}
                icon={<PaymentIcon/>}
                label="PAYMENT"/>
          }
        </CardActions>
        {
          <Dialog
            title="Show Order"
            actions={paymentActions}
            modal={false}
            open={this.state.diaShow}
            contentStyle={dialogStyle}
            onRequestClose={this.dismissDialog}>
            <OrderInfoLayout tableId={this.state.tableId} showPrice={false}/>
          </Dialog>
        }
      </Card>
    )
  }
}

class OrderStatusContent extends Component {
  constructor(props){
    super(props);
    this.state = {
      tableList:null,
      tableCalling:{},
      show:true
    }
    this.dbC = DBClient.getInstance();
    this.spinner = props.spinner;
  }

  setCalling=(tableId)=>{
    this.dbC.write("/OrderStatus/Calling/Table_"+tableId+"/status", true);
  }

  removeCalling=(tableId)=>{
    this.dbC.wipe("/OrderStatus/Calling/Table_"+tableId);
  }

  initTableList=(totalTables)=>{
    var tableList={};
    for(var i=1; i<=totalTables; i++) tableList[i]=new Table(i);
    this.dbC.write("/OrderStatus/list", tableList);
  }

  async fetchTableList(){
    var instance = this;
    return new Promise(resolve=>(
      this.dbC.monitor("/OrderStatus/list", function(val){
        if(val==null) instance.initTableList(9);
        else instance.setState({tableList: val});
        instance.dbC.monitor("/OrderStatus/Calling", function(val){
          instance.setState({tableCalling:val});
          resolve();
        });
      })
    ))
  }

  async componentDidMount(){
    await this.fetchTableList();
    this.spinner.current.dismiss();
  }

  render() {
    if(this.state.tableList==null) return '';
    var callings = this.state.tableCalling!=null? Object.keys(this.state.tableCalling).join().toString().split("_").join(" ") : "Empty";
    return (
      this.state.show?
      <div style={styles.root}>
        <GridList
          cellHeight="auto"
          cols={window.innerWidth < 1000? 2 : 3}
          style={styles.gridList}>
          <Subheader>
            <MenuItem leftIcon={<WaitingIcon color={callings!=="Empty"?orangeA200:""}/>}>
              <div>
                {`Calling : ${callings}`}
              </div>
            </MenuItem>
          </Subheader>
          {
            Object.keys(this.state.tableList).map((id)=>(
              <TableContent
                key={id}
                tableId={id}
                parent={this}
                status={this.state.tableList[id].status}
                numCustomer={this.state.tableList[id].numCustomer}
                foods={this.state.tableList[id].foods}/>
            ))
          }
        </GridList>
      </div>:null
    )
  }
}

class OrderStatusLayout extends Component {
  constructor(props){
    super(props);
    this.spinner=React.createRef();
  }
  render(){
    return(
      <div>
        <Spinner ref={this.spinner}/>
        <OrderStatusContent spinner={this.spinner}/>
      </div>
    )
  }
}

export default OrderStatusLayout;
