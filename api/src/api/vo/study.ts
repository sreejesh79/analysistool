import Tag from "./tag";

class Study {
    _id: string;
    name: string;
    brandImageUrl: string;
    createdAt: string;
    participantsCount: number;
    imagesCount: number;
    videosCount: number;
    tags: Tag[] = new Array();
}

export default Study;