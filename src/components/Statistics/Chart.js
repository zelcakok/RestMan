import React, {Component} from 'react';
import {Line} from 'react-chartjs-2';
import * as firebase from 'firebase';
import moment from 'moment';

// var config = {
//   apiKey: "AIzaSyAuFFwNuQWWpBLjU7ZmVB-z3Cm17Xy4dr0",
//   authDomain: "wepapp-201307.firebaseapp.com",
//   databaseURL: "https://wepapp-201307.firebaseio.com/",
//   storageBucket: "wepapp-201307.appspot.com"
// }
// firebase.initializeApp(config);


class Chart extends Component {

  constructor(props) {
    super(props);
    if (this.props.dataType === 'dailySale') {
      this.state = {
        chartData: {
          labels: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
            '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'
          ],
          datasets: [{
            fill: false,
            lineTension: 0,
            borderColor: '#F4A460',
            data: []
          }]
        },
        opt: {
          legend: {
            display: false
          },
          title: {
            display: true,
            fontColor: '#535353',
            text: 'Daily Sale Chart of ' + this.props.target,
            fontSize: 24
          },
          animation: {
            duration: 2500,
            easing: "easeInOutCubic"
          },
          //Modified
          scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true,
                    min: 0
                }
              }]
         },
         responsive: true,
         maintainAspectRatio:false
        },
      };
    } else if (this.props.dataType === 'monthlySale') {
      this.state = {
        chartData: {
          labels: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10'
          ],
          datasets: [{
            fill: false,
            lineTension: 0,
            borderColor: '#F4A460',
            data: []
          }]
        },
        opt: {
          legend: {
            display: false
          },
          title: {
            display: true,
            fontColor: '#81DE76',
            text: 'Monthly Sale Chart of ' + this.props.target,
            fontSize: 24
          },
          animation: {
            duration: 2500,
            easing: "easeInOutCubic"
          }
        },
      };
    }
  }


componentDidMount(){
  if (this.props.dataType === 'dailySale'){
    var searchdate = this.props.target;
    var dateStart = Date.parse(searchdate);
    var dateEnd = dateStart + 24 * 3600 * 1000 ;
    const rootRef = firebase.database().ref().child('Transactions');
    rootRef.orderByChild("endTime").startAt(dateStart.toString()).endAt(dateEnd.toString()).once('value', snaps => {
      var timeRev = [];
      for (var i = 0; i < 24; i++) {
        timeRev[i] = 0;
      }
      snaps.forEach(snap => {
        var date = new Date(parseInt(snap.val().endTime,10)); //time tuining
        var hour = date.getHours();
        timeRev[hour] += snap.val().revenue;

      });
      var tempData = this.state.chartData;
      var tempOpt = this.state.opt;
      var tempDataObj = (tempData.datasets)[0];
      tempDataObj.data = timeRev;
      tempOpt.title.text = 'Daily Sale Chart of ' + this.props.target;
      this.setState({
        chartData: tempData
      });
    });

  } else if (this.props.dataType === 'monthlySale') {
    var dayRev = [];
    var lb = [];
    var yearStr = this.props.target.substr(0,4);
    var monthStr = this.props.target.substr(4,3);
    var fullDateStr = "1 " + monthStr + " " + yearStr + " 00:00:00 +0000";
    console.log(fullDateStr);
    var dateMoment = moment(fullDateStr);
    var monthday = dateMoment.daysInMonth();
    for (var i = 0; i < monthday; i++) {
      dayRev[i] = 0;
      lb.push((i+1).toString());
    }
    var startOfMonth = dateMoment.valueOf();
    var endOfMonth = startOfMonth + monthday * 24 * 3600 * 1000;
    const rootRef = firebase.database().ref().child('Transactions');
    rootRef.orderByChild("endTime").startAt(startOfMonth.toString()).endAt(endOfMonth.toString()).once('value', snaps =>{
      snaps.forEach(snap => {
        var snapDate = moment(parseInt(snap.val().endTime,10));
        dayRev[snapDate.date()-1] += snap.val().revenue;
        console.log(snap.revenue);
        console.log(dayRev);
      });
      var tempData = this.state.chartData;
      var tempOpt = this.state.opt;
      var tempDataObj = (tempData.datasets)[0];
      tempDataObj.data = dayRev;
      tempOpt.title.text = 'Monthly Sale Chart of ' + monthStr + " " + yearStr;
      tempData.labels = lb;
      this.setState({
        chartData: tempData
      });
    });
  }
}


componentWillReceiveProps(nextProps){
    if (nextProps.dataType === 'dailySale'){
      var searchdate = nextProps.target;
      var dateStart = Date.parse(searchdate);
      var dateEnd = dateStart + 24 * 3600 * 1000 ;
      const rootRef = firebase.database().ref().child('Transactions');
      rootRef.orderByChild("endTime").startAt(dateStart.toString()).endAt(dateEnd.toString()).once('value', snaps => {
        var timeRev = [];
        for (var i = 0; i < 24; i++) {
          timeRev[i] = 0;
        }
        snaps.forEach(snap => {
          var date = new Date(parseInt(snap.val().endTime,10)); //time tuining
          var hour = date.getHours();
          timeRev[hour] += snap.val().revenue;

        });
        var tempData = this.state.chartData;
        var tempOpt = this.state.opt;
        var tempDataObj = (tempData.datasets)[0];
        tempDataObj.data = timeRev;
        tempOpt.title.text = 'Daily Sale Chart of ' + nextProps.target;
        this.setState({
          chartData: tempData
        });
      });

    } else if (nextProps.dataType === 'monthlySale') {
      var dayRev = [];
      var lb = [];
      var yearStr = nextProps.target.substr(0,4);
      var monthStr = nextProps.target.substr(4,3);
      var fullDateStr = "1 " + monthStr + " " + yearStr + " 00:00:00 +0000";
      console.log(fullDateStr);
      var dateMoment = moment(fullDateStr);
      var monthday = dateMoment.daysInMonth();
      for (var i = 0; i < monthday; i++) {
        dayRev[i] = 0;
        lb.push((i+1).toString());
      }
      var startOfMonth = dateMoment.valueOf();
      var endOfMonth = startOfMonth + monthday * 24 * 3600 * 1000;
      const rootRef = firebase.database().ref().child('Transactions');
      rootRef.orderByChild("endTime").startAt(startOfMonth.toString()).endAt(endOfMonth.toString()).once('value', snaps =>{
        snaps.forEach(snap => {
          var snapDate = moment(parseInt(snap.val().endTime,10));
          dayRev[snapDate.date()-1] += snap.val().revenue;
          console.log(snap.revenue);
          console.log(dayRev);
        });
        var tempData = this.state.chartData;
        var tempOpt = this.state.opt;
        var tempDataObj = (tempData.datasets)[0];
        tempDataObj.data = dayRev;
        tempOpt.title.text = 'Monthly Sale Chart of ' + monthStr + " " + yearStr;
        tempData.labels = lb;
        this.setState({
          chartData: tempData
        });
      });
    }
  }


  render() {
    return (
      <div>
        <Line data={this.state.chartData} options = {this.state.opt} redraw = {true} height={window.innerHeight * 0.5}/>
      </div>
    );
  }
}

export default Chart;
