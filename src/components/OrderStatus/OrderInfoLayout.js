import React, {Component} from 'react';
import DBClient from '../Firebase/DBClient';

import {
  Table,
  TableBody,
  TableHeader,
  TableFooter,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';


class OrderInfoLayout extends Component {
    constructor(props){
      super(props);
      this.state={
        items : null,
        tableId: props.tableId,
        showPrice:props.showPrice
      }
      this.dbC = DBClient.getInstance();
      this.totalPrice = 0;
      this.orderList = [];
    }

    componentDidMount=()=>{
      var instance=this;
      this.dbC.monitor("/OrderStatus/list/"+this.state.tableId+"/foods", function(val){
        instance.setState({items:val});
      });
    }

    render(){
      if(this.state.items==null || Object.keys(this.state.items).length<1) return 'No order is found';
      // eslint-disable-next-line
      Object.keys(this.state.items).map((id)=>{
        this.totalPrice+=this.state.items[id].price;
        this.orderList.push(id);
      });
      return (
        <Table fixedHeader={true}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn style={{color:"rgb(0,0,0)"}}>Dish Name</TableHeaderColumn>
              <TableHeaderColumn style={{color:"rgb(0,0,0)"}}>Status</TableHeaderColumn>
              {this.state.showPrice? <TableHeaderColumn style={{color:"rgb(0,0,0)"}}>Price</TableHeaderColumn> : null}
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {
              Object.keys(this.state.items).map((id)=>(
                <TableRow key={id}>
                  <TableRowColumn>{this.state.items[id].title}</TableRowColumn>
                  <TableRowColumn>{this.state.items[id].status}</TableRowColumn>
                  {this.state.showPrice? <TableRowColumn>$ {this.state.items[id].price.toFixed(2)}</TableRowColumn> : null}
                </TableRow>
              ))
            }
          </TableBody>
          {
            this.state.showPrice?
            <TableFooter adjustForCheckbox={false}>
              <TableRow>
                <TableRowColumn colSpan="2" style={{textAlign: 'right', fontWeight:"bold"}}>Total:</TableRowColumn>
                <TableRowColumn colSpan="1" style={{fontWeight:"bold"}}>
                  $ {this.totalPrice.toFixed(2)}
                </TableRowColumn>
              </TableRow>
            </TableFooter>:null
          }
        </Table>
      )
    }
}

export default OrderInfoLayout;
