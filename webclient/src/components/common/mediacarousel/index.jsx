import React, {Component} from "react";
import DummyImage from '../../../assets/images/defaultImageThumb.jpg';
import icoLeft from '../../../assets/images/icoLeft.png';
import icoRight from '../../../assets/images/icoRight.png';
import SpinnerLoader from '../../common/spinnerloader'; // need to change the loader
import icoPlay from '../../../assets/images/icoPlay.svg';

import "./style.scss";
import DisplayVideo from "../display-video";
import DisplayImage from "../display-image";

class MediaCarousel extends Component {
    thumbnailRef;
    imageWidth = 160; // width 150 and margin 10
    posts = null;
    constructor(props){
        super(props);
        this.state={ 
            selectedPost: 0,
            scrollPosition:0,
            showNavigation: false,
        };
        this.showPreviousPost = this.showPreviousPost.bind(this);
        this.showNextPost = this.showNextPost.bind(this);
        this.onThumbnailPostClick = this.onThumbnailPostClick.bind(this);
        this.setThumbnailRef = this.setThumbnailRef.bind(this);
    }

    setThumbnailRef (ref) {
        if(ref) {
            this.thumbnailRef = ref;
            this.setState({
                showNavigation: true
            });
        }
    }

    getThumbnailDivWidth() {
        if(this.thumbnailRef) {
            const thumbnailDivWidth = this.thumbnailRef.clientWidth;
            const len = this.props.posts.length;
            return (len * this.imageWidth) > thumbnailDivWidth;
        }
        return false;
    }

    isPrevDisabled() {
        return this.state.scrollPosition > 0;
    }
    isNextDisabled() {
        return this.state.scrollPosition < (this.thumbnailRef.scrollWidth - this.thumbnailRef.clientWidth);
    }

    onThumbnailPostClick(index) {
        this.setState({
            selectedPost: index
        })
    }

    scrollThumbnailDivBy(pixel) {
        if(this.thumbnailRef) {
            this.thumbnailRef.scrollLeft = this.thumbnailRef.scrollLeft + pixel;
            this.setState({
                scrollPosition:this.thumbnailRef.scrollLeft
            })
        }
    }

    showPreviousPost() {
        this.scrollThumbnailDivBy(-this.imageWidth);
    }

    showNextPost() {
        this.scrollThumbnailDivBy(this.imageWidth);
    }
    onImageLoad=()=>{}
    onHandleClick=()=>{}

    renderPost (post) {
        const { mediaType, videoThumbnailUrl, mediaUrl, videoObjectKey, imageObjectKey } = post;
        return (
            mediaType == "video" ?
                    <DisplayVideo url={mediaUrl} videoObjectKey={videoObjectKey}>
                    </DisplayVideo>
                : 
                    <DisplayImage url={(!mediaUrl || mediaUrl == "" ? DummyImage : mediaUrl)} 
                        checkUpdate={true}
                        imageLoaded={this.onImageLoad}
                        handleClick={this.onHandleClick}
                        imageObjectKey={imageObjectKey}>
                    </DisplayImage>
        );
    }

    renderThumbnail(post, index) {
        const { mediaType} = post;
        const mediaUrl = mediaType == "video"  ? post.videoThumbnailUrl : post.mediaUrl;
        return  (  <div key={index} className={ this.state.selectedPost == index ? "thumbnail-media-img selected" :"thumbnail-media-img"}>
            <DisplayImage key={index} url={(!mediaUrl || mediaUrl == "" ? DummyImage : mediaUrl)} className="thumb-image"
                imageObjectKey={post.imageObjectKey}
                imageLoaded={this.onImageLoad}
                handleClick={() => this.onThumbnailPostClick(index)}>
            </DisplayImage>
            {
                mediaType == "video" ?
                <img src={icoPlay} alt="Play" onClick={() => this.onThumbnailPostClick(index)} className="play-icon" />
                : null
            }
        
        </div>)
    }

    getWrapperClass () {
        if (this.props.className) {
            return `carousel-container ${this.props.className}`;
        }
        return "carousel-container";
    }

    render() {
        return (
            <div className={this.getWrapperClass()}> 
                <div className="posts-container">
                    {
                       this.renderPost(this.props.posts[this.state.selectedPost])
                    }
                </div>
                <div className="thumbnail-container">
                    <div className={this.state.showNavigation && this.getThumbnailDivWidth() && this.isPrevDisabled() ? "left-navigation" : "left-navigation disabled-navigation"}  
                        onClick={()=>this.showPreviousPost()}>
                        <img src={icoLeft} alt="Previous" />
                    </div>
                    <div className={`thumbnail-images ${!(this.state.showNavigation && this.getThumbnailDivWidth()) ? 'center-image' : ''}`} ref={this.setThumbnailRef}>
                        <div className="thumbnail-wrapper">
                            {
                                this.props.posts ? this.props.posts.map(
                                    (post, index) => this.renderThumbnail(post, index)
                                ) : null
                            }
                        </div>
                    </div>
                    <div className={this.state.showNavigation && this.getThumbnailDivWidth() && this.isNextDisabled() ? "right-navigation" : "right-navigation disabled-navigation"}  onClick={()=>this.showNextPost()}>
                                <img src={icoRight} alt="Next" />
                    </div>
                </div>
                <span className="close-modal" onClick={() => this.props.closePopUp()}>x</span>
            </div>
        );
    }

}

export default MediaCarousel;
