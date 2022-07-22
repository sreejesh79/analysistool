import React, { Component } from 'react';

import ParticipantName from './participantname';
import CheckBox from './checkbox';

import './style.scss';
import ParticipantDetails from './participantdetails';
import icoHide from "../../../../assets/images/icoHide.png";
import icoUnhide from "../../../../assets/images/icoUnhide.png"
import CookieService from "../../../../services/cookieservice";
const CookieInstance = CookieService.instance;

class VerbatimTable extends Component{
    constructor(props){
        super(props);
        this.state = {
            showScrollOnColumn: -1,
            checkAll: false,
            arrCheckbox:[],
            showEmptyRows: false,
            showEmptyColums: false,
            emptyTable: false,
            showTasks: CookieInstance.getTaskColumnStatus()
        }
        this.handleColumnmClick = this.handleColumnmClick.bind(this);
        this.handleParentCheckbox = this.handleParentCheckbox.bind(this);
        this.handleChildCheckbox = this.handleChildCheckbox.bind(this);
        this.handleOnHideColumnClick = this.handleOnHideColumnClick.bind(this);
        this.onPostIconClick = this.onPostIconClick.bind(this);
    }

    componentWillMount(){
        const bodyData = this.props.body.map(item=>{
            return {checked:false}
            });

        const TaskColumnStatus = CookieInstance.getTaskColumnStatus();
        this.setState({
            arrCheckbox: bodyData,
        });
    }

    componentDidMount(){
        // show EmptyRows only if data in table is less then viewport
        var documnetHeight = document.documentElement.getBoundingClientRect().height;
        var tBody = document.getElementsByTagName('tbody');
        const tBodyHeight = tBody[0].getBoundingClientRect().height;
        if(tBodyHeight < documnetHeight){
            this.setState({ showEmptyRows: true })
        } else if(this.props.body != '') {
            this.renderDefaultEmptyRows();
        }

        // empty table
        if(this.props.body == ''){
            this.setState({ emptyTable: true })            
        }

        // empty columns only if participant are more then 4
        if(this.props.header.length <= 5){
            this.setState({ showEmptyColums : true })
        }
    }
    scrollTo(id) {
        var scrollingDiv = document.getElementById('verbatim-table');
        var tableheader = document.getElementById('tablehead');
        var elmnt = document.getElementById(id);
        var topPos = elmnt.offsetTop;
        scrollingDiv.scrollTop = topPos - tableheader.getBoundingClientRect().height;
    }

    componentDidUpdate(prevProps){
        if(prevProps.showLiveTags!==this.props.showLiveTags) {
            const id = this.props.showLiveTags ? "live-tags" : "question-tags";
            this.scrollTo(id);
        }
        if(prevProps.body!==this.props.body){
            const checked = this.props.body.map(item=>{
                return {checked:false}
            });
            this.renderDefaultEmptyRows();
            this.setState({arrCheckbox:checked});
        }
        
    }
    
    // on parent check/unchek child gets checked/unchecked
     handleParentCheckbox(boo){
        this.props.onCheckAllRows(boo);
        if(this.state.checkAll != boo){
            const arrCheckbox = this.state.arrCheckbox.map(item=>{
                item.checked=boo;
                return item;
            });
            this.setState({
                arrCheckbox:arrCheckbox,
                checkAll:boo
            });
        }
    }

    handleOnHideColumnClick(index) {
        CookieInstance.toggleTaskColumnVisibility(!this.state.showTasks);
        this.setState({
            showTasks: !this.state.showTasks
        })

    }
    handleChildCheckbox(boo,index){
        const arrCheckbox = this.state.arrCheckbox;
        arrCheckbox[index].checked = boo;
        const checkAll = arrCheckbox.filter(item=>!item.checked).length===0
        this.props.onCheckboxCheck(index, boo);
        this.setState({
            arrCheckbox:arrCheckbox,
            checkAll: checkAll
        })
    }

    // show scroll on the column whose data is greater then viewport ht
    handleColumnmClick(columnIndex, rowIndex){
        let column = -1;
        if(this.state.showScrollOnColumn != rowIndex+"-"+columnIndex){
            column = rowIndex+"-"+columnIndex;
        }
        this.setState({ showScrollOnColumn: column  })
    }
    
    // Creating empty columns
    renderEmptyColumns(data, num = 5){
        const empty = [];
        for(let i=1; i<=num; i++) {
            if(data==="th"){
                empty.push(<th key={`empty-th-${i}`} className="empty-col"></th>);
            } else {
                empty.push(<td key={`empty-td-${i}`} className="empty-col"></td>);
            }

        }
        return empty;
    }

    // creating empty rows as per the viewport height
    renderEmptyRows(data){
        var tableDiv = document.getElementsByClassName('verbatim-table');
        var tableDivHeight = tableDiv[0].getBoundingClientRect().height;
        var tableHeaderHeight = 50;
        var scrollBarHeight = 13;
        var tableBodyHeight = tableDivHeight - tableHeaderHeight - scrollBarHeight;
        var singleRowHeight = 50;
        var emptyRowsToShow = Math.round(tableBodyHeight/50);

        var emptyRow = data.map((item)=> "");
        for(let i=1; i<=emptyRowsToShow; i++){
            this.props.body.push(emptyRow);
        }
    }

