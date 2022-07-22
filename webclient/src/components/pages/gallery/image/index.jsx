// @flow
import React, {Component} from "react";

import Loader from "../../../common/loader";
import PostCard from '../postcard';
import PostcardModal from '../postcardmodal';

import DummyImage from '../../../../assets/images/defaultImageThumb.jpg';
import ImageController from "./image";
import NoResultFound from '../../../common/noresultfound'; 
import CookieService from "../../../../services/cookieservice";
import './style.scss';
import UserType from "../../../../utils/constants";

let imageController

class Image extends Component<Props>{
    constructor(props: any) {
        super(props);
        this.state = {
            dataLoaded: false,
            refresh: false,
            showPostcardModal: false,
            postCardIndex: -1,
            mediaIndex: undefined
        }
        this.imageGalleryRef = React.createRef();
        this.skip = 0;
        this.limit = 10;
        this.lastRecordedPostLength = this.limit;
        this.bottomReached = false;
        this.postData = '';
        this.closePostcardModal = this.closePostcardModal.bind(this);
        this.showPreviousPost = this.showPreviousPost.bind(this);
        this.showNextPost = this.showNextPost.bind(this);
        this.updateDescription = this.updateDescription.bind(this);
        this.onEscPress = this.onEscPress.bind(this);
        this.toggleSelectedPost = this.toggleSelectedPost.bind(this);
        this.onVerbatimIconClick = this.onVerbatimIconClick.bind(this);
        this.onDeletePost = this.onDeletePost.bind(this);
        imageController = new ImageController();
    }

    async onVerbatimIconClick(post) {
        const tags = imageController.linkedPosts[post._id]
        this.props.toggleModalPopup();
        const request = {study: this.props.studyId, tagsData: tags, userId: post.user._id};
        const response = await imageController.getTagsDataInList(request);
        const body = await imageController.processParticipantData(response.participantsData, response.questionnaireData, response.tagsData);
        this.props.onSelectedPostTagsReceived(body); // getTagsDataInList
    }

    refreshUI() {
        this.setState({ refresh: !this.state.refresh });
    }
    onEscPress(){
        this.setState({ showPostcardModal: false});
	}

    // to get filter data we have set type to any, because filter api expect skip and limit null
    async getData(skip: any, limit: any) {
        this.bottomReached = true;
        this.setState({dataLoaded: false});
        let t;
        if (imageController) {
            t = await imageController.getImageData(this.props.filterData, this.props.studyId, this.props.isNewStudy, skip, limit);
            imageController.postsData = imageController.postsData.map((item)=> {
                item.selected = this.props.selectAllPosts;
                return item;
            });
            this.lastRecordedPostLength = imageController.postsData.length;

            if(imageController.postsData.length > 0) {
                this.bottomReached = false;
                let dataWithMedia;
                if(!this.props.isNewStudy) {
                    dataWithMedia = imageController.postsData.filter((item)=> item.imageUrl)
                }
                else {
                    dataWithMedia = imageController.postsData.filter((item)=> item.media && item.media.length>0)
                }
                imageController.allPosts = imageController.allPosts.concat(dataWithMedia);
            }
            this.props.onDataUpdated(imageController.filteredCounts, imageController.questionnairePostData, imageController.participantsData, imageController.groupsData, imageController.filteredParticipantData, imageController.filteredQuestionnaireData, imageController.liveTagsData, imageController.filteredLiveTagsData);

            /* const len = this.getPostDataLength(imageController.allPosts);
            if(!this.hasScroll() && this.lastRecordedPostLength > 0) {
                this.bottomReached = true; //stop scroll while loading more data
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
        const elem = document.querySelectorAll(".image-gallery")[0];
        const scrollHeight = elem.scrollHeight;
        const divHeight = elem.clientHeight;

        return scrollHeight > divHeight;
    }

    toggleSelectedPost(check, mediaId) {
        // imageController.checkSelectedPost(check, mediaId);
        imageController.allPosts = imageController.allPosts.map((item)=> {
            if(item.mediaId == mediaId) {
                item.selected = !item.selected;
            }
            return item;
        })
        // this.props.selectAllPostcards(imageController.postArray.length == this.getPostDataLength(imageController.allPosts));
    }

    async componentDidMount() {
        await imageController.getSidePanelData(this.props.studyId);
        await this.getData(this.skip, this.limit);
        imageController ? this.props.disableDownload(this.getPostDataLength(imageController.allPosts) == 0) : null;
    }

    componentWillUnmount()	{
		if(imageController){
			imageController = null;
		}
	}
    async updateDescription(post, content, prevContent, isMedia = false) {
        let t = {n: 0};
        if(content != prevContent) {
            const id = isMedia ? post.mediaId : post._id;
            t = await imageController.updatePostDescription(id,content, isMedia);
        } 
        if(t.n == 1) {
            post.description = content;
            this.refreshUI();
        }
    }

    getPostDataLength (postData) {
        let len = 0;
        for (let post of postData) {
            if(post.media != undefined) {
                len += post.media.length;
            } else {
                return postData.length;
            }
        }
        return len;
    }

    async componentDidUpdate(prevProps: any, prevState: any){
        if((prevProps.downloadImages != this.props.downloadImages) && this.props.downloadImages) {
            const response = await imageController.downloadPosts("image", this.props.studyId, imageController.allPosts, this.props.filterData, this.props.isNewStudy);
            if(response && response.filename) {
                window.location = process.env.API_HOST + response.filename;
            }
            this.props.onDownloadComplete();
        }
        
        if((prevProps.selectAllPosts != this.props.selectAllPosts)) {
            const check = this.props.selectAllPosts;
            const len = this.getPostDataLength(imageController.allPosts);
            /*if((len != imageController.postArray.length && check) || (len == imageController.postArray.length && !check)){
                imageController.allPosts = imageController.allPosts.map((item)=> {
                    item.selected = check;
                    return item;
                })*/
                this.props.selectAllPostcards(check);
                imageController.selectAllPosts(check, imageController.allPosts);
            //}
            this.refreshUI();
        }

        if (prevProps.filterData !== this.props.filterData) {
            window.scrollTo(0, 0);
            this.setState({
                dataLoaded: false
            }, async () => {
                    imageController.allPosts = [];
                    this.skip = 0;
                    await this.getData(this.skip, this.limit);
                    imageController ? this.props.disableDownload(this.getPostDataLength(imageController.allPosts) == 0) : null;
            })
            
        }
    }

