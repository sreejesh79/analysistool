import SearchService from "../services/searchService";
import ApiRequest from "../../lib/apiRequest";
import ApiResponse from "../../lib/apiResponse";
import PostService from "../services/postService";
import ParticipantService from "../services/participantService";
import TagService from "../services/tagService";
import UserType from "../../common/constants";
import DateUtils from "../../util/dateUtils";
import QuestionnaireService from '../services/questionaireService';
import Extras from "../../util/exras";
import mongoose, { Types } from 'mongoose';

const _getCommentIds = (comments) => {
    const postIds = [];
    for (let comment of comments) {
        if (postIds.indexOf(comment.post) == -1) {
            postIds.push(comment.post);
        }
    }
    return postIds;
}
const searchService: SearchService = SearchService.instance;
class Search {

    public static async searchKeywords (req: ApiRequest, res: ApiResponse): Promise<any> {
        const responseEmpty = {participants:[], posts:[], comments:[], tagComments:[]}
        const body = req.body;
        const participants: any = await ParticipantService.instance.getAllParticipantsInStudyArr({study: Types.ObjectId(body.study)});
        if (participants.error) {
            return res.apiError(participants.message);
        }
        const userIds = [];
        const participantIds = [];
        let comments: any;
        for (let participant of participants) {
            if (participant && participant.user && participant.user.userType == "Prospect") {
                userIds.push(""+participant.user._id);
                participantIds.push(participant._id);
            }
        }
        if(participantIds.length === 0 ){
            return res.apiSuccess(responseEmpty);
        }
        let postIds = await PostService.instance.getPostsByStudyIds(body.study, userIds);
        if (postIds.error) {
            return res.apiError(postIds.message);
        }
        if(body.searchText.length>0){
            const regExObj = body.searchText.map(text => {
                let searchText = text;
                const regExReservedKeywords = "\\$^*[]|.?/";
                for (let t = 0; t < regExReservedKeywords.length; ++ t) {
                    if (searchText.indexOf(regExReservedKeywords.charAt(t)) != -1) {
                        const regx = new RegExp(`\\${regExReservedKeywords.charAt(t)}`);
                        searchText = searchText.replace(regx, (match) => ("\\" + match))
                    }
                }
                const pattern =  `(?<=^|\\s)${searchText}(?=\\s|[.,;:]|$)`;
                return new RegExp(pattern, "i")});
            comments = await searchService.searchTextInComments(regExObj, postIds, userIds);
            if (comments.error) {
                return res.apiError(comments.message);
            }
            postIds = _getCommentIds(comments);
        } else {
            comments = [];
            postIds = [];
        }
        let tagComments: any  = await Search._getTaggedPresetCommentsAndPostIds(body.tagIds, body.study, participantIds, userIds, postIds);
        if (tagComments.error) {
            return res.apiError(tagComments.message);
        }
        if(postIds.length === 0 ){
            return res.apiSuccess(responseEmpty);
        }
        const posts = await PostService.instance.getPostDataByIds(postIds, "imageObjectKey videoObjectKey videoThumbnailUrl imageUrl videoUrl study user media");
        return res.apiSuccess({participants, posts, comments, tagComments});
    }

    private static async _getTaggedPresetCommentsAndPostIds(tagIds:any, study: any, participantIds: any, userIds: any, postIds: any){
        let tagComments: any  = [];
        if(tagIds && tagIds.length>0) {
            let texts = [];
            console.time("QuestionnaireService.getSearchedPresetTagsData");
            tagComments= await QuestionnaireService.getSearchedPresetTagsData(tagIds, study, participantIds, userIds);
            console.timeEnd("QuestionnaireService.getSearchedPresetTagsData");
            if (tagComments.error) {
                return tagComments;
            }
            for (let tagComment of tagComments) {
                texts = texts.concat(tagComment.texts);
            }
            for (let text of texts) {
                if (text.comment.post && postIds.indexOf(""+text.comment.post) == -1) {
                    postIds.push(text.comment.post);
                }
            }
        }
        return tagComments;
    }

