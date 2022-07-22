import React, { Component } from 'react';
import ClassNames from "classnames";

import Searchbar from './searchbar';
import AccActionbtn from './accactionbtn';
import Accordion from './accordion';

import icoDone from '../../../../assets/images/icoDone.png';
import icoSelectAll from '../../../../assets/images/icoSelectAll.png';
import icoUnselectAll from '../../../../assets/images/icoUnselectAll.png';

import './style.scss';
class Sidebar extends Component {  
    _questionnaireData=[];
    _liveTagsData=[];
    _participantData=[];
    _groupsData=[];
    objFilter: any = {tagsId:[],participantsId:[],groupsId:[],liveTagsId:[]};
  constructor(props){
    super(props);
    this.state = {search:"", refresh:false, selectAll: true}
    this.applyFilter = this.applyFilter.bind(this)
    this.resetFilter = this.resetFilter.bind(this)
    this.searchHandler = this.searchHandler.bind(this)
    this.toggleItemSelection = this.toggleItemSelection.bind(this)
  }

  async componentDidMount(){
    await this.processProps();
  }

  setSelectAllState() {
    const value = (this._groupsData.length != this.objFilter.groupsId.length || this._participantData.length != this.objFilter.participantsId.length || this._questionnaireData.length != this.objFilter.tagsId.length || this._liveTagsData.length != this.objFilter.liveTagsId.length);
    this.setState({
      selectAll: value
    });
  }

  async componentDidUpdate(prevProps){
    if(prevProps != this.props) {
      await this.processProps();
      if(prevProps.hideSideBar != this.props.hideSideBar) {
        this.setState({
          search: ""
        })
      }else{
        this.refreshUI();
      }
    }
  }

  async processProps (){
    this.objFilter.tagsId = this.props.filteredQuestionnaireData.map(item=>item._id);
    this.objFilter.liveTagsId = this.props.filteredLiveTagsData.map(item => item._id);
    this.objFilter.participantsId = [];
    this.objFilter.groupsId = [];
    for(let p of this.props.filteredParticipantData){
      this.objFilter.participantsId.push(p._id);
      if(p.group && p.group.name && this.objFilter.groupsId.indexOf(p.group._id) === -1) {
        this.objFilter.groupsId.push(p.group._id)
      }
    }
    this.updateTagSelections();
    this.updateLiveTagSelections();
    this.updateParticipantsSelections();
    this.updateGroupsSelections();    
    this.setSelectAllState();
  }

  refreshUI(){
    this.setState({refresh:!this.state.refresh});
  }

  getFilterableIds(data, ids) {
    const temp = [];
    for (let d of data) {
      if(ids.indexOf(d._id) !== -1) {
        temp.push(d._id);
      }
    }
    return temp;
  }

  applyFilter(){
    const filters = [{
      tags: this.getFilterableIds(this.props.questionnaireData.slice(0), this.objFilter.tagsId),
      liveTags: this.getFilterableIds(this.props.liveTagsData.slice(0), this.objFilter.liveTagsId),
      participants: this.getFilterableIds(this.props.participantData.slice(0), this.objFilter.participantsId),
    }];
    this.props.applyFilter(filters);
  }

  resetFilter() {
    this._groupsData = this.toggleData(this._groupsData, this.objFilter.groupsId);
    this._participantData = this.toggleData(this._participantData, this.objFilter.participantsId);
    this._questionnaireData = this.toggleData(this._questionnaireData, this.objFilter.tagsId);
    this._liveTagsData = this.toggleData(this._liveTagsData, this.objFilter.liveTagsId);
    if(!this.state.selectAll) {
      this.objFilter = {tagsId:[],participantsId:[],groupsId:[],liveTagsId:[]};
    }
    this.setState({
      selectAll: !this.state.selectAll
    })
  }

  toggleData(data, objectFilter) {
    for(let d of data) {
      d.selected = this.state.selectAll;
      if(objectFilter.indexOf(d._id) == -1) {
        objectFilter.push(d._id)
      }
    }
    return data
  }