    openPostcardModal(mediaIndex){
        if(mediaIndex > -1 && mediaIndex < imageController.allPosts.length) {
            let postMedia = imageController.allPosts[mediaIndex];
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

    renderPostCard(){
        return imageController.allPosts.map((item, index) => {
                // const mediaUrl = (item.media && item.media.length > 0) ? item.media[0].image :  ((item.imageUrl == undefined || item.imageUrl == "") ? DummyImage :item.imageUrl) // (item.imageUrl == undefined || item.imageUrl == "") ? DummyImage :item.imageUrl
                return (
                    <PostCard
                    key = {`post-${item._id}-${index}`}
                    id = {item._id}
                    mediaId = {item.mediaId}
                    mediaType={"image"}
                    imageObjectKey={item.imageObjectKey}
                    participantName={item.name}
                    dob={item.createdAt}
                    media={item.image}
                    tags = {item.tags}
                    altImgName={"Dummy Media"} 
                    description={item.description}
                    openPostcardModal={()=> this.openPostcardModal(index)}
                    updateDescription={(content)=> this.updateDescription(item, content, item.description, true)}
                    selectedPost={(check, id) => this.toggleSelectedPost(check, id)}
                    selected={item.selected}
                    verbatimTags={imageController.linkedPosts[item._id]}
                    onVerbatimIconClick={() => this.onVerbatimIconClick(item)}
                    />
                )
        })
    }

    showPreviousPost(id){
        const post = imageController.showPreviousPost(id, this.state.mediaIndex);
        if(post.post != -1) {
            this.openPostcardModal(post.post, post.mediaIndex)
        }
    }

    showNextPost(id){
        const post = imageController.showNextPost(id, this.state.mediaIndex);
        if(post.post != -1) {
            this.openPostcardModal(post.post, post.mediaIndex)
        }
    }

    async onDeletePost (post) {
        await imageController.deletePost(this.props.studyId, post, "image");
        this.setState({ showPostcardModal: false })
    }

    onScroll=async(element)=> {
        // console.log((element.target.scrollTop+element.target.clientHeight), (element.target.scrollHeight * 0.8), element.target.scrollHeight);
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
        return <div onScroll={this.onScroll} className="image-gallery" ref={this.props.setContentContainerRef}>
                <div>
                    {
                        imageController.allPosts.length > 0 ?
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
                            length={imageController.allPosts.length}
                            post={imageController.allPosts[this.state.postCardIndex]}
                            nameKey={"image"}
                            closePostcardModal={this.closePostcardModal}
                            data={this.postcardData}
                            showPreviousPost={this.showPreviousPost}
                            showNextPost={this.showNextPost}
                            mediaType="Image"
                            onEscPress={this.onEscPress}
                            showDelete={showDelete}
                            onDelete={() => this.onDeletePost(this.postcardData)}
                        />
                    :
                        null
                }
                {
                    !this.state.dataLoaded && <div className="loader-container-image-gallery">
                        <Loader className={"center"} />
                    </div>
                }
            </div>
    }
}

export default Image;