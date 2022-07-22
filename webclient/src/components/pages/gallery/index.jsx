// @flow
import React, {Component} from "react";
import {Link} from "react-router-dom";

// Components
import withAuth from "../../withAuth";
import IconText from "../../common/icontext";
import ShareButton from "../../common/sharebutton";
import FilteredText from "../../common/filteredtext";
import FilterIcon from './filtericon';
import Verbatim from './verbatim';
import GalleryHeader from './galleryheader';
import Image from "./image";
import Video from "./video";
import Sidebar from './sidebar';
import TransparentButton from "../../common/transparentbutton";
import Loader from "../../common/loader";
import FilteredList from '../../common/filteredlist';
import ModalPopUp from './../../common/modelpopup';

// Images
import IOCImage from '../../../assets/images/iocImages.svg';
import VerbatimIcon from '../../../assets/images/iocVerbatim.svg';
import IOCVideo from '../../../assets/images/iocVideo.svg';
import FilterIconImage from '../../../assets/images/iocFilter.svg';

import "./style.scss";
import GalleryController from "./gallery";
import CryptoHelper from "../../../utils/cryptohelper";
import Utils from "../../../utils/utilityScript";
import LookLookAtUtils from "../../../utils/looklook-at";
import CookieService from "../../../services/cookieservice"

//popups
import ShareLinkPopup from '../../common/sharepopup';
import MediaCarousel from '../../common/mediacarousel';
import VerbatimTable from './verbatimtable';
import StudyService from "../../../services/studyService";
import UserType from "../../../utils/constants";
type Props = {
}

type State = {
	type: string,
	refresh: boolean
}

let user;
let GalleryCtrl;
class Gallery extends Component<Props, State> {
	contentContainerRef;
	filteredListRef;
	verbatimTableContainer;
	verbatimTableRef;
	constructor(props: Object) {
		super(props);
		this.state = {
			studyId:null,
			isNewStudy: false,
			type:null,
			startFetching:false,
			refresh:false,
			showSidebar: false,
			hideSidebar: false,
			expandResult: false,
			collapseResult: false,
			showPopUp: false,
			showLiveTags: false,
			download: false,
			search: "",
			postCardChecked: false,
			disableDownload: false,
			refreshHeader: false,
			popupType: "",
		}
		user = CookieService.instance.user;
		this.navigateTo = LookLookAtUtils.navigateTo.bind(this);
		this.applyFilter = this.applyFilter.bind(this);
		this.bottomTabClick = this.bottomTabClick.bind(this);
		this.resetFilter = this.resetFilter.bind(this);
		this.showFilterSidebar = this.showFilterSidebar.bind(this);
		this.refreshData = this.refreshData.bind(this)
		this.expandFilteredResult = this.expandFilteredResult.bind(this);
		this.collapseFilteredResult = this.collapseFilteredResult.bind(this);
		this.onEscPress = this.onEscPress.bind(this);
		this.setContentContainerRef = this.setContentContainerRef.bind(this);
		this.setFilteredListRef = this.setFilteredListRef.bind(this);
		this.myAnimationEnd = this.myAnimationEnd.bind(this);
		this.closeTag = this.closeTag.bind(this);
		this.toggleModalPopup = this.toggleModalPopup.bind(this);
		this.onToggleVerbitam = this.onToggleVerbitam.bind(this);
		this.toggleDownloadHandler = this.toggleDownloadHandler.bind(this);
		this.selectAllPostcards = this.selectAllPostcards.bind(this);
		this.disableDownload = this.disableDownload.bind(this);
		this.onSelectedPostsReceived = this.onSelectedPostsReceived.bind(this);
		this.onSelectedPostTagsReceived = this.onSelectedPostTagsReceived.bind(this);
		this.setVerbatimTableWrapperRef = this.setVerbatimTableWrapperRef.bind(this);
		this.setVerbatimTableContainerRef = this.setVerbatimTableContainerRef.bind(this);
		GalleryCtrl = new GalleryController();

	}

	async isStudyAssignedToMe(studyId) {
        const studyList = await StudyService.instance.getStudyList();
        const foundStudy = studyList.find(item => item._id === studyId);
        return foundStudy ? true : false;
    }

	onSelectedPostTagsReceived(tagsData) {
		GalleryCtrl.selectedPostTagsData = tagsData;
		this.refreshUI();
	}
		
