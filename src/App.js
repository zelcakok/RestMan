import React, {Component} from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import LoadingIcon from 'material-ui/svg-icons/navigation/more-horiz';
import {BrowserRouter as Router,Route,Switch} from 'react-router-dom';
import AppBarLayout from './components/AppBar/AppBarLayout';
import LoginLayout from './components/Login/LoginLayout';
import TableStatusLayout from './components/TableStatus/TableStatusLayout';
import OrderStatusLayout from './components/OrderStatus/OrderStatusLayout';
import CookLayout from './components/CookStatus/CookLayout';
import ServeLayout from './components/ServeQueue/ServeLayout';
import StatisticsLayout from './components/Statistics/StatisticsLayout';
import ConfigLayout from './components/Configuration/ConfigLayout';
import './App.css';
import Authenticator from './components/Firebase/Authenticator';
import SessionExpiredDialog from './components/SessionExpireDialog/SessionExpiredDialog';
import Permission from './components/Accounts/Permission';
import LinearProgress from 'material-ui/LinearProgress';
import {orangeA200} from 'material-ui/styles/colors';
import Logo from './components/Login/logo.png';
import FlatButton from 'material-ui/FlatButton';

class LoadingPage extends Component {
  render(){
    return (
      <div style={{width:"100%", textAlign:"center"}}>
        <img style={{float:"none", margin:"auto", width:"auto", marginTop:"20%"}} src={Logo} alt=""/>
        <LinearProgress style={{width:"50%", margin:"auto", float:"none", marginTop:"80px"}} color={orangeA200}/>
        <FlatButton label="Loading..." disabled/>
      </div>
    )
  }
}

class ErrPage extends Component {
  constructor(props){
    super(props);
    this.routes=props.routes;
  }
  componentDidMount=()=>{
    setTimeout(()=>{
      window.location = "/"+this.routes[0].toLowerCase();
    }, 2000);
  }
  render(){
    return (
      <div style={{width:"100%", textAlign:"center"}}>
        <img style={{float:"none", margin:"auto", width:"auto", marginTop:"20%"}} src={Logo} alt=""/>
        <LinearProgress style={{width:"50%", margin:"auto", float:"none", marginTop:"80px"}} color={orangeA200}/>
        <FlatButton label="Redirecting..." disabled/>
      </div>
    )
  }
}

class App extends Component {
  constructor(props){
    super(props);
    this.seDialog = React.createRef();
    this.appBarRef = React.createRef();
    this.state = {
      user : null,
      userTag: null
    }
  }

  async componentDidMount(){
    var user = null;
    if(!(user = await Authenticator.isLoggedIn()) && window.location.href.indexOf("login")===-1) {
      this.seDialog.current.show();
    }
    this.setState({user: user});
  }

  render() {
    if(this.state.user!=null) var routes = Permission.getPage(this, this.state.user.email.split("@")[0].toUpperCase());
    var switchStatus=false;
    return (
      <MuiThemeProvider>
        <Router>
          <div>
            <SessionExpiredDialog ref={this.seDialog}/>
            <Switch>
              {
                (switchStatus=Permission.pageControl(routes, "TABLE"))?
                  <Route exact path="/table" render={(props)=>(<div><AppBarLayout title="Table Status" menu={routes}/><TableStatusLayout/></div>)}/>:null
              }
              {
                (switchStatus=Permission.pageControl(routes, "ORDER"))?
                  <Route exact path="/order" render={(props)=>(<div><AppBarLayout title="Order Status" menu={routes}/><OrderStatusLayout/></div>)}/>:null
              }
              {
                (switchStatus=Permission.pageControl(routes, "COOK"))?
                  <Route exact path="/cook" render={(props)=>(<div><AppBarLayout ref={this.appBarRef} title="Cook Status" btnAppBarName="LOADING" btnIcon={<LoadingIcon/>} dbRef="/CookPending" isBtnIconEnabled={true} menu={routes}/><CookLayout appBarRef={this.appBarRef}/></div>)}/>:null
              }
              {
                (switchStatus=Permission.pageControl(routes, "SERVE"))?
                  <Route exact path="/serve" render={(props)=>(<div><AppBarLayout ref={this.appBarRef} title="Serve Queue" btnAppBarName="LOADING"  btnIcon={<LoadingIcon/>} dbRef="/ServeQueue" isBtnIconEnabled={true} menu={routes}/><ServeLayout appBarRef={this.appBarRef}/></div>)}/>:null
              }
              {
                (switchStatus=Permission.pageControl(routes, "STATISTICS"))?
                  <Route exact path="/statistics" render={(props)=>(<div><AppBarLayout ref={this.appBarRef} title="Statistics" menu={routes}/><StatisticsLayout appBarRef={this.appBarRef}/></div>)}/>:null
              }
              {
                (switchStatus=Permission.pageControl(routes, "CONFIG"))?
                  <Route exact path="/config" render={(props)=>(<div><AppBarLayout ref={this.appBarRef} title="RestMan Configuration" menu={routes}/><ConfigLayout appBarRef={this.appBarRef}/></div>)}/>:null
              }
              {
                (switchStatus=this.state.user===null)?
                  <Route path="/login" render={(props)=>(<LoginLayout/>)}/>:null
              }
              {
                switchStatus?
                  <LoadingPage/>:<ErrPage routes={routes}/>
              }
            </Switch>
          </div>
        </Router>
      </MuiThemeProvider>
    );
  }
}

export default App;
