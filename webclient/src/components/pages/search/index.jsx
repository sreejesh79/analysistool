// @flow
import React, {Component} from "react";
import { Link, Redirect } from "react-router-dom";

import "./style.scss";
import withAuth from "../../withAuth";
import Footer from "../../footer";
import Header from "../../header";
import SearchController from "./search";
import SearchHeader from "./search-header";
import SelectedFilteredItems from "./selected-filtered-items";
import SearchResultText from './searchresulttext';
import SearchCard from './searchcard';

import CryptoHelper from "../../../utils/cryptohelper";
import LookLookAtUtils from "../../../utils/looklook-at";
import Utils from "../../../utils/utilityScript";
import CookieService from "../../../services/cookieservice";
import NoResultFound from '../../common/noresultfound'; 
import MediaCarousel from '../../common/mediacarousel';
import AuthServerService from '../../../services/auth-server.service';
import StudyService from "../../../services/studyService";
import UserType from "../../../utils/constants";

let SearchCtrl;
let user;

class Search extends Component {
    mediaCarouselItems = [];
    constructor ( props : Object) {
      super(props);
      this.state = {
        isFetching: false,
        startFetching: false,
        allStudiesSelected: false,
        allStudyTagsSelected: false,
        refresh:false,
        disableDownload:true,
        download:false,
        filename:'',
        showCarousel: false
        
      }
      this.downloadClickHandler = this.downloadClickHandler.bind(this);
      this.navigateTo = LookLookAtUtils.navigateTo.bind(this);
      this.handleTextChange = this.handleTextChange.bind(this);
      this.toggleSelectedStudyById = this.toggleSelectedStudyById.bind(this);
      this.toggleSelectedOrganizationById = this.toggleSelectedOrganizationById.bind(this);
      this.removeFilteredItem = this.removeFilteredItem.bind(this);
      this.resetSearch = this.resetSearch.bind(this);
      this.searchStudies = this.searchStudies.bind(this);
      this.selectAllHandler = this.selectAllHandler.bind(this);
      this.backToCms = this.backToCms.bind(this);
      this.toggleSelectedStudyTagById = this.toggleSelectedStudyTagById.bind(this);
      this.openCarousel = this.openCarousel.bind(this);
      this.toggleModalPopup = this.toggleModalPopup.bind(this);
      this.onEscPress = this.onEscPress.bind(this);
      SearchCtrl = new SearchController();
    }

    async componentWillMount(){
        window.scrollTo(0, 0);
        user = CookieService.instance.user;
        /*
        * This code is commented as we are now allowing search tool access to Client and Client Administrator roles
        if(user.userType == "Client") {
            return this.navigateTo("/dashboard/unarchived/");
        }
        */
       
		if (user.token && user.token != "") {
            const init = await SearchCtrl.init();
            if (this.props.search && this.props.search.length > 0) {
                const data = await this.getData();
            }
            this.refreshUI();
        }
    }
    async getData () {
        const searchData = await Utils.queryParams(this.props.search);
        await this.setState({
            startFetching: true,
            disableDownload:true
        }, async () => {
            SearchCtrl.resetSearchResult();
            SearchCtrl.setUpdatedSearch(searchData);
            const search = await SearchCtrl.handleSearch(searchData);
            const selectAll = this.isAllSelected(SearchCtrl.studies);
            if(user.userType !== UserType.ADMIN) {
                const isAssigned = await this.isStudyAssignedToMe(this.getSelectedStudies(SearchCtrl.studies));
                if(!isAssigned) {
                    CookieService.instance.clearAll();
                    const { history } = this.props;
                    history.push("/login");
                    return;
                }
            }
            
            const selectAllTags = this.isAllSelected(SearchCtrl.studyTags);
            this.setState({
                startFetching:false,
                disableDownload: search.length == 0,
                allStudiesSelected: selectAll,
                allStudyTagsSelected: selectAllTags
            })
        })
    }
    
    async componentDidUpdate (prevProps, prevState) {
        if (prevProps.search != this.props.search && this.props.search != "") {
            const searchData = await this.getData();
        }
        if (prevState.filename != this.state.filename && this.state.filename != "") {
            const filePath = `${process.env.API_HOST.replace("https","http")}${this.state.filename}`;
            window.location = filePath;
            this.setState({
                filename:""
            })
        }
    }

    componentDidMount () {
        document.addEventListener('keydown', this.onEscPress, false);
    }

