import BaseGallery from "./basegallery";
import MediaService from "../../../services/mediaService";
import Utils from "../../../utils/utilityScript";
import DownloadService from "../../../services/downloadservice";
import VerbatimService from "../../../services/verbatimservice";
import moment from "moment";

const mediaService = MediaService.instance;
class MediaController extends BaseGallery {
    questionnairePostData = [];
    groupsData = [];
    participantsData = [];
    postsData = [];
    allPosts = [];
    linkedPosts = {};
    constructor() {
        super();
    }

    async getTagsDataInList(request: any) {
        // getVerbatimDataByIds
        const data = VerbatimService.instance.getVerbatimDataByIds(request);
        return data;
    }

    processParticipantData(participant, questionnaireData, tagsData){
        let header = [["Tag"],["Task"]];
        let body = [];
        participant.name = participant.user.firstName + ' ' + (participant.user.lastName ? participant.user.lastName : '');
        let data = "";
        participant.name = participant.user.firstName + ' ' + (participant.user.lastName ? participant.user.lastName : '');
        if(participant.user.birthdate){
            data = [participant.name + " - " + moment().diff(moment(participant.user.birthdate), 'years') , participant.user.city];
        } else {
            data = [participant.name , participant.user.city];
        }
        header.push(data);
        body = questionnaireData.length > 0 ? questionnaireData.map(data=>this._parseVerbatimData(participant._id, data, "tag")) : [];
        const liveTagsBody = tagsData.length > 0 ? tagsData.map(data=>this._parseVerbatimData(participant._id, data, "name")) : [];
        if (liveTagsBody.length > 0) {
            if(body.length > 0) {
                body.push(["", "", ""]);
            }
            for(let d of liveTagsBody) {
                body.push(d);
            }
        }
        return {header, body};
        
    }
    
    _parseVerbatimData(participantId, tagsData, nameKey){
        const row = [tagsData[nameKey],tagsData.task || ""];
        const pText = [];
        for(let j=0; j<tagsData.texts.length; j++){
            const tagText = tagsData.texts[j];
            if(participantId+"" === tagText.participant+""){
                pText.push(tagText.text);
            }
        }
        row.push(pText);
        return row;
    }

    selectAllPosts (check, posts) {
        for (let post of posts) {
            post.selected = check;
        }
    }

    async updatePostDescription(postId: string, description: string, isMedia: boolean){
        return mediaService.updatePostDescription(postId,description,isMedia)
    }

    isFilterApplied(filterData) {
        let filteredViewCount = 0;
        if(filterData) {
            filteredViewCount = ((filterData.participants && filterData.participants.length) 
            || (filterData.liveTags && filterData.liveTags.length) 
            || (filterData.tags && filterData.tags.length) 
            || (filterData.groups && filterData.groups.length));
        }
        return filteredViewCount > 0 ? true : false;
    }
    isTagsFilterApplied(filterData) {
        let filteredViewCount = 0;
        if(filterData) {
            filteredViewCount = ((filterData.liveTags && filterData.liveTags.length) 
            || (filterData.tags && filterData.tags.length));
        }
        return filteredViewCount > 0 ? true : false;
    }


    async downloadPosts(type, studyId, postsData, filterData, isNewStudy) {
        let mediaIds = [];
        for (let post of postsData) {
            if(post.selected) {
                mediaIds.push(post.mediaId);
            }
        }

        mediaIds = mediaIds.filter((item)=>item !== undefined)
        if(mediaIds.length<1 && this.isFilterApplied(filterData)) {
            const filterObj = await this.getFilteredPostIdsAndUserIdsObject(filterData, studyId);
            const response = await mediaService.getStudyMedia(studyId, type, isNewStudy, null, null,filterObj);
            mediaIds = response.map(post => post.mediaId);
            mediaIds = mediaIds.filter((item, i, ar) => ar.indexOf(item) === i);
        }
        return await DownloadService.instance.downlaodPosts(type, mediaIds, studyId);
    }
    
