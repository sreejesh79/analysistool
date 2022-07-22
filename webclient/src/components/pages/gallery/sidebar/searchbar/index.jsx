import React, { Component } from 'react';

import "./style.scss";

import FilterIcon from '../filterbutton';
import iocSearch from "../../../../../assets/images/iocSearch.svg";

let _searchVal: string = "";
class Searchbar extends Component {
    constructor(props){
      super(props);
      this.state = {
        refresh: false
      }
      this.handleChange = this.handleChange.bind(this);
    }
    refreshUI() {
      this.setState({
        refresh: !this.state.refresh
      })
    }
    componentDidUpdate(prevProps) {
      if(prevProps.search != this.props.search) {
        this.refreshUI();
      }
    }
    handleChange (event: any){
      _searchVal = event.target.value;
      this.props.searchHandler(_searchVal);
    }
    render() {
      return (
            <div className="search-container">
              <input placeholder="Search..." type="text" value={this.props.search} name="search" onChange={this.handleChange} />
              <img src={iocSearch} alt="search icon"/>
            </div>
      );
    }
  }
  
  export default Searchbar;