	selectAllPostcards(check){
		if(check != undefined){
			this.setState({ postCardChecked: check})
		} else {
			this.setState({ postCardChecked: !this.state.postCardChecked})}
	}
	onSelectedPostsReceived (posts) {
		GalleryCtrl.selectedPosts = posts;
		this.refreshUI();
	}
	disableDownload(check) {
		this.setState({
			disableDownload: check
		})
	}

	toggleDownloadHandler() {
		this.setState({
			download:!this.state.download
		})
	}

	onToggleVerbitam() {
		this.setState({
			showLiveTags: !this.state.showLiveTags,			
		})
	}

	setContentContainerRef(ref){
		this.contentContainerRef = ref;
		this.myAnimationEnd();
	}

	setVerbatimTableWrapperRef (ref) {
		if(ref) {
			this.verbatimTableContainer = ref;
			const verbatimTableCHeight = this.verbatimTableContainer.getBoundingClientRect().height;
			if(this.verbatimTableRef) {
				const verbatimTableHeight = this.verbatimTableRef.getBoundingClientRect().height;
				const top = this.verbatimTableContainer.getBoundingClientRect().top;
				if (verbatimTableHeight > verbatimTableCHeight) {
					const newHeight = verbatimTableHeight + 60;
					this.verbatimTableContainer.style.height = `${newHeight}px`;
					const actualHeightIncreased = this.verbatimTableContainer.getBoundingClientRect().height - verbatimTableCHeight;
					const newTop = top - actualHeightIncreased;
					this.verbatimTableContainer.style.top = `${newTop}px`;
				}
			}
		}
	}

	setVerbatimTableContainerRef(ref){
		if(ref) {
			this.verbatimTableRef = ref;
		}
	}

	setFilteredListRef(ref){
		if(ref){
			this.filteredListRef = ref
			this.filteredListRef.addEventListener("webkitAnimationEnd", this.myAnimationEnd);
			this.filteredListRef.addEventListener('animationend',this.myAnimationEnd);
		}
		
	}

	refreshData(filteredCounts, questionnaireData, participantData, groupsData, filteredParticipantData, filteredQuestionnaireData, liveTagsData, filteredLiveTagsData) {
		GalleryCtrl.refreshData(filteredCounts, questionnaireData, participantData, groupsData, filteredParticipantData, filteredQuestionnaireData, liveTagsData, filteredLiveTagsData)
		this.setState({ startFetching: false });
	}

	async closeTag(type, item){
		const filter = await GalleryCtrl.getFilterableData(type, item);
		if((filter[0].tags && filter[0].tags.length == 0) && (filter[0].groups && filter[0].groups.length == 0) && (filter[0].participants && filter[0].participants.length == 0) && (filter[0].liveTags && filter[0].liveTags.length == 0)) {
			this.collapseFilteredResult();
		}
        this.applyFilter(filter);
	}

	toggleModalPopup(type = "") {
		GalleryCtrl.selectedPosts = [];
		GalleryCtrl.selectedPostTagsData = undefined;
		this.setState({ showPopUp: !this.state.showPopUp,
			disableDownload: !this.state.disableDownload,
			popupType: type}); // popupType: type
	}

	showFilterSidebar(){
		const boo = !this.state.showSidebar;
		this.setState({ showSidebar: boo , hideSidebar: !boo});
	}

	expandFilteredResult(){
        this.setState({ 
			expandResult: true,
			collapseResult: false
		})
    }

    collapseFilteredResult(){
        this.setState({ 
			expandResult: false,
			collapseResult: true
		})
	}
	
	refreshUI(check){
		if(check) {
			this.setState({
				refreshHeader: !this.state.refreshHeader
			})
			return;
		}
		this.setState({
			refresh: !this.state.refresh
		});
	}

	async componentWillMount(){
		const user: any = CookieService.instance.user;
		if (user.token && user.token != "") {
			if(!this.props.studyId || this.props.studyId.length != 24) {
				return this.navigateTo("/dashboard/unarchived");
			}
			const {history} = this.props;
			if(user.userType !== UserType.ADMIN) {
				const isAssigned = await this.isStudyAssignedToMe(this.props.studyId);
				if(!isAssigned) {
					//CookieService.instance.clearAll();
					return history.push("/permission");
				}
			}
			const studyInfo = await StudyService.instance.getStudyInfo(this.props.studyId);
			const type = this.props.type || GalleryCtrl.defaultType;
			if(this.props.search){
				GalleryCtrl.filterData = await Utils.queryParams(this.props.search);
			}
			this.setState({
				studyId: this.props.studyId, 
				type:type, 
				search: this.props.search, 
				startFetching: true,
				isNewStudy:studyInfo.isNewStudy});
		}
	}

