import StudyService from "../../../services/studyService";
import OrganizationService from "../../../services/organizationService";
import LookLookUtils from "../../../utils/looklook-at";
import TagService from "../../../services/tagService";
import QuestionnaireService from "../../../services/questionnaireService";
import DownloadService from "../../../services/downloadservice";
import CookieService from "../../../services/cookieservice";
import LookLookAtUtils from "../../../utils/looklook-at";
import Utils from "../../../utils/utilityScript";

let _studies = [];
let _filteredStudies;
let _organizations = [];
let _strSearch = "";
let _selectedOrganizations = [];
let _selectedStudies = [];
let _selectedStudyTags = [];
let _searchResults;
let _searchLength = 0;
let _keywordCount = {};
let _studyKeywordCount = {};
let _studyTags = [];
let _allAvailableTags = [];
let _allAvailableTagIdNamePair = {};
let _studyTagMapping = {}
let _filteredStudyTags = [];
const seperator = "+";
let downloadData={studies:{}, users:[], comments:[]};

const _resetOrganizations = () => {
    return _organizations.map(i=>{
        i.selected=false;
        i.selectedStudies = [];
        i.orgName = undefined;
        return i;
    });;
}
const _resetStudies = () => {
    return _studies.map(i=>{
        i.selected=false;
        i.studyName = undefined;
        return i;
    }); 
}

const _resetStudyTags = () => {
    return _studyTags.map(i=>{
        i.selected=false;
        return i;
    }); 
}

const _setStudiesSelectedBelongsToOrganization = (id, boo) => {
    const arrIds = [];
    for(const study of _studies){
        if(study.client == id){
            // study.selected = boo;
            if(boo){
                arrIds.push(study._id);
            }
        }
    }
    return arrIds
}

const _toggleArrayId = (arr, id, selected) => {
    const index = arr.indexOf(id);
    if(selected && index == -1) {
        arr.push(id);
    } else if(!selected && index != -1) {
        arr.splice(index, 1);
    }
}

const _anyStudyTagInStudyIsSelected = (id, studyTags) =>{
    for(const tag of studyTags) {
        if(tag.study === id && tag.selected){
            return true;
        }
    }
    return false;
}

const _isAnySingleStudySelectedOfClient = (id, studies) => {
    for(const study of studies) {
        if(study.client === id && study.selected){
            return true;
        }
    }
    return false;
}

const _mapCommentsAndPosts = (comments, postIdsObj) => {
    const postsWithComments = [];
    const user = CookieService.instance.user;
    for (let comment of comments) {
        if (comment.post && postIdsObj[comment.post]) {
            if (postsWithComments.indexOf(postIdsObj[comment.post]) == -1) {
                postsWithComments.push(postIdsObj[comment.post]);
            }
            if (!postIdsObj[comment.post]["comments"]) {
                postIdsObj[comment.post]["comments"] = [];
            }
            comment.createdBy = LookLookAtUtils.getNameByUserType(user.userType, comment.createdBy);
            comment.name = comment.createdBy.name;
            comment.dateTime = `${LookLookUtils.formatDate(comment.createdAt)} ${LookLookUtils.formatDate(comment.createdAt, "hh:mm a")}` ; 
            postIdsObj[comment.post].keywordInPost = (postIdsObj[comment.post].keywordInPost || 0) + comment.keywordCount || 0
            postIdsObj[comment.post]["comments"].push(comment);
        }
    }
    postIdsObj = {};
    return postsWithComments;
}

const _getUniqueTagsArrayByName= (_allAvailableTags) => {
    const _studyTags = [];
    _studyTagMapping = {};
    const tagNames = [];
    for(let tag of _allAvailableTags){
        const index = tagNames.indexOf(tag.name);
        _allAvailableTagIdNamePair[tag._id] = tag.name;
        if(index==-1){
            tagNames.push(tag.name);
            tag.ids=[tag._id]
            _studyTagMapping[tag._id] = _studyTags.length;
            _studyTags.push(tag);
        } else {
            _studyTagMapping[tag._id] = index;
            _studyTags[index].ids.push(tag._id)
        }
    }
    return _studyTags;
}