    renderDefaultEmptyRows() {
        var emptyRow = this.props.header.map((item)=> "");
        for(let i=1; i<=12; i++){
            this.props.body.push(emptyRow);
        }
    }

    // inserting data to table header
    renderParticipant(data){
        return data.map((participant, index) => {
          /*
            if (index === 1) {
                return(
                    <th key={`header-index${index}`} className={!this.state.showTasks? this.props.showCheckBoxes ? 'less-width': 'less-width-col' : ''}>
                        {
                            !this.state.showTasks ?
                                <img src={icoUnhide} alt="show-column" className="show-task" onClick={() => this.handleOnHideColumnClick(index)}/>
                            :
                                <img src={icoHide} alt="hide-column" className="hide-task" onClick={() => this.handleOnHideColumnClick(index)}/>
                        }
                        {
                            !this.state.showTasks?null : <ParticipantName key={index} name={participant[0]} group={participant[1]} city={participant[2]}/>
                        }
                    </th>
                );
            }
          */
            if(index == 0 && !this.props.showCheckBoxes) {
                return (
                    <th key={`header-index${index}`} className='maximum-width'>
                        <ParticipantName key={index} name={participant[0]} group={participant[1]} city={participant[2]}/>
                </th>
                )
            }
            return(
                <th key={`header-index${index}`}>
                    <ParticipantName key={index} name={participant[0]} group={participant[1]} city={participant[2]}/>
                </th>
            );
        })
    }
    
    // creating table header
    renderVerbitamThead(data){
        
        return(
            <thead id={"tablehead"} key="tableheader" className={this.state.stickHeader ? 'stickyHeader' : ''}>
                <tr>
                    {
                        this.props.showCheckBoxes ?
                        <th className="first-child">
                            <CheckBox
                            handleCheckbox={this.handleParentCheckbox}
                            checked={this.state.checkAll}
                            />
                        </th>
                        : null
                    }
                    { this.renderParticipant(data) }
                    { 
                        (this.state.showEmptyColums && this.props.showCheckBoxes) ?
                            this.renderEmptyColumns("th")
                        : 
                            null
                    }
                </tr>
            </thead>
        );
    }

    onPostIconClick (posts) {
        this.props.toggleModalPopup(posts);
    }

    // inserting data to table body
    renderParticipantDetails(data,rowIndex){
        return data.map((participant, index) => {
            if (index === 1 && !this.state.showTasks) {
                return(
                    <td key={`participant${rowIndex}-${index}`} className='less-width'>
                    
                </td>
                );
            }
            return(
                <td key={`participant${rowIndex}-${index}`} className={(!this.props.showCheckBoxes) ? "hide-checkbox-cell" : " "}>
                    <ParticipantDetails
                        showPostsIcon={this.props.showPostsIcon}
                        detail={(participant && participant.texts) ? participant.texts : participant}
                        linkedPosts={(participant && participant.linkedPosts) ? participant.linkedPosts.length : 0 }
                        handleClick={this.handleColumnmClick.bind(this, index, rowIndex)}
                        onPostIconClick={()=>this.onPostIconClick(participant.linkedPosts)}
                        showScroll={this.state.showScrollOnColumn ==  rowIndex + "-" + index ? true : false }
                        />
                </td>
            );
        })
    }

    // creating table body
    renderVerbitamTbody(data,index){
        const boo = this.state.arrCheckbox[index]?this.state.arrCheckbox[index].checked:false
        // const tagsId = (data[0] != "" && data[1] == "") ? "live-tags" : "question-tags";
        const tagsId = (data[0] == "") ? "live-tags" : "question-tags";
        return(
            <tr key={`tr${index}`} id={tagsId}>
             {
                 this.props.showCheckBoxes ?
                 <td key={`checkbox${index}`} className={this.props.showCheckBoxes ? "first-child":  "hide-checkbox-cell"}>
                {
                    (data[0].length===0 || !this.props.showCheckBoxes)?null:<CheckBox
                        checked={ boo }
                        handleCheckbox={(boo)=>this.handleChildCheckbox(boo,index)}
                    />
                }
                </td> : null

             }
                { this.renderParticipantDetails(data,index) }
                { 
                    (this.state.showEmptyColums && this.props.showCheckBoxes) ?
                        this.renderEmptyColumns("td")
                    :
                        null
                }
            </tr>
        );
    }

    render(){
        {
            (this.state.showEmptyRows && this.props.showCheckBoxes) ?
                this.renderEmptyRows(this.props.header)
            : 
                null
        }
        const tableBody = this.props.body.map((item, index) =>{
             return (
                      this.renderVerbitamTbody(item,index)
                  )
          })

        return(            
            <div id={"verbatim-table"} className="verbatim-table" onScroll={this.handleScroll} ref={this.props.setContentContainerRef}>	
                <table className={`gallery-table ${this.state.emptyTable ? 'empty-table' : ''}`}>
                    { this.renderVerbitamThead(this.props.header) }
                    <tbody id={"tableBody"}>
                        { tableBody }
                    </tbody>
                </table>
            </div>
        )
    }
}

export default VerbatimTable;