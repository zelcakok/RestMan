import React, {Component} from 'react';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import Menu from 'material-ui/svg-icons/navigation/menu';
import LogoutIcon from 'material-ui/svg-icons/action/power-settings-new';
import TableStatusIcon from 'material-ui/svg-icons/action/event-seat';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import ServeIcon from 'material-ui/svg-icons/places/room-service';
import WaiterIcon from 'material-ui/svg-icons/maps/directions-run';
import OrderIcon from  'material-ui/svg-icons/maps/restaurant-menu';
import BlockIcon from 'material-ui/svg-icons/content/block';
import ConfigIcon from 'material-ui/svg-icons/action/settings';
import StatisticsIcon from 'material-ui/svg-icons/action/trending-up';
import {orangeA200} from 'material-ui/styles/colors';
import Authenticator from '../Firebase/Authenticator';
import DBClient from '../Firebase/DBClient';
import Dialog from 'material-ui/Dialog';
import Permission from '../Accounts/Permission';

class LogoutMenuItem extends Component {
  state = {
    open: false
  }

  handleOpen = () => {
    this.setState({open: true});
  }

  handleClose = () => {
    this.setState({open: false});
  }

  async handleLogout(){
    await Authenticator.logout();
    window.location = "/login";
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        style={{color:orangeA200}}
        onClick={this.handleClose}
      />,
      <FlatButton
        label="YES"
        primary={true}
        style={{color:orangeA200}}
        onClick={this.handleLogout}
      />,
    ];

    return (
      <div>
        <MenuItem
          style={{width:"100%"}}
          leftIcon={<LogoutIcon/>}
          onClick={this.handleOpen}>Logout</MenuItem>
        <Dialog
          title="Logout"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          Do you want to continue?
        </Dialog>
      </div>
    );
  }
}

class AppBarLayout extends Component {

  constructor(props) {
    super(props);
    this.title = props.title != null ? props.title : "RestMan";
    // this.state.btnAppBarName = props.btnAppBarName != null ? props.btnAppBarName : null;
    this.state.btnIcon = props.btnIcon;
    this.isBtnIconEnabled = props.isBtnIconEnabled;
    this.dbRef = props.dbRef;

    this.state={
      btnAppBarName:props.btnAppBarName,
      btnIcon:props.btnIcon
    }
    this.menu = props.menu;
    this.dbC = DBClient.getInstance();
  }

  state = {
    isLoggedIn: true,
    isDrawerOpened: false,
    onBtnClick:null
  };

  handleChange = (event, isLoggedIn) => {
    this.setState({isLoggedIn: isLoggedIn});
  };

  handleToggle = () => this.setState({"isDrawerOpened":true})
  handleClose = () => this.setState({"isDrawerOpened":false})

  navTableStatus = () => {
    this.setState({"isDrawerOpened":false})
    window.location = "/table";
  }

  navOrderStatus = () => {
    this.setState({"isDrawerOpened":false})
    window.location = "/order";
  }

  navCookStatus = () => {
    this.setState({"isDrawerOpened":false})
    window.location = "/cook";
  }

  navServeStatus = () => {
    this.setState({"isDrawerOpened":false})
    window.location = "/serve";
  }

  navOrderStatus = () =>{
    this.setState({"isDrawerOpened":false})
    window.location = "/order";
  }

  navStatistics = () =>{
    this.setState({"isDrawerOpened":false})
    window.location = "/Statistics";
  }

  navConfig = () =>{
    this.setState({"isDrawerOpened":false})
    window.location = "/config";
  }

  btnIconClick=()=>{
    var instance = this;
    this.dbC.read("/"+this.dbRef, function(items){
      for(var id in items){
        if(items[id].status==="finished"){
          console.log("Mark delete: ", items[id].title, instance.dbRef+"/"+id);
          instance.dbC.wipe(instance.dbRef+"/"+id);
        }
      }
    });
  }

  onBtnClick=()=>{
    this.state.onBtnClick();
  }

  render() {
    return (
      <div style={{marginBottom: "60px"}}>
        <AppBar
          title={this.title}
          style={{backgroundColor: orangeA200, position: 'fixed', top: 0}}
          iconElementLeft={
            this.state.isDrawerOpened?
            <IconButton onClick={this.handleToggle}><NavigationClose /></IconButton> :
            <IconButton onClick={this.handleToggle}><Menu /></IconButton>
          }
          iconElementRight={
            this.state.btnAppBarName!=null?
              <FlatButton
                // onClick={this.state.btnIconClick}
                onClick={this.onBtnClick}
                icon={this.isBtnIconEnabled? this.state.btnIcon : <BlockIcon/>}
                label={this.isBtnIconEnabled? this.state.btnAppBarName : "DISABLED"}
                disabled={!this.isBtnIconEnabled}
              />:
              null
          }
        />
        <Drawer
          docked={false}
          width={200}
          open={this.state.isDrawerOpened}
          onRequestChange={(isDrawerOpened) => this.setState({isDrawerOpened})}
        >

          <MenuItem
            style={{fontWeight:"bold"}}
            leftIcon={<ArrowBack/>}
            onClick={this.handleClose}>Menu</MenuItem>
          <hr style={{width:"90%"}}/>
            {
              Permission.pageControl(this.menu, "TABLE")?
                <MenuItem
                  leftIcon={<TableStatusIcon/>}
                  onClick={this.navTableStatus}>Table Status</MenuItem>:null
            }
            {
              Permission.pageControl(this.menu, "ORDER")?
                <MenuItem
                  leftIcon={<OrderIcon/>}
                  onClick={this.navOrderStatus}>Order Status</MenuItem>:null
            }
            {
              Permission.pageControl(this.menu, "COOK")?
                <MenuItem
                  leftIcon={<ServeIcon/>}
                  onClick={this.navCookStatus}>Cook Status</MenuItem>:null
            }
            {
              Permission.pageControl(this.menu, "SERVE")?
                <MenuItem
                  leftIcon={<WaiterIcon/>}
                  onClick={this.navServeStatus}>Serve Queue</MenuItem>:null
            }
            {
              Permission.pageControl(this.menu, "STATISTICS")?
                <MenuItem
                  leftIcon={<StatisticsIcon/>}
                  onClick={this.navStatistics}>Statistics</MenuItem>:null
            }
            {
              Permission.pageControl(this.menu, "CONFIG")?
                <MenuItem
                  leftIcon={<ConfigIcon/>}
                  onClick={this.navConfig}>Configuration</MenuItem>:null
            }
          <div style={{position:"fixed", bottom:"0px",width:"100%"}}>
            <hr style={{width:"90%"}}/>
            <LogoutMenuItem/>
          </div>
        </Drawer>
      </div>
    );
  }
}

export default AppBarLayout;
