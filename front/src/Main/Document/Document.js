import React from 'react';
import './Document.css';

export default class Document extends React.Component {
    render() {
        return (
            <div 
                className='text'
                style={{position: 'absolute'}}
            >
                {this.props.data.documentText}
            </div>
        )
    }
}