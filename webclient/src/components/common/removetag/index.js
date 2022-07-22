import React, { Component } from 'react';
import icoClose from '../../../assets/images/closetag.svg';

class RemoveTag extends Component{
    constructor(props){
        super(props)
    }

    render(){      
        const { onClick } = this.props;  
        return (
            <div className={this.props.className} key={this.props.index}>
                <span className={this.props.contentClass}>{this.props.tagName}</span>
                {
                this.props.onClick ?
                <img src={icoClose} className="close-tag" alt="Closs" onClick = {onClick} />
                : null}
            </div>
        )
    }
}

export default RemoveTag;