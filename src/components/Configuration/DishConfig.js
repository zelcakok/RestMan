import React, {Component} from 'react';
import {Card, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import {orangeA200} from 'material-ui/styles/colors';
import DeleteSingleIcon from 'material-ui/svg-icons/action/done';
import DeleteMultiIcon from 'material-ui/svg-icons/action/done-all';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import DBClient from '../Firebase/DBClient';
import DishFileHandler from './DishFileHandler';
import LoadingBar from './LoadingBar';
import Thumbnail from './Thumbnail';

class DishConfig extends Component{
  constructor(props){
    super(props);
    this.progress = React.createRef();
    this.dbC=DBClient.getInstance();
    this.state={
      dishes:null,
      selected:"",
      btnDelete:{icon:null, label:" "}
    }
  }

  monitorDishList=()=>{
    var instance=this;
    return new Promise(resolve=>(
      this.dbC.monitor("/Dishes", function(val){
        instance.setState({dishes:val});
        if(instance.progress.current!=null || instance.state.dishes==null) instance.progress.current.dismiss();
        resolve();
      })
    ));
  }

  async componentDidMount(){
    await this.monitorDishList();

  }

  updateSelection=(rows)=>{
    this.setState({selected:(rows!=="all"&&rows!=="none")? rows.join("_"):rows}, ()=>(
      this.setState({btnDelete: this.getBtnDelete()})
    ));
  }

  onRowSelect=(rows)=>{
    this.updateSelection(rows);
  }

  getBtnDelete=()=>{
    if(this.state.selected==="all" || this.state.selected.lastIndexOf("_")>=1) return {icon:<DeleteMultiIcon/>, label:"DELETE ALL"};
    if(this.state.selected==="none" || this.state.selected==="") return {icon:null, label:" "};
    if(this.state.selected.lastIndexOf("_")===-1) return {icon:<DeleteSingleIcon/>, label:"DELETE"};
  }

  isSelected=(val)=>{
    return (this.state.selected!=="none" || this.state.selected==="all") && this.state.selected.indexOf(val)!==-1;
  }

  deleteItems=()=>{
    var index=0;
    if(this.state.selected==="all") this.dbC.wipe("/Dishes");
    else {
      Object.keys(this.state.dishes).map( (type)=>(
        // eslint-disable-next-line
        Object.keys(this.state.dishes[type]).map( (dish)=> {
          if(this.state.selected.indexOf(index++)!==-1)
            this.dbC.wipe("/Dishes/"+type+"/"+dish);
        })
      ))
    }
    this.setState({selected:""}, ()=>(this.setState({btnDelete: this.getBtnDelete()})));
  }

  render(){
    if(this.state.dishes==null) return (
      <div>
        <Card style={{maxWidth:"1200px", float:"none", margin:"auto"}}>
          <CardTitle>Dishes Management</CardTitle>
          <CardText>
            <Table>
              <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn style={{textAlign: 'right'}}>
                    <DishFileHandler parent={null}/>
                  </TableHeaderColumn>
                </TableRow>
                <TableRow>
                  <TableHeaderColumn style={{textAlign:"center"}}>
                    <LoadingBar ref={this.progress} width="30%" resultMsg="Opps...Dish menu is empty..."/>
                  </TableHeaderColumn>
                </TableRow>
              </TableHeader>
            </Table>
          </CardText>
        </Card>
      </div>
    );
    var index=0;
    return(
      <div>
        <Card style={{maxWidth:"1200px", float:"none", margin:"auto"}}>
          <CardTitle style={{fontWeight:"bold"}}>Dishes Management</CardTitle>
          <CardText>
            {
              this.state.dishes===null?
               <LoadingBar ref={this.progress} width="30%"/>:
                 <Table multiSelectable={true} onRowSelection={this.onRowSelect}>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderColumn colSpan="3" style={{textAlign: 'right'}}>
                        {
                          this.state.btnDelete.icon!==null?
                          <FlatButton
                            label={this.state.btnDelete.label}
                            icon={this.state.btnDelete.icon}
                            primary={true}
                            onClick={this.deleteItems}
                            style={{color:orangeA200}}/>
                          :<DishFileHandler parent={this}/>
                        }
                      </TableHeaderColumn>
                    </TableRow>
                    <TableRow>
                      <TableHeaderColumn>Dish</TableHeaderColumn>
                      <TableHeaderColumn>Price</TableHeaderColumn>
                      <TableHeaderColumn>Image</TableHeaderColumn>
                    </TableRow>
                  </TableHeader>
                  <TableBody deselectOnClickaway={false}>
                    {
                      Object.keys(this.state.dishes).map( (type)=>(
                        Object.keys(this.state.dishes[type]).map( (dish)=> (

                          <TableRow
                            selected={this.isSelected(index++)}>
                            <TableRowColumn>{this.state.dishes[type][dish].title}</TableRowColumn>
                            <TableRowColumn>$ {this.state.dishes[type][dish].price.toFixed(2)}</TableRowColumn>
                            <TableRowColumn>{<Thumbnail src={this.state.dishes[type][dish].img}/>}</TableRowColumn>
                          </TableRow>

                        ))
                      ))
                    }
                  </TableBody>
                </Table>
            }
          </CardText>
        </Card>
      </div>
    )
  }
}
export default DishConfig;
