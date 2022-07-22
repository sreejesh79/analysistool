// @flow
import React, {Component} from "react";

import PostCard from '../postcard';
import PostcardModal from '../postcardmodal';

import VideoController from "./video";
import Loader from "../../../common/loader";
import DummyImage from '../../../../assets/images/defaultImageThumb.jpg';
import NoResultFound from '../../../common/noresultfound';
import WarningPopup from '../../../common/warningpopup';
import CookieService from "../../../../services/cookieservice";
import './style.scss';
import UserType from "../../../../utils/constants";
let videoController;
class Video extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataLoaded: false,
            showPostcardModal: false,
            refresh: false,
            postCardIndex: -1,
            isPostSelected: false,
            WarningPopup: false,
            mediaIndex: undefined
        }
        this.skip = 0;
        this.limit = 10;
        this.lastRecordedPostLength = this.limit;
        this.bottomReached = false;
        this.closePostcardModal = this.closePostcardModal.bind(this);
        this.showPreviousPost = this.showPreviousPost.bind(this);
        this.showNextPost = this.showNextPost.bind(this);
        this.updateDescription = this.updateDescription.bind(this);
        this.onEscPress = this.onEscPress.bind(this);
        this.toggleSelectedPost = this.toggleSelectedPost.bind(this);
        this.closeWarningPopup = this.closeWarningPopup.bind(this);
        this.onVerbatimIconClick = this.onVerbatimIconClick.bind(this);
        this.onDeletePost = this.onDeletePost.bind(this);
        videoController = new VideoController();
    }

    async onVerbatimIconClick(post) {
        const tags = videoController.linkedPosts[post._id]
        this.props.toggleModalPopup();
        const request = {study: this.props.studyId, tagsData: tags, userId: post.user._id};
        const response = await videoController.getTagsDataInList(request);
        const body = await videoController.processParticipantData(response.participantsData, response.questionnaireData, response.tagsData);
        this.props.onSelectedPostTagsReceived(body); // getTagsDataInList
    }
    onEscPress(){
		this.setState({ showPostcardModal: false});
    }

    toggleSelectedPost(check, mediaId) {
        // videoController.checkSelectedPost(check, mediaId || id);
        videoController.allPosts = videoController.allPosts.map((item)=> {
            if(item.mediaId == mediaId) {
                item.selected = !item.selected;
            }
            return item;
        })
        //this.props.selectAllPostcards(videoController.postArray.length == videoController.allPosts.length);
    }

    // to get filter data we have set type to any, because filter api expect skip and limit null
    async getData(skip: any, limit: any) {
        this.bottomReached = true;
        this.setState({dataLoaded: false});
        let t;
        if (videoController) {
            t = await videoController.getVideoData(this.props.filterData, this.props.studyId, this.props.isNewStudy, skip, limit)
            this.lastRecordedPostLength = videoController.postsData.length;
            // console.log(videoController.postsData);
            videoController.postsData = videoController.postsData.map((item)=> {
                item.selected = this.props.selectAllPosts;
                return item;
            });
            
            if(videoController.postsData.length > 0) {
                this.bottomReached = false;
                let dataWithMedia;
                if(!this.props.isNewStudy) {
                    dataWithMedia = videoController.postsData.filter((item)=> item.videoUrl)
                }
                else {
                    dataWithMedia = videoController.postsData.filter((item)=>  item.media && item.media.length>0)
                }
                videoController.allPosts = videoController.allPosts.concat(dataWithMedia);
            }
            this.props.onDataUpdated(videoController.filteredCounts, videoController.questionnairePostData, videoController.participantsData, videoController.groupsData, videoController.filteredParticipantData, videoController.filteredQuestionnaireData, videoController.liveTagsData, videoController.filteredLiveTagsData);

            /*if(!this.hasScroll() && this.lastRecordedPostLength > 0) {
                this.bottomReached = true;
                this.skip = this.limit + this.skip;
                this.setState({dataLoaded: false});
                this.getData(this.skip, this.limit);
                return;
            }*/
        }
        
        this.setState({dataLoaded: true});
        return t;
    }

    hasScroll() {
        const elem = document.querySelectorAll(".video-gallery")[0];
        const scrollHeight = elem.scrollHeight;
        const divHeight = elem.clientHeight;

        return scrollHeight > divHeight;
    }

    getVideosCount(postData) {
        let count = 0;
        postData.forEach(item => {
            if(item.media) {
                count += item.media.length;
            }
        });
        return count;
    }

    async componentDidMount() {
        await videoController.getSidePanelData(this.props.studyId);
        await this.getData(this.skip, this.limit);
        videoController ? this.props.disableDownload(videoController.allPosts.length == 0) : null;
    }
    componentWillUnmount()	{
		if(videoController){
			videoController = null;
		}
	}
    refreshUI() {
        this.setState({
            refresh: !this.state.refresh
        })
    }

    closeWarningPopup() {
        this.setState({
            WarningPopup: false
        })
    }

    async updateDescription(post, content, prevContent, isMedia = false) {
        let t = {n: 0};
        if(content != prevContent) {
            const id = isMedia ? post.mediaId : post._id;
            t = await videoController.updatePostDescription(id,content, isMedia);
        } 
        if(t.n == 1) {
            post.description = content;
            this.refreshUI();
        }
    }

    isVideoSelected() {
        const selectedVideos = videoController.allPosts.filter(item => item.selected);
        return selectedVideos.length > 0 ? true : false;
    }

    async componentDidUpdate(prevProps: any, prevState: any){
        if((prevProps.downloadVideos != this.props.downloadVideos) && this.props.downloadVideos) {
            if(videoController.allPosts && videoController.allPosts.length > 0 && this.isVideoSelected()) {
                const response = await videoController.downloadPosts("video", this.props.studyId, videoController.allPosts, videoController.filterData, this.props.isNewStudy);
                if(response && response.filename) {
                    window.location = process.env.API_HOST + response.filename;
                }
            } else {
                this.setState({
                    WarningPopup: true
                })
            }           
            this.props.onDownloadComplete();
        }
        if((prevProps.selectAllPosts != this.props.selectAllPosts)) {
            const check = this.props.selectAllPosts;
            /*if((videoController.allPosts.length != videoController.postArray.length && check) || (videoController.allPosts.length == videoController.postArray.length && !check)){
                videoController.allPosts = videoController.allPosts.map((item)=> {
                    item.selected = check;
                    return item;
                })*/
                // this.props.selectAllPostcards(check);
                // videoController.selectAllPosts(check);
            //}
            this.refreshUI();
        }
        if (prevProps.filterData !== this.props.filterData) {
            window.scrollTo(0, 0);
            this.setState({
                dataLoaded: false
            }, async () => {
                videoController.allPosts = [];
                this.skip = 0;
                await this.getData(this.skip, this.limit);
                videoController ? this.props.disableDownload(videoController.allPosts.length == 0) : null;
            });
            
        }
    }

    openPostcardModal(mediaIndex){
        if(mediaIndex > -1 && mediaIndex < videoController.allPosts.length) {
            let postMedia = videoController.allPosts[mediaIndex];
            this.postcardData = postMedia ;
            this.setState({ showPostcardModal: true, refresh: !this.state.refresh, postCardIndex: mediaIndex, mediaIndex })
        }
        else {
            this.setState({ showPostcardModal: false })
        }
    }

    closePostcardModal(e){
        if(e.target == e.currentTarget){
			this.setState({ showPostcardModal: false })
		}
    }

    showPreviousPost(id){
        const post = videoController.showPreviousPost(id, this.state.mediaIndex);
        if(post.post != -1) {
            this.openPostcardModal(post.post, post.mediaIndex)
        }
    }

    showNextPost(id){
        const post = videoController.showNextPost(id, this.state.mediaIndex);
        if(post.post != -1) {
            this.openPostcardModal(post.post, post.mediaIndex)
        }
    }

    async onDeletePost (post) {
        await videoController.deletePost(this.props.studyId, post, "video");
        this.setState({ showPostcardModal: false })
    }

    renderPostCard(){
        return videoController.allPosts.map((item, index) => {
                const mediaUrl = (item.image) ? item.image : (item.videoThumbnailUrl ? item.videoThumbnailUrl : DummyImage)
                return (
                    <PostCard
                        mediaType={"video"}
                        participantName={item.name}
                        dob={item.createdAt}
                        media={mediaUrl}
                        imageObjectKey={item.imageObjectKey}
                        videoObjectKey={item.videoObjectKey}
                        altImgName={item.name + " video"}
                        key={`${item._id}-${index}`}
                        id={item._id}
                        mediaId = {item.mediaId}
                        tags = {item.tags}
                        description={item.description}
                        openPostcardModal={()=> this.openPostcardModal(index)}
                        updateDescription={(content)=> this.updateDescription(item, content, item.description, true)}
                        selectedPost={(check, id) => this.toggleSelectedPost(check, id)}
                        selected={item.selected}
                        verbatimTags={videoController.linkedPosts[item._id]}
                        onVerbatimIconClick={() => this.onVerbatimIconClick(item)}
                    />
                )
        })
    }

    onScroll=async(element)=> {
        if ((element.target.scrollTop+element.target.clientHeight) >= (element.target.scrollHeight * 0.8)) {
            if(this.lastRecordedPostLength > 0 && !this.bottomReached) {
                this.bottomReached = true;
                this.skip = this.limit + this.skip;
                await this.getData(this.skip, this.limit);
            }
        }
    }    

    render() {
        const user = CookieService.instance.user;
        let showDelete = user.userType == UserType.ADMIN || user.userType == UserType.MODERATOR || user.userType == UserType.CLIENT_ADMINISTRATOR;
        return <div onScroll={this.onScroll} className="video-gallery" ref={this.props.setContentContainerRef}>
                <div> 
                    {
                        videoController.allPosts.length > 0 ?
                            this.renderPostCard()
                        : null
                            // <NoResultFound message="No data available"/>
                    }          
                </div>
                {
                    this.state.showPostcardModal ? 
                        <PostcardModal
                            currentPost = {this.state.postCardIndex}
                            currentMedia = {this.state.mediaIndex}
                            length={videoController.allPosts.length}
                            post={videoController.allPosts[this.state.postCardIndex]}
                            nameKey={"videoUrl"}
                            closePostcardModal={this.closePostcardModal}
                            data={this.postcardData}
                            showPreviousPost={this.showPreviousPost}
                            showNextPost={this.showNextPost}
                            mediaType="Video"
                            onEscPress={this.onEscPress}
                            showDelete={showDelete}
                            onDelete={() => this.onDeletePost(this.postcardData)}
                        />
                    :
                    null
                }
                {
                    this.state.WarningPopup ? 
                        <WarningPopup 
                            warningHeaderText="Unable to Download"
                            warningText="Please select at least one video to download" closePopup={()=>this.closeWarningPopup()}
                        /> 
                    : 
                        null
                }
                {
                    !this.state.dataLoaded && <div className="loader-container-video-gallery">
                        <Loader className={"center"} />
                    </div>
                }
            </div>
    }
}

export default Video;