const _getPostIdsObject = (posts) =>{
    const postIdsObj= {};
        for (let post of posts) {
            postIdsObj[post._id] = post;
            if(!downloadData.studies[post.study]){
                downloadData.studies[post.study] = {"name":"", "comments":{}};
            }
        }
    return postIdsObj;
}
const _getHighlightedString = (comment, text) =>{
    let tagText = text.text.trim();
    if(tagText.slice(-1) === "\\" ){
        tagText = tagText.slice(0, -1);
    }
    const txt = Utils.removeExtras(tagText);
    let commentText = Utils.removeExtras(comment.commentText || comment.text);
    let word_list = txt.split(" ");
    let dataRE = [];
    if(word_list.length >= 2){
        let firstWord = Utils.escapeRegExp(word_list[0]);
        let lastWord = Utils.escapeRegExp(word_list[word_list.length - 1]);
        let matchRegEx = "(.*?)";
        let defaultRegEx = "([^\\s\\w\\W]*?)";
        let firstRegEx = defaultRegEx;
        let secondRegEx = defaultRegEx;
        if(!Utils.checkSpecialChar(firstWord)){
            firstRegEx = "(\\b[^\\s\\w\\W]*?)";
            matchRegEx = "(\\b.*?)";
        }
        if(!Utils.checkSpecialChar(firstWord)){
            firstRegEx = "(\\b[^\\s\\w\\W]*?)";
            matchRegEx = "(.*?\\b)";
        }
        if(!Utils.checkSpecialChar(firstWord) && !Utils.checkSpecialChar(firstWord)){
            matchRegEx = "(\\b.*?\\b)";
        }
        let regExString = new RegExp(firstRegEx + firstWord + matchRegEx + lastWord + secondRegEx,"g");
        let m;
        while ((m = regExString.exec(commentText)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regExString.lastIndex) {
            regExString.lastIndex++;
            }
            m.forEach((match, groupIndex) => {
                var highlightStr = match.replace(/<\/?b[^>]*>/g,"");
                if(txt === highlightStr.replace(/\\/g,'')){
                    dataRE[0] = m[0];
                }
            });
        }
    }
    if(!dataRE || dataRE.length == 0){
        dataRE = [];
        dataRE[0] = txt;
    } else {
        dataRE.splice(1);
    }
    const selectionBold = `<b>${dataRE[0].replace(/\\/g,'')}</b>`;
    if(commentText.indexOf(selectionBold)===-1){
        let finalData = dataRE.join("|").trim();
        let escapeData = null;
        let regExpression = null;

        let txtContainsSpecialChar = Utils.checkSpecialChar(finalData); 
        if(finalData.split(" ").length <= 1 && txtContainsSpecialChar == true){
            escapeData = finalData.replace(/\\/g,'');
            regExpression = '(?:\\b[^\\s\\w\\W]*?)' + escapeData + '(?:[^\\s\\w\\W]*?\\b)';
        } else {
            escapeData = Utils.escapeRegExp(finalData.replace(/\\/g,''));
            regExpression = '(?:[^\\s\\w\\W]*?)' + escapeData + '(?:[^\\s\\w\\W]*?)';
        }
        let combine = new RegExp(regExpression, "g");
        let selectedStr = combine.exec(commentText);
        if(selectedStr && selectedStr[0] === finalData.replace(/\\/g,'')){
            commentText = commentText.replace(combine, selectionBold);
        }
    }
    return commentText;
}

const _getKeyworgRegEx = (text) => {
    let temp = text;
    const regExReservedKeywords = "\\$^*[]|.?/";
    for (let c = 0; c < regExReservedKeywords.length; ++ c) {
        if (temp.indexOf(regExReservedKeywords.charAt(c)) != -1) {
            const regx = new RegExp(`\\${regExReservedKeywords.charAt(c)}`);
            temp = temp.replace(regx, (match) => ("\\" + match))
        }
    }
    return temp
}
class SearchController {
	
    constructor() { 
    }
    async init() {
        const a = await this.getStudyList();
        const b = await this.getOrganizationList();
        const studyTags = await this.getPresetTagsList();
        const temp = this.filterData();
        this.text = "";
    }
    async getStudyList(){
        _studies = await StudyService.instance.getStudyList(); 
        _filteredStudies = _resetStudies();
    }
    
    async getOrganizationList(){
        _organizations = await OrganizationService.instance.getOrganizations(); 
        _organizations = _resetOrganizations();
        return _organizations;
    }