    componentWillUnmount () {
        if (SearchCtrl) {
            SearchCtrl.resetSearch();
            SearchCtrl.clearData();
            SearchCtrl = undefined;
        }
        document.removeEventListener('keydown', this.onEscPress, false);
    }

    onEscPress (e) {
        if(e.key === "Escape"){
			this.toggleModalPopup();
		}
    }

    selectAllStudies () {
        const boo = !this.state.allStudiesSelected
        SearchCtrl.selectAllStudies(boo);
        this.setState({
            allStudiesSelected: boo
        });
    }

    selectAllStudyTags () {
        const boo = !this.state.allStudyTagsSelected
        SearchCtrl.selectAllStudyTags(boo);
        this.setState({
            allStudyTagsSelected: boo
        });
    }

    selectAllHandler (selectionType) {
        switch(selectionType) {
            case "study":
                this.selectAllStudies();
                break;
            case "studyTag":
                this.selectAllStudyTags();
                break;
        }
        this.refreshUI();
    }
    handleTextChange (txt: any){
        if (typeof txt == "string") {
            SearchCtrl.text = txt;
        } else {
            SearchCtrl.arrText = txt;
        }
        this.refreshUI();
    }
    async downloadClickHandler(){
        this.setState({
            download:true,
        })
        const response = await SearchCtrl.downloadSearch();
        if(response && response.filename) {
            this.setState({
                    download:false,
                    filename:response.filename
                })
            // window.location = process.env.API_HOST + "/file/test.txt";
        } else {
            this.setState({
                download:false,
                filename:""
            })
        }
    } 
    refreshUI(){
        this.setState({
            refresh:!this.state.refresh
        })
    }

    search (){
        this.setState({
            startFetching:true
        },() => {
            setTimeout(()=>{
                this.setState({
                    startFetching:false
                })
            }, 3000)
        })
    }

    isAllSelected(studies) {
        for (let study of studies) {
            if (study.selected == false) {
                return false
            }
        }
        return true;
    }

    getSelectedStudies(studies) {
        return studies.filter(study => study.selected);
    }

    async isStudyAssignedToMe(studies) {
        const studyList = await StudyService.instance.getStudyList();
        const foundStudies = [];
        for(let i = 0; i<studies.length; i++) {
            foundStudies.push(studyList.find(item => item._id === studies[i]._id));
        }
        return foundStudies.length ? true : false;
    }

    updateCheckBoxSelections(){
        const selectAllStudy = this.isAllSelected(SearchCtrl.studies);
        const selectAll = this.isAllSelected(SearchCtrl.studyTags);
        this.setState({
            allStudiesSelected: selectAllStudy,
            allStudyTagsSelected: selectAll
        });
    }
    toggleSelectedStudyById(id){
        SearchCtrl.toggleSelectedStudyById(id);
        this.updateCheckBoxSelections();
    }

    toggleSelectedOrganizationById(id){
        SearchCtrl.toggleSelectedOrganizationById(id);
        this.updateCheckBoxSelections();
    }

    toggleSelectedStudyTagById(id) {
        SearchCtrl.toggleSelectedStudyTagById(id);
        const selectAll = this.isAllSelected(SearchCtrl.studyTags);
        this.setState({
            allStudyTagsSelected: selectAll
        });
        this.refreshUI();
    }

    isSearchable (data, filter) {
        for (let d of data) {
            if (filter.indexOf(d) == -1) {
                return true;
            }
        }
        return false;
    }

    async canSearch () {
        if(this.props.search && this.props.search != "") {
            const controllerSearchData = SearchCtrl.searchData[0];
            const searchData = await Utils.queryParams(this.props.search);
            if ((searchData.searchText.length != controllerSearchData.searchText.length) || (controllerSearchData.studies.length != searchData.studies.length) || (controllerSearchData.studyTags.length != searchData.studyTags.length)) {
                return true;
            } 
            if (searchData.searchText.length == controllerSearchData.searchText.length && this.isSearchable(searchData.searchText, controllerSearchData.searchText)) {
                return true;
            }
            if (controllerSearchData.studies.length == searchData.studies.length && this.isSearchable(searchData.studies, controllerSearchData.studies)) {
                return true;
            }
            if (controllerSearchData.studyTags.length == searchData.studyTags.length && this.isSearchable(searchData.studyTags, controllerSearchData.studyTags)) {
                return true;
            }
            return false;
        }
        return true;
    }
    getStudyIds (studyIds, orgStudies) {
        const studies = [];
        for (let study of orgStudies) {
            if (studyIds.indexOf(study) != -1) {
                studies.push(study);
            }
        }
        return studies;
    }

