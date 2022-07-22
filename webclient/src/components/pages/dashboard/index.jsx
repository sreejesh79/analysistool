// @flow
import React, {Component} from "react";
import StudyService from "../../../services/studyService";
import LocalStorageService from "../../../services/localstorageservice";
import CookieService from "../../../services/cookieservice";
import AuthService from "../../../services/authservice";

// Components
// import StudyCard from "./studycard";
import withAuth from "../../withAuth";
import Header from "../../header";
import Welcome from "../../common/welcome";
import Footer from "../../footer";
import StudyType from "./studytype";
// import Loader from "../../common/loader";
import StudyCardContainer from './studycardcontainer';

//Models
import StudyModel from "../../../models/study";
import UserModel from "../../../models/user";

// Images
import iocmore from '../../../assets/images/iocMore.svg';

// Style sheet
import './style.scss';

type Props = {}

type State = {
	hidden:boolean,
	studyType:string,
	studiesLength:number
}
class Dashboard extends Component<Props> {
	getCall = true;
	studyCount = 0;
	studyType = "unarchived";
	WELCOMENOTE_HIDDEN = "welcomenotehidden";
	userStudies: StudyModel[] = [];
	user: UserModel;
	docHeight = 0;
	windowBottom = 0;
	bottomReached = false;
	constructor(props: Object) {
		super(props);
		//LocalStorageService.instance.clear();
		this.user = CookieService.instance.user;
		this.hideClickHandler = this.hideClickHandler.bind(this);
		this.cardClickHandler = this.cardClickHandler.bind(this);
		this.handleData = this.handleData.bind(this);
		this.state={
			hidden: LocalStorageService.instance.getItemBoolean(this.WELCOMENOTE_HIDDEN),
			studyType: props.studyType || this.studyType,
			studiesLength:-1,
			userStudies: this.userStudies
		};
		this.handleScroll = this.handleScroll.bind(this);
	}

	componentDidMount() {
		window.addEventListener('scroll', this.handleScroll);
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this.handleScroll);
		StudyService.removeEventListener(StudyService.instance.STUDY_DATA, this.handleData);
	}

	componentWillMount(){
		if(this.props.studyType && ["archived", "unarchived", "hidden"].indexOf(this.props.studyType) == -1) {
			return this.navigateTo("/dashboard/unarchived");
		}
		this.studyType = this.props.studyType || this.studyType;
		this.setState({studyType:this.studyType});
		this.get(this.studyType);
	}

	componentDidUpdate(prevProps, prevState) {
		// only update chart if the data has changed
		if (prevProps.studyType !== this.props.studyType) {
			this.studyCount = 0;
			this.userStudies = [];
			this.getCall = true;
			this.bottomReached = false;
			window.scrollTo(0, 0);
			this.setState({
				userStudies: [],
				studyType:this.props.studyType,
				studiesLength: -1
			});
			this.get(this.props.studyType);
		}
	}

	handleData(e: Event) {
		const data: any = e.data;
		if(data){
			if(!data.hasOwnProperty("tags")){
				this.studyCount = data.count ? data.count : this.studyCount;
				this.userStudies.push(...data.studies);
				// this.userStudies.sort((a: any, b:any) => {
				// 	return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
				// })
			} else {
				this.userStudies[data.index].tags = data.tags;
			}
			this.setState({
				studiesLength: Object.keys(this.userStudies).length,
				userStudies: this.userStudies
			});
		}
	}

	async get(studyType: string, skip?: number = 0) {
		StudyService.addEventListener(StudyService.instance.STUDY_DATA, this.handleData);
		const response: any = await StudyService.instance.get(studyType, skip);
		if(response._error && response._body === "Invalid Token"){
			const { history } = this.props;
			const response = await AuthService.instance.logout();
			LocalStorageService.instance.clear();
			history.push("/login");
		} else if(response._body.message === "success") {
			this.getCall = false; 
			if(this.bottomReached){
				this.bottomReached = false;
				this.handleGetCall();
			}
		}
	}

	hideClickHandler(){
		const newState = !this.state.hidden;
		this.setState({hidden:newState});
		LocalStorageService.instance.setItemBoolean(this.WELCOMENOTE_HIDDEN, newState);
	}

	navigateTo(url){
		const { history } = this.props;
        history.push(url);
	}

	cardClickHandler(id,type){
		let url = `/gallery/${id}`;
		if(type){
			url = `${url}/${type}`;
		}
		this.navigateTo(url)
	}
	handleScroll() {
		const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
		const body = document.body;
		const html = document.documentElement;
		this.docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight,  html.scrollHeight, html.offsetHeight);
		this.windowBottom = windowHeight + window.pageYOffset;
		
		if(this.windowBottom == this.docHeight){
			this.bottomReached = true;
		}
		if (this.windowBottom >= this.docHeight* 0.8) {
			this.handleGetCall();
		    // console.log('bottom reached');
		} else {
		//   console.log('not at bottom');
		}
	}

	handleGetCall(){
		if(!this.getCall && this.studyCount >= this.userStudies.length){
			this.getCall = true;
			this.get(this.state.studyType, this.userStudies.length);
		}
	}

	render() {
		return (
			<div className="bg-color-white">
				{/* <Header history={this.props.history} showSearch={this.user.userType != "Client"}/> */}
				<Header history={this.props.history} showSearch={true}/>
				<div className="dashboard-containeer">
					<Welcome hidden={this.state.hidden} onHideClick={this.hideClickHandler} />
					<StudyType selected={this.state.studyType} showOptions={ this.user.userType === "Admin" }/>
					<div className="lk_studie_card_container">
					<StudyCardContainer 
						studiesLength={this.state.studiesLength}
						userStudies={this.userStudies}
						clickHandler={this.cardClickHandler}	
					/>
					
				</div>									
				</div>
				<Footer />
			</div>
		)
	}
}

export default withAuth(Dashboard);