    async getTagsList() {
        // _allAvailableTags = await TagService.instance.getStudyTagsByUserType();
        // _studyTags = _getUniqueTagsArrayByName(_allAvailableTags);
        // _filteredStudyTags = _resetStudyTags();
    }
    async getPresetTagsList() {
        _allAvailableTags = await QuestionnaireService.instance.getPresetStudyTagsByUserType();
        _studyTags = _getUniqueTagsArrayByName(_allAvailableTags);
        _filteredStudyTags = _resetStudyTags();
    }
    validiateOrganization (orgStudies, studyIds) {
        for(let study of orgStudies) {
            if (studyIds.indexOf(study) != -1) {
                return true;
            }
        }
        return false;
    }
    async downloadSearch() {
        
        return await DownloadService.instance.createDownloadableSearchResultExcelFile(downloadData);
    }
    filterData () {
        const studyIds = _studies.map((item) => item._id);
        _organizations = _organizations.filter(item => this.validiateOrganization(item.studies, studyIds));
        if (_organizations && _organizations.length == 1) {
            this.toggleSelectedOrganizationById(_organizations[0]._id);
        }
    }

    toggleSelectedStudyTagById (id) {
        let tempStudyTag = this.studyTags.filter(i => i._id===id)[0];
        // const anyStudyTagInStudyIsSelected = _anyStudyTagInStudyIsSelected(tempStudyTag.study, this.studyTags);
        tempStudyTag.selected = !tempStudyTag.selected;
        for(let _id of tempStudyTag.ids){
            _toggleArrayId(_selectedStudyTags, _id, tempStudyTag.selected);
        }
        // let selection = tempStudyTag.selected
        // if (anyStudyTagInStudyIsSelected && !tempStudyTag.selected) {
        //     selection = !selection;
        // }
        // this.updateStudiesByStudyTags(tempStudyTag.study, selection);
        // this.updateOrganizationByStudyTag(tempStudyTag.selected);
    }

    updateStudiesByStudyTags(studyId, selection) {
        _toggleArrayId(_selectedStudies, studyId, selection);
        _filteredStudies = _filteredStudies.map(item => {
            if (item._id == studyId) {
                item.selected = selection;
            }
            return item;
        })
    }

    updateOrganizationByStudyTag (selection) {
        const clients = [];
        for (let study of this.studies) {
            if (_selectedStudies.indexOf(study._id) != -1  && clients.indexOf(study._id) == -1) {
                clients.push(study.client);
            }
        }
        for (let organization of this.organizations) {
            if (clients.indexOf(organization._id) != -1) {
                const isAny = _isAnySingleStudySelectedOfClient(organization._id, this.studies);
                let sel = selection;
                if (!selection && isAny) {
                    sel = !selection;
                }
                _toggleArrayId(_selectedOrganizations, organization._id, sel);
                organization.selected = sel;
            }
        }
    }

    toggleSelectedStudyById(id){
        let tempStudy = this.studies.filter(i=>i._id===id)[0];
        tempStudy.selected = !tempStudy.selected;
        // if (tempStudy.selected != undefined) {
            this.updateSelectedStudiesDataInOrganization(id, tempStudy.selected, tempStudy.client);
        // }
        this.updateTagsListBySelectedStudies();
        
    }

