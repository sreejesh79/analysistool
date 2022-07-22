import React, {Component} from "react";

import "./style.scss";

import Tag from '../tag/index';
import ShowMoreShowLessBtn from './showmoreshowlessbtn';

class Taggroup extends Component {
    constructor(props){
        super(props);
        this.state = {
            showButton : false,
            showHide : false
        }
        this.showLess = this.showLess.bind(this);
        this.showMore = this.showMore.bind(this);
    }

    componentDidMount(){
        this.showLess();
    }
    
    showMore(){
        let element = document.getElementById(this.props.id);
        let tagContainer = element.getElementsByClassName('tag-btn-container');
        for(let i=0; i<tagContainer.length; i++)
        tagContainer[i].classList.remove('hide')
        this.setState({
            showHide : true
        })
    }

    showLess(){
        let element = document.getElementById(this.props.id);
        let tagContainer = element.getElementsByClassName('tag-btn-container');
        if(tagContainer[0]){
            const firstElem = tagContainer[0].getBoundingClientRect();
            var left = document.querySelector('.tag-btn');
            const limitY = firstElem.top + firstElem.height * 2;
            var tillIndex = 0;
            for(let i=0; i<tagContainer.length; i++){
                if(tagContainer[i].getBoundingClientRect().top >=  limitY ){
                    tillIndex = i;
                    break;
                }          
            }
            if(tillIndex!=0){
                for(let i=tillIndex; i<tagContainer.length; i++){
                    tagContainer[i].classList.add('hide');        
                }
                this.setState({
                    showHide : false,
                    showButton: true
                }) 
            } else {
                this.setState({
                    showButton: false
                })
            }
    
        }
    }

    render() {
        const { 
            tags,
            id
        } = this.props;

        let tagsTag = tags.map((item, index) => {
            return (
                <Tag key={`tags-${index}`} name={item.name ? item.name : item.tag} />
            )
        });
        return(
            <div>
                <div className={`c-tag-group`} id={id}>
                    { tagsTag }
                </div>
                    {
                        this.state.showButton ?
                            <ShowMoreShowLessBtn
                                showHide={this.state.showHide} 
                                showLess={this.showLess}
                                showMore={this.showMore}
                            />
                        : null                   
                    }
            </div>            
        );
    }

}

export default Taggroup;
