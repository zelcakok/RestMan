import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import {Card, CardActions, CardMedia, CardTitle} from 'material-ui/Card';
import {orangeA200} from 'material-ui/styles/colors';
import DBClient from '../Firebase/DBClient';
import Dialog from 'material-ui/Dialog';
import Subheader from 'material-ui/Subheader';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import DessertIcon from 'material-ui/svg-icons/action/favorite';
import MainDishIcon from 'material-ui/svg-icons/maps/restaurant';
import ServeSingleIcon from 'material-ui/svg-icons/action/done';
import ServeMultiIcon from 'material-ui/svg-icons/action/done-all';
import {GridList} from 'material-ui/GridList';

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    display: 'flex',
    flexWrap: 'wrap',
    overflowX: 'auto',
    justifyContent: 'space-around',
    height: "auto"
  },
  titleStyle: {
    color: 'rgb(0, 188, 212)',
  },

};

class Dish {
  constructor(dishId, title, imgUrl, price){
    this.dishId=dishId;
    this.title=title;
    this.imgUrl = imgUrl;
    this.price = price;
  }
}

class MenuContent extends Component{
  static SELECTED="rgb(17,166,240)";
  static SELECTED_LABEL="rgb(255,255,255)";
  static NORMAL="rgb(255,255,255)";
  static NORMAL_LABEL="#616161";

  constructor(props){
    super(props);
    this.state = {
      selected:props.isSelected,
      dishId:props.dishId,
      title:props.title,
      img:props.img,
      price:props.price,
      label:"SELECT",
      actionColor:MenuContent.NORMAL,
      labelColor:MenuContent.NORMAL_LABEL
    }
    this.parent = props.parent;
    this.dbC=DBClient.getInstance();
  }

  componentDidMount=()=>{
    this.setState({
      actionColor:this.state.selected?MenuContent.SELECTED:MenuContent.NORMAL,
      label:this.state.selected?"SELECTED":"SELECT",
      labelColor:this.state.selected?MenuContent.SELECTED_LABEL:MenuContent.NORMAL_LABEL
    });
  }

  getContent=()=>{
    return new Dish(this.state.dishId, this.state.title, this.state.img, this.state.price);
  }

  cacheStatus=(status)=>{
    var type = this.parent.state.selectedIndex===0? "mainDish" : "desserts";
    if(status) this.parent.cache[type][this.state.dishId] = this.getContent();
    else delete this.parent.cache[type][this.state.dishId];
    this.parent.updateAppBarLabel();
  }

  onClick=()=>{
    this.setState({selected:!this.state.selected}, ()=>{
      this.setState({
        actionColor:this.state.selected?MenuContent.SELECTED:MenuContent.NORMAL,
        label:this.state.selected?"SELECTED":"SELECT",
        labelColor:this.state.selected?MenuContent.SELECTED_LABEL:MenuContent.NORMAL_LABEL
      }, ()=>{this.cacheStatus(this.state.selected)});
    });
  }

  render(){
    return (
      <Card style={{cursor:"pointer"}} onClick={this.onClick}>
        <CardMedia>
          <img src={this.state.img} alt=""/>
        </CardMedia>
        <CardTitle>
          {this.state.title}
        </CardTitle>
        <CardActions style={{backgroundColor:this.state.actionColor}}>
          <FlatButton label={this.state.label} style={{width:"100%", textAlign:"right", color:this.state.labelColor}}/>
        </CardActions>
      </Card>
    );
  }
}

class MenuContainer extends Component{
  constructor(props){
    super(props);
    this.state={
      selectedIndex:0,
      showData:"dish",
      show:true,
      tableId:props.tableId,
      appBarLabel:" ",
      appBarIcon:null
    }
    this.parent=props.parent;
    this.cache={
      mainDish:{},
      desserts:{}
    };
    this.mainDishes=props.mainDishes;
    this.desserts=props.desserts;
    this.orderSubmitHandler=props.orderSubmitHandler;
  }

  select=(index)=>{
    var instance = this;
    this.setState({show:false}, ()=>{
      instance.setState({selectedIndex:index, showData: index===0? "dish":"dessert"}, ()=>{
        instance.setState({show:true});
      });
    });
  }

  componentWillUnmount=()=>{
    this.cache={
      mainDish:{},
      desserts:{}
    };
    ReactDOM.unmountComponentAtNode(document.getElementById("msg"));
  }

  updateAppBarLabel=()=>{
    var mainDishNum = Object.keys(this.cache["mainDish"]).length;
    var dessertsNum = Object.keys(this.cache["desserts"]).length;
    if(mainDishNum<1 && dessertsNum<1) {
      this.setState({appBarLabel: " "});
      this.setState({appBarIcon: null})
      return;
    }

    var msg = " ";

    if(mainDishNum>0) msg+=`Dishes (${mainDishNum}) `;
    if(mainDishNum>0 && dessertsNum>0) msg+=", ";
    if(dessertsNum>0) msg+=`Desserts (${dessertsNum})`;

    this.setState({appBarLabel: msg});
    this.setState({appBarIcon: (mainDishNum + dessertsNum > 1)? <ServeMultiIcon/> : <ServeSingleIcon/>})
    console.log(this.cache);
  }

