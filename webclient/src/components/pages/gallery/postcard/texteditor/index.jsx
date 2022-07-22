import React, { Component } from 'react';

import TransparentButton from '../../../../common/transparentbutton';
import IconText from '../../../../common/icontext';
import icoDelete from '../../../../../assets/images/icoDelete.svg';
import icoClose from '../../../../../assets/images/icoClose.svg';
import icoSave from '../../../../../assets/images/icoSave.svg';
import icoEdit from '../../../../../assets/images/icoEdit.svg';

import './style.scss';

class TextEditor extends Component {
    constructor(props){
        super(props);
        this.state = {
            showOptions: false,
            description: this.props.content || "",
            readOnly: true
        }
        this.onTextareaChange = this.onTextareaChange.bind(this);
        this.addInput = this.addInput.bind(this);
        this.closeEditor = this.closeEditor.bind(this);
        this.deleteInput = this.deleteInput.bind(this);
        this.saveInput = this.saveInput.bind(this);
        this.onKeyDownEvent = this.onKeyDownEvent.bind(this);
    }

    componentDidMount() {
        if(this.refs.myTextarea){
            this.refs.myTextarea.addEventListener('keydown', this.onKeyDownEvent, false);
            this.onKeyDownEvent();
        }
    }

    componentWillReceiveProps() {
        if(this.props.content !== this.state.description) {
            this.setState({description: this.props.content})
        }
    }

    componentWillUnmount() {
        if(this.refs.myTextarea){
            this.refs.myTextarea.removeEventListener('keydown', this.onKeyDownEvent, false);
        }
    }

    onKeyDownEvent() {
        var textarea = this.refs.myTextarea;
        textarea.style.height = "1px";
        textarea.style.height = (5+textarea.scrollHeight)+"px";
    }

    onTextareaChange(e){
        this.setState({ description: e.target.value })
    }

    addInput(){
        this.setState({description: this.props.content, showOptions: true, readOnly: false}, () => {
            var textarea = this.refs.myTextarea;
            textarea.focus();
        });
    }

    closeEditor(){
        this.setState({ description: this.props.content, showOptions: false, readOnly: true })
    }

    deleteInput(){
        this.setState({
            showOptions: false,
            description: '',
            readOnly: true
        }, () => {
            this.props.updateDescription(this.state.description)
        });
        
    }

    saveInput(){
        this.props.updateDescription(this.state.description)
        this.setState({ showOptions: false, readOnly: true })
    }

    render(){
        return (
            <div className="text-editor">
                <div className="input">
                    <textarea ref="myTextarea" readOnly={this.state.readOnly} placeholder="Add Description here" onChange={this.onTextareaChange} value={this.state.description ? this.state.description : ''}></textarea>
                    {/* <div contentEditable></div> */}
                    <TransparentButton className={`${this.state.showOptions ? 'hideEdit' : ''} ${this.state.description ? '' : 'top-position'}`} onClick={this.addInput}>
                        <IconText image={icoEdit} altImgName={"Edit"}/>
                    </TransparentButton>
                </div>
                {
                    this.state.showOptions ?
                        <div className="input-options">
                            <div className="delete">
                                <TransparentButton onClick={this.deleteInput}>
                                    <IconText image={icoDelete} altImgName={"Delete"}/>
                                </TransparentButton>
                            </div>
                            <div className="close-save">
                                <TransparentButton onClick={this.closeEditor}>
                                    <IconText image={icoClose} altImgName="Close"/>
                                </TransparentButton>
                                <TransparentButton className="save" onClick={this.saveInput}>
                                    <IconText image={icoSave} altImgName="Save"/>
                                </TransparentButton>
                            </div>
                        </div>
                    :
                        null
                }
            </div>
        )
    }
}

export default TextEditor;

