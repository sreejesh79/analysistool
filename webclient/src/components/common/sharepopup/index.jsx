import React, {Component} from "react";
import icoClose from './../../../assets/images/share_close_btn.svg';
import "./style.scss";

class ShareLinkPopup extends Component {
    constructor(props){
        super(props);
        this.state={ notifyUser: false }
        this.onCopyBtnClick = this.onCopyBtnClick.bind(this);
    }
    onCopyBtnClick(){
        this.copy(this.props.searchURL);
        this.setState({ notifyUser: !this.state.notifyUser }, () => {
            this.setState({
                        notifyUser: true
                    });
        });
    }
    copy(text) {
        var input = document.createElement('input');
        input.setAttribute('value', text);
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }

    render() {
        return(
             <div className="share-pop-up-wrapper">
                    <p className="link-name">Share with others</p>
                    <textarea className="link-to-be-copied" rows="3" disabled value={this.props.searchURL}></textarea>
                    <button className="copy-btn" onClick={this.onCopyBtnClick}>Copy</button>                        
                    <img src={icoClose} alt="Close" className="close-pop-up" onClick={(e) => this.props.closePopUp(e)}/>
                    {
                        this.state.notifyUser ? 
                            <span>Link copied to clipboard.</span>
                        :
                            null
                    }                  
                </div> 
        );
    }

}

export default ShareLinkPopup;
