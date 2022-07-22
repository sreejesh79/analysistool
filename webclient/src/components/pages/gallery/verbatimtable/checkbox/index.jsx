import React, {Component} from "react";

class CheckBox extends Component {
    constructor(props){
        super(props);
        this.state = {checked:false};
        this.handleCheckbox = this.handleCheckbox.bind(this);
    }

    handleCheckbox(e){
        this.setState({checked:e.target.checked})
        this.props.handleCheckbox(e.target.checked);
    }

    componentDidMount(){
        this.setState({
            checked:this.props.checked
        })
    }
    componentDidUpdate(prevProps){
        if(prevProps.checked!==this.props.checked){
            this.setState({checked:this.props.checked});
        }
    }
    render() {
        return (
            <div className="checkbox-container">
                <input type="checkbox" onChange={this.handleCheckbox} checked={this.state.checked} />
                <span className='checkmark'></span>
            </div>
        )
    }

}

export default CheckBox;