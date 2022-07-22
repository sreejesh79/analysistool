import React, {Component} from "react";
import ShareLinkPopup from '../sharepopup';
import MediaCarousel from '../mediacarousel';
import VerbatimTable from '../../pages/gallery/verbatimtable';
import Loader from '../loader';
import "./style.scss";

class ModalPopUp extends Component {
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
			this.props.closePopUp();
		}
    }
    onEscPress(e) {
        if(e.key === "Escape") {
			this.props.onEscPress();
        }
        
    }
    render() {
        return(
            <div className="modal-pop-up" onClick={this.closePopUp}>
                {
                    this.props.children ?
                        this.props.children
                        : <Loader className={"center"} />
                }
            </div>
        );
    }

}

export default ModalPopUp;
