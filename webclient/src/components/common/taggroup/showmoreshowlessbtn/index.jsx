import React, { Component } from 'react';

class ShowMoreShowLessBtn extends Component{
    render(){
        return(
            <div className="show-more-btn">
            {
                this.props.showHide ? 
                    <span onClick={this.props.showLess} className="hide-btn">Show Less</span>
                :
                    <span onClick={this.props.showMore}>Show More</span>
            }   
            </div>
        )
    }
}

export default ShowMoreShowLessBtn;