import React, {Component} from "react";
import ClassNames from "classnames";
import RemoveTag from '../../common/removetag';
import icoClose from './../../../assets/images/closetag.svg';
import './style.scss';
import Utils from "../../../utils/utilityScript";
class FilteredList extends Component {
   
    renderItem(name, css, type, item, index) {
        return (
            <RemoveTag 
                key={index}
                className={css}
                index={index}
                tagName={name}
                onClick={() => this.props.closeTag(type, item)}
            />
        )
    }
    renderParticipantNames(){
        return this.props.filterData.participants ? this.props.filterData.participants.
        map((item, index) => this.renderItem(item.name, 'participant-name', 'participants', item, index)) : null
    }

    renderTagNames(){
        return this.props.filterData.tags ? this.props.filterData.tags.map((item, index) =>
        this.renderItem(item.tag, 'tags-name', 'tags', item, index)) : null
    }

    renderLiveTagNames(){
        return this.props.filterData.liveTags ? this.props.filterData.liveTags.map((item, index) =>
        this.renderItem(item.name, 'tags-name', 'liveTag', item, index)) : null
    }

    renderGroupNames(){
        return this.props.filterData.groups ? this.props.filterData.groups.map((item, index) => this.renderItem(item.name, 'group-name', 'groups', item, index)) : null;
    }

    render() {
        const { participant, tags, group, liveTags } = this.props;
        const hideFilteredResult = participant === '00' && tags === '00' && group === '00' && liveTags === '00';

        const filteredResultClass = ClassNames('filtered-result', {
            'show': this.props.expandResult,
            'hide': this.props.collapseResult || hideFilteredResult
        })

        return(           
            <div className={filteredResultClass} ref={this.props.setFilteredListRef}>
                {this.renderParticipantNames()}
                {this.renderTagNames()}
                {this.renderGroupNames()}
                {this.renderLiveTagNames()}
            </div>
        );
    }
}

export default FilteredList;