import tagCommentModel from "../models/tag_comment";
import CommentModel from "../models/comment";
import PostService from "./postService";
import TagModel from "../models/tag";
import PostModel from "../models/post";
import LocaleCommentModel from "../models/localecomment";
import Extras from "../../util/exras";
class TagService {
    private static _singleton: boolean = true;
    private static _instance: TagService;
    constructor() {
        if (TagService._singleton) {
            throw new SyntaxError("This is a singleton class. Please use TagService.instance instead!");
        }
    }
    public static get instance(): TagService {
        if (!this._instance) {
            this._singleton = false;
            this._instance = new TagService();
            this._singleton = true;
        }
        return this._instance;
    }

    private static doNotUse() {
        // Do not use this function
        // This function is just to import LocaleCommentModel within the module so as to avoid below error:
        // Schema not registered for model
        CommentModel.find().lean().exec();
        LocaleCommentModel.find().lean().exec();
    }

    public async getTagData(query: any): Promise<any> {
        let tagsData = [];
        try {
            tagsData = await TagModel.find(query)
            .populate({path:"texts", model: "TagComment", populate:{ path:"entity", populate: {path: "comment", model: "Comment", select: "post"}}})
            .populate({path: "posts", model: "Post", match: {isDeleted: false}, select: "_id"})
            .lean()
            .exec();
            tagsData = this.parseTagData(tagsData);
        } catch (e) {
            return {error: true, message: "Invalid Study Id"};
        }
        return tagsData;
    }

    private parseTagData(tagsData: any, filterPosts: boolean = true) {
        tagsData = tagsData.map(tag => {
            tag.texts = tag.texts.filter(tagComment => {
                if(tagComment.entity) {
                    tagComment.comment = tagComment.entity;
                    if(tagComment.onModel === "Comment") {
                        delete tagComment.entity;
                        return true;
                    }
                    else if(tagComment.onModel === "LocaleComment" && tagComment.entity.comment) {
                        tagComment.comment["post"] = tagComment.entity.comment.post;
                        delete tagComment.entity;
                        // do not use below line as it cause circular reference issue
                        // rather implement alternative for below to avoid extra data in response
                        // delete tagComment.comment.comment;
                        return true;
                    }
                }
                return false;
            });
            if (filterPosts) {
                tag.posts = tag.posts.map(post => post._id.toString()).filter(Extras.onlyUnique);
            }
            return tag;
        });

        return tagsData;
    }

    public async getTagsDataInArray(tagIds: any) {
        let tagsData = await TagModel.find({ _id : {$in: tagIds}})
        .sort("name")
        .populate({path:"texts", model: "TagComment", populate:{ path:"entity", populate: {path: "comment", model: "Comment", select: "post"}}})
        .lean().exec();
        tagsData = this.parseTagData(tagsData, false);
        return tagsData;
    }

    public async getTagList (query): Promise<any> {
        let tags: any = [];
        try {
            tags = TagModel.find(query)
            .lean().exec();
        } catch (e) {
            return {
                error: true,
                message: e.message
            }
        }
        return tags;
    }

    private async _getTagsCommentDataByUsers(query: any, populationObj: any, userIds: any) {
        const data = await tagCommentModel.find(query).populate(populationObj).lean().exec();
        return data.filter(i => (i.comment && userIds.indexOf("" +i.comment.createdBy) != -1));
    }

    public async getSearchedTagsData (tagIds: any, study: any, participantIds: any, userIds: any): Promise<any> {
        let tags: any = [];
        try {
            tags = await TagModel.find({_id: {$in: tagIds}, study: study})
            .populate({path: "posts", model: PostModel})
            .lean()
            .exec();
            for (let tag of tags) {
                const text = await this._getTagsCommentDataByUsers({ _id : {$in: tag.texts}, participant: {$in: participantIds}}, "comment", userIds);
                // console.log("text", text);
                tag.texts = text;
            }
        } catch (e) {
            return {
                error: true,
                message: e.message
            }
        }
        return tags;
    }
}
export default TagService;