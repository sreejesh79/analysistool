// @flow
import React, {Component} from "react";
import Download from "../../../../assets/images/iocDownload.svg";

import iocSearch from "../../../../assets/images/iocSearch.svg";
import "./style.scss";
import SpinnerLoader from "../../../common/spinnerloader";
import DropDown from "../../../common/dropdown";
import SelectedFilteredItems from "../selected-filtered-items";
import FilteredText from "../../../common/filteredtext"
class SearchHeader extends Component {
    constructor ( props) {
        super(props);
        this.state = {
          refresh:false,
          text:"",
          showFilteredItems: true,
          selectedStudyTagsLength:-1
        }
        this.handleTextChange = this.handleTextChange.bind(this);
        this.showFilteredItems = this.showFilteredItems.bind(this);
      }
      componentDidUpdate(prevProps) {
          if(prevProps.search != this.props.search && this.props.search != this.state.text){
            this.setState({text: this.props.search});
          }
          if(prevProps.selectedStudyTags.length != this.props.selectedStudyTags.length && this.props.selectedStudyTags.length != this.state.selectedStudyTagsLength){
            this.setState({selectedStudyTagsLength: this.props.selectedStudyTags.length});
          }
      }

      showFilteredItems () {
          this.setState({
            showFilteredItems: !this.state.showFilteredItems
          })
      }

      getFitlerTextLength (filterText) {
        let len = 0;
        for(let text of filterText) {
            if(text != "") {
                ++len;
            }
        }
        return len;
      }

      renderFilterTextString () {
          let filteredText = "(" + this.getFitlerTextLength(this.props.filterText) + ") Keywords, (" + this.props.selectedStudyTags.length + ") Tags";
          if (this.props.showOrganizations) {
              filteredText += ", (" + this.props.selectedOrganizations.length + ") Organizations";
          }
          filteredText += " and (" + this.props.selectedStudies.length + ") Study Names";
          return filteredText;
      }

      handleTextChange = (e) =>{ 
        this.setState({text: e.target.value});
        this.props.handleTextChange(e.target.value)
      }
      render() {
        const {organizations, studies, toggleSelectedOrganizationById, toggleSelectedStudyTagById, toggleSelectedStudyById, search, searchStudies, resetSearch,downloadClickHandler,  studyTags, allStudyTagsSelected} = this.props
        return (
            <div className='search-header'>
                <div className="search-content-container">
                    <div className="parent-container">
                        <div className="label-code-container">
                            <label>Keyword</label>
                            <span className="tag-color-code keyword-tag-bg-code"></span>
                        </div>
                        <input placeholder="Type your keywords with '+' here" autoComplete="off" type="text" value={this.state.text} name="search" onChange={this.handleTextChange} />
                    </div>
                    {this.props.showOrganizations ? <div className="parent-container">
                        {/* <label>Organization Name</label> */}
                        <div className="label-code-container">
                            <label>Organization Name</label>
                            <span className="tag-color-code org-tag-bg-code"></span>
                        </div>
                        <DropDown
                        keys="organization"
                        isMulti={true}
                        needFilter={true}
                        refresh={this.state.refresh}
                        titleHelper="Organization"
                        title="Select Organization"
                        uniqueKey="_id"
                        list={organizations}
                        toggleItem={toggleSelectedOrganizationById}
                        />
                    </div> : null}
                    <div className="parent-container">
                        {/* <label>Study Name</label> */}
                        <div className="label-code-container">
                            <label>Study Name</label>
                            <span className="tag-color-code study-tag-bg-code"></span>
                        </div>
                        <DropDown
                        keys="study"
                        isMulti={true}
                        needFilter={true}
                        refresh={this.state.refresh}
                        titleHelperPlural="Studies"
                        titleHelper="Study"
                        title="Select Study Name"
                        uniqueKey="_id"
                        list={studies}
                        toggleItem={toggleSelectedStudyById}
                        selectAllHandler={(selectionType) => this.props.selectAllHandler(selectionType)}
                        selectAll={this.props.allStudiesSelected}
                        />
                    </div>
                    <div className="parent-container">
                        {/* <label>Study Name</label> */}
                        <div className="label-code-container">
                            <label>Tags</label>
                            <span className="tag-color-code studytag-tag-bg-code"></span>
                        </div>
                        <DropDown
                        keys="studyTag"
                        isMulti={true}
                        needFilter={true}
                        refresh={this.state.refresh}
                        titleHelperPlural="Tags"
                        titleHelper="Tag"
                        title="Select Tag(s)"
                        uniqueKey="_id"
                        list={studyTags}
                        toggleItem={toggleSelectedStudyTagById}
                        selectAllHandler={(selectionType) => this.props.selectAllHandler(selectionType)}
                        selectAll={allStudyTagsSelected}
                        />
                    </div>
                </div>
                <div className="filter-items-container">
                    <div className={"filter-text-container"}>
                        {/* { // onClick={() => this.showFilteredItems()}
                            this.renderFilterTextString()
                        } */}
                        <FilteredText
                        showIcon={this.getFitlerTextLength(this.props.filterText) == 0}
                        filterText={this.renderFilterTextString()}
                        expandResult={this.state.showFilteredItems}
                        collapseFilteredResult={() => this.showFilteredItems()}
                        expandFilteredResult={() => this.showFilteredItems()}
                         />
                     </div>
                     {
                         this.state.showFilteredItems ? 
                            <SelectedFilteredItems
                                refresh={this.state.refresh}
                                selectedOrganizations={this.props.showOrganizations ? this.props.selectedOrganizations : []}
                                selectedStudies={this.props.selectedStudies}
                                selectedStudyTags={this.props.selectedStudyTags}
                                filterText={this.props.filterText}
                                removeItem={this.props.removeItem}
                                updateSearchString={this.props.updateSearchString}
                            />
                         : null
                     }
                    
                </div>
                <div className="search-reset-container">
                    <div className="button-left-container">
                        <div className={(this.state.selectedStudyTagsLength <= 0 && this.state.text.length < 2 || this.props.startFetching) ? 'search disable': 'search'}>
                            {/* <span>
                                {
                                    this.props.disable ?
                                        <SpinnerLoader />
                                    :
                                    <img src={iocSearch} alt="Search" onClick={()=>searchStudies()}/>
                                } // this.props.disable ? 'search in-progess' : this.state.startFetching ? 'search disable' : this.props.disableSearch ? 'search disable': 'reset'
                            </span> */}
                            <button onClick={()=>searchStudies()}>Search</button>
                        </div>
                        <div className={this.props.startFetching ? 'reset disable': 'reset'}>
                            <button onClick={()=>resetSearch()}>Reset</button>
                        </div>
                    </div>
                    <div className="button-right-container">
                        <div className={this.props.download ? 'download in-progess' : this.props.startFetching ? 'download disable' : this.props.disableDownload ? 'download disable': 'download'}>
                            <div className="icon-container">
                                {
                                    this.props.download ?
                                    <SpinnerLoader className="lds-spinner custom-lds-spinner" />
                                    :
                                    <img src={Download} alt="" onClick={()=>downloadClickHandler()}
                                    />
                                }
                            </div>
                            <button onClick={()=>downloadClickHandler()}>Download</button>
                        </div>
                    </div>
                    
                </div>
            </div>
        )
    }
}
export default SearchHeader;