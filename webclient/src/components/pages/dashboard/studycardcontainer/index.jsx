import React, { Component } from 'react';

import StudyCard from '../studycard';
import Loader from '../../../common/loader';

class StudyCardContainer extends Component{
    constructor(props){
        super(props);
        this.clickHandler=this.props.clickHandler.bind(this);
    }
    render(){
        return(
            <div className="lk_studies_container">
                {
                    (this.props.studiesLength>0)?
                        Object.keys(this.props.userStudies).map((key)=>{
                            return (<StudyCard key={key} study={this.props.userStudies[key]} clickHandler={this.clickHandler} />);
                        }
                    ) 
                    : 
                    (this.props.studiesLength == 0) ?
                        <div className="empty-container">
                            <p>You currently have no studies</p>
                        </div>
                    :
                        <div className="loader-container">
                            <Loader />
                        </div>
                }
            </div>
        )
    }
}

export default StudyCardContainer;