    async searchStudies () {
        let searchStudy = [];
        let clients = [];
        if (SearchCtrl.selectedStudies.length) {
            searchStudy = SearchCtrl.selectedStudies.map(item => item._id);
            clients = SearchCtrl.selectedStudies.map(item => item.client);
            
        }
        const studyIds = SearchCtrl.allStudies.map(item => item._id);
        for (let org of SearchCtrl.organizations) {
            if (clients.indexOf(org._id) == -1 && SearchCtrl.selectedOrganizations.indexOf(org._id) != -1) {
                const studies = this.getStudyIds(studyIds, org.studies);
                searchStudy = searchStudy.concat(studies);
            }
        }
        // const searchableText = SearchCtrl.arrText.filter(item => /[a-zA-Z0-9]{3}.*/.test(item));
        const searchableText = [];
        for (let text of SearchCtrl.arrText) {
            if (text.trim().length >= 2 && searchableText.indexOf(text) == -1) {
                searchableText.push(text);
            }
            // if ((/[\u00ff-\uffff]{2}.*/.test(text) || /[a-zA-Z0-9]{2}.*/.test(text)) && searchableText.indexOf(text) == -1) {
            //     searchableText.push(text);   
            // }
        }
        // if(searchableText.length == 0) {
        //     return;
        // }
        // const studyTags = SearchCtrl.studyTags.filter(item => item.selected);
        const studies = SearchCtrl.selectedOrganizations.length ? searchStudy : studyIds
        SearchCtrl.updateStudyTagsBySearchText();
        const studyTags = SearchCtrl.selectedStudyTags;
        // console.log(studyTags.length);
        SearchCtrl.searchData = [{searchText: searchableText, studies: (SearchCtrl.selectedOrganizations.length ? searchStudy : studyIds), studyTags}];
        // return;
        const isSearchable = await this.canSearch();
        if (isSearchable) {
            const encryptedString = CryptoHelper.encrypt(SearchCtrl.searchData, process.env.NONCE);
			var encoded = encodeURI(`?qt=${encryptedString}`);
			this.navigateTo({
				pathname: `/search`,
				search: `${encoded}`,
			});
        }
    }

    resetSearch(){
        SearchCtrl.resetSearch();
        this.setState({
            allStudiesSelected: false,
            allStudyTagsSelected: false,
            disableDownload: true
        }, () => {
            this.navigateTo('/search');
        })
    }

    removeFilteredItem(id, from){
        SearchCtrl.removeFilteredItem(id, from);
        this.refreshUI();
    }

    renderSearchResult(){
        return SearchCtrl.searchLength ? <span>{"Search Result (" + SearchCtrl.searchLength + ")"}</span> : <NoResultFound needIcon={false} message="No matching results found"/> ;
    }

    renderLoader(){
        return <Loader className="center" something="data" /> ;
    }

    async backToCms(study, participant, post){
		if(user && user.token){
			const token: any = AuthServerService.refresh_token;
            const cmsRoute = SearchCtrl.getCmsParticipantRoute(user.userType, study, participant);
            console.log("cmsRoute", cmsRoute);
            const encryptedData = CryptoHelper.encrypt({redirectTo: `${cmsRoute}?p=${post}`, token}, process.env.NONCE);
			window.open(encodeURI(`${process.env.API_CMS}auth${encryptedData?'?t='+encryptedData : ''}`));
		}
    }
    
    openCarousel (post) {
        this.mediaCarouselItems = [];
        if (post.media != undefined) {
            if (post.media.length == 0) {
                return;
            }
            const media = post.media;
            for (let med of media) {
                // const { mediaType, videoThumbnailUrl, mediaUrl } = post;
                if ((med["videoObjectKey"] && med["videoObjectKey"].trim() != "")||(med["video"] && med["video"].trim() !== "")) {
                    med["mediaType"] = "video";
                    med["videoThumbnailUrl"] = med["image"];
                    med["mediaUrl"] = med["video"];
                } else {
                    med["mediaType"] = "image";
                    med["mediaUrl"] = med["image"];
                }
            }
            this.mediaCarouselItems = media;
        } else {
            if (post.videoUrl) {
                post["mediaType"] = "video";
                post["mediaUrl"] = post["videoUrl"];
            } else {
                post["mediaType"] = "image";
                post["mediaUrl"] = post["imageUrl"];
            }
            this.mediaCarouselItems = [post];
        }
        this.toggleModalPopup();
    }

