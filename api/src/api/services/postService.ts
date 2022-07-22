import PostModel from "../models/post";
import MediaModel from "../models/media";
import CommentModel from "../models/comment";
import TranscribeModel from "../models/transcribe";
import Extras from "../../util/exras"
class PostService {
    private static _singleton: boolean = true;
    private static _instance: PostService;

    constructor() {
        if (PostService._singleton) {
            throw new SyntaxError("This is a singleton class. Please use PostService.instance instead!");
        }
    }

    public static get instance(): PostService{
        if (!this._instance) {
            this._singleton = false;
            this._instance = new PostService();
            this._singleton = true;
        }
        return this._instance;
    }
    
    public async getDistinctPostsArray(postIds: any) {
        return await PostModel.find({isDeleted: false, _id: {$in: postIds}}).distinct("_id").lean().exec();
    }

    public async getPostsArray(postIds: any, type: string) {
        return await PostModel.find({_id: {$in: postIds}, isDeleted: false}).select(type).lean().exec();
    }

    public async getMediaArray(mediaIds: any, type: string) {
        return await MediaModel.find({_id: {$in: mediaIds}}).select(type).lean().exec();
    }

    public async getPostDataByIds(posts, selection): Promise<any> {
        let postData = [];
        try {
            postData = await PostModel.find({_id: {$in: posts}, isDeleted: false})
                        .select(selection)
                        .populate("media", "image video imageObjectKey videoObjectKey")
                        .lean().exec();
        } catch (e) {
            return {error: true, message: "Invalid Post Id(s)"};
        }
        return postData;
    }

    public async getPostsByStudyIds (studyId: any, userIds: any): Promise<any> {
        let posts: any = [];
        try {
            posts = await PostModel.find({isDeleted: false, study: studyId, user: {$in: userIds}}).distinct("_id").lean().exec();
        } catch (e) {
            return {error: true, message: "Invalid Study Id(s)"};
        }
        return posts;
    }
    
    private async deletePost (model:any, query: any, deleteSingle: boolean): Promise<any> {
        let response: any;
        try {
            if (deleteSingle) {
                response = await model.findOneAndRemove(query).lean().exec();
            } else {
                response = await model.deleteMany(query).lean().exec();
            }
        } catch (e) {
            return {error: true, message: e.message};
        }
        return {
            error: false,
            body: response
        };
    }

    private async deleteTranscribeCommentsByVideo(videoUrl) {
        let response: any;
        try {
            const commentIds = await TranscribeModel.find({ videoUrl}).distinct("comment").lean().exec();
            response = await CommentModel.deleteMany({_id: {$in: commentIds}}).lean().exec();
        } catch (e) {
            return {error: true, message: e.message};
        }
        return {
            error: false,
            body: response
        };
    }

    public async delete (query: any, type: string, mediaType, deleteSingle: boolean =  true): Promise<any> {
        const model = type == "media" ? MediaModel : PostModel;
        const response = await this.deletePost(model, query, deleteSingle);
        if(!response.error && type == "media" && mediaType == "video") {
            const video = (response.body.videoObjectKey ? response.body.videoObjectKey.substr(response.body.videoObjectKey.lastIndexOf("/") + 1).split(".")[0] : "") || (response.body.video.substr(response.body.video.lastIndexOf("/") + 1).split(".")[0]);
            await this.deleteTranscribeCommentsByVideo(video);
        }
        return response;
    }

    public async getDistinctPostsByStudyId(studyId: any) {
        console.time("get_posts_ids");
        const posts = await PostModel.find({isDeleted: false, study: studyId}).distinct("_id").lean().exec();
        console.timeEnd("get_posts_ids");
        return posts;
    }

    public async getDistinctMediaArray(postIds: any, type: string) {
        console.time("get_distinct_media");
        let urls = [];
        let mediaObjectKeys = [];
        const mediaQuery = {
            $and: [
                {post: {$in: [...new Set(postIds)]}},
                (type === "image")
                ? { $or: [
                    {
                        $and: [
                            { imageObjectKey: {$nin: ["", undefined]} },
                            { videoObjectKey: {$in: ["", undefined]} }
                        ]
                    },
                    {image: { $ne: "" }, video: {$in: ["", undefined]}}
                ] }
                : { $or: [
                    {
                        $and: [
                            { imageObjectKey: {$in: ["", undefined]} },
                            { videoObjectKey: {$nin: ["", undefined]} }
                        ]
                    },
                    {video: { $ne: "" }}
                ] }
            ]
        };

        // const medias = await MediaModel.find(mediaQuery).distinct(type).lean().exec();
        // Based on previous query above, array of distinct type (image/video) column value is returned
        // As we have image/video value in two columns (image, imageObjectKey / video,videoObjectKey) now, we need to select both columns, filter any one of them and then get list of unique values as done below
        const mediaObjs = await MediaModel.find(mediaQuery).select(type == "image" ? "image imageObjectKey" : "video videoObjectKey").lean().exec();
        const medias = mediaObjs.map(item => (type == "image") ? (item["imageObjectKey"] || item["image"]) : (item["videoObjectKey"] || item["video"])).filter(Extras.onlyUnique);

        return medias;
    }
    public async getDistinctPostsMediaArray(postIds: any, type: string) {
        const postQuery = {_id: {$in: [...new Set(postIds)]}, isDeleted: false}
        if (type == "imageUrl") {
            postQuery["videoUrl"] = undefined;
        } else {
            postQuery["videoUrl"] = { $ne: undefined };
        }
        return await PostModel.find(postQuery).distinct(type).lean().exec();
    }
}
export default PostService;