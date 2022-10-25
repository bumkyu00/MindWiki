import React from 'react';
import './Node.css';

export default class Node extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            can_move: false, 
            x: 60, 
            y: 40,
            orig_x: 60,
            orig_y: 40,
            click_x: 60,
            click_y: 40
        };
    }

    zoom = (e) => {
        var zoomDiff = -e.deltaY * this.zoomSpeed;
        var newZoomRatio = this.state.zoom_ratio + zoomDiff;
        newZoomRatio = newZoomRatio >= 1 ? newZoomRatio : 1;
        var newX = this.state.x + ((this.state.x - e.clientX) / this.state.zoom_ratio) * zoomDiff;
        var newY = this.state.y + ((this.state.y - e.clientY) / this.state.zoom_ratio) * zoomDiff;
        if(newX >= 0) {
            newX = 0;
        }
        if(newX <= this.frameWidth * (1 - newZoomRatio)) {
            newX = this.frameWidth * (1 - newZoomRatio);
        }
        if(newY >= 0) {
            newY = 0;
        }
        if(newY <= this.frameHeight * (1 - newZoomRatio)) {
            newY = this.frameHeight * (1 - newZoomRatio);
        }
        this.setState({
            zoom_ratio: newZoomRatio,
            x: newX,
            y: newY
        });
    }

    onMouseDownCaptureHandler = (e) => {
        this.setState({
            can_move: true,
            orig_x: this.state.x,
            orig_y: this.state.y,
            click_x: e.clientX,
            click_y: e.clientY
        })
    }

    onMouseMoveHandler = (e) => {
        if(this.state.can_move){
            var x_diff = e.clientX - this.state.click_x;
            var y_diff = e.clientY - this.state.click_y;
            this.setState({x: this.state.orig_x + x_diff, y: this.state.orig_y + y_diff});
        }
    }

    onMouseUpCapture = () => {
        this.setState({
            can_move: false,
            orig_x: this.state.x,
            orig_y: this.state.y
        })
    }

    render() {
        var node = (
        <div 
            className='node' 
            style={{left: this.state.x, top:this.state.y}}
            onMouseDownCapture={(e)=>this.onMouseDownCaptureHandler(e)}
            onMouseUpCapture={()=>this.onMouseUpCapture()}
            onMouseMove={(e)=>this.onMouseMoveHandler(e)}
            onMouseOut={(e)=>this.onMouseMoveHandler(e)}
        >
            {this.props.text}
        </div>
        );
        return node;
    }
}