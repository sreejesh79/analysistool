import React, { Component } from "react";
import Loader from "../../../common/loader";
import "./style.scss";

class SearchResultText extends Component {
  render(){
    const { showResultText } = this.props;
	  return(
        <div className={this.props.startFetching ? 'search-result centered-loader' : ((showResultText ? showResultText.length : 0) ? 'search-result' : 'search-result centered-loader')}>
        {
            this.props.startFetching ? <Loader className="center" />  : this.props.showResultText ? this.props.renderSearchResult : null
        }
        </div>
    );
  }
}

export default SearchResultText;