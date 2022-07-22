import React, { Component } from 'react';

import "./style.scss";

import icoArrowUp from '../../../assets/images/arrowup.svg';
import icoArrowDown from '../../../assets/images/icoArrowDown.png';
const defaultLabel = "name";
const defaultKey = "_id";
class DropDown extends Component{
    constructor(props){
        super(props)
        this.state = {
            showList: false,
            filterText:"",
            headerTitle: this.props.title,
            allStudiesChecked: false
        }
        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.blurHandler = this.blurHandler.bind(this);
        this.itemSelected = this.itemSelected.bind(this);
        this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
    }
    componentDidMount() {
        document.addEventListener('mousedown', this.blurHandler);
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.blurHandler);
    }
    setWrapperRef(node) {
        this.wrapperRef = node;
    }

    static getDerivedStateFromProps(nextProps){
        if(!nextProps.list.length) return {headerTitle: nextProps.title}
        const count = nextProps.list.filter(a=>a.selected).length;
        if(count === 0){
            return {headerTitle: nextProps.title}
        }
        if(count === 1){
            return {headerTitle: `${count} ${nextProps.titleHelper}`}
        }
        if(count > 1){
            if(nextProps.titleHelperPlural){
                return {headerTitle: `${count} ${nextProps.titleHelperPlural}`}
            }
            return {headerTitle: `${count} ${nextProps.titleHelper}s`}
        }
    }
    blurHandler(event){
        if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
            this.setState({
                showList: false
            })
        }
    }
    handleFilterTextChange(event){
        this.setState({
            filterText: event.target.value
        })
    }
    toggleList(){
        this.setState(prevState => ({
            showList: !prevState.showList,
            filterText: ""
        }))
    }
    
    itemSelected(item) {
        const uniqueKey = this.props.uniqueKey || defaultKey;
        if(this.props.isMulti && this.props.toggleItem){
            return this.props.toggleItem(item[uniqueKey]);
        }
        if(this.props.selectSingleItem){
            this.props.selectSingleItem(item[uniqueKey]);
        }
                
    }
    renderFilterTextField(key){
        //  ref={input => input && input.focus()}
        return (<li className={this.props.selectAllHandler ? "Filter filter-with-select" :"Filter"} key={`${key}-filter-text`} >
                <input placeholder={ "Search..." } type="text" autoComplete="off" value={this.state.search} name="search" onChange={this.handleFilterTextChange} autoFocus/>
                {
                    this.props.selectAllHandler ? <span onClick={()=>this.props.selectAllHandler(this.props.keys)} className={`check-box ${this.props.selectAll? 'checked' : ''}`}></span> : null
                }
            </li>
            
            )
    }
    renderList(){
        const label = this.props.label || defaultLabel;
        const uniqueKey = this.props.uniqueKey || defaultKey;
        let list = this.props.list;
        if(this.state.filterText.length > 0){
            list = list.filter(i=>i[label].toLowerCase().indexOf(this.state.filterText.toLowerCase())!==-1)
        }
        return list.map((item) => {
            let className = item.selected?"dd-list-item selected":"dd-list-item"
            return (<li className={className} key={item[uniqueKey]} onClick={() => this.itemSelected(item)}>{item[label]}</li>)
        })
    }
    render(){
        const{needFilter, keys} = this.props;
        const{showList, headerTitle} = this.state
        return(
          <div className="dd-wrapper" key={`dd-${keys}`} ref={this.setWrapperRef} >
            <div className="dd-header" onClick={() => this.toggleList()}>
                <div className="dd-header-title">{headerTitle}</div>
                {showList
                    ? <img src={icoArrowUp} className='caret' alt="Hide" />
                    :
                    <img src={icoArrowDown} className='caret' alt="Show"/>
                }
            </div>
            {
                showList && <ul className="dd-list">
                    {
                        needFilter ? this.renderFilterTextField(`dd-${keys}`) : null
                    }
                    {
                        this.renderList()
                    }
                </ul>
            }
          </div>
        )
      }
}

export default DropDown;