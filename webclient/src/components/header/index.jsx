import React, { Component } from "react";
import { Link } from "react-router-dom";

import CookieService from "../../services/cookieservice";
import AuthService from "../../services/authservice";
import AuthServerService from "../../services/auth-server.service";
import LocalStorageService from "../../services/localstorageservice";

import Navigation from './navigation';

import Logo from "../../assets/images/Logo_LookLook.png";

import "./style.scss";
import CryptoHelper from "../../utils/cryptohelper";

class Header extends Component {
	user: UserModel;

	constructor(props){
		super(props);
		this.state = {
			showNavigation: false
		}
		this.user = CookieService.instance.user;
		this.logout = this.logout.bind(this);
		this.backToCms = this.backToCms.bind(this);
		this.gotolink = this.gotolink.bind(this);
	}

	async logout(){
		// CookieService.instance.clearUser(this.user);
		CookieService.instance.clearAll();
		const response = await AuthService.instance.logout();
		LocalStorageService.instance.clear();
		this.props.history.push("/login");
	}

	async gotolink(link) {
		// CookieService.instance.clearUser(this.user);
		this.props.history.push(`/${link}`);
	}

	async backToCms(){
		if(this.user){
			const token: any = AuthServerService.refresh_token;
			const encryptedString = CryptoHelper.encrypt({token}, process.env.NONCE);
			window.open(encodeURI(`${process.env.API_CMS}auth${token?'?t='+encryptedString : ''}`));

		}
	}

	componentWillMount(){
		// Hide navigation on login page
		if(window.location.pathname !== "/login"){
			this.setState({
				showNavigation: true
			})
		}
	}

  render(){
    return(
      <div className="header">
				<div className="header-wrapper">
					<h1>
						<a href="#" title="Look Look">
							<img style={{width: '207px'}} src={Logo} alt="Look Look"/>
						</a>
					</h1>
					{
						this.state.showNavigation ?
							<Navigation 
								firstName={this.user.firstName} 
								lastName={this.user.lastName} 
								logout={this.logout}
								backToCms={this.backToCms} 
								gotolink={this.gotolink} 
								showDashboard={this.props.showDashboard || false}
								showSearch={this.props.showSearch || false}
							/>		
						:
							null
					}
				</div>
      </div>
    )
  }
}

export default Header;
