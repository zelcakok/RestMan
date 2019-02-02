import React, {Component} from 'react';
import FlatButton from 'material-ui/FlatButton';
import {orangeA200} from 'material-ui/styles/colors';
import FileIcon from 'material-ui/svg-icons/file/file-upload';
import FileExportIcon from 'material-ui/svg-icons/file/file-download';
import DBClient from '../Firebase/DBClient';
import CSVReader from 'react-csv-reader';
import moment from 'moment';

import ErrDialog from './ErrDialog';

class FileHandler extends Component {
  constructor(props){
    super(props);
    this.state={
      filePath:"",
      errDiaShow:true
    }
    this.parent = props.parent;
    this.errDialog = React.createRef();
    this.fileInput = React.createRef();
    this.dbC=DBClient.getInstance();
  }

  fileValidate=(file)=>{
    var keys = ["Type", "DishName", "Price", "Image"];
    try{
      for(var i=0; i<keys.length; i++) if(file[0][i]!==keys[i]) return false;
    } catch(e){
      return false;
    }
    return true;
  }

  onFileLoaded=(file)=>{
    if(!this.fileValidate(file)) this.onFileLoadErr();
    else {
      var dishes={
        "MainDishes":{},
        "Desserts":{}
      };
      var dishId=0;
      for(var i=1; i<file.length; i++){
        if(file[i][0]==="" || file[i][0]===null) break;
        dishes[file[i][0]][file[i][0][0]+"_id_"+dishId++]={
          title:file[i][1],
          price:parseInt(file[i][2],10),
          img:file[i][3]
        };
      }
      this.dbC.write("/Dishes/MainDishes", dishes["MainDishes"]);
      this.dbC.write("/Dishes/Desserts", dishes["Desserts"]);
    }
  }

  onFileLoadErr=()=>{
    this.errDialog.current.show();
  }

  download_csv=(data)=>{
      var csv = "";
      data.forEach(function(row) {
              csv += row.join(',');
              csv += "\n";
      });
      var a = document.createElement('a');
      a.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
      a.download = 'MenuExport_'+moment().format("YYYY-MM-DD")+".csv";
      a.click();
  }

  gatherData=()=>{
    var dishes=[["Type", "DishName", "Price", "Image"]];
    // eslint-disable-next-line
    Object.keys(this.parent.state.dishes).map((type)=>{
      // eslint-disable-next-line
      Object.keys(this.parent.state.dishes[type]).map((dish)=>{
          dishes.push([
            type,
            this.parent.state.dishes[type][dish].title,
            this.parent.state.dishes[type][dish].price,
            this.parent.state.dishes[type][dish].img
          ]);
      })
    })
    return dishes;
  }

  async prepareFile(){

  }

  exportCSV=()=>{
    if(this.parent===null) return;
    this.download_csv(this.gatherData());
  }

  render(){
    return(
      <div>
        <FlatButton
          containerElement="label"
          label="UPLOAD"
          icon={<FileIcon/>}
          style={{color:orangeA200}}>
          <ErrDialog ref={this.errDialog} msg="Invalid file format"/>
          <div style={{display:"none"}}><CSVReader
            cssClass="csv-input"
            onFileLoaded={this.onFileLoaded}
            onError={this.onFileLoadErr}/></div>
        </FlatButton>
        <FlatButton
          containerElement="label"
          label="EXPORT"
          icon={<FileExportIcon/>}
          onClick={this.exportCSV}
          style={{color:orangeA200}}/>
      </div>
    )
  }
}
export default FileHandler;
