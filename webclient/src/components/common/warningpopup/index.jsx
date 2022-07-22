import React, {Component} from "react";
import icoClose from './../../../assets/images/share_close_btn.svg';
import TransparentButton from "../transparentbutton";
import DanderRedExclaim from "./../../../assets/images/red_danger_alert.png"
import "./style.scss";

class WarningPopup extends Component {
    constructor(props){
        super(props);
        this.state = {
            warningText: this.props.warningText
        }
        this.onEscPress = this.onEscPress.bind(this);
        this.closePopUp = this.closePopUp.bind(this);
    }
    componentDidMount() {
        document.addEventListener('keydown', this.onEscPress, false);
    }
    componentWillUnmount() {
        document.removeEventListener('keydown', this.onEscPress, false);
    }
    onEscPress(e) {
        if(e.key === "Escape") {
			this.props.closePopup();
        }
    }
    closePopUp(e) {
        if(e.target == e.currentTarget){
			this.props.closePopup();
		}
    }

    render() {
        return(
            <div className="warning-pop-up" onClick={(e)=>this.closePopUp(e)}>
                <div className="warning-pop-up-wrapper">
                    <div className="header-wrapper">
                        {
                            this.props.danger && <img src={DanderRedExclaim} alt="danger_delete" className="danger-delete" />
                        }
                        <p className="link-name">{this.props.warningHeaderText}</p>
                    </div>
                    <img src={icoClose} alt="Close" className="close-pop-up" onClick={this.closePopUp}/>
                    <p>{this.state.warningText}</p>
                    {
                        this.props.showButtons ?
                            <div className="confirmation-wrapper">
                                <TransparentButton onClick={this.closePopUp} className={"cancel-button"}>
                                    Cancel
                                </TransparentButton>
                                <TransparentButton onClick={this.props.onConfirmation} className={"confirm-button"}>
                                    Confirm
                                </TransparentButton>
                            </div>
                            : null
                    }
                </div>
            </div>
        );
    }

}

export default WarningPopup;
