import React, { Component } from 'react';

import './style.scss';

class TransparentButton extends Component{
    render(){
        return(            
            <button {...this.props} className={`transparent ${this.props.className ? this.props.className : ''}`}>
                {this.props.children}
            </button>
        )
    }
}

export default TransparentButton;