    async _processPostsDatabyTags(filter, postsData) {
        const filteredPosts = [];
        const insert = [];
        for(let f of filter) {
            for(let p of postsData) {
                if(p.tagsId.indexOf(f) != -1 && insert.indexOf(p._id) == -1) {
                    insert.push(p._id);
                    filteredPosts.push(p);
                }
            }
        }
        return filteredPosts;
    }
    async _processPostsDatabyParticipants(filter) {
        let users = []
        for (let p of this.filteredParticipantData) {
            if(filter.indexOf(p._id) != -1) {
                users.push(p.user._id);
            }

        }
        const pData = await this.postsData.filter(item => users.indexOf(item.user._id) != -1);
        return pData;
    }
    async _mapTagsToPost(questionnaires, posts) {
        for(let p of posts) {
            p.tags = [];
            p.tagsId = [];
            p.availableTags = [];
            for(let q of questionnaires){
                const index = q.posts.indexOf(p._id);
                if(index != -1) {
                    p.tags.push({id: q._id, tag: q.tag});
                    p.tagsId.push(q._id);
                    q.posts[index] = p._id;
                } else {
                    p.availableTags.push({id: q._id, tag: q.tag});
                }
            }
        }
        return posts;
    }
    async _mapLiveTagsToPost(liveTagsData, posts) {
        for(let p of posts) {
            const temp = [];
            for(let t of liveTagsData) {
                if(t.posts.indexOf(p._id) != -1 && temp.indexOf(t._id) == -1) {
                    p.tagsId.push(t._id);
                    p.tags.push({id: t._id, tag:t.name, type: 'live'});
                } else if(t.posts.indexOf(p._id) == -1 && temp.indexOf(t._id) == -1) {
                    p.availableTags.push({id: t._id, tag: t.name, type: 'live'});
                }
                temp.push(t._id);
            }
        }
        return posts;
    }

    _getlinkedTags(tagsData, flag) {
        const tempReturn = {};
        for(let tag of tagsData) {
            const postIds = flag ? tag.posts.map(item => item._id) : tag.posts;
            if(postIds.length != 0) {
                for(let text of tag.texts) {
                    const post = text.comment.post;
                    if(post && postIds.indexOf(post) != -1) {
                        if(tempReturn[post]) {
                            if(tempReturn[post].indexOf(tag._id) == -1) {
                                tempReturn[post].push(tag._id);
                            }
                        } else {
                            tempReturn[post] = [tag._id];
                        }
                    }
                }
            }
            
        }
        return tempReturn;
    }

    async getSidePanelData(studyId) {
        // TODO: this data should pass from gallery

        // getParticipantsData data get from participantModel
        this.participantsData = await this.getParticipantsData(studyId); //baseGallery method

        // getStudyTags data get from tagModel
        this.liveTagsData = await this.getStudyTags(studyId, null);
        this.liveTagsData = this.liveTagsData.map(i=>{
            i["tagType"] = "liveTag";
            i["nameKey"] = "name";
            return i;
        })
        // getQuestionnairePostData data get from questionaireModel
        this.questionnairePostData = await mediaService.getQuestionnairePostData(studyId, null);
        this.questionnairePostData = this.questionnairePostData.map(i=>{
            i["tagType"] = "tag";
            i["nameKey"] = "tag";
            return i;
        })

        // getGroupNames data get from groupModel
        this.groupsData = await this.getGroupNames(studyId); //baseGallery method
    }

    createFilteredObject(participants, tags) {
        const filtered={};
        if(participants && participants.length) {
            filtered["users"]= participants.filter((item, i, ar) => ar.indexOf(item) === i);
        }
        if(tags && tags.length) {
            filtered["posts"] = tags.filter((item, i, ar) => ar.indexOf(item) === i);
        }
        return filtered
    }

    async getFilteredPostIdsAndUserIdsObject(filterData, studyId) {
        let _particiapntsIds = [];
        let _postIds = [];
        let response;
        if(filterData && filterData.participants && filterData.participants.length) {
            response = await this.getParticipantsData(studyId, filterData.participants);
            _particiapntsIds = response.map(item=>item.user._id);
        }
        if(filterData && filterData.liveTags && filterData.liveTags.length) {
            response = await this.getStudyTags(studyId, filterData.liveTags);
            for(let item of response) {
                if(item.posts && item.posts.length>0){
                    _postIds = _postIds.concat(item.posts);
                }
            }
        }
        if(filterData && filterData.tags && filterData.tags.length) {
            response = await mediaService.getQuestionnairePostData(studyId, filterData.tags);
            for(let item of response) {
                if(item.posts && item.posts.length>0){
                    _postIds = _postIds.concat(item.posts);
                }
            }
        }
        return this.createFilteredObject(_particiapntsIds, _postIds);
    }

