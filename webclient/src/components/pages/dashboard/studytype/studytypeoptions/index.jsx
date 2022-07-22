import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class StudyTypeOptions extends Component{
    render(){
        return (
            <div className="show-options">
                <img src={this.props.moreMenuIcon} alt="Show Options" onClick={this.props.toggleOptions} />
                {
                    this.props.showMoreOptions ?
                        <ul>
                            { 
                                this.props.selectedValue !== "unarchived" ?
                                    <li>
                                        <Link to="/dashboard/unarchived" onClick={this.props.hideDropdown}>Ongoing</Link>
                                    </li>
                                : null
                            }
                            {
                                this.props.selectedValue !== "archived"  ?
                                    <li>									
                                        <Link to="/dashboard/archived" onClick={this.props.hideDropdown}>Archived</Link>
                                    </li>
                                :
                                    null
                            }
                            {
                                this.props.selectedValue !== "hidden" ?
                                    <li>
                                        <Link to="/dashboard/hidden" onClick={this.props.hideDropdown}>Hidden</Link>
                                    </li>
                                : 
                                    null
                            }
                        </ul>					
                    :
                        null
                }
            </div>
        )
    }
}

export default StudyTypeOptions;