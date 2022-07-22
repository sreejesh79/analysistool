import React, { Component } from 'react';

import ThumbnailLoader from '../../../common/thumbnailloader';
import RemoveTag from '../../../common/removetag';
import iconRedirect from "../../../../assets/images/Redirect.svg";
import DefaultImage from "../../../../assets/images/defaultImageThumb.jpg";
import './style.scss';

class SearchCard extends Component {
    createMarkup(commentText) { return {__html: commentText}; };

    renderComments (comments) {
        return comments.map((comment, index) => 
            <div className="search-card-description" key={`comment-${index}`}>
                <div className="username-date-container">
                    <div><span className="username capitalize">{comment.name}</span><span className="date">{comment.dateTime}</span></div>
                    {/* <p>{comment.commentText}</p>                             */}
                    <p dangerouslySetInnerHTML={this.createMarkup(comment.commentText)}></p>
                </div>
                <div className="keyword-container">
                    {
                        comment.keyword.map((item, index) =><RemoveTag 
                            key={`commentTag-${index}`}
                            className={comment.studyTag ? "tag studyTag-tag" : "tag text-tag"}
                            index={`txt`}
                            tagName={item}
                            contentClass={comment.studyTag ? "studyTag-tag-content" : ""}
                        />)
                    }
                </div>
            </div>
        )
    }
    render(){
        return (
            <div className="search-card-container">
                <div className="search-card-image-container">
                    <div className="image-container-wrapper" onClick={() => this.props.openCarousel()}>
                        <ThumbnailLoader media={this.props.postImage} imageObjectKey={this.props.imageObjectKey} videoObjectKey={this.props.videoObjectKey}/>
                    </div>
                    <img src={iconRedirect} alt="ico-verbatim" className="view-portal-icon" onClick={this.props.backToCms}/>
                    
                </div>
                <div className="search-card-content">
                    <div className="stydy-organization-name">
                        <span>{this.props.organizationName}</span>
                        <span>:</span>
                        <span> {this.props.studyName}</span>
                    </div>
                    <div>
                        {
                            this.renderComments(this.props.comments)
                        }
                    </div>
                    <div className="keyword-container">
                        {/* <RemoveTag 
                            key={}
                            className={}
                            index={}
                            tagName={}
                            onClick={}
                        /> */}
                    </div>
                </div>
            </div>
        )
    }
}

export default SearchCard;