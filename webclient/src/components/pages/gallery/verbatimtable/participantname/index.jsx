import React, {Component} from "react";

class ParticipantName extends Component {
    render() {
        return (
            <div>
                <span className="capitalize">{this.props.name}</span>
                <span className="user-group">{this.props.group}</span>
                <span className="user-location capitalize">{this.props.city}</span>
            </div>
        )
    }

}

export default ParticipantName;