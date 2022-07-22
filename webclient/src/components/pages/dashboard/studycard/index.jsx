import React, {Component} from "react";
// Components
import IconText from '../../../common/icontext/index';
import Taggroup from '../../../common/taggroup/index';
import StudyModel from '../../../../models/study';
import ThumbnailLoader from '../../../common/thumbnailloader';
import Utils from "../../../../utils/utilityScript";
import LookLookUtils from "../../../../utils/looklook-at";

// Images
import iocimage from '../../../../assets/images/iocImages.svg';
import iocvideo from '../../../../assets/images/iocVideo.svg';
import iocverbatim from '../../../../assets/images/iocVerbatim.svg';

import './style.scss';
import TransparentButton from "../../../common/transparentbutton";
import Loader from "../../../common/loader";

type Props = {
    study:StudyModel
}
class StudyCard extends Component {
    constructor(props){
        super(props);
        this.clickHandler = this.props.clickHandler.bind(this);
    }

    render() {
        const {id,name,createdAt,participants,brandImageUrl,images,videos,tags, imageObjectKey} = this.props.study;
        return(
            <div className="card_main_container">
                <div className="card_wrapper">
                    <div className="card-img-container">
                        <ThumbnailLoader media={brandImageUrl} imageObjectKey={imageObjectKey} mediaType="image" />
                    </div>
                    <div className="card_content_main">
                        <div>
                            <TransparentButton onClick={()=>this.clickHandler(id)}>
                                <h2 className="card_heading">{name}</h2>
                            </TransparentButton>
                        </div>
                    <div className="card_details">
                        <h5 className="card_date">Date: {LookLookUtils.formatDate(createdAt)}</h5>
                        <h5 className="card_participant">Participants - {Utils.twoDigit(participants)}</h5>
                    </div>
                    <div className="card_btn_row">
                        <TransparentButton onClick={()=>this.clickHandler(id,"image")}>
                            <IconText className="btn-p" image={iocimage} text={`Images - ${Utils.twoDigit(images)}`}/>
                        </TransparentButton>
                        <TransparentButton  onClick={()=>this.clickHandler(id,"video")}>
                            <IconText className="btn-p" image={iocvideo}  text={`Videos - ${Utils.twoDigit(videos)}`}/>
                        </TransparentButton>
                        <TransparentButton  onClick={()=>this.clickHandler(id,"verbatim")}>
                            <IconText className="btn-p" image={iocverbatim}  text={"Verbatims"}/>
                        </TransparentButton>
                    </div>
                    {
                        (tags) ?
                            <Taggroup tags={tags} name={name} id={id}/>
                         : 
                            <div className="sc-loader">
                                <Loader/>
                            </div>
                    }
                    <div>
                    </div>
                    </div>
                </div>
            </div>
    );
    }

}

export default StudyCard;