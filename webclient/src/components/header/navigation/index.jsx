import React, { Component } from 'react';
// import { Link } from 'react-router-dom';

class Navigation extends Component {
    render(){
        return (
            <nav>
                <ul>
                    <li>
                        <span className="capitalize">Welcome {this.props.firstName + " " + this.props.lastName }</span>
                    </li>
                    <li>
                        <a href="#" title="About LookLook Analysis">About LookLook Analysis</a>
                    </li>
                    <li>
                        <span className="cursor" onClick={this.props.backToCms}>Back to Portal</span>
                    </li>
                    {
                        this.props.showDashboard?<li>
                            <span className="cursor" onClick={()=>this.props.gotolink('dashboard')}>Dashboard</span>
                        </li>:null
                    }
                    {
                        this.props.showSearch?<li>
                            <span className="cursor" onClick={()=>this.props.gotolink('search')}>Search</span>
                        </li>:null
                    }
                    <li>
                        <span className="cursor" onClick={this.props.logout}>Logout</span>
                    </li>
                </ul>
            </nav>
        )
    }
}

export default Navigation;