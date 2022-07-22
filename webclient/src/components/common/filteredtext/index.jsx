import React, { Component } from 'react';

// import icoArrowUp from '../../../../assets/images/arrowup.svg';
// import icoArrowDown from '../../../../assets/images/icoArrowDown.png';

import icoArrowUp from '../../../assets/images/arrowup.svg';
import icoArrowDown from '../../../assets/images/icoArrowDown.png';

import './style.scss';

class FilteredText extends Component{
    
    render(){
        const { showIcon, filterText } = this.props;
        return(
            <div className="filtered-text-container">
                <p>You have selected {filterText}.</p>
                {
                    showIcon ? <img src={icoArrowDown} className='show-filtered-data disabled' /> : (
                        this.props.expandResult ?
                        <img src={icoArrowUp} className={'hide-filtered-data'} alt="Hide" onClick={this.props.collapseFilteredResult} />
                    :
                        <img src={icoArrowDown} className={'show-filtered-data'} alt="Show" onClick={this.props.expandFilteredResult} />
                    )
                    
                }
            </div>
        )      
    }
}

export default FilteredText;