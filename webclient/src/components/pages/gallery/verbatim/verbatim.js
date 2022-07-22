import BaseGallery from "../basegallery"
import moment from "moment";
import VerbatimService from "../../../../services/verbatimservice";
import MediaService from "../../../../services/mediaService";
import DownloadService from "../../../../services/downloadservice";
import Utils from "../../../../utils/utilityScript";
class Verbatim extends BaseGallery {
    body=[];
    checkedRows = [];
    checkedLiveTagRow = []
    constructor () {
        super();
    }
    processParticipantData(){
        // let header = [["Tag"],["Task"]];
        let header = [["Tag"]];
        const participantIds = [];
        let participant: any;
        const pList = this.filteredParticipantData.length>0?this.filteredParticipantData:this.participantData
        for(participant of pList) {
                participantIds.push(participant._id+"");
                const groupName = (participant.group && participant.group.name) ? participant.group.name : "";
                let data = "";
                if(participant.user.birthdate){
                    data = [participant.name + " - " + moment().diff(moment(participant.user.birthdate), 'years') , groupName, participant.user.city];
                } else {
                    data = [participant.name , groupName, participant.user.city];
                }
                header.push(data);
        };
        this.body = (this.filteredQuestionnaireData.length>0?this.filteredQuestionnaireData: this.filteredLiveTagsData.length > 0 ? this.filteredQuestionnaireData: this.questionnaireData).map(data=>this._parseVerbatimData(participantIds, data, data.tagType == "tag" ? "tag" : "name"));
        if((this.liveTagsData && this.liveTagsData.length > 0) || (this.filteredLiveTagsData && this.filteredLiveTagsData.length > 0)) {
            const liveTagsVerbitam = (this.filteredLiveTagsData.length > 0?this.filteredLiveTagsData: this.filteredQuestionnaireData.length>0 ? this.filteredLiveTagsData : this.liveTagsData).map(data => this._parseVerbatimData(participantIds, data, "name"))
            if(liveTagsVerbitam.length > 0) {
                // if(this.body.length > 0) {
                //     this.body.push(["", ""]);
                // }
                for(let d of liveTagsVerbitam) {
                    this.body.push(d);
                }
            }
        }
        return header;
        
    }

    _parseVerbatimData(participantIds, tagsData, nameKey){
            // const row = [tagsData[nameKey],tagsData.task || ""];
            const row = [tagsData[nameKey]];
            for(let i =0; i< participantIds.length; i++){
                const pText = [];
                const linkedPosts = [];
                for(let j=0; j<tagsData.texts.length; j++){
                    const tagText = tagsData.texts[j];
                    if(participantIds[i]+"" === tagText.participant+""){
                        pText.push(tagText.text);
                        if(tagText.comment.post && tagsData.posts.indexOf(tagText.comment.post) != -1 && linkedPosts.indexOf(tagText.comment.post) === -1) {
                            linkedPosts.push(tagText.comment.post);
                        }
                    }
                }
                row.push({texts: pText, linkedPosts});
                // row.push(pText);
            }
        return row;
    }
    