    updateTagsListBySelectedStudies(){
        if (_selectedStudies.length == 0) {
            _filteredStudyTags = _resetStudyTags();
            return;
        }
        _filteredStudyTags = [];
        const tempStudyTagIds = []
        for(let studyTag of _allAvailableTags){
            const booIsAvailable = _selectedStudies.indexOf(studyTag.study) != -1;
            if(booIsAvailable){
                // console.log(_selectedStudies, studyTag.study);
                const index = _studyTagMapping[studyTag._id];
                const tag = _studyTags[index];
                // console.log(tag);
                if(tempStudyTagIds.indexOf(tag._id) == -1){
                    tempStudyTagIds.push(tag._id);
                    _filteredStudyTags.push(tag);
                }
            }
        }
    }
    updateSelectedStudiesDataInOrganization (studyId, studySelected, orgId) {
        const tempOrg = this.organizations.filter(i=>i._id===orgId)[0];
        _toggleArrayId(_selectedStudies, studyId, studySelected);
        tempOrg.selected = _isAnySingleStudySelectedOfClient(orgId, this.studies);
        _toggleArrayId(_selectedOrganizations, orgId, tempOrg.selected);
        // 
        if(_selectedOrganizations.length == 0) {
            _filteredStudies = _resetStudies();
            return;
        }
        if(!studySelected && !tempOrg.selected) {
            _filteredStudies = this.getStudiesOfSelectedOrganizations();
        }
        
    }
    toggleSelectedOrganizationById(id){
        let org = this.organizations.filter(i=>i._id===id)[0];
        org.selected = !(_selectedOrganizations.indexOf(id) != -1);
        _toggleArrayId(_selectedOrganizations, id, org.selected);
        org.selectedStudies = _setStudiesSelectedBelongsToOrganization(id, org.selected);
        if(this.selectedOrganizations.length == 0) {
            _filteredStudies = _studies.map((item) => {
                item.selected = false;
                return item;
            });
            _filteredStudyTags = _resetStudyTags();
        } else {
            _filteredStudies = _studies.filter((item) => _selectedOrganizations.indexOf(item.client) != -1);
            const filteredStudyIds = _filteredStudies.map(item => item._id);
            const allTagsofSelectedOrganization = _allAvailableTags.filter(tag=>filteredStudyIds.indexOf(tag.study) != -1).map(tag => tag._id);
            // console.log(allTagsofSelectedOrganization.length);
            _filteredStudyTags = _studyTags.filter((item) => {
                for(let id of item.ids){
                    if(allTagsofSelectedOrganization.indexOf(id)!=-1){
                        return true;
                    }
                }
                return false;
            });
        }
    }

    
    getUpdatedFilteredStudies() {
        if(_selectedOrganizations.length == 0) {
            return _resetStudies();
        } 
        return this.getStudiesOfSelectedOrganizations();
    }
    removeFilteredItem(id, from) {
        if(from == "studies"){
            this.toggleSelectedStudyById(id);
        } else if(from == "studyTag") {
            this.toggleSelectedStudyTagById(id);
        } else {
            this.toggleSelectedOrganizationById(id);
        }
    }

	set text(val){
        _strSearch = val;
    }

    get text(){
        return _strSearch;
    }

    get arrText() {
        return this.text.split(seperator);
    }

    set arrText(newText) {
        this.text = newText.join(seperator);
    }

    get selectedStudyTags() {
        return _selectedStudyTags || [];
    }
    
    get filterText () {
        const filterText = [];
        const text = this.arrText;
        for ( let keyword in text) {
            let data = text[keyword];
            if(data.trim().length) {
                filterText.push({keywordText: data, count: _keywordCount[data.trim()]});
            }
        }
        return filterText;
    }

    get filteredStudyTags() {
        // const filterStudyTags = this.studyTags.filter(item => item.selected===true);
        const filterStudyTags = [];
        for (let tag of this.studyTags) {
            if (tag.selected) {
                filterStudyTags.push({name: tag.name, count:_studyKeywordCount[tag.name], _id: tag._id});
            }
        }
        return filterStudyTags || [];
    }

    get studies() {
        return _filteredStudies || [];
    }

    get allStudies() {
        return _studies || [];
    }

    set searchResults (results) {
        _searchResults = results;
    }

    get searchLength () {
        return _searchLength;
    }

    get searchResults() {
        return _searchResults;
    }

    get organizations() {
        return _organizations || [];
    }
    
    get selectedOrganizationsBySelectedStudy(){
        return this.organizations.filter(i=>_selectedOrganizations.indexOf(i._id)!=-1);
    }

    get selectedStudies(){
        return this.studies.filter(i=>i.selected);
    }

    get studyTags() {
        return _filteredStudyTags || [];
    }

    getStudiesOfSelectedOrganizations() {
        let arrStudyIds = this.selectedOrganizationsBySelectedStudy.map(i=>i.studies);
        arrStudyIds = arrStudyIds.reduce((a, b) => a.concat(b), []);
        // _studies = _studies.map(item => )
        return _studies; //.filter(i=>arrStudyIds.indexOf(i._id)!=-1)
    }

    resetSearchResult () {
        _searchResults = undefined;
    }

    clearData () {
        _filteredStudies = [];
        _organizations = [];
    }

    resetSearch() {
        _filteredStudies = _resetStudies();
        _organizations = _resetOrganizations();
        _filteredStudyTags = _resetStudyTags();
        _selectedStudies = [];
        _selectedOrganizations = [];
        _searchResults = undefined;
        _selectedStudyTags = [];
        _searchLength = 0;
        _keywordCount = {};
        _studyKeywordCount = {};
        downloadData={studies:{}, users:[], comments:[]};
        this.text = "";
    }