	componentWillUnmount()	{
		if(GalleryCtrl){
			// GalleryCtrl.resetAll();
			GalleryCtrl = null;
		}
		if(this.filteredListRef){
			this.filteredListRef.removeEventListener("webkitAnimationEnd", this.myAnimationEnd);
			this.filteredListRef.removeEventListener('animationend',this.myAnimationEnd);
		}
	}

	onEscPress(){
		this.setState({ showPopUp: false,
			disableDownload: !this.state.disableDownload,
		})
	}
	
	async componentDidUpdate(prevProps, prevState) {
		if (prevProps.type !== this.props.type && this.state.type != this.props.type && prevState.studyId === this.props.studyId){
			window.scrollTo(0, 0);
			if(this.props.search){
				GalleryCtrl.filterData = await Utils.queryParams(this.props.search);
			}
			this.setState({
				startFetching:true,
				showLiveTags: false,
				postCardChecked: false,
				type: this.props.type
			});
			this.refreshUI(true);
		} 
		if (prevProps.search !== this.props.search && this.state.search != this.props.search) {
			window.scrollTo(0, 0);
			await this.setState({
				search: this.props.search,
				startFetching:true
			} , async () =>{
				GalleryCtrl.filterData = await Utils.queryParams(this.props.search);
				this.refreshUI(true);
			});
		}
	}


	myAnimationEnd(){		
		let filterSelectedShareDivHeight = 0;
		if(this.refs.filterSelectedShareRef){
			filterSelectedShareDivHeight = this.refs.filterSelectedShareRef.getBoundingClientRect().height;
		}

		let height = 0;
		if(this.filteredListRef){
			height = this.filteredListRef.getBoundingClientRect().height;
		}
		// 174 (footer height + gallery header height + margin-bottom of filter-selected-share div)
		const newHeight = 174 + height + filterSelectedShareDivHeight;
		if(this.contentContainerRef){
			this.contentContainerRef.style.height = `calc(100vh - (${newHeight}px))`;
		}
		
	}
	
	resetFilter(){
		this.collapseFilteredResult();
		GalleryCtrl.resetFilter();
		this.navigateTo({
			pathname: `/gallery/${this.props.studyId}/${this.state.type}`,
			search: "",
			});
	}
	
	applyFilter (filter) {
		const canFilter = GalleryCtrl.canFilter(filter[0], this.props.search);
		if(canFilter) {
			filter[0].study=this.props.studyId;
			const encryptedString = CryptoHelper.encrypt(filter, process.env.NONCE);
			var encoded = encodeURI(`?q=${encryptedString}`);
			this.navigateTo({
				pathname: `/gallery/${this.props.studyId}/${this.state.type}`,
				search: `${encoded}`,
			});
		} else if(canFilter == false) {
			this.resetFilter();
		}
		this.setState({showLiveTags: false, postCardChecked: false, showSidebar: false, hideSidebar: true});
	}

	renderPopup () {
		switch(this.state.popupType) {
            case "share":
                return <ShareLinkPopup searchURL={window.location.href} closePopUp={() => this.toggleModalPopup()}/>;
			case "carousel":
				return ((GalleryCtrl.selectedPosts && GalleryCtrl.selectedPosts.length > 0) ?
						<MediaCarousel posts={GalleryCtrl.selectedPosts} closePopUp={() => this.toggleModalPopup()}/>
						: null)
			case "verbatim":
					return (GalleryCtrl.selectedPostTagsData ?
						<div className="verb-table-container" ref={this.setVerbatimTableWrapperRef}>
                            <div className="verb-table-wrapper">
                                <VerbatimTable
										setContentContainerRef={this.setVerbatimTableContainerRef}
                                        showPostsIcon={false}
                                        showLiveTags={false}
                                        header={GalleryCtrl.selectedPostTagsData.header} 
                                        body={GalleryCtrl.selectedPostTagsData.body}
                                        showCheckBoxes={false}
                                />
                            </div>
                            <span className="close-modal" onClick={() => this.toggleModalPopup()}>x</span>
                        </div> 
						: null)
        }
	}
	
