import React from 'react';
import Node from './Node/Node';
import './Mindmap.css';
import logo from '../logo.svg';

export default class Mindmap extends React.Component {
    constructor(props) {
        super(props);
        this.frameRef = React.createRef();
        this.state = {
            zoom_ratio: 1.,
            dragged: false,
            x: 0, 
            y: 0,
            orig_x: 0,
            orig_y: 0,
            click_x: 0,
            click_y: 0,
            mouse_x: 0,
            mouse_y: 0,
        }
        window.addEventListener('mousemove', (e)=>this.boardOnMouseMoveHandler(e));
        window.addEventListener('mouseup', (e)=>this.onMouseUpCaptureHandler(e));

        this.zoomSpeed = 0.003;
    }
    adjustPositionRatio = () => {
        var width = this.frameRef.current.clientWidth * this.state.zoom_ratio;
        var height = this.frameRef.current.clientHeight * this.state.zoom_ratio;
        var xRatio = (this.state.mouse_x - this.state.x) / width;
        var yRatio = (this.state.mouse_y - this.state.y) / height;
        return [xRatio, yRatio];
    }

    onWheelHandler = (e) => {
        var width = this.frameRef.current.clientWidth;
        var height = this.frameRef.current.clientHeight;
        var ratio = this.adjustPositionRatio();
        var newZoomRatio = this.state.zoom_ratio - e.deltaY * this.zoomSpeed;
        newZoomRatio = newZoomRatio >= 1 ? newZoomRatio : 1;
        var newX = this.state.x + e.deltaY * this.zoomSpeed * ratio[0] * this.frameRef.current.clientWidth;
        var newY = this.state.y + e.deltaY * this.zoomSpeed * ratio[1] * this.frameRef.current.clientHeight;
        if(newX >= 0) {
            newX = 0;
        }
        else if(newX <= width * (1 - newZoomRatio)) {
            newX = width * (1 - newZoomRatio);
        }
        if(newY >= 0) {
            newY = 0;
        }
        else if(newY <= height * (1 - newZoomRatio)) {
            newY = height * (1 - newZoomRatio);
        }
        this.setState({
            mouse_x: e.clientX, 
            mouse_y: e.clientY,
            zoom_ratio: newZoomRatio,
            x: newX,
            y: newY
        });
    }

    frameOnMouseMoveHandler = (e) => {
        this.setState({
            mouse_x: e.clientX, 
            mouse_y: e.clientY,
        });
    }

    onMouseDownCaptureHandler = (e) => {
        this.setState({
            dragged: true,
            orig_x: this.state.x,
            orig_y: this.state.y,
            click_x: e.clientX,
            click_y: e.clientY
        })
    }

    boardOnMouseMoveHandler = (e) => {
        if(this.state.dragged){
            var newX = this.state.orig_x + (e.clientX - this.state.click_x);
            var newY = this.state.orig_y + (e.clientY - this.state.click_y);
            var width = this.frameRef.current.clientWidth;
            var height = this.frameRef.current.clientHeight;
            var zoom_ratio = this.state.zoom_ratio;
            if(newX >= 0) {
                newX = 0;
            }
            else if(newX <= width * (1 - zoom_ratio)) {
                newX = width * (1 - zoom_ratio);
            }
            if(newY >= 0) {
                newY = 0;
            }
            else if(newY <= height * (1 - zoom_ratio)) {
                newY = height * (1 - zoom_ratio);
            }
            this.setState({x: newX, y: newY});
        }
    }

    onMouseUpCaptureHandler = (e) => {
        this.setState({
            dragged: false,
            orig_x: this.state.x,
            orig_y: this.state.y
        })
    }

    render() {
        return (
            <div
                 className='frame'
                 ref={this.frameRef}
                 style={{userSelect: 'none'}}
                 onWheel={(e)=>this.onWheelHandler(e)}
                 onMouseMove={(e)=>this.frameOnMouseMoveHandler(e)}
            >
                <div
                    className='board'
                    style={{
                        left: this.state.x,
                        top: this.state.y,
                        width: 100 * this.state.zoom_ratio + '%',
                        height: 100 * this.state.zoom_ratio + '%',
                    }}
                    onMouseDownCapture={(e)=>this.onMouseDownCaptureHandler(e)}
                    onMouseUpCapture={()=>this.onMouseUpCaptureHandler()}
                >
                    <img draggable={false} src={logo}/>
                </div>
            </div>
        );
    }
}