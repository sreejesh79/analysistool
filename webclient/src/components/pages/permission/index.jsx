import React, {Component} from "react";
import withAuth from "../../withAuth";
import TransparentButton from "../../common/transparentbutton";
import LookLookAtUtils from "../../../utils/looklook-at";
import BackArrow from "../../../assets/images/iocArrowright.svg";
import './style.scss';

class Permission extends Component<Props, State> {
	constructor(props: Object) {
        super(props);
        this.state = { name: 'Dashboard'}
        this.backClickHandler = this.backClickHandler.bind(this);
        this.navigateTo = LookLookAtUtils.navigateTo.bind(this);
    }
    backClickHandler() {
        this.navigateTo("/dashboard");
    }
    componentWillMount() {
        console.log("mounting permission");
    }
    render() {
        return (
        <div className="permission-page-container">
            <div className="back-button">
                <TransparentButton onClick={()=>this.backClickHandler()} >
                    <img src={BackArrow} alt="Back" className="back-arrow-ico" />
                </TransparentButton>
                <h2>{this.state.name}</h2>
            </div>
            <div className="permission-txt">
                <p>You do not have access to this study. Please contact the administrator.</p>
            </div>
        </div>)
    }

}

export default withAuth(Permission);