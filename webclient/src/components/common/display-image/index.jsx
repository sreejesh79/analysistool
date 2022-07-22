import React, { Component } from 'react';
import './style.scss';
import Loader from '../loader';
import MediaService from '../../../services/mediaService';

class DisplayImage extends Component {
    imageUrl = null;
    _imageObjectKey = null;
    _mediaService = MediaService.instance;
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: false
        }

        // fallback condition to handle image
        if(!this.props.imageObjectKey) {
            this.imageUrl = this.props.url;
        }
        
    }
    onLoadHandler=()=> {
        this.props.imageLoaded();
        this.setState({loading:false, error: false});
    }
    onErrorHandler=(e)=> {
        this.imageUrl = "";
        this.setState({loading:false, error: true});
    }

    async componentDidMount() {
        if(this.props.imageObjectKey) {
            // this._imageObjectKey = this.props.imageObjectKey;
            this.imageUrl = await this._mediaService.generateSignedUrl(this.props.imageObjectKey);
            this.setState({loading:false, error: false});
        }

        /*if(!Utility.isValidUrl(this.imageUrl) && !this.props.imageObjectKey) {
            this.setState({loading:false, error: true});
        }*/
    }

    async componentDidUpdate() {
        if(this.props.imageObjectKey && this._imageObjectKey !== this.props.imageObjectKey) {
            this.setState({loading:true, error: false});
            this._imageObjectKey = this.props.imageObjectKey;
            this.imageUrl = await this._mediaService.generateSignedUrl(this.props.imageObjectKey);
            this.setState({loading:false, error: false});
        }
        else if(this.props.checkUpdate && this.props.url && !this.props.imageObjectKey && this.imageUrl !== this.props.url) {
            this.imageUrl = this.props.url;
            this.setState({loading:true, error: false});
        }
    }

    render() {
  
        return (
            <div className="display-image-container">
                {this.state.loading && <Loader className={"center"} />}
                {!this.state.error && <img className={this.props.style} src={this.imageUrl ? this.imageUrl: ""} 
                    onLoad={this.onLoadHandler} 
                    onError={this.onErrorHandler}
                    onClick={this.props.handleClick}/>}
                {/*this.state.error && <FaFileImage size={80}/>*/}
            </div>
        );
    }
}

export default DisplayImage;