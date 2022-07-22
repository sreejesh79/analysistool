import React, { Component } from "react";
import { Link } from "react-router-dom";

import FooterLogo from "../../assets/images/footer_logo.png";

import "./style.scss";

class Footer extends Component {
  render(){
	  return(
  	  <div className="footer">
        <ul>
          <li>
            <a href="#" title="About Us">About Us</a>
          </li>
          <li>
            <a href="#" title="Privacy Policy">Privacy Policy</a>
          </li>
          <li>
            <a href="#" title="Terms of Service">Terms of Service</a>
          </li>
        </ul>
        <a href="#" title="Look Look">
          <img src={FooterLogo} alt="Look Look" />
        </a>
      </div>
    );
  }
}

export default Footer;