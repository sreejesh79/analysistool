import React, {Component} from "react";
import "../../../assets/styles/_states.scss";
import "./style.scss";

class Tag extends Component {
    render() {
        return(
            <div className="tag-btn-container">
                <div className="tag-btn">
                    <p>{this.props.name}</p>
                </div>
                <p className="tag-tooltip-text">{this.props.name}</p>
            </div>
        );
    }

}

export default Tag;
