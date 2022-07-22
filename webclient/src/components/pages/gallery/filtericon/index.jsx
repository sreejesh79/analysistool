import React, { Component } from 'react';

import './style.scss';
class FilterIcon extends Component {
    render(){
        return(
            <img src={this.props.image} className="filter-img" alt="Filter" onClick={this.props.showFilterSidebar}/>
        )
    }
}

export default FilterIcon;