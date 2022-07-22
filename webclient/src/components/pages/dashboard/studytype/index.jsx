//@flow
import React, { Component } from 'react';
import { Link } from "react-router-dom";

// Components 
import StudyTypeOptions from './studytypeoptions';

// Images
import icoMore from '../../../../assets/images/iocMore.svg';

// Stylesheet
import "./style.scss";

type Props = {
	selected:string
}

class StudyType extends Component {
	constructor(props){
		super(props);
		this.state = { showMoreOptions: false, showOptions: true }
		this.toggleOptions = this.toggleOptions.bind(this);
		this.hideDropdown = this.hideDropdown.bind(this);
	}

	componentWillMount(){
		this.setState({ 
			showOptions: this.props.showOptions 
		});
	}

	toggleOptions(){
		this.setState({
			showMoreOptions: !this.state.showMoreOptions
		});
	}

	hideDropdown(){
		this.setState({ showMoreOptions: false });
	}

	render(){
		return(
			<div className="study-type">
				<h2>{this.props.selected === "unarchived" ? "Ongoing" : this.props.selected} Studies</h2>
				{
					this.state.showOptions ? 
						<StudyTypeOptions
							moreMenuIcon={icoMore}
							toggleOptions={this.toggleOptions}
							showMoreOptions={this.state.showMoreOptions}
							selectedValue={this.props.selected}
							hideDropdown={this.hideDropdown}
						/>
					: 
						null
				}
			</div>
		)
  }
}

export default StudyType;