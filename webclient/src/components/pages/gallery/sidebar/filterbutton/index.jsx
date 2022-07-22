import React, { Component } from 'react';
import "./style.scss";
import iocFilter from "../../../../../assets/images/iocFilter.svg";

class Filterbtn extends Component {
    render() {
      return (
        <div className="filter-btn">
          <img src={iocFilter} alt="filter icon" />
        </div>
      );
    }
  }
  
  export default Filterbtn;