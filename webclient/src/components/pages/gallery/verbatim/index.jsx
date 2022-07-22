// @flow
import React, {Component} from "react";

import VerbatimTable from '../verbatimtable';
import Loader from "../../../common/loader";
import moment from "moment";
import VerbatimController from "./verbatim";

let verbatimController;
class Verbatim extends Component<Props> {
    constructor(props: any) {
        super(props);
        this.state= {
            header:[],
            dataupdated:false
        }
        this.onCheckboxCheck = this.onCheckboxCheck.bind(this);
        this.onCheckAllRows = this.onCheckAllRows.bind(this);
        this.onPostIconClick = this.onPostIconClick.bind(this);
        verbatimController = new VerbatimController();
    }
    async onPostIconClick(posts) {
        this.props.toggleModalPopup();
        const postsData = await verbatimController.getPostDataByIds(posts);
        this.props.onSelectedPostsReceived(postsData);
    }
    
    onCheckboxCheck(index, check) {
        const data = (verbatimController.filteredQuestionnaireData.length > 0 ? verbatimController.filteredQuestionnaireData : verbatimController.questionnaireData);
        if(index < data.length) {
            const item = data[index];
            const i = verbatimController.checkedRows.indexOf(item._id)
            if(check && i == -1) {
                verbatimController.checkedRows.push(item._id);
            } else if(!check && i != -1) {
                verbatimController.checkedRows.splice(i, 1);
            }
        } else {
            const liveTagIndex = (index - Math.max(data.length - 1, 0)) - 1;
            const item = (verbatimController.filteredLiveTagsData.length > 0 ? verbatimController.filteredLiveTagsData : verbatimController.liveTagsData)[liveTagIndex];
            const i = verbatimController.checkedLiveTagRow.indexOf(item._id)
            if(check && i == -1) {
                verbatimController.checkedLiveTagRow.push(item._id);
            } else if(!check && i != -1) {
                verbatimController.checkedLiveTagRow.splice(i, 1);
            }
        }
        
    }

    onCheckAllRows(check) {
        verbatimController.checkedRows = [];
        verbatimController.checkedLiveTagRow = [];
        if(check) {
            verbatimController.checkedRows = (verbatimController.filteredQuestionnaireData.length > 0 ? verbatimController.filteredQuestionnaireData : verbatimController.questionnaireData).map(item=>item._id);
            verbatimController.checkedLiveTagRow = (verbatimController.filteredLiveTagsData.length > 0 ? verbatimController.filteredLiveTagsData : verbatimController.liveTagsData).map(item=>item._id);
        }
    }

    async getFullData() {
        await verbatimController.getFilteredData(this.props.filterData, this.props.studyId);
        if (verbatimController) {
            this.props.onDataUpdated(verbatimController.filteredCounts, verbatimController.questionnaireData, verbatimController.participantData, verbatimController.groupsData, verbatimController.filteredParticipantData, verbatimController.filteredQuestionnaireData, verbatimController.liveTagsData, verbatimController.filteredLiveTagsData);
            const headers = verbatimController.processParticipantData()
            this.setState({
                header: headers,
                dataupdated: !this.state.dataupdated });
        }
    }

    async componentDidMount(){
        await this.getFullData();
        this.props.disableDownload(false);
    }

    componentWillUnmount()	{
		if(verbatimController){
			verbatimController = null;
		}
	}
    async componentDidUpdate(prevProps: any, prevState: any){
        if (prevProps.filterData !== this.props.filterData) {
            window.scrollTo(0, 0);
            this.setState({ header: [] }, () => this.getFullData() );
        }
        if((prevProps.downloadVerbatim != this.props.downloadVerbatim) && this.props.downloadVerbatim) {
            const response = await verbatimController.downloadVerbatim();
            if(response && response.filename) {
                window.location = process.env.API_HOST + response.filename;
            }
            this.props.onDownloadComplete();
        }
    }

    render() {
        if(this.state.header.length>0){
            return (
                <VerbatimTable
                    toggleModalPopup={(posts) => this.onPostIconClick(posts)}
                    showPostsIcon={true}
                    showCheckBoxes={true}
                    showLiveTags={this.props.showLiveTags}
                    header={this.state.header} 
                    body={verbatimController.body} 
                    setContentContainerRef={this.props.setContentContainerRef}
                    onCheckboxCheck={(index, check)=>this.onCheckboxCheck(index, check)}
                    onCheckAllRows={(check)=>this.onCheckAllRows(check)}
                />
            )
        }
        return <Loader className={"center"} />;
    }

}

export default Verbatim;