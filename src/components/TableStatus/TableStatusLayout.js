import React, {Component} from 'react';
import {Card, CardActions, CardMedia, CardTitle} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import AvailSeats from 'material-ui/svg-icons/social/group-add';
import PaymentIcon from 'material-ui/svg-icons/action/payment';
import CustomerIcon from 'material-ui/svg-icons/action/supervisor-account';
import {orangeA200} from 'material-ui/styles/colors';
import DropDownMenu from 'material-ui/DropDownMenu';
import Dialog from 'material-ui/Dialog';
import {GridList} from 'material-ui/GridList';
import Subheader from 'material-ui/Subheader';
import DBClient from '../Firebase/DBClient';
import OrderInfoLayout from '../OrderStatus/OrderInfoLayout';
import Spinner from '../Spinner/Spinner';

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
  width:'85%',
  maxWidth: '350px',
  color: 'orange'
}

class Table {
  constructor(id, foods="",status="available",numCustomer=0,transId=null){
    this.tableId=id;
    this.foods=foods;
    this.status=status;
    this.numCustomer=numCustomer;
    this.transId = transId;
  }
}

class Transaction {
  constructor(numCustomer, timestamp=(new Date()).getTime().toString(), revenue=0){
    this.timestamp = timestamp;
    this.id = "transId_"+this.timestamp;
    this.numCustomer = numCustomer;
    this.revenue = revenue;
    this.dbC = DBClient.getInstance();
  }

  write(){
    this.dbC.write("/Transactions/"+this.id, {
      startTime:this.timestamp,
      numCustomer:this.numCustomer,
      revenue:this.revenue,
      endTime:""
    });
  }

  static parseResult(numCustomer, timestamp, revenue){
    return new Transaction(numCustomer, timestamp, revenue);
  }

  static getTransaction(transId){
    return new Promise( (resolve) => {
      DBClient.getInstance().read("/Transactions/"+transId, function(transaction){
        resolve(Transaction.parseResult(transaction.numCustomer, transaction.timestamp, transaction.revenue));
      });
    })
  }
}

/*
  Status: Available, Occupied, Waiting, Delivered
*/
class TableContent extends Component {
  static imgUrl="http://www.clker.com/cliparts/0/1/9/7/12657987251322660982dining-table.png";
  constructor(props){
    super(props);
    this.state = {
      status:props.status==null? "available":props.status,
      numCustomer:props.numCustomer==null? 0:props.numCustomer,
      foods:props.foods,
      tableId:props.tableId,
      diaShow:false,
      transId:props.transId,
      tmp:0
    }
    this.trans = null;
    this.parent = props.parent;
    this.dbC = DBClient.getInstance();
    this.orderInfo = React.createRef();
  }

  getTableContent=()=>{
    return new Table(
      this.state.tableId,
      this.state.foods,
      this.state.status,
      this.state.numCustomer,
      this.state.transId
    )
  }

  updateOrderStatus=(status)=>{
    this.dbC.write("/OrderStatus/list/"+this.state.tableId+"/status", status);
    this.dbC.wipe("/OrderStatus/list/"+this.state.tableId+"/foods");
  }

  updateTableContent=()=>{
    this.dbC.write("/TableStatus/list/"+this.state.tableId, this.getTableContent());
  }

  componentDidMount=()=>{
    if(this.state.transId!=null){
      Transaction.getTransaction(this.state.transId).then((trans)=>{
        this.trans = trans;
        console.log("Existing transaction found: ", this.trans);
      });
    }
    var instance = this;
    this.setState({tmp:this.state.numCustomer});
    this.dbC.monitor("/TableStatus/list/"+this.state.tableId, function(val){
      instance.setState({foods:val.foods, status:val.status, numCustomer:val.numCustomer});
    });
  }

  selNumCustomers=(event, index, value)=>{
    this.setState({tmp:value});
  }

  saveNumCustomers=(event)=>{
    if(this.state.tmp > 0){
      var trans = new Transaction(this.state.tmp);
      this.setState({status:"occupied", numCustomer:this.state.tmp, diaShow:false, transId:trans.id}, function(){
        this.updateTableContent();
        this.updateOrderStatus("calling");
        this.dbC.write("/TableStatus/totalNumCust", this.parent.state.totalNumCust + this.state.tmp);
        trans.write();
      });
    } else this.setState({diaShow:false});
  }

  handlePayment=()=>{
    var revenue = this.orderInfo.current.totalPrice;
    var orderList = this.orderInfo.current.orderList;
    this.dbC.write("/Transactions/"+this.state.transId+"/revenue", revenue);
    this.dbC.write("/Transactions/"+this.state.transId+"/orderList", orderList);
    this.dbC.write("/Transactions/"+this.state.transId+"/endTime", (new Date()).getTime().toString());

    this.dbC.write("/TableStatus/totalNumCust", this.parent.state.totalNumCust - this.state.numCustomer);
    this.setState({status:"available", numCustomer:0, tmp:0, diaShow:false, transId:null}, function(){
      this.updateTableContent();
      this.updateOrderStatus("empty");
    });
  }

  showDialog=()=>{
    this.setState({diaShow:true});
  }

  dismissDialog=()=>{
    this.setState({diaShow:false});
    if(this.state.tmp !== this.state.numCustomer) this.setState({tmp:0});
  }

