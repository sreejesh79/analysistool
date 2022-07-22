import React, {Component} from "react";
import "./style.scss";
import icoClose from './../../../assets/images/share_close_btn.svg';

class PrivacyPolicy extends Component {
    constructor(props){
        super(props);
        this.onEscPress = this.onEscPress.bind(this);
        this.closePopUp = this.closePopUp.bind(this);
    }
    componentDidMount() {
        // console.log("this.props", this.props);
        document.addEventListener('keydown', this.onEscPress, false);
    }
    componentWillUnmount() {
        document.removeEventListener('keydown', this.onEscPress, false);
    }
    closePopUp(e) {
        if(e.target == e.currentTarget){
			this.props.closePrivacyPolicy();
		}
    }
    onEscPress(e) {
        if(e.key === "Escape") {
			this.props.closePrivacyPolicy();
        }
        
    }
 
    render() {
        return(
            <div className="privacy-policy-container" onClick={(e) => this.closePopUp(e)}>
                <div className="privacy-policy-wrapper">
                    <div className="close-container">
                        <img src={icoClose} alt="Close" className="close-pop-up" onClick={() => this.props.closePrivacyPolicy()} />
                    </div>
                    <div className="privacy-policy-content-wrapper">
                        <div className="privacy-policy-content">
                            <p className="welcome-msg">Welcome to LookLook<sup>&#174;</sup>! Let's Get Started</p>
                            <p className="content">Click on the below links and please read our Terms of Conditions Agreement and Privacy Policy. By checking the box below, you acknowledge and agree that you have read these documents and agree to the terms.</p>
                            <p className="content">For our Terms of Service, <a href="https://static1.squarespace.com/static/57ee9f0c15d5db8fe164b4f7/t/5c1117dd6d2a73d7ab16c0b0/1544624093470/LookLook+Terms+of+Service.pdf" target="_blank">click here</a>. | For our Privacy Policy, <a href="https://static1.squarespace.com/static/57ee9f0c15d5db8fe164b4f7/t/5c111880c2241b7d0c8c8549/1544624256466/LookLook+Privacy+Policy.pdf" target="_blank">click here</a>.</p>
                            <hr />
                        </div>
                    </div>
                    <div className="privacy-policy-footer">
                        <button type="submit" onClick={() => this.props.onAgreeClick()}>I Agree</button>
                    </div>
                </div>
                
            </div>
        );
    }

}

export default PrivacyPolicy;
