import React, { Component } from 'react';

import './style.scss';

class TagButton extends Component{
    constructor(props) {
        super(props);
        this.state = {
            checked: false
        }
        this.toggleTag = this.toggleTag.bind(this);
    }

    toggleTag(e){
        e.preventDefault();
        e.stopPropagation();
        let checked = !this.state.checked;
        this.setState({ checked: checked })
        this.props.toggleTag(checked);
    }

    componentWillMount() {
        this.setState({
            checked: this.props.selected
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.checked != this.props.selected) {
            this.setState({
                checked: this.props.selected
            })
        }
    }

    render(){
        return(
            <button className="filtered-tag-btn" onClickCapture={this.toggleTag}>
                <span className="filtered-tag-name">{this.props.content}</span>
                <span className={`check-box ${this.state.checked? 'checked' : ''}`}></span>
            </button>
        )
    }
}

export default TagButton;