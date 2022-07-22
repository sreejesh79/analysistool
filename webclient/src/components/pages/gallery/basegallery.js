import ParticipantService from "../../../services/participantService";
import Utils from "../../../utils/utilityScript";
import GroupService from "../../../services/groupService";
import TagService from "../../../services/tagService";
import LookLookAtUtils from "../../../utils/looklook-at";
const participantService: ParticipantService = ParticipantService.instance;
const groupService: GroupService = GroupService.instance;
const tagService: TagService = TagService.instance;
class BaseGallery {
	participantData;
	questionnaireData;
	groupsData;
	liveTagsData;
	filteredCounts = {participants:"00",tags:"00",groups:"00",liveTags:"00"}
	filter;
	filteredParticipantData = [];
	filteredQuestionnaireData = [];
	filteredLiveTagsData = [];
	filteredGroups;
	constructor () {}
	
	async getParticipantsData(studyId, participantIds) {
		return await participantService.getStudyParticipants(studyId, participantIds);
	}
	
	async getGroupNames(studyId) {
		return await groupService.getStudyGroups(studyId);
	}

	async getFilteredArray(arr, filterData) {
		return await arr.filter(item => filterData.indexOf(item._id) !== -1);
	}

	async getStudyTags(studyId, liveTags) {
		const response = await tagService.getStudyTags(studyId, liveTags);
		return response;
	}
}
export default BaseGallery;