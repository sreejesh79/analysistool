import React, { Component } from 'react';

import PlayIcon from '../../../assets/images/play_icon.svg';
import DefaultImage from "../../../assets/images/defaultImageThumb.jpg";

import './style.scss';
import DisplayImage from '../display-image';

class ThumbnailLoader extends Component{
    onImageLoad=()=> {}
    onHandleClick=()=>{}
    
    render(){
        return(
            <div className="thumbail-loader-conatiner">
                
                <DisplayImage style={"media-img"} url={this.props.media}
                        imageObjectKey={this.props.imageObjectKey}
                        imageLoaded={this.onImageLoad}
                        handleClick={this.onHandleClick}>
                </DisplayImage>
                {
                    this.props.mediaType && this.props.mediaType.toLowerCase() === 'video' ?
                        <img src={PlayIcon} alt="Play"  className="play" />
                    :
                        null
                }
            </div>
        )
    }
}

export default ThumbnailLoader;