    private static async _getTaggedComments(tagIds:any,study, participantIds, userIds, postIds){
        let tagComments: any  = [];
        if(tagIds && tagIds.length>0) {
            let texts = [];
            tagComments= await TagService.instance.getSearchedTagsData(tagIds, study, participantIds, userIds);
            if (tagComments.error) {
                return tagComments;
            }
            for (let tagComment of tagComments) {
                texts = texts.concat(tagComment.texts);
            }
            for (let text of texts) {
                if (text.comment.post && postIds.indexOf(""+text.comment.post) == -1) {
                    postIds.push(text.comment.post);
                }
            }
        }
        return tagComments;
    }

    static async downloadSearchResults(req: ApiRequest, res: ApiResponse) {
        const user: any = req.socket.user;
        const body = req.body;
        const searchStudies = body.search.studies;
        const studies = Object.keys(body.search.studies);
        let commentIds = []
        let objStudies = {}
        for(const study of studies){
            searchStudies[study]["commentIds"] = Object.keys(searchStudies[study].comments);
            commentIds = commentIds.concat(searchStudies[study]["commentIds"])
            for(const cId of searchStudies[study]["commentIds"]){
                searchStudies[study].comments[cId].studyName = searchStudies[study]["name"]
                searchStudies[study].comments[cId].clientName = searchStudies[study]["clientName"]
            }
            objStudies = Object.assign({},objStudies,searchStudies[study].comments)
        }
        // const comments = await searchService.getCommentsByIds(commentIds);
        // if (comments.error) {
        //     return res.apiError(comments.message);
        // }

        // extract comments from comment model / locale comment model
        let comments: any = [];

        // get unique comment ids for which comments need to be extracted
        let uniqueCommentIds = commentIds.filter(Extras.onlyUnique);

        // fetch from comment model first
        comments = await searchService.getCommentsByIds(uniqueCommentIds);
        if (comments.error) {
            return res.apiError(comments.message);
        }

        // search from locale comment model for ids not found in comment model
        if (comments && !comments.error && comments.length != uniqueCommentIds.length) {

            let localeCommentIds = uniqueCommentIds.filter(id => !comments.find(cmt => cmt._id.toString() === id));
            let localeComments = await searchService.getLocaleCommentsByIds(localeCommentIds, true);

            if (localeComments.error) {
                return res.apiError(localeComments.message);
            }

            if (localeComments && !localeComments.error && localeComments.length > 0) {
                for (var lc of localeComments) {
                    if (lc.comment) {
                        lc['createdBy'] = lc.comment.createdBy;
                        lc['post'] = lc.comment.post;
                        delete lc.comment;
                        comments = comments.concat(lc);
                    }
                }
            }
        }
        let xlsxData = []
        for(let com of comments){
            const commentId = com._id+""
            const study = objStudies[commentId];
            com.dateTime = `${DateUtils.formatDate(com.createdAt)} ${DateUtils.formatDate(com.createdAt, "hh:mm a")}` ; 
            com.name = (com.createdBy.firstName ? com.createdBy.firstName.trim() : "") + " " + (com.createdBy.lastName ? (user.userType == UserType.ADMIN?com.createdBy.lastName.trim(): com.createdBy.lastName.trim().charAt(0)) : "");

            if(com.name && com.name.trim() !== "") {
                com.name = Extras.titleCase(com.name); 
            }

            if(study){
                xlsxData.push([study.studyName,com.name ,com.text, com.dateTime, study["keyword"].join(", "), study["tag"].join(", ")]);
            } else {
                xlsxData.push([study.studyName,com.name ,com.text, com.dateTime, [], []])

            }
        }
        // xlsxData.sort((a, b) => {
        //     var nameA=a[0].toLowerCase(), nameB=b[0].toLowerCase();
        //     if (nameA < nameB) //sort string ascending
        //         return -1;
        //     if (nameA > nameB)
        //         return 1;
        //     return 0;
        // })
        xlsxData.unshift(["Study Name","Participant Name","Comment","Date & Time","Keyword(s) Match", "Preset Tag(s) Included"])
        const filename = await searchService.export(xlsxData);
        return res.apiSuccess({"filename": "/file/" + filename});
        // return res.apiSuccess({xlsxData, body});
    }
}
export default Search;
