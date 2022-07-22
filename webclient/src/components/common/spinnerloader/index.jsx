import React, { Component } from 'react';

import "./style.scss";

class SpinnerLoader extends Component{
    render(){
        return (
            <div className="lds-spinner" {...this.props}>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        )
    }
}

export default SpinnerLoader;