    get selectedOrganizations () {
        return _selectedOrganizations || []
    }

    updateData (data, filter) {
        const organizations = [];
        for (let d of data) {
            if(filter.indexOf(d._id) != -1) {
                d.selected = true;
                // d.orgName = d.name + " (0)";
                if(d.client) {
                    if (organizations.indexOf(d.client) == -1) {
                        organizations.push(d.client);
                    }
                    d.studyName = d.name + " (0)";
                } else {
                    d.orgName = d.name + " (0)";
                }
            }
        }
        return organizations;
    }

    updateTagsData(data, studies, tags) {
        // _selectedStudyTags = [...tags];
        for (let tag of _studyTags) {
            if (tags.indexOf(tag._id) != -1) {
                tag.selected = true;
                for(let _id of tag.ids){
                    _toggleArrayId(_selectedStudyTags, _id, true);
                }
            }
        }

        const allTagsofSelectedOrganization = _allAvailableTags.filter(tag=>studies.indexOf(tag.study) != -1).map(tag => tag._id);
        // console.log(allTagsofSelectedOrganization.length);
        _filteredStudyTags = _studyTags.filter((item) => {
            for(let id of item.ids){
                if(allTagsofSelectedOrganization.indexOf(id)!=-1){
                    return true;
                }
            }
            return false;
        });

        // _filteredStudyTags = _studyTags.filter((item) => studies.indexOf(item.study) != -1);
        // _selectedStudyTags = tags;
        return [];
    }

    setUpdatedSearch (searchData) {
        if(!searchData) return;
        if(searchData.searchText) {
            this.text = searchData.searchText.join(seperator);
        }
        if(searchData.studies) {
            const orgIds = this.updateData(_studies, searchData.studies);
            const orgs = this.updateData(_organizations, orgIds);
            _filteredStudies = _studies.filter(item => orgIds.indexOf(item.client) != -1);
            _selectedOrganizations = orgIds;
            _selectedStudies = [...searchData.studies];
            const temp = this.updateTagsData(_filteredStudyTags, searchData.studies, searchData.studyTags);
        }
    }

    
    _parseStudyAndClientNames (posts, participants) {
        let organizations = {};
        let studies = {}
        let participantData = {};
        for (let study of this.studies) {
            studies[study._id] = study;
        }
        for (let org of this.organizations) {
            organizations[org._id] = org;
        }
        for (let p of participants) {
            participantData[`${p.study}-${p.user._id}`] = p._id;
        }
        // const flag = this.organizations.length == 1;
        for(let post of posts) {
            const study = studies[post.study];
            const organization = organizations[study.client];
            if (organization) {
                post.studyName = study.name;
                downloadData.studies[post.study]["name"] = study.name;
                downloadData.studies[post.study]["clientName"] = organization.name;
                post.clientName = organization.name;
                post.client = study.client;

                organization.keywordInPost = ((organization.keywordInPost || 0) + post.keywordInPost) || 0;
                organization.orgName = organization.name + " (" + organization.keywordInPost + ")";

                study.keywordInPost = ((study.keywordInPost || 0) + post.keywordInPost) || 0;
                study.studyName = study.name + " (" + study.keywordInPost + ")";
                post.participant = participantData[`${post.study}-${post.user}`];
            }
            // console.log("study.keywordInPost", study.name,  study.keywordInPost);
            // console.log("organization.keywordInPost", organization.name, organization.keywordInPost)
            // study.selected = flag;
        }
        // console.log("final -organization.keywordInPost", organizations);
        // console.log("final - study.keywordInPost", studies);
        organizations = {};
        studies = {}
        return posts;
    }

    

