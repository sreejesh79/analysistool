// @flow
import React, {Component} from "react";
import RemoveTag from '../../../common/removetag';

import "./style.scss";
class SelectedFilteredItems extends Component {
    constructor ( props) {
        super(props);
        this.state = {
          refresh:false
        }
        this.removeItemFromSearch = this.removeItemFromSearch.bind(this);
      }

    removeItemFromSearch(item, index){
        const {filterText} = this.props;
        filterText.splice(index, 1);
        const data = filterText.map(item => item.keywordText);
        this.props.updateSearchString(data)
    }

    renderSearchText(){
        const {filterText} = this.props;
        if(filterText.length == 0) {return null}
        return filterText.map((i, index)=>((i.keywordText && i.keywordText.length) ? <RemoveTag 
        key={`txt-${index}`}
        className={"tag text-tag"}
        index={`txt`}
        tagName={(i.keywordText + (i.count != undefined ? (" (" + i.count + ")") : ""))}
        onClick={() => this.removeItemFromSearch(i,index)}
    /> : null))
    }

    renderOrganizations(){
        return this.props.selectedOrganizations.map(i=>(
            <RemoveTag 
                key={i._id}
                className={"tag org-tag"}
                index={i._id}
                tagName={i.orgName || i.name}
                onClick={() => this.props.removeItem(i._id, "organizations")}
            />
        ))
    }

    renderStudies() {
        return this.props.selectedStudies.map(i=>(
            <RemoveTag 
                key={i._id}
                className={"tag study-tag"}
                index={i._id}
                tagName={i.studyName || i.name}
                onClick={() => this.props.removeItem(i._id, "studies")}
            />
        ))
    }

    renderStudyTags() {
        return this.props.selectedStudyTags.map((i, index)=>(
            <RemoveTag 
                key={`sTag-${index}`}
                className={"tag studyTag-tag"}
                index={`sTag`}
                tagName={i.name + (i.count != undefined ? (` (${i.count})`): "")}
                onClick={() => this.props.removeItem(i._id, "studyTag")}
            />
        ))
    }

    render() {
        return (
            <div className='filtered-items'>
                {
                    this.renderSearchText()
                }
                {
                    this.renderOrganizations()
                }
                {
                    this.renderStudies()
                }
                {
                    this.renderStudyTags()
                }
            </div>
        )
    }
}

export default SelectedFilteredItems;