import React, {Component} from 'react';
import {Card, CardActions, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import {orangeA200} from 'material-ui/styles/colors';

//From Denny
import StatisticsChart from './Chart.js';
// import DatePicker from 'react-datepicker';
import moment from 'moment';
import "react-datepicker/dist/react-datepicker.css";

//Modified
import DatePicker from 'material-ui/DatePicker';

class Statistics extends Component {
  constructor(props){
    super(props);
    this.state = {
      dataSet : null,
      targetDate: moment()
    }
    this.chart=null;
  }

  handleChange(event,date) {
    this.setState({
      targetDate: moment(date)
    });
  }

  render(){
    return(
      <Card style={{height: "50%", maxWidth:"100%"}}>
        <CardTitle>
          <label style={{fontWeight:"bold"}}>Statistics</label>
        </CardTitle>
        <CardText>
          <StatisticsChart dataType="dailySale" target={this.state.targetDate.format('MMM D, YYYY')}/>
        </CardText>
        <CardActions style={{height:"50px"}}>
          <div style={{float:"right"}}>
            <FlatButton
              style={{color:orangeA200, width:"100%"}} containerElement="label"
              label={"DATE \u00A0\u00A0\u00A0[\u00A0" + this.state.targetDate.format("YYYY/MM/DD") + "\u00A0]"}>
              <DatePicker
                id="datepicker"
                autoOk={true}
                style={{display:"none"}}
                formatDate={(date) => moment(date).format('YYYY/MM/DD')}
                textColor={orangeA200}
                value={new Date(this.state.targetDate.format("YYYY/MM/DD"))}
                onChange={this.handleChange.bind(this)}/>
            </FlatButton>
          </div>
        </CardActions>
      </Card>
    )
  }
}

class Content extends Component{
  render(){
    return(
      <div>
        <Statistics/>
      </div>
    )
  }
}
class StatisticsLayout extends Component {
  render(){
    return (
      <div style={{padding:"2%"}}>
        <Content/>
      </div>
    )
  }
}
export default StatisticsLayout;
