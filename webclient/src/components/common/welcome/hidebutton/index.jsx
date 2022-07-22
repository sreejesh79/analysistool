import React, { Component } from 'react'

class HideButton extends Component{
    render(){
        return(
            <div className="btn_hide">
                <p onClick={this.props.onHideClick}>
                {
                    this.props.hidden?"Unhide":"Hide"
                }
                </p>
            </div>
        )
    }
}
export default HideButton;