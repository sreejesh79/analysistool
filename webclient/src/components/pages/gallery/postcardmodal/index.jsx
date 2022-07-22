import React, { Component } from 'react';

import TransparentButton from '../../../common/transparentbutton';
import IconText from '../../../common/icontext';
import AddTag from '../../../common/addtag';

import icoView from '../../../../assets/images/icoView.png';
import icoLeft from '../../../../assets/images/icoLeft.png';
import icoRight from '../../../../assets/images/icoRight.png';
import DummyImage from '../../../../assets/images/defaultImageThumb.jpg';
import Dustbin from '../../../../assets/images/delete.svg';
import WarningPopup from "../../../common/warningpopup";
import './style.scss';
import { isDuration } from 'moment';
import DisplayImage from '../../../common/display-image';
import DisplayVideo from '../../../common/display-video';

class PostcardModal extends Component{
    constructor(props){
        super(props);
        this.state = { 
            showViewButton: true,
            playVideo: false,
            refresh: false,
            WarningPopup: false
        }
        this.togglePostcardDetails = this.togglePostcardDetails.bind(this);
        this.removeTag = this.removeTag.bind(this);
        this.playVideo = this.playVideo.bind(this);
        this.onEscPress = this.onEscPress.bind(this);
        this.toggleWarningPopup = this.toggleWarningPopup.bind(this);
        this.onDeleteClicked = this.onDeleteClicked.bind(this);
    }
    
    onEscPress(e){
        if(e.key === "Escape" && !this.state.WarningPopup) {
			this.props.onEscPress();
        }
	}

    refreshUI() {
        this.setState({
            refresh: !this.state.refresh
        })
    }
    componentDidMount() {
        document.addEventListener('keydown', this.onEscPress, false);
    }
    componentWillUnmount() {
        document.removeEventListener('keydown', this.onEscPress, false);
    }

    togglePostcardDetails(){
        this.setState({ showViewButton: !this.state.showViewButton })
    }

    removeTag(){
        alert('removed tag');
    }

    renderPostcardTags(){
        return (this.props.data.tags || []).map((item, index) =>{
            return(
                <div className="postcard-modal-tags" key={"postcard-modal-tags-" + index}>
                    <span className="tag-container">{item.tag}</span>
                    {/* <span className="close-tag" onClick={this.removeTag}>x</span> */}
                </div>
            )
        })
    }

    playVideo(){
        this.setState({ playVideo: true })
    }
    
    toggleWarningPopup () {
        this.setState({
            WarningPopup: !this.state.WarningPopup
        })
    }

    async onDeleteClicked () {
        this.toggleWarningPopup();
        await this.props.onDelete();
    }
    onImageLoad=()=>{}
    onHandleClick=()=>{}

    render(){
        const {
            currentPost,
            currentMedia,
            post,
            length,
            data,
            mediaType
        } = this.props;
        const {
            name,
            createdAt,
            _id,
            description,
            mediaId,
        } = data || {};
        const { nameKey } = this.props
        const media = this.props.data[nameKey];
        const uiKey = mediaId ? `${_id}-${mediaId}` : _id;
        let isLeftEnable = currentPost != 0;
        let rightEnable = currentPost != (length - 1);
        if (currentMedia != undefined) {
            if (!isLeftEnable && currentMedia > 0) {
                isLeftEnable = true;
            }
            if (!rightEnable && currentMedia < post.length - 1) {
                rightEnable = true;
            }
        }

        return(
            <div key={uiKey} className="postcard-modal-wrapper" onClick={this.props.closePostcardModal}>
                <div className="postcard-modal-container">
                {
                    nameKey == "videoUrl" ?
                        <DisplayVideo key={uiKey}
                            videoObjectKey={this.props.data.videoObjectKey}
                            url={(!media || media == "" ? DummyImage : media)}>
                        </DisplayVideo>
                    : <DisplayImage style={"modal-media-img"} 
                        url={(!media || media == "" ? DummyImage : media)}
                        imageObjectKey={this.props.data.imageObjectKey}
                        imageLoaded={this.onImageLoad}
                        handleClick={this.onHandleClick}>
                    </DisplayImage>
                }
                <span className="close-modal" onClick={this.props.closePostcardModal}>x</span>
                    {
                        this.state.showViewButton ?
                            <TransparentButton onClick={this.togglePostcardDetails} className={"view-hide-btn view-btn"}>
                                <IconText text={"View more"} image={icoView} />
                            </TransparentButton>
                        :   
                            null
                }
                {
                    !this.state.showViewButton ?
                        <div className="postcard-content">
                            {
                                this.props.showDelete && <div className="dustbin-wrapper">
                                    <img src={Dustbin} alt="Dustbin" onClick={()=>this.toggleWarningPopup()} />
                                </div>
                            }
                            <div className="postcard-content-wrapper">
                                <div className="participant-name-hidebtn">
                                    <span className="participantName capitalize">{name}</span>
                                    <TransparentButton onClick={this.togglePostcardDetails} className={"view-hide-btn hide-btn"}>
                                        <IconText text={"Hide"} image={icoView} />
                                    </TransparentButton>
                                </div>
                                <span className="date">{createdAt}</span>
                                {
                                    this.renderPostcardTags()
                                }
                                {/* <AddTag
                                    availableTags={this.props.data.availableTags} Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                                /> */}
                                <p className="userInput">{description}</p>
                            </div>
                        </div>
                    :
                        null
                }
                </div>
                <div className="left-right-navigation">
                        <img src={icoLeft} alt="Previous" className={isLeftEnable ? "icon-previous" : "disabled-previous"} onClick={()=>this.props.showPreviousPost(_id)} />
                        <img src={icoRight} alt="Next" className={rightEnable ? "icon-next" : "disabled-next"} onClick={()=>this.props.showNextPost(_id)} />
                </div>
                {
                    this.state.WarningPopup ? 
                        <WarningPopup 
                            danger={true}
                            warningHeaderText={`Delete ${mediaType}`} //"Delete "
                            warningText={`This action is permanent and can't be undone! ${mediaType} deleted will be permanently lost.`} closePopup={()=>this.toggleWarningPopup()}
                            showButtons={true}
                            onConfirmation={() => this.onDeleteClicked()}
                        />
                    : 
                        null
                }
            </div>
        )
    }
}

export default PostcardModal;