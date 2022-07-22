import React, { Component } from 'react'

import TransparentButton from '../../common/transparentbutton';
import IconText from '../../common/icontext';

import icoTag from '../../../assets/images/icoTag.png';

import './style.scss';

class AddTag extends Component{
    constructor(props){
        super(props);
        this.state  = { showInputField: false }
        this.showInputField = this.showInputField.bind(this);
    }

    showInputField(){
        this.setState({ showInputField: true })
    }

    render(){
        return(
            <div className="add-tag" onClick={this.showInputField}>
                <img src={icoTag} alt="Tag" />
                {
                    this.state.showInputField ? 
                    <div>
                        <input list="tags" name="tag" />
                        <datalist id="tags">
                            <option value="1" />
                            <option value="2" />
                            <option value="3" />
                        </datalist>
                    </div>
                    :   
                        null
                }
                <span className={this.state.showInputField ? 'add-border' : null }>Add Tag</span>
            </div>
        )
    }
}

export default AddTag;