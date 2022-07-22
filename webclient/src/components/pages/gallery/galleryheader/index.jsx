import React, {Component} from "react";

import Download from "../../../../assets/images/iocDownload.svg";
import BackArrow from "../../../../assets/images/iocArrowright.svg";
import GalleryHeaderController from "./galleryheader"
import SpinnerLoader from '../../../common/spinnerloader';
import AuthService from "../../../../services/authservice";
import LocalStorageService from "../../../../services/localstorageservice";

import "./style.scss";
import TransparentButton from "../../../common/transparentbutton";

class GalleryHeader extends Component {
    constructor(props){
        super(props);
        this.state = {
            name: ""
        }
        this.backClickHandler = this.props.backClickHandler.bind(this);
    }
    async validiate() {
        let galleryHeaderController: GalleryHeaderController = new GalleryHeaderController();
        const response = await galleryHeaderController.getStudyName(this.props.studyId);
        const { history } = this.props;
        if(response == undefined) {
            return history.push("/dashboard");
        } else if(response._error && response._body === "Invalid Study Id") {
            return history.push("/permission");
        }
        else if(response._error && response._body === "Invalid Token"){
            const response = await AuthService.instance.logout();
            LocalStorageService.instance.clear();
            history.push("/login");
        } else {
            this.setState({
                name: response._body
            })
        }
    }
    async componentDidUpdate(prevProps) {
        if(prevProps.refreshHeader != this.props.refreshHeader) {
            this.validiate();
        }
    }
    async componentDidMount() {
        this.validiate();
    }

    render() {
        return (
            <div className="gallery-header">
                <div className="study-name">
                    <TransparentButton onClick={()=>this.backClickHandler()} >
                        <img src={BackArrow} alt="Back" />
                    </TransparentButton>
					<h2>{this.state.name}</h2>
				</div>
                <div className={this.props.disable ? 'download in-progess' : this.props.startFetching ? 'download disable' : this.props.disableDownload ? 'download disable': 'download'}>
                    <span>
                        {
                            this.props.disable ?
                                <SpinnerLoader />
                            :
                            <img src={Download} alt="Download" onClick={()=>this.props.downloadClickHandler()}
                             />
                        }
                    </span>
		    		<button onClick={()=>this.props.downloadClickHandler()}>Download</button>
			    </div>
            </div>
        )
    }

}
export default GalleryHeader;