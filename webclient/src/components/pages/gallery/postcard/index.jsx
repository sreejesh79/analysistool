import React, { Component } from 'react';

import TextEditor from './texteditor';
import TransparentButton from '../../../common/transparentbutton';
import IconText from '../../../common/icontext';
import ReadOnlyTag from '../../../common/readonlytag';

import icoPlay from '../../../../assets/images/icoPlay.svg';
import icoVerbatim from '../../../../assets/images/book-with-bookmark.svg';
// import icoPlay from '../../../../assets/images/icoPlay.svg';

import './style.scss';
import DisplayImage from '../../../common/display-image';

class PostCard extends Component{
    limit: number = 2;
    constructor(props){
        super(props);
        this.state = {
            loading: true,
            checked: false,
            moreTags: false,
            postCardChecked: false,
            refresh: false
        }
        
        this.toggleTag = this.toggleTag.bind(this);
        this.togglePostcardCheck = this.togglePostcardCheck.bind(this);
    }

    async componentDidMount(){
        if(this.props.tags.length > this.limit){
            this.setState({postCardChecked:this.props.selected, moreTags: true })
        }
    }
    
    componentDidUpdate(prevProps) {
        if(prevProps.selected !== this.props.selected) {
            this.setState({postCardChecked:this.props.selected});
        }
        if(prevProps.description !== this.props.description) {
            this.setState({refresh: !this.state.refresh});
        }
    }


    toggleTag(check, item){
        // console.log("checked: ", check, item, this.props.id);
        let checked = !this.state.checked;
        this.setState({ checked: checked })
    }

    togglePostcardCheck(id){
        this.props.selectedPost(!this.state.postCardChecked, id);
        this.setState({ postCardChecked: !this.state.postCardChecked })
    }
    onImageLoad=()=> {
        this.setState({loading:false, error: false});
    }

    renderTags(){
        const tags = [];
        const len = Math.min(this.limit, this.props.tags.length);
        let className = 'tag-groups';
        if(len===1){
            className = 'tag-groups single-tag';
        }
        for(let i = 0; i < len; ++i){
            tags.push(
                <TransparentButton className={className} key={i} onClick={this.props.openPostcardModal}>
                    <ReadOnlyTag content={this.props.tags[i].tag} />
                </TransparentButton>
            );
        }
        return tags;
    }

    render(){
        return(
            <div className="post-card-container">
                <div className="participant-details">
                    <span className="participant-name capitalize">{this.props.participantName}</span>
                    <span className="date">{this.props.dob}</span>
                </div>
                <div className="media-type">
                    <DisplayImage style={"media-img"} url={this.props.media}
                        imageObjectKey={this.props.imageObjectKey}
                        imageLoaded={this.onImageLoad}
                        checkUpdate={true}
                        handleClick={this.props.openPostcardModal}>
                    </DisplayImage>
                    {
                        this.props.verbatimTags ?
                        <img src={icoVerbatim} alt="ico-verbatim" className="verb-icon" onClick={()=>this.props.onVerbatimIconClick()} /> : null
                    }
                    <span onClick={() => this.togglePostcardCheck(this.props.mediaId)} className={`check-box ${this.state.postCardChecked? 'checked' : ''}`}></span>
                    {
                        !this.state.loading && this.props.mediaType === 'video' ?
                            <img src={icoPlay} alt="Play" onClick={this.props.openPostcardModal} className="play-icon" />
                        :null
                    }
                </div>
                <div className="postcard-tags-container">
                    <div className="postcard-tags">
                        {this.renderTags()}
                    </div>
                    {
                        this.state.moreTags  ? 
                            <div className="more-tags-btn">
                                <TransparentButton onClick={this.props.openPostcardModal}>
                                    <IconText text={ '+' + (this.props.tags.length - this.limit)}/>
                                </TransparentButton>
                            </div>
                        :
                            null
                    }
                </div>
                <TextEditor
                    content={this.props.description}
                    updateDescription={(content)=> this.props.updateDescription(content)}
                    />
            </div>
        )
    }
}

export default PostCard;