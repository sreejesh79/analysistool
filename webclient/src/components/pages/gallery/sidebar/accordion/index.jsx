import React, { Component } from 'react';

import AccordionTabs from './accordiontabs';

import './style.scss';
import Utils from '../../../../../utils/utilityScript';

let _questionnaireData=[];
let _groupsData=[];
let _participantData=[];
let _liveTagsData=[];
class Accordion extends Component {
    constructor(props){
        super(props);
        this.state={
            refresh:false,
            active:3
          }
        this.showContent = this.showContent.bind(this);
        this.toggleTag = this.props.toggleItemSelection.bind(this);
    }
    getSyncData() {
        _questionnaireData = this.props.questionnaireData.slice(0);
        _groupsData = this.props.groupsData.slice(0);
        _participantData = this.props.participantData.slice(0);
        _liveTagsData = this.props.liveTagsData.slice(0);
        _questionnaireData = _questionnaireData.concat(_liveTagsData);
        this.refreshUI();
    }
    componentDidMount(){
        this.getSyncData()
    }
    componentDidUpdate(prevProps){
        if(prevProps.questionnaireData !== this.props.questionnaireData 
            || prevProps.groupsData !== this.props.groupsData 
            || prevProps.participantData !== this.props.participantData
            || prevProps.liveTagsData !== this.props.liveTagsData){
            this.getSyncData();
        }
        if(prevProps.search !== this.props.search){
            this.filterBySearch();
        }
    }
    refreshUI(){
        this.setState({refresh:!this.state.refresh});
    }
    filterBySearch(){
        const strSearch = this.props.search.toLowerCase().trim();
        _questionnaireData = this.props.questionnaireData.slice(0).filter(item=> item.tag.toLowerCase().indexOf(strSearch)!== -1);
        _groupsData = this.props.groupsData.slice(0).filter(item=> item.name.toLowerCase().indexOf(strSearch)!== -1);
        _participantData = this.props.participantData.slice(0).filter(item=> item.name.toLowerCase().indexOf(strSearch)!== -1);
        _liveTagsData = this.props.liveTagsData.slice(0).filter(item=>item.name.toLowerCase().indexOf(strSearch)!==-1);
        _questionnaireData = _questionnaireData.concat(_liveTagsData);
        this.refreshUI();
    }

    showContent(id){
       this.setState({active:id});
    }

    render() {
      return (
        <ul>
            <AccordionTabs 
                id={1}
                startFetching={this.props.startFetching}
                active={this.state.active===1}
                no_result={this.props.search.length>=3 && _groupsData.length === 0}
                title={"Group"} 
                nameKey={'name'}
                content={_groupsData} 
                selected={Utils.twoDigit(_groupsData.length)} 
                showContent={this.showContent}
                toggleTag={(check, item)=>this.toggleTag(check, item, 'group')}
                tabName={"Group"}
                noDataMessage={"Groups have not been added to this study"}
            />
            <AccordionTabs 
                id={2}
                startFetching={this.props.startFetching}
                active={this.state.active===2}
                no_result={this.props.search.length>=3 && _participantData.length === 0}
                title={"Participant Name"} 
                nameKey={'name'}
                content={_participantData} 
                selected={Utils.twoDigit(_participantData.length)} 
                showContent={this.showContent}
                toggleTag={(check, item)=>this.toggleTag(check, item, 'participants')}
                tabName={"Participant"}
                noDataMessage={"Participants have not been added to this study"}
            />
            <AccordionTabs 
                id={3}
                startFetching={this.props.startFetching}
                active={this.state.active===3}
                no_result={this.props.search.length>=3 && _questionnaireData.length === 0}
                title={"Tag"} 
                nameKey={'tag'}
                content={_questionnaireData} 
                selected={Utils.twoDigit(_questionnaireData.length)} 
                showContent={this.showContent}
                toggleTag={(check, item)=>this.toggleTag(check, item, item.tagType)}
                tabName={"Tag"}
                noDataMessage={"Tags have not been added to this study"}
            />
            {/* <AccordionTabs 
                id={4}
                startFetching={this.props.startFetching}
                active={this.state.active===4}
                no_result={this.props.search.length>=3 && _liveTagsData.length === 0}
                title={"Study Tag"} 
                nameKey={'name'}
                content={_liveTagsData} 
                selected={Utils.twoDigit(_liveTagsData.length)} 
                showContent={this.showContent}
                toggleTag={(check, item)=>this.toggleTag(check, item, 'liveTag')}
                tabName={"Study Tag"}
            /> */}
          </ul>
      );
    }
  }
  
  export default Accordion;

  