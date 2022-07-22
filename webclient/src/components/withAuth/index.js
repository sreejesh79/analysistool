import React, { Component } from 'react';
import AuthServerService from '../../services/auth-server.service';
import Header from '../header';
import Loader from '../common/loader';
export default function withAuth(AuthComponent) {
	return class AuthWrapped extends Component {
		// Code here now
		constructor() {
			super();
			this.state = {
				accessToken: null
			}
		}
		async componentWillMount() {
            // console.log("AuthServerService.refresh_token", AuthServerService.refresh_token);
            if (AuthServerService.refresh_token) {
				try {
                    const profile = await AuthServerService.init();
                    await AuthServerService.wait(50);
                    // console.log("componentWillMount", profile, AuthServerService.token);
					return this.setState({
						accessToken: AuthServerService.token
					})
				} catch (err) {
					
				}
            }
            const redirectTo = this.props.location.pathname + this.props.location.search;
            const location = {pathname: "/login", state: {redirectTo: redirectTo}};
            this.props.history.replace(location)
		}

		renderHeader = () => {
			console.log("this.props.location: ", this.props.location);
			switch (this.props.location.pathname) {
				case "/dashboard":
					return <Header history={this.props.history} showSearch={true} />;
				case "/search":
					return <Header history={this.props.history} showDashboard={true} />;
				default:
					return <Loader />;
			}
		}
		render() {
			if (this.state.accessToken) {
				return ( <AuthComponent { ...this.props } history = { this.props.history } accessToken = { this.state.accessToken } /> )
			} 
			// return null;
			return this.renderHeader();
		}
	}
}