	async getFilteredData(filterData = undefined, studyId: string) {
        this.filter = filterData;
        this.participantData = await this.getParticipantsData(studyId);
		this.groupsData = await this.getGroupNames(studyId);
        this.questionnaireData = await VerbatimService.instance.getStudyQuestionnaireVerbatim(studyId);
        this.questionnaireData = this.questionnaireData.map(i=>{
            i["tagType"] = "tag";
            i["nameKey"] = "tag";
            return i;
        })
        // this.liveTagsData = [];
        // this.liveTagsData = await this.getStudyTags(studyId);
        this.liveTagsData = await this.getStudyTags(studyId);
        this.liveTagsData = this.liveTagsData.map(i=>{
            i["tagType"] = "liveTag";
            i["nameKey"] = "name";
            return i;
        })
        // this.questionnaireData = this.questionnaireData.concat(this.liveTagsData);
        // console.log("this.questionnaireData", this.questionnaireData);
        const parsedData = await this._parseFilteredData();
        this.checkedRows = [];
        this.checkedLiveTagRow = [];
        if(!parsedData) {
            this.filteredParticipantData = []; // this._participantData.slice(0)
            this.filteredQuestionnaireData = []; // this._questionnaireData.slice(0)
            this.filteredLiveTagsData = [];
            this.filteredGroups = [];
            this.filteredCounts = {participants:"00",tags:"00",groups:"00",liveTags:"00"}
        }
		return this.filteredParticipantData;
    }
    async _parseFilteredData() {
        if(this.filter && ((this.filter.participants && this.filter.participants.length>0) || (this.filter.tags && this.filter.tags.length>0)  || (this.filter.liveTags && this.filter.liveTags.length>0))) {
			this.filteredParticipantData = await this.getFilteredArray(this.participantData,this.filter.participants);
            this.filteredQuestionnaireData = await this.getFilteredArray(this.questionnaireData,this.filter.tags);
            this.filteredLiveTagsData = await this.getFilteredArray(this.liveTagsData, this.filter.liveTags);
            this.filteredGroups = [];
			for(let p of this.filteredParticipantData){
				if(p.group && p.group.name && this.filteredGroups.indexOf(p.group.name) === -1) {
					this.filteredGroups.push(p.group.name)
				}
			  }
			this.filteredCounts = {
				participants: Utils.twoDigit(this.filter.participants.length),
				tags: Utils.twoDigit(this.filter.tags.length + this.filteredLiveTagsData.length),
                groups: Utils.twoDigit(this.filteredGroups.length),
                liveTags:Utils.twoDigit(this.filteredLiveTagsData.length)
			}
			return this.filteredParticipantData;
        }
        return null;
    }
    async downloadVerbatim() {
        const request = {participantIds: [], tagIds: [], liveTagIds: []};
        request.participantIds = ((this.filteredParticipantData.length > 0) ? this.filteredParticipantData : this.participantData)
                                .map(item=>item._id);
        if(this.checkedRows.length > 0) {
            request.tagIds = this.checkedRows;
        } else if(this.checkedLiveTagRow.length == 0) {
            request.tagIds = ((this.filteredQuestionnaireData.length > 0) ? this.filteredQuestionnaireData : this.filteredLiveTagsData.length > 0 ? this.filteredQuestionnaireData : this.questionnaireData)
                                .map(item=>item._id);
        }
        if(this.checkedLiveTagRow.length > 0) {
            request.liveTagIds = this.checkedLiveTagRow;
        } else if(this.checkedRows.length == 0) {
            request.liveTagIds = ((this.filteredLiveTagsData.length > 0) ? this.filteredLiveTagsData : this.filteredQuestionnaireData.length > 0 ? this.filteredLiveTagsData : this.liveTagsData)
                                .map(item=>item._id);
        }
        return await DownloadService.instance.createDownloadableExcelFile(request);
    }

    async getPostDataByIds(posts) {
        const data = await MediaService.instance.getPostDataByIds(posts);
        // pre-processing
        let processedData = [];
        let t: any;
        for(t of data) {
            let url = "";
            let type = "";
            if(t.media){
                for (let media of t.media) {
                    if((media["videoObjectKey"] && media["videoObjectKey"] !== "") || (media.video && media.video !== "")) {
                        media["mediaType"] = "video";
                        media["videoThumbnailUrl"] = media.image
                        media["mediaUrl"] = media.video;
                    } else {
                        media["mediaType"] = "image";
                        media["mediaUrl"] = media.image;
                    }
                    processedData.push(media);
                }

            } else if(t.videoUrl && t.videoUrl != "") {
                t["type"] = "video";
                t["mediaUrl"] = t.videoUrl;
                processedData.push(t);
            } else {
                t["type"] = "image";
                t["mediaUrl"] = t.imageUrl;
                processedData.push(t);
            }
            // t["mediaType"] = type;
            // t["mediaUrl"] = url;
        }
        return processedData;
    }
}
export default Verbatim;