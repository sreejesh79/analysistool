import React, {Component} from "react";

type Props = {
    text:string,
    image:string
}

class IconText extends Component {

    render() {
        return(
            <div className="c-button">
                <img src={this.props.image} alt={this.props.altImgName}/>
                {
                    this.props.text ?
                        <p className="c-btn-p">{this.props.text}</p>
                    :
                        null
                }                
            </div>
        );
    }

}

export default IconText;