    async getPostData(filterData = undefined, studyId: string, mediaType: string, isNewStudy: boolean, skip, limit) {
        const newFilteredObject = await this.getFilteredPostIdsAndUserIdsObject(filterData, studyId);
        if((this.isFilterApplied(filterData) && Object.keys(newFilteredObject).length === 0)
        || this.isTagsFilterApplied(filterData) && !newFilteredObject["posts"]) {
            this.postsData = [];
        }
        else {
            this.postsData = await mediaService.getStudyMedia(studyId, mediaType, isNewStudy, skip, limit,newFilteredObject);
        }
        const task = this._getlinkedTags(this.questionnairePostData, false);
        const tags = this._getlinkedTags(this.liveTagsData);

        if(this.postsData && this.postsData.length) {
            for(let p of this.postsData) {
                const data = {};
                if(task[p._id]) {
                    data["task"] = task[p._id];
                }
                if(tags[p._id]) {
                    data["tag"] = tags[p._id];
                }
                if(data.task || data.tag) {
                    this.linkedPosts[p._id] = data;
                }
            }
            this.postsData = await this._mapTagsToPost(this.questionnairePostData, this.postsData);
            this.postsData = await this._mapLiveTagsToPost(this.liveTagsData, this.postsData);
        }

        this.filteredParticipantData = [];
		this.filteredQuestionnaireData = [];
        this.filteredGroups = [];
        this.filteredLiveTagsData = [];
        this.filteredCounts = {participants:"00",tags:"00",groups:"00",liveTags:"00"}
        if(filterData && ((filterData.participants && filterData.participants.length>0) || (filterData.tags && filterData.tags.length>0) || (filterData.liveTags && filterData.liveTags.length>0))) {
            this.filteredQuestionnaireData = await this.getFilteredArray(this.questionnairePostData, filterData.tags);
            this.filteredParticipantData = await this.getFilteredArray(this.participantsData, filterData.participants);
            this.filteredLiveTagsData = (this.liveTagsData, filterData.liveTags);
			for(let p of this.filteredParticipantData){
				if(p.group && p.group.name && this.filteredGroups.indexOf(p.group.name) === -1) {
					this.filteredGroups.push(p.group.name)
				}
              }
            let finalPostIds = []
            const pPostData = filterData.participants.length > 0 ? await this._processPostsDatabyParticipants(filterData.participants) : this.postsData;
            finalPostIds = pPostData.map(item => item._id);
            let qPostdata = [];
            if(filterData.tags.length > 0) {
                qPostdata = await this._processPostsDatabyTags(filterData.tags, this.postsData);
            }
            let postsData = [];
            if(filterData.liveTags.length > 0) {
                postsData = await this._processPostsDatabyTags(filterData.liveTags, this.postsData);
            }
            const postIds = qPostdata.map(item=>item._id);
            for(let p of postsData) {
                if(postIds.indexOf(p._id) == -1) {
                    qPostdata.push(p);
                }
            }
            const taggedPostParticiantIds = [];
            for (let p of qPostdata) {
                if (finalPostIds.indexOf(p._id) != -1) {
                    taggedPostParticiantIds.push(p._id);
                }
            }
            //const tagsApplied = (filterData.tags && filterData.tags.length > 0) || (filterData.liveTags && filterData.liveTags.length > 0)
            //this.postsData = tagsApplied ? this.postsData.filter(item => taggedPostParticiantIds.indexOf(item._id) != -1) : this.postsData.filter(item => finalPostIds.indexOf(item._id) != -1);
            this.filteredCounts = {
				participants: Utils.twoDigit(filterData.participants.length),
				tags: Utils.twoDigit(filterData.tags.length + this.filteredLiveTagsData.length),
				groups: Utils.twoDigit(this.filteredGroups.length),
                liveTags:Utils.twoDigit(this.filteredLiveTagsData.length)
            }
        }
        return this.postsData;
    }

    showNextPost(id, mediaIndex){
        const len = this.allPosts.length;
        if(mediaIndex<len) {
            return { post: mediaIndex+1, mediaIndex: mediaIndex + 1 }
        }
        return { post:-1 };
    }

    showPreviousPost(id, mediaIndex){
        const len = this.allPosts.length;
        if(mediaIndex>0) {
            return { post: mediaIndex-1, mediaIndex: mediaIndex - 1 }
        }
        return { post:-1 };
    }

    async deletePost (study, post, mediaType) {
        const isMedia = (mediaType.toLowerCase() === "video" || mediaType.toLowerCase() === "image") ? true : false;
        const id = (isMedia && post.mediaId) ? post.mediaId : post._id;
        const response = await MediaService.instance.deleteMedia(study, id, mediaType);
        if (response._error) {
            return;
        }
        if (post.mediaId) {
            this.allPosts = this.allPosts.filter((item)=> item.mediaId !== post.mediaId);
           
        } else {
            this.allPosts = this.allPosts.filter((item)=> item._id+"" != post._id+"");
        }
    }
}
export default MediaController;