    _sortByComments (comments, postIdsObj, keywords) {
        // _keywordCount = {};
        const _regExKeywords = {};
        for (let key of keywords) {
            _keywordCount[key] = 0;
            _regExKeywords[key] = _getKeyworgRegEx(key);
        }

        const singleKeyWords = []
        const multipleKeyWords = []
        for (let comment of comments) {
            comment.keyword = [];
            comment.keywordCount = 0;
            comment.commentText = comment.text;
            for(let t of keywords) {
                const pTag = t;
                t = _regExKeywords[t];
                const regx = new RegExp(`(^|\\s)${t}(\\s|[.,;:]|$)`, 'igm');
                const chk = (comment.text || '').match(regx);
                const n = ((comment.text || '').match(regx) || []).length;
                if (n > 0) {
                    comment.commentText = this._highlightTextInComment(comment.commentText, regx);
                    comment.keywordCount += n;
                    if(comment.keyword.indexOf(pTag) == -1) {
                        comment.keyword.push(pTag);
                        const post = postIdsObj[comment.post]
                        if(!downloadData.studies[post.study]["comments"][comment._id]){
                            downloadData.studies[post.study]["comments"][comment._id] = {"tag":[],"keyword":comment.keyword}
                        }
                        downloadData.studies[post.study]["comments"][comment._id]["keyword"] = comment.keyword;
                    }
                    _searchLength += n;
                    _keywordCount[pTag] = (_keywordCount[pTag] || 0) + n || 0;
                }
            }
            if(comment.keyword.length == 1){
                singleKeyWords.push(comment);
            } else {
                multipleKeyWords.push(comment);
            }
        }
        // console.log("_searchLength", _searchLength);
        const mKey =  multipleKeyWords.sort((a, b) => {
            var x = a.keyword.length; var y = b.keyword.length;
            return y-x;
        });
        const sKey =  singleKeyWords.sort((a, b) => {
            var x = keywords.indexOf(a.keyword[0]); var y = keywords.indexOf(b.keyword[0]);
            if(x < y) { return -1; }
            if(x > y) { return 1; }
            return 0;
        });
        return mKey.concat(sKey);
    }

    _highlightTextInComment (comment, regx) {
        return comment.replace(regx, (match, content, sign, offset) => {
            const whiteSpaceChar = ((match.charCodeAt(0) == 10) ? "\n" : (match.charAt(0) == " " ? " " : undefined));
            const front = whiteSpaceChar !=undefined ? match.charAt(0) == whiteSpaceChar : false;
            match = match.slice((front ? 1 : 0), (match.length - sign.length));
            const returnData = (front ? whiteSpaceChar : "") + `<b>${match}</b>` + sign;
            return returnData;
        });
    }

    async handleSearch (searchData) {
        // console.log(searchData.studyTags.length, searchData.studyTags);
        const startTimestamp = Date.now();
        const searchableText = [];
        for (let searchT of searchData.searchText) {
            searchableText.push(searchT.trim());
        }
        const response = await StudyService.instance.handleStudySearch(searchableText, searchData.studies, searchData.studyTags, _allAvailableTags);
        const totalTimeTaken = (Date.now() - startTimestamp) / 1000;
        console.log("Response", response, totalTimeTaken);
        _studyKeywordCount = {}
        _searchLength = 0
        // _selectedStudyTags = [];
        _selectedStudyTags = [...searchData.studyTags];
        downloadData={studies:{}, users:[], comments:[]};
        const postIdsObj = _getPostIdsObject(response.posts)
        const comments = this._mapTagCommentsWithComments(response.tagComments, response.participants, postIdsObj);
        const searchComments = this._sortByComments(response.comments, postIdsObj, searchableText);
        const finalcomments = comments.concat(searchComments);
        const tempPosts = _mapCommentsAndPosts(finalcomments, postIdsObj);
        const posts = this._parseStudyAndClientNames(tempPosts, response.participants);
        this.searchResults = posts.length ? posts : [];
        return posts;
    }