  searchHandler(strSearch){
    this.setState({
      search:strSearch
    });
  }

  updateLiveTagSelections() {
    this._liveTagsData = this.props.liveTagsData.slice(0).map(item=>{
      item.selected = this.objFilter.liveTagsId.indexOf(item._id) !== -1;
      return item;
    });
  }

  updateTagSelections() {
    this._questionnaireData = this.props.questionnaireData.slice(0).map(item=>{
      item.selected = this.objFilter.tagsId.indexOf(item._id) !== -1;
      return item;
    });
  }

  updateParticipantsSelections() {
    this._participantData = this.props.participantData.slice(0).map(item=>{
      item.selected = this.objFilter.participantsId.indexOf(item._id) !== -1;
      return item
    });
  }

  updateGroupsSelections() {
    this._groupsData = this.props.groupsData.slice(0).map(item=>{
      item.selected = this.objFilter.groupsId.indexOf(item._id) !== -1;
      return item;
    });
  }

  updateGroupParticipants() {
    let pData = [];
    for (let p of this.props.participantData) {
      if(p.group && this.objFilter.groupsId.indexOf(p.group._id) !==-1 && pData.indexOf(p._id) === -1) {
        pData.push(p._id);
      }
    }
    return pData;
  }

  updateArrayOfIndex(arr,id, check){
      const index = arr.indexOf(id)
      if(check) {
        if(index === -1){
          arr.push(id);
        }
      } else {
        if(index !== -1){
          arr.splice(index,1);
        }
      }
      return arr
  }

  toggleItemSelection(check, item, type) {
    console.log("check, item, type", check, item, type);
    if(type==="tag"){
      this.objFilter.tagsId = this.updateArrayOfIndex(this.objFilter.tagsId.slice(0),item._id, check);
      this.updateTagSelections();
    }else if(type==="group"){
      this.objFilter.groupsId = this.updateArrayOfIndex(this.objFilter.groupsId.slice(0),item._id, check);
      this.objFilter.participantsId = this.updateGroupParticipants();
      this.updateGroupsSelections();
    } else if(type==="participants"){
      this.objFilter.participantsId = this.updateArrayOfIndex(this.objFilter.participantsId.slice(0),item._id, check);
      this.updateParticipantsSelections();
    } else if(type==="liveTag"){
      this.objFilter.liveTagsId = this.updateArrayOfIndex(this.objFilter.liveTagsId.slice(0),item._id, check);
      console.log("this.objFilter.liveTagsId", this.objFilter.liveTagsId);
      this.updateLiveTagSelections();
    }
    this.setSelectAllState();
    
  }
  
  render() {

    const verbatimFilterClass = ClassNames('verbatim-filter-sidebar',{
      'show-sidebar': this.props.showSideBar,
      'hide-sidebar': this.props.hideSideBar
    });
    return (
      <div className={verbatimFilterClass}>
        <div className="filter-container">        
          <Searchbar search={this.state.search} searchHandler={this.searchHandler}/>
          <Accordion 
                    startFetching={this.props.startFetching} 
                    search={this.state.search} 
                    toggleItemSelection={this.toggleItemSelection} 
                    questionnaireData={this._questionnaireData}
										participantData={this._participantData}
                    groupsData={this._groupsData}
                    liveTagsData={this._liveTagsData} />
          <div className="action-btn">
            <AccActionbtn btnName={this.state.selectAll ? "Select All" : "Unselect All"} img={this.state.selectAll ? icoSelectAll : icoUnselectAll} className={"reset-icon"} alternateName={"Select All"} onClick={this.resetFilter}/>
            <AccActionbtn btnName={"Confirm Selections"} img={icoDone} className={"done-icon"} alternateName={"Confirm Selections"} onClick={this.applyFilter}/>
          </div>
        </div>
      </div>
    );
  }
}

export default Sidebar;