  render(){
    const selCustActions = [
      <FlatButton
        label="Dismiss"
        primary={true}
        style={{color:orangeA200}}
        onClick={this.dismissDialog}
      />,
      <FlatButton
        label="Save"
        primary={true}
        style={{color:orangeA200}}
        onClick={this.saveNumCustomers}
      />,
    ];
    const paymentActions = [
      <FlatButton
        label="Dismiss"
        primary={true}
        style={{color:orangeA200}}
        onClick={this.dismissDialog}
      />,
      <FlatButton
        label="PAYMENT"
        primary={true}
        icon={<PaymentIcon/>}
        style={{color:orangeA200}}
        onClick={this.handlePayment}
      />,
    ];
    const items = [];
    for (let i = 0; i <=4; i++ ) {
      items.push(<MenuItem value={i} key={i} primaryText={ i!==0? i<=1?`${i} Customer`:`${i} Customers` : "No Customer"} />);
    }
    return (
      <Card className="card" onClick={this.showDialog}>
        <CardTitle>
          Table {this.state.tableId}
        </CardTitle>
        <CardMedia
          overlay={this.state.status==="occupied"?<CardTitle style={{textAlign:"left"}} title={`Occupied: ${this.state.numCustomer}`} /> : null}>
          <img style={{padding:"30px"}} src={TableContent.imgUrl} alt=""/>
        </CardMedia>
        <CardActions style={{backgroundColor:this.state.color}}>
          {
            this.state.status==="available"?
            <FlatButton
              style={{color:orangeA200, marginBottom:"5px", width:"100%", textAlign:"right"}}
              icon={<AvailSeats/>}
              label="Available"/>:
            <FlatButton
              style={{color:orangeA200, marginBottom:"5px", width:"100%", textAlign:"right"}}
              icon={<PaymentIcon/>}
              label="Payment"/>
          }
        </CardActions>
        {
          this.state.status==="available" ?
          <Dialog
            title="Select number of customers"
            actions={selCustActions}
            modal={false}
            open={this.state.diaShow}
            contentStyle={dialogStyle}
            autoScrollBodyContent={true}
            onRequestClose={this.dismissDialog}>
            <DropDownMenu maxHeight={300} value={this.state.tmp} onChange={this.selNumCustomers} style={{width:"100%"}}>
              {items}
            </DropDownMenu>
          </Dialog> :
          <Dialog
            title="Payment"
            actions={paymentActions}
            modal={false}
            open={this.state.diaShow}
            autoScrollBodyContent={true}
            contentStyle={dialogStyle}
            onRequestClose={this.dismissDialog}>
            <OrderInfoLayout ref={this.orderInfo} tableId={this.state.tableId} showPrice={true}/>
          </Dialog>
        }
      </Card>
    )
  }
}

class TableStatusContent extends Component {
  constructor(props){
    super(props);
    this.state = {
      totalNumCust:0,
      todayRevenue:0,
      tableList:null
    }
    this.spinner=props.spinner;
    this.dbC = DBClient.getInstance();
  }

  monitorTotalNumCust=()=>{
    var instance = this;
    this.dbC.monitor("/TableStatus/totalNumCust", function(val){
      if(val==null) instance.dbC.write("/TableStatus/totalNumCust", 0);
      else {
        instance.setState({totalNumCust:val});
      }
    });
  }

  initTableList=(totalTables)=>{
    var tableList={};
    for(var i=1; i<=totalTables; i++) tableList[i]=new Table(i);
    this.dbC.write("/TableStatus/list", tableList);
  }

  fetchTableList=()=>{
    return new Promise(resolve=>{
      var instance = this;
      this.dbC.monitor("/TableStatus/list", function(val){
        if(val==null) instance.initTableList(9);
        else instance.setState({tableList: val});
        resolve();
      });
    })
  }

  async componentDidMount(){
    this.monitorTotalNumCust();
    await this.fetchTableList();
    this.spinner.current.dismiss();
  }

  render() {
    if(this.state.tableList==null) return '';
    return (
      <div style={styles.root}>
        <GridList
          cellHeight="auto"
          cols={window.innerWidth < 1000? 2 : 3}
          style={styles.gridList}>

          <Subheader>
            <GridList style={{height:"fit-content"}} cellHeight="auto">
              <MenuItem style={{width:"fit-content"}} leftIcon={<CustomerIcon color={this.state.totalNumCust>0?orangeA200:""}/>}>Customer(s): {this.state.totalNumCust}</MenuItem>
            </GridList>
          </Subheader>
          {
            Object.keys(this.state.tableList).map((id)=>(
              <TableContent
                key={id}
                tableId={id}
                parent={this}
                status={this.state.tableList[id].status}
                numCustomer={this.state.tableList[id].numCustomer}
                foods={this.state.tableList[id].foods}
                transId={this.state.tableList[id].transId}/>
            ))
          }
        </GridList>
      </div>
    )
  }
}

class TableStatusLayout extends Component {
  constructor(props){
    super(props);
    this.spinner = React.createRef();
  }

  render(){
    return(
      <div>
        <Spinner ref={this.spinner}/>
        <TableStatusContent spinner={this.spinner}/>
      </div>
    )
  }
}

export default TableStatusLayout;
