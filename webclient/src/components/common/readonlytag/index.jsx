import React, { Component } from 'react';

import './style.scss';

class ReadOnlyTag extends Component{

    render(){
        return(
            <div className="readonly-tag-btn">
                <span className="readonly-tag-name">{this.props.content}</span>
            </div>
        )
    }
}

export default ReadOnlyTag;