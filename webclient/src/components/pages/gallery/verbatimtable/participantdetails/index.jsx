import React, { Component } from 'react';
import ICOPost from '../../../../../assets/images/verb_attached_media.svg';

class ParticipantDetails extends Component {
     render(){
         if(typeof this.props.detail === "string"){
            return(
                <p>
                   {
                       this.props.detail
                   }
                </p>
               
            )
         }
         // console.log("data: ", this.props.detail);
         return(
             <div className={this.props.showScroll ? 'show-scroll' : null} onClick={() => this.props.handleClick()}>
                {
                    this.props.showPostsIcon && this.props.linkedPosts > 0 ? <div onClick={()=>this.props.onPostIconClick()} className="verb-text-post-icon"><img src={ICOPost} alt={"View Posts"}/><p className="verb-text-post-count">{ this.props.linkedPosts>1 ? (" +" + (this.props.linkedPosts - 1)) : ""}</p></div>: null
                }
                {
                    this.props.detail.map((item,index)=>(<p key={index}>{item}</p>))
                }
             </div>
            
         )
     }
}

export default ParticipantDetails;