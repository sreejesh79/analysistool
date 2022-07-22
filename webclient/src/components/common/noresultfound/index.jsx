import React, {Component} from "react";
import icoNoResult from './../../../assets/images/iconNoResult.png';
import './style.scss';

class NoResultsFound extends Component {
    render() {
        return(
            <div className="no-results-found">
                {this.props.needIcon == false ? null : <img src={icoNoResult} alt="No Result"/>}
                <p>{this.props.message}</p>
            </div>
        );
    }

}
export default NoResultsFound;