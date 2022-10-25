import React from 'react';
import Node from './Node/Node';
import './Mindmap.css';
import logo from '../logo.svg';

export default class Mindmap extends React.Component {
    constructor(props) {
        super(props);
        this.frameRef = React.createRef();
        this.state = {
            zoom_ratio: 1.
        }
        // window.addEventListener('mousemove', (e)=>this.boardOnMouseMoveHandler(e));
        // window.addEventListener('mouseup', (e)=>this.onMouseUpCaptureHandler(e));

        this.frameWidth = null;
        this.frameHeight = null;
        this.zoomSpeed = 0.003;
    }

    

    render() {
        return (
            <div
                 className='board'
                 ref={this.frameRef}
                 style={{userSelect: 'none'}}
            >
            </div>
        );
    }
}