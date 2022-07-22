// @flow
import React, {Component} from 'react';
import RemotingClient from "./lib/remoting.client";
import CookieService from "./services/cookieservice";
import AuthServerService from "./services/auth-server.service";
import AuthService from "./services/authservice";
import '../node_modules/normalize.css';
import './assets/styles/main.scss';  /* removed index.scss and linked main.css -GM  */
import CryptoHelper from './utils/cryptohelper';
import Utils from './utils/utilityScript';

type Props = {};
type State = {};

class App extends React.Component<State, Props> {

  constructor(props: Object)
  {
    super(props);
    this.init();
  }

  async validateTokenFromQuery(token) {
      const authService: any = AuthService.instance;
      let userToken: any
      try {
        const decryptObj = CryptoHelper.decrypt(token, process.env.NONCE);
        if (decryptObj.error) {
          return null;
        }
        userToken = decryptObj.decryptedData.token
      } catch (e) {
          console.log(e);
      }
      if(userToken) {
        const { history } = this.props;
        const response: any = await AuthServerService.updateRefreshToken(userToken, true);
        if(response._error){
          history.push("/login");
        } else {
          CookieService.instance.saveUser(response._body);
          history.push("/dashboard");
        }
      }
  }

  validateAuthorization(userType, pathname) {
    /*
    * This code is commented as we are now allowing search tool access to Client and Client Administrator roles
    if (userType == "Client") {
      return (pathname.indexOf('search') == -1);
    }
    */
    return true;
  }
  async init() {
    // console.log("process", process.env.API_HOST);
    RemotingClient.init(process.env.API_HOST, "5OnRUTZmFFmqPuPi52Q7");

    const user: any = CookieService.instance.user;
    const authService: any = AuthService.instance;
    const { history } = this.props;
    let location = {pathname: "/login"};
    if(this.props.location.search) {
      const queryObj = await Utils.getQueryObj(this.props.location.search);
      if(queryObj.t) {
        return await this.validateTokenFromQuery(queryObj.t)
      }
    }
    if (AuthServerService.refresh_token && AuthServerService.refresh_token != "") {
      await AuthServerService.wait(50);
      const response: any = await authService.validateToken(user);
      if(!response._error) {
        if(this.props.location.pathname == "/" || this.props.location.pathname == "/login") {
          location = {pathname: "/dashboard"};
        } else {
          location = {pathname: this.props.location.pathname, search: this.props.location.search};
        }
      }

    } else {
      if(!(this.props.location.pathname == "/" || this.props.location.pathname == "/login")) {
        const redirectTo = this.props.location.pathname + this.props.location.search;
        location = {pathname: "/login", state: {redirectTo: redirectTo}};
      }
      return history.push(location);
    }
    const pathname = this.props.location.pathname;
    const routes = ["login", "permission", "dashboard", "gallery", "search"];
    const isValidPath = Utils.validiateRoutes(routes, pathname);
    if (!isValidPath || pathname == "/gallery" || pathname == "/gallery/" || !this.validateAuthorization(user.userType, pathname)) {
      location = {pathname: "/dashboard/unarchived/"};
    }
    return history.push(location);
  }

  render(){
    return (
      null
    )
  }
}

export default App;
