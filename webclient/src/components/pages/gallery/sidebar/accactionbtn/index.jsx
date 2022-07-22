import React, { Component } from 'react';
import './style.scss';

class AccActionbtn extends Component {
    render() {
      return (
        <div className="btn" onClick={this.props.onClick}>
          <img src={this.props.img} className={this.props.className ? this.props.className : ''} alt={this.props.alternateName}/>
          <span>{this.props.btnName}</span>
        </div>
      );
    }
  }
  
  export default AccActionbtn;