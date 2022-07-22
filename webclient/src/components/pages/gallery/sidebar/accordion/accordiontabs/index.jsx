import React, { Component } from 'react';

import TagButton from '../../../../../common/tagbutton';
import Loader from './../../../../../common/loader';
import NoResultsFound from './../../../../../common/noresultfound';

import './style.scss';

class AccordionTabs extends Component{
    constructor(props){
        super(props);
        this.state={
            active: false,
            refresh: false
        }
        this.showContent = this.showContent.bind(this);
        this.toggleTag = this.props.toggleTag.bind(this);
    }
    componentDidMount(){
        this.setState({active: this.props.active});
    }

    refreshUI() {
        this.setState( {
            refresh: !this.state.refresh
        })
    }
    componentDidUpdate(prevProps){
        if(prevProps.active !==this.props.active){
            this.setState({active: this.props.active});   
        }
        if (prevProps.content !== this.props.content || prevProps.no_result !== this.props.no_result) {
            this.refreshUI();
        }
    }
    
    showContent(){
        this.props.showContent(this.props.id);
    }

    render(){
        const {nameKey} =this.props
        return(
        <li>
            <div className={`acc-header ${this.state.active ? 'active' : ''}`} onClick={this.showContent}>
                <span className="acc-title">{this.props.title}</span>
                <span className="no-of-selection">({this.props.selected})</span>
            </div>
            <div className={`acc-content ${this.state.active ? 'show' : ''}`}>
            {
                this.state.active ? 
                this.props.content.length !== 0 ?
                    <div className={`acc-content ${this.state.active ? 'show' : ''}`}>
                        {
                        this.props.content.map((item,index)=>{
                               let name = item[item["nameKey"] || nameKey];
                               return (
                                    <TagButton key={index} selected={item.selected} content={name} toggleTag={(check)=>{
                                        this.toggleTag(check, item)}}/>
                                );
                            })
                        }
                    </div>
                    : (this.props.no_result)? <NoResultsFound message={"Sorry we couldn't find any matches"} />: (this.props.startFetching)?<Loader />: (this.props.noDataMessage || ` We are yet to add ${this.props.tabName}(s) to this study`)
                : null
            }
            </div>
        </li>
        )
    }
}

export default AccordionTabs;