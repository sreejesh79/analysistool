import React, { Component } from 'react';

import ShareBtnImg from '../../../assets/images/shareicon.svg';

import './style.scss';

class ShareButton extends Component{
    constructor (props) {
        super(props);
        this.openPopup = this.openPopup.bind(this);
    }
    openPopup() {
        if(!this.props.disabled) {
            this.props.openPopup();
        }
    }
    render(){
        return(
            <div className={ this.props.disabled ? 'share-btn-container disabled' : 'share-btn-container'} onClick={this.openPopup}>
                <img src={ShareBtnImg} alt="Share" />
                <span>share</span>
            </div>
        )
    }
}

export default ShareButton;