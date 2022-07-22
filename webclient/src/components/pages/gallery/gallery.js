import Utils from "../../../utils/utilityScript";
import LookLookAtUtils from "../../../utils/looklook-at";
class GalleryController {
	defaultType = "verbatim";
    filteredCounts = {participants:"00",tags:"00",groups:"00",liveTags:"00"};
	filterData = {tags: [], participants: [], groups: [], liveTags: []};
	questionnaireData = [];
	participantData = [];
	groupsData = [];
	liveTagsData = []
	filteredParticipantData = [];
	filteredQuestionnaireData = [];
	filteredLiveTagsData = [];
    filterListData = {tags: [], participants: [], groups: [], liveTags: []};
	selectedPosts = [];
	selectedPostTagsData = undefined;
    constructor() {    
    }

    refreshData(filteredCounts, questionnaireData, participantData, groupsData, filteredParticipantData, filteredQuestionnaireData, liveTagsData, filteredLiveTagsData) {
		this.filteredCounts = filteredCounts;
		this.questionnaireData = questionnaireData;
		this.participantData = participantData;
		this.groupsData = groupsData;
		this.liveTagsData = liveTagsData;
		this.filteredParticipantData = filteredParticipantData;
		this.filteredQuestionnaireData = filteredQuestionnaireData;
		this.filteredLiveTagsData = filteredLiveTagsData;
		if(this.filterData && (this.filterData.tags.length || this.filterData.participants.length || this.filterData.liveTags.length)) { //|| this.filterData.groups.length
			this.filterListData = Object.assign({}, this._getFilteredNames(this.filterData, this.questionnaireData, this.participantData, this.liveTagsData));
			if(this.filterListData && this.filterListData.groups) {
				this.filterListData.groups.sort((a, b) => a.groupName < b.groupName ? -1 : a.groupName > b.groupName ? 1 : 0);
			}
		}
    }

    _getFilteredNames(filterData, questionnaireData, participantData, liveTagsData) {
		if(filterData && filterData.tags && filterData.participants && filterData.liveTags) {
			const _participants = filterData.participants.slice(0).map((i) =>participantData.filter(it=>it._id === i)[0]);
			return {
				tags:filterData.tags.slice(0).map((i) => questionnaireData.filter(it=>it._id === i)[0]),
				liveTags:filterData.liveTags.slice(0).map((i)=> liveTagsData.filter(it=> it._id === i)[0]),
				participants:_participants,
				groups:this._getFilteredGroups(_participants)
			}
		}
		return null;
    }
    
    _getFilteredGroups(participantData) {
        let groupData = [];
        let elem;
        let groups = [];
        for(elem of participantData) {
            if(elem.group) {
                const index = groups.indexOf(elem.group._id);
                if(index===-1){
                    groups.push(elem.group._id);
                    groupData.push({_id: elem.group._id, count: 1, groupName: elem.group.name, 'name': elem.group.name + " (" + Utils.twoDigit(1) + ")"});
                } else {
                    groupData[index].name = elem.group.name + " (" + Utils.twoDigit(++groupData[index].count) + ")"
                }
            }
        }
        return groupData;
    }
    
    async getFilterableData(type, item){
        const filterable = {};
		filterable.tags = LookLookAtUtils.getArrayOfIds(this.filterListData.tags, item._id);
		filterable.groups = LookLookAtUtils.getArrayOfIds(this.filterListData.groups, item._id);
		filterable.participants = LookLookAtUtils.getArrayOfIds(this.filterListData.participants, item._id);
		filterable.liveTags = LookLookAtUtils.getArrayOfIds(this.filterListData.liveTags, item._id);
		if(type == "groups") {
			filterable.participants = this._removeGroupParticipants(item._id);
        }
        return await [filterable];
    }


	
    
    _removeGroupParticipants(group){ 
		const temp = [];
		let t;
		for (t of this.filterListData.participants) {
			if(t.group && t.group._id !== group) {
				temp.push(t._id);
			}
		}
		return temp;
	}
    
    resetFilter(){
        this.filterListData = {tags: [], participants: [], groups: [], liveTags: []};
		this.filteredParticipantData = [];
		this.filteredQuestionnaireData = [];
		this.filteredLiveTagsData = [];
		this.filteredCounts = {participants:"00",tags:"00",groups:"00",liveTags:"00"};
	}

	resetAll() {
		this.defaultType = "verbatim";
		this.filteredCounts = {participants:"00",tags:"00",groups:"00",liveTags:"00"};
		this.filterData = {tags: [], participants: [], groups: [], liveTags: []};
		this.questionnaireData = [];
		this.liveTagsData = [];
		this.participantData = [];
		this.groupsData = [];
		this.filteredParticipantData = [];
		this.filteredQuestionnaireData = [];
		this.filteredLiveTagsData = [];
		this.filterListData = {tags: [], participants: [], groups: [], liveTags: []};
	}
	
	_isFilterable(filter) {
		const tags = this.filterListData.tags.map(item => item._id);
		const participants = this.filterListData.participants.map(item => item._id);
		const liveTags = this.filterListData.liveTags.map(item=>item._id);
		if(tags.length == filter.tags.length && participants.length == filter.participants.length && liveTags.length == filter.liveTags.length ) {
			const c = this._checkEquality(tags, filter.tags) || this._checkEquality(participants, filter.participants) || this._checkEquality(liveTags, filter.liveTags)
			return c;
		}
		return true;
	}
	_checkEquality(filterable, filter) {
		for(let d of filterable) {
			if(filter.indexOf(d) == -1) {
				return true;
			}
		}
		return false;
	}

	canFilter(filter, search) {
		const isFilterable = this._isFilterable(filter);
		if (!isFilterable || (search && (search.length === 0 && filter.tags.length === 0 && filter.participants.length === 0 && filter.liveTags.length === 0 ) )) {
			return null;
		}
		return !(isFilterable && search && search.length > 0 && filter.tags.length === 0 && filter.participants.length === 0 && filter.liveTags.length === 0);
	}
	
}
export default GalleryController;