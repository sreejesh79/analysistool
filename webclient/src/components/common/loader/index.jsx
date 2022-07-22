import React, { Component } from 'react';

import "./style.scss";

class Loader extends Component{
    render(){
        return (
            <div className={`loader ${this.props.className ? this.props.className : ''}`}>
                <span></span>
                <span></span>
                <span></span>
            </div>
        )
    }
}

export default Loader;
