import React from 'react';
import './Document.css';

export default class Document extends React.Component {
    render() {
        return (
            <div 
                className='text'
                style={{position: 'absolute', top: '110px'}}
            >
                {this.props.data.documentText}
            </div>
        )
    }
}