    _mapTagCommentsWithComments (tagComments, participants, postIdsObj) {
        const commentIds = [];
        const comments = [];
        let arrTaggedText = {};
        let tagNameById = {};
        let singleKeyWords = []
        let multipleKeyWords = []
        const keywords = [];
        
        // console.log("tagComments.length", tagComments.length);
        for(let tagId of _selectedStudyTags){
            const name = _allAvailableTagIdNamePair[tagId]
            if (!_studyKeywordCount[name]) {
                _studyKeywordCount[name] = 0;
            }
        }
        for (let tagComment of tagComments) {
            // _selectedStudyTags.push(tagComment._id);
            arrTaggedText[tagComment._id] = tagComment.texts.sort((a,b)=>b.text.length-a.text.length);
            tagNameById[tagComment._id] = tagComment.name;
        }
        let participantData = {};
        for (let p of participants) {
            participantData[p.user._id] = p.user;
        }
        let comment, index, post;
        for (let id of Object.keys(arrTaggedText)) {
            const textArr = arrTaggedText[id];
            const keyName = tagNameById[id];
            comment = null;
            for (let text of textArr) {
                post = postIdsObj[text.comment.post];
                let n = Utils.getCountOfApprearance(Utils.removeExtras(text.comment.text), Utils.removeExtras(text.text));

                if(post && n > 0){
                    const c_id = `${id}-${text.comment._id}-${post._id}`
                    index = commentIds.indexOf(c_id);
                    if(index == -1){
                        commentIds.push(c_id)
                        comments.push(text.comment)
                    }
                    index = commentIds.indexOf(c_id);
                    comment = comments[index];
                    comment.c_id = c_id;
                    const regx = new RegExp('<b>', 'g');
                    let oldCount = 0;
                    if(comment.commentText){
                        oldCount = comment.commentText.match(regx).length;
                    }
                    comment.commentText = _getHighlightedString(comment, text);
                    
                    const newCount = comment.commentText.match(regx).length - oldCount;
                    // const newCount = Utils.getCountOfApprearance(comment.commentText,"<b>");
                    if (!comment.keyword) {
                        comment.keyword = [];
                        comment.keywordCount = 0;
                    }
                    if(comment.keyword.indexOf(keyName) ==-1){
                        comment.keyword.push(keyName);
                    }
                    if(keywords.indexOf(keyName) ==-1){
                        keywords.push(keyName);
                    }
                    console.log(comment.commentText, n, newCount);
                    comment.keywordCount+=newCount;
                    _searchLength+=newCount;
                    comment["studyTag"] = true;
                    _studyKeywordCount[keyName]+=newCount;
                    if(!downloadData.studies[post.study]["comments"][comment._id]){
                        downloadData.studies[post.study]["comments"][comment._id] = {"tag":comment.keyword,"keyword":[]}
                    } else {
                        downloadData.studies[post.study]["comments"][comment._id]["tag"] =[...new Set( [...downloadData.studies[post.study]["comments"][comment._id]["tag"],...comment.keyword])]
                    }
                    comment.createdBy = participantData[comment.createdBy] || comment.createdBy;
                
                    if(comment.keywordCount == 1){
                        singleKeyWords.push(comment);
                    } else if(comment.keywordCount > 1){
                        singleKeyWords = singleKeyWords.filter(item=>{
                            return !(item.c_id === comment.c_id)
                        });

                        if(multipleKeyWords.filter(item=>item.c_id === comment.c_id).length===0){
                            multipleKeyWords.push(comment);
                            
                        }
                    }
                }
                
            }   
        }
        arrTaggedText = {};
        tagNameById = {};
        participantData = {};
        const mKey =  multipleKeyWords.sort((a, b) => {
            var x = a.keyword.length; var y = b.keyword.length;
            return y-x;
        });
        const sKey =  singleKeyWords.sort((a, b) => {
            var x = keywords.indexOf(a.keyword[0]); var y = keywords.indexOf(b.keyword[0]);
            if(x < y) { return -1; }
            if(x > y) { return 1; }
            return 0;
        });
        return mKey.concat(sKey);
        // return comments;
    }

    selectAllStudies (check) {
        for(let study of this.studies) {
            study.selected = check;
            _toggleArrayId(_selectedStudies, study._id, check)
        }
        this.updateTagsListBySelectedStudies();
    }

    selectAllStudyTags (check) {
        
        for (let tag of this.studyTags) {
            tag.selected = check;
            for(let _id of tag.ids){
                _toggleArrayId(_selectedStudyTags, _id, check);
            }
        }
    }

    updateStudyTagsBySearchText () {
        for(let tag of _studyTags){
            if(this.arrText.indexOf(tag.name) != -1){
                tag.selected = true;
                for(let _id of tag.ids){
                    _toggleArrayId(_selectedStudyTags, _id, true);
                }
            }
        }
    }

    getCmsParticipantRoute (userType, studyId, participantId) {
        // Ember to react migration handles all urls through below url itself
        return `/participant/${participantId}`;
        switch(userType) {
            case "Admin":
                return `/participants/${participantId}`;
            case "Moderator":
                return `/moderator/${studyId}/participants/${participantId}`;
            case "Client":
                return `/client/${studyId}/participants/${participantId}`;
            case "Client Administrator":
                return `/client/${studyId}/participants/${participantId}`;
        }
    }

    
}
export default SearchController;