	renderTable(){
		switch(this.state.type){
			case "image":
				return <Image 
				studyId={this.props.studyId}
				isNewStudy={this.state.isNewStudy}
				filterData={GalleryCtrl.filterData}
				onDataUpdated = { this.refreshData }
				setContentContainerRef={this.setContentContainerRef}
				downloadImages={this.state.download}
				onDownloadComplete={()=>{this.toggleDownloadHandler()}}
				selectAllPosts={this.state.postCardChecked}
				selectAllPostcards={(check)=>this.selectAllPostcards(check)}
				disableDownload={(check)=>this.disableDownload(check)}
				toggleModalPopup={(tags) => this.toggleModalPopup("verbatim", tags)}
				onSelectedPostTagsReceived={(data) => this.onSelectedPostTagsReceived(data)}
				/>
			case "video":
				return <Video 
				studyId={this.props.studyId}
				isNewStudy={this.state.isNewStudy}
				filterData={GalleryCtrl.filterData}
				onDataUpdated = { this.refreshData }
				setContentContainerRef={this.setContentContainerRef}
				downloadVideos={this.state.download}
				onDownloadComplete={()=>{this.toggleDownloadHandler()}}
				selectAllPosts={this.state.postCardChecked}
				selectAllPostcards={(check)=>this.selectAllPostcards(check)}
				disableDownload={(check)=>this.disableDownload(check)}
				toggleModalPopup={(tags) => this.toggleModalPopup("verbatim", tags)}
				onSelectedPostTagsReceived={(data) => this.onSelectedPostTagsReceived(data)}
				/>
				default:
				return <Verbatim
				toggleModalPopup={(posts) => this.toggleModalPopup("carousel", posts)}
				onSelectedPostsReceived={(posts) => this.onSelectedPostsReceived(posts)}
				showLiveTags={this.state.showLiveTags}
				filterData={GalleryCtrl.filterData} 
				studyId={this.props.studyId} 
				onDataUpdated = { this.refreshData }
				setContentContainerRef={this.setContentContainerRef}
				downloadVerbatim={this.state.download}
				onDownloadComplete={()=>{this.toggleDownloadHandler()}}
				disableDownload={(check)=>this.disableDownload(check)}
				/>
		}		
	}

	selectedClassName(name){
		return this.state.type===name?'selected':'';
	}

	async bottomTabClick(name){
		if(this.state.type===name) return;
		this.navigateTo({
			pathname: `/gallery/${this.props.studyId}/${name}`,
			search: this.props.search,
		});
		this.refreshUI();
	}

	renderHeaderButtons() {
		let returnView = null;
		switch (this.state.type) {
			case "image":
			 returnView = <div className="checkbox-container">
							<span>Select all Posts</span>
							<span onClick={()=>this.selectAllPostcards()} className={`check-box ${this.state.postCardChecked? 'checked' : ''}`}></span>
						</div>
			break;
			// case "verbatim":
			// 	if(!this.state.startFetching && ((GalleryCtrl.filteredLiveTagsData.length > 0 && GalleryCtrl.filteredQuestionnaireData.length > 0) || (GalleryCtrl.filteredLiveTagsData.length == 0 && GalleryCtrl.filteredQuestionnaireData.length == 0)) && GalleryCtrl.liveTagsData.length != 0) {
			// 		returnView = <TransparentButton className="toggle-button-container" onClick={() => this.onToggleVerbitam()}>{this.state.showLiveTags ? "Show question tags" : "Show study tags"}</TransparentButton>
			// }
			// break;
		}
		return returnView;
	}
	