  render(){
    if(this.mainDishes==null && this.desserts==null) return '';
    var instance=this;

    return(
      <div style={{margin:"-24px", height:"fit-content"}}>

      <AppBar
        title="Menu"
        style={{backgroundColor: orangeA200, position: 'fixed', top: 0}}
        showMenuIconButton={false}
        iconElementRight={
          <FlatButton
            icon={this.state.appBarIcon}
            label={this.state.appBarLabel}
            onClick={()=>(this.orderSubmitHandler(this.cache))}/>
        }/>

      <div style={{width:"100%", height:"fit-content", padding:"5%", marginTop:"10%"}}>
        {
          this.state.showData==="dish"?
          this.state.show?
          <GridList
            cellHeight="auto"
            cols={parseInt(window.innerWidth/200, 10)}
            style={styles.gridList}>
            <Subheader
              style={{fontSize:"18px"}}
              id="lblTotalCustomer">Main Dishes</Subheader>
            {
              Object.keys(this.mainDishes).map((id)=>(
                <MenuContent
                  isSelected={this.cache["mainDish"][id]!=null}
                  key={id}
                  parent={instance}
                  tableId={instance.state.tableId}
                  dishId={id}
                  img={this.mainDishes[id].img}
                  title={this.mainDishes[id].title}
                  price={this.mainDishes[id].price}/>
              ))
            }
          </GridList>:null
          :
          this.state.show?
          <GridList
            cellHeight="auto"
            cols={parseInt(window.innerWidth/200,10)}
            style={styles.gridList}>
            <Subheader
              style={{fontSize:"18px"}}
              id="lblTotalCustomer">Desserts</Subheader>
            {
              Object.keys(this.desserts).map((id)=>(
                <MenuContent
                  isSelected={this.cache["desserts"][id]!=null}
                  key={id}
                  parent={instance}
                  tableId={instance.state.tableId}
                  dishId={id}
                  img={this.desserts[id].img}
                  title={this.desserts[id].title}
                  price={this.desserts[id].price}/>
              ))
            }
          </GridList>:null
        }
      </div>
      <Paper zDepth={1}>
      <BottomNavigation selectedIndex={this.state.selectedIndex}>
        <BottomNavigationItem
          label="Main Dish"
          icon={<MainDishIcon/>}
          onClick={() => this.select(0)}
        />
        <BottomNavigationItem
          label="Dessert"
          icon={<DessertIcon/>}
          onClick={() => this.select(1)}
        />
      </BottomNavigation>
    </Paper>
    </div>
    )
  }
}

class MenuLayout extends Component{
  constructor(props){
    super(props);
    this.state = {
      menuShow:false,
      mainDishes:null,
      desserts:null,
      tableId:props.tableId,
    }
    this.dbC = DBClient.getInstance();
    this.handler=props.handler;
  }

  componentDidMount=()=>{
    var instance=this;
    this.dbC.read("/Dishes", function(val){
      instance.setState({mainDishes:val["MainDishes"], desserts:val["Desserts"]}, ()=>(
        instance.setState({menuShow:true})
      ))
    });
  }

  componentWillUnmount=()=>{
    console.log("MENU GONE");
  }

  orderSubmitHandler=(cache)=>{
    this.dismiss();
    var foods={};
    for(var key in cache){
      for(var id in cache[key]){
        var food = {
          foodId:id,
          title:cache[key][id].title,
          img:cache[key][id].imgUrl,
          status:"pending",
          tableId:this.state.tableId,
          price:cache[key][id].price
        };
        //Update table status to ordered
        this.dbC.append("/CookPending", food);
        foods[id]=food;
      }
    }
    // console.log(foods);
    this.handler.updateTableStatus("ordered", foods);
    // this.handler.setTableFoods(foods);
  }

  onClick=()=>{
    this.setState({menuShow:true});
  }

  dismiss=()=>{
    this.setState({menuShow:false});
  }

  render() {
    return (
      <div>
        {
          <Dialog
            parent={this}
            modal={false}
            open={this.state.menuShow}
            contentStyle={{width:"95%"}}
            autoScrollBodyContent={true}
            onRequestClose={this.dismiss}>
            <MenuContainer
              tableId={this.state.tableId}
              mainDishes={this.state.mainDishes}
              desserts={this.state.desserts}
              orderSubmitHandler={this.orderSubmitHandler}/>
          </Dialog>
        }
      </div>
    )
  }
}

export default MenuLayout;
