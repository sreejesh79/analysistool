//@flow
import React, {Component} from "react";

import ClassNames from "classnames";

import CookiesService from "../../../../src/services/cookieservice";

import HideButton from './hidebutton';

import './style.scss';

type Props= {
	hidden:boolean,
	onHideClick:Function
}

class Welcome extends Component<Props> {
	
	render() {
		const contentClass = ClassNames('lk_content',{
			hide:this.props.hidden
		});
		return(
			<div className="main_container">
				<div className="lk_message_main_container">
					<div className="lk_content_header">
						<div className="lk_message_header">
							<h2 className="w-heading">Welcome to the LookLook<sup>&#174;</sup> Analysis Tool!</h2>
						</div>
						{
							this.props.onHideClick ?
								<HideButton 
									onHideClick={this.props.onHideClick}
									hidden={this.props.hidden}
								 />
							: 
								null
						}
					</div>
					<div className={contentClass}>
						<p className="lk_content_size lk_msg_body_margin">On this platform, you can see the story of your LookLook<sup>&#174;</sup> data unfold.</p>
						<p className="lk_content_size lk_msg_body_margin">Moderators of your study have selected the key verbatims, images and video content that emerged from one-on-one interaction with the study participants.</p>
						<p className="lk_content_size lk_msg_body_margin">Here, you can interact with that data by filtering and viewing these curated responses in three ways:</p>
						<ol>
							<li><p className="lk_content_size lk_msg_body_margin">1) By participant</p></li>
							<li><p className="lk_content_size lk_msg_body_margin">2) By subgroup/segment</p></li>
							<li><p className="lk_content_size lk_msg_body_margin">3) By content theme (tag)</p></li>
						</ol>
						<p className="lk_content_size lk_msg_body_margin">Select the study you want to explore, then click on the blue filter button to make your selections.  You can save or share any view that you create.</p>
						{/* <p><a href="#" title="Click Here">Click here</a> for a quick video tour!</p> */}
					</div>
					
				</div>
			</div>
		);
	}
}

export default Welcome;