    getPostImage (post) {
        if (post.media && post.media.length > 0) {
            return post.media[0].image;
        }
        return post.imageUrl || post.videoThumbnailUrl
    }

    toggleModalPopup () {
        this.setState({
            showCarousel: !this.state.showCarousel
        }, () => {
            var body = document.getElementsByTagName("BODY")[0];
            if (this.state.showCarousel) {
                body.style.overflow = "hidden"
            } else {
                body.style.overflow = ""
            }
        })
    }

    renderSearch() {
        return (
            <div className='navigation-search-container'>
                <span className="search-title">Search</span>
                <SearchHeader
                    download={this.state.download}
                    disableDownload={this.state.disableDownload}
                    downloadClickHandler={this.downloadClickHandler}
                    refresh={this.state.refresh}
                    startFetching={this.state.startFetching}
                    search={SearchCtrl.text}
                    organizations={SearchCtrl.organizations || []}
                    studyTags={SearchCtrl.studyTags || []}
                    studies={SearchCtrl.studies || []}
                    toggleSelectedStudyById={this.toggleSelectedStudyById}
                    toggleSelectedOrganizationById={this.toggleSelectedOrganizationById}
                    toggleSelectedStudyTagById={this.toggleSelectedStudyTagById}
                    handleTextChange={(val) => this.handleTextChange(val)}
                    searchStudies={this.searchStudies}
                    resetSearch={this.resetSearch}
                    selectAllHandler={(selectionType) => this.selectAllHandler(selectionType)}
                    // showOrganizations={user.userType != "Client"}
                    showOrganizations={!(["Client", "Client Administrator"].includes(user.userType))}
                    // selectedOrganizations={user.userType != "Client" ? (SearchCtrl.selectedOrganizationsBySelectedStudy || []) : []}
                    selectedOrganizations={!(["Client", "Client Administrator"].includes(user.userType)) ? (SearchCtrl.selectedOrganizationsBySelectedStudy || []) : []}
                    selectedStudyTags={SearchCtrl.filteredStudyTags || []}
                    selectedStudies={SearchCtrl.selectedStudies || []}
                    filterText={SearchCtrl.filterText}
                    removeItem={this.removeFilteredItem}
                    updateSearchString={this.handleTextChange}
                    allStudiesSelected={this.state.allStudiesSelected}
                    allStudyTagsSelected={this.state.allStudyTagsSelected}
                />
                {(SearchCtrl.searchResults && !this.state.startFetching) ? <hr /> : null }
                <SearchResultText
                    startFetching= {this.state.startFetching}
                    showResultText={SearchCtrl.searchResults}
                    renderSearchResult ={this.renderSearchResult()}
                />
                <div className="search-result-postcards">
                    {
                        (SearchCtrl.searchResults && SearchCtrl.searchResults.length > 0 && !this.state.startFetching) ?
                            SearchCtrl.searchResults.map((item, index) => 
                                <SearchCard 
                                    key={`searchcard-${index}`}
                                    // postImage={item.imageUrl || item.videoThumbnailUrl}
                                    postImage={this.getPostImage(item)}
                                    imageObjectKey={(item.media && item.media[0] && item.media[0].imageObjectKey) ? item.media[0].imageObjectKey : (item.imageObjectKey ? item.imageObjectKey : null) }
                                    videoObjectKey={(item.media && item.media[0] && item.media[0].videoObjectKey) ? item.media[0].videoObjectKey : (item.videoObjectKey ? item.videoObjectKey : null) }
                                    organizationName={item.clientName}
                                    studyName={item.studyName}
                                    comments={item.comments}
                                    backToCms={() => this.backToCms(item.study, item.participant, item._id)}
                                    openCarousel={() => this.openCarousel(item)}
                                />
                                )
                        : null
                    }
                </div>
            </div>
            )
    }

    renderLoader(){
        return <Loader />
    }

    render() {
        return (
            <div>
            <div className={this.state.showCarousel ? "bg-color-white scroll-lock"  : "bg-color-white"}>
				<Header history={this.props.history} showDashboard={true}/>
				<div className="search-app-container">
                    {
                        !this.state.isFetching ? this.renderSearch() : this.renderLoader()
                    }
				</div>
				<Footer />
			</div>
            <div>
                    {
                        this.state.showCarousel && <MediaCarousel className="carousel-container" posts={this.mediaCarouselItems} closePopUp={() => this.toggleModalPopup()}/>
                    }
                </div>
            </div>
        )
    }
}

export default withAuth(Search);