	render() {
		if(this.state.studyId==null){
			return <Loader />
		}
		return (
			<div className="gallery-conatiner">
				<GalleryHeader 
					{...this.props}
					studyId={this.props.studyId}
					backClickHandler={()=>{
						GalleryCtrl.resetAll();
						this.navigateTo('/dashboard')}}
					downloadClickHandler={()=>this.toggleDownloadHandler()}
					disable={this.state.download}
					startFetching={this.state.startFetching}
					disableDownload={this.state.disableDownload}
					refreshHeader={this.state.refreshHeader}
				/>
				{
					this.state.showPopUp ?
						<ModalPopUp
							closePopUp={this.toggleModalPopup}
							onEscPress={() => this.onEscPress()}
						>
						{
							this.renderPopup()
						}
						</ModalPopUp>
					:
						null
				}				
				<div className="gallery-main-container">
					<div className="filter-selected-share" ref="filterSelectedShareRef">		
						<FilterIcon image={FilterIconImage} showFilterSidebar={this.showFilterSidebar} />
						<div className="filter-text-container">
							<FilteredText
								// showIcon={((GalleryCtrl.filteredCounts.participants) == 0 && GalleryCtrl.filteredCounts.tags == 0 && GalleryCtrl.filteredCounts.groups == 0 && GalleryCtrl.filteredCounts.liveTags == 0)}
								// filterText={`(${GalleryCtrl.filteredCounts.participants}) Participants, (${GalleryCtrl.filteredCounts.groups}) Groups, (${GalleryCtrl.filteredCounts.tags}) Tags and (${GalleryCtrl.filteredCounts.liveTags}) Study Tags`}
								showIcon={((GalleryCtrl.filteredCounts.participants) == 0 && GalleryCtrl.filteredCounts.tags == 0 && GalleryCtrl.filteredCounts.groups == 0)}
								filterText={`(${GalleryCtrl.filteredCounts.participants}) Participants, (${GalleryCtrl.filteredCounts.groups}) Groups and (${GalleryCtrl.filteredCounts.tags}) Tags`}
								collapseFilteredResult={this.collapseFilteredResult}
								expandFilteredResult={this.expandFilteredResult}
								expandResult={this.state.expandResult}
								collapseResult={this.state.collapseResult}

							/>
						</div>
						{/* <ShareButton openPopup={() => this.toggleModalPopup("share")} disabled={GalleryCtrl.filteredCounts.participants === '00' && GalleryCtrl.filteredCounts.tags === '00' && GalleryCtrl.filteredCounts.groups === '00' && GalleryCtrl.filteredCounts.liveTags === '00'} /> */}
						<ShareButton openPopup={() => this.toggleModalPopup("share")} disabled={GalleryCtrl.filteredCounts.participants === '00' && GalleryCtrl.filteredCounts.tags === '00' && GalleryCtrl.filteredCounts.groups === '00'} />
						<div className={this.state.type == 'verbatim' ? 'btn-container' : null}>
							{
						 		this.renderHeaderButtons()
							}
						</div>						
					</div>
					<Sidebar 
						startFetching={this.state.startFetching}
						questionnaireData={GalleryCtrl.questionnaireData}
						participantData={GalleryCtrl.participantData}
						groupsData={GalleryCtrl.groupsData}
						liveTagsData={GalleryCtrl.liveTagsData}
						filteredParticipantData={GalleryCtrl.filteredParticipantData}
						filteredQuestionnaireData={GalleryCtrl.filteredQuestionnaireData}
						filteredLiveTagsData={GalleryCtrl.filteredLiveTagsData}
						applyFilter={this.applyFilter}
						showSideBar={this.state.showSidebar}
						hideSideBar={this.state.hideSidebar}
					/>
					<FilteredList 
						expandResult={this.state.expandResult}
						collapseResult={this.state.collapseResult}
						filterData = {GalleryCtrl.filterListData}
						applyFilter={this.applyFilter}
						showFilterResult={this.state.showFilterResult}
						setFilteredListRef={this.setFilteredListRef}
						participant={GalleryCtrl.filteredCounts.participants}
						tags={GalleryCtrl.filteredCounts.tags}
						group={GalleryCtrl.filteredCounts.groups}
						liveTags={GalleryCtrl.filteredCounts.liveTags}
						closeTag={this.closeTag}
					/>
					{ this.renderTable() }
				</div>
				<div className="gallery-fotter">
					<div className="gallery-bottom-tabs">
						<TransparentButton className={this.selectedClassName('verbatim')} onClick={()=>this.bottomTabClick('verbatim')}>
							<IconText image={VerbatimIcon} text={'Verbatims'} />
						</TransparentButton>
						<TransparentButton className={this.selectedClassName('image')} onClick={()=>this.bottomTabClick('image')}>
							<IconText image={IOCImage} text={'Images'}/>
						</TransparentButton>
						<TransparentButton className={this.selectedClassName('video')} onClick={()=>this.bottomTabClick('video')}>
							<IconText image={IOCVideo} text={'Videos'}/>
						</TransparentButton>
					</div>
				</div>				
			</div>
		)
	}

}

export default withAuth(Gallery);