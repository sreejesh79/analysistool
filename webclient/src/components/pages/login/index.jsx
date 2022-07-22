// @flow
import React, {Component} from "react";
import { Link, Redirect } from "react-router-dom";

import AuthService from "../../../services/authservice";
import AuthServerService from "../../../services/auth-server.service";
import CookieService from "../../../services/cookieservice";

import Header from "../../header";
import Welcome from "../../common/welcome";
import PrivacyPolicy from '../../common/privacypolicypopup';

import "./style.scss";

let _credentials: any = {username: "",password:""};
class Login extends Component {
  constructor(props: Object) {
    super(props);
    this.state = { 
      username: false,
      password: false,
      showLogin: false,
      isFetching: true,
      error_msg: '',
      showPrivacyPolicy: false
    }
    _credentials = {username: "",password:""}
    this.login = this.login.bind(this);
    this.handleChange = this.handleChange.bind(this)
    this.togglePrivacyPolicyModal = this.togglePrivacyPolicyModal.bind(this);
    this.onPrivacyPolicyAgreeClick = this.onPrivacyPolicyAgreeClick.bind(this);
  }

  togglePrivacyPolicyModal () {
    this.setState({
      showPrivacyPolicy: !this.state.showPrivacyPolicy
    })
  }

  async onPrivacyPolicyAgreeClick () {
    const response = await AuthService.instance.acceptPrivacyPolicy(_credentials.username);
    CookieService.instance.saveUser(response);
    const { history } = this.props;
    if(history.location.state && history.location.state.redirectTo) {
      return history.push(history.location.state.redirectTo);
    } else {
      return history.push("/dashboard");
    }
  }

  async componentDidMount(){
    // console.log("STATE", this.state, this.props);
    // console.log("componentDidMount login mounted");
    const t = await this.checkIfValidUser();
  }

  async checkIfValidUser() {
    const user: any = CookieService.instance.user;
    let check = false;
    if (user.email && user.email != "") {
      if(user.token === ""){
        await AuthServerService.init()
        await AuthServerService.wait(50);
        user.token = AuthServerService.token;
      }
      const response = await AuthService.instance.validateToken(user);
      if(response._error){
        check = true;
      }
    } else {
      check = true
    }
    this.setState({
      showLogin: check,
      isFetching: false
    })
  }

  handleChange (event: any){
    _credentials[event.target.name]= event.target.value.trim();
    this.setState({
      username: _credentials.username==="",
      password: _credentials.password===""
    })
  }

  async login (event: any){
    event.preventDefault();
    // Validation
    // console.log("props.location", this.props.location.state.redirectTo);
    this.setState({
      username: _credentials.username==="",
      password: _credentials.password===""
    })
    if(_credentials.username!=="" &&  _credentials.password!==""){
      let authService = AuthService.instance;
      const response: any = await authService.login(_credentials.username, _credentials.password);
      console.log(response);
      if(response._error){
        // console.log(response._body);
        this.setState({ error_msg: response._body });
      } else {
        if( response._body.pp_accepted) {
          CookieService.instance.saveUser(response._body);
          const { history } = this.props;
          console.log("login redirectionproips: ", this.props);
          if(history.location.state && history.location.state.redirectTo) {
            console.log("redirecting to:", history.location);
            return history.push(history.location.state.redirectTo);
          } else {
            return history.push("/dashboard");
          }
        } else {
          this.togglePrivacyPolicyModal();
        }        
      }
    }

  } 
  isLoggedIn(): boolean{
    if(!this.state.showLogin) {
      return <Redirect to="/dashboard" />;
    } else {
      return this.renderLogin();
    }
  }

  renderLogin() {
    return (
      <div className='app-container'>
          <Header />
          <div className="login-wrapper">
            <div className="login">
            < Welcome />
            <hr/>
              <h2>Login</h2>
              <div className="login-form">
                <div>
                  <label>Email</label>
                  <input type="text" placeholder="hello@looklookapp.com" name="username" onChange={this.handleChange} className={this.state.username ? 'error' : ""} />
                </div>
                <div>
                  <label>Password</label>
                  <input type="password" placeholder="Password" name="password" onChange={this.handleChange} className={this.state.password ? 'error' : ""} />
                </div>
                <button type="submit" onClick={this.login}>Login</button>
                <div className="error">
                  { this.state.error_msg }
                </div>
              </div>
            </div>
              {
                this.state.showPrivacyPolicy ? <PrivacyPolicy closePrivacyPolicy={() => this.togglePrivacyPolicyModal()} onAgreeClick={() => this.onPrivacyPolicyAgreeClick()}/> : null
              } 
          </div>
          <div className="login-footer"></div>
        </div>
      )
  }

  render() {
    return !this.state.isFetching ? this.isLoggedIn() : null;
  }
}

export default Login;