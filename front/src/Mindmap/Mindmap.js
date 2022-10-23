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
    }

    adjustPositionRatio = () => {
        var width = this.frameRef.current.clientWidth * this.state.zoom_ratio;
        var height = this.frameRef.current.clientHeight * this.state.zoom_ratio;
        console.log(this.state.mouse_x, this.state.x);
        var xRatio = (this.state.mouse_x - this.state.x) / width;
        var yRatio = (this.state.mouse_y - this.state.y) / height;
        // console.log(xRatio, yRatio);
        return [xRatio, yRatio];
    }

    onWheelHandler = (e) => {
        var ratio = this.adjustPositionRatio();
        console.log(ratio);
        this.setState({
            mouse_x: e.clientX, 
            mouse_y: e.clientY,
            zoom_ratio: this.state.zoom_ratio + e.deltaY * 0.001,
            x: this.state.x - e.deltaY * 0.001 * 0.5 * this.frameRef.current.clientWidth,
            y: this.state.y - e.deltaY * 0.001 * 0.5 * this.frameRef.current.clientHeight
        });
    }

    frameOnMouseMoveHandler = (e) => {
        this.setState({mouse_x: e.clientX, mouse_y: e.clientY});
        // console.log(this.state.mouse_x, this.state.mouse_y);
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
            var new_x = this.state.orig_x + e.clientX - this.state.click_x;
            var new_y = this.state.orig_y + e.clientY - this.state.click_y;
            // if(new_x >= 0) {
            //     new_x = 0;
            // }
            // if(new_y >= 0) {
            //     new_y = 0;
            // }
            this.setState({x: new_x, y: new_y});
        }
    }

    onMouseUpCapture = () => {
        this.setState({
            dragged: false,
            orig_x: this.state.x,
            orig_y: this.state.y
        })
    }

    render() {
        // console.log(this.state.x, this.state.y);
        return (
            <div
                 className='frame'
                 ref={this.frameRef}
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
                        // transform: `scale(${this.state.zoom_ratio})`,
                        // transformOrigin: `${this.state.mouse_x - this.state.x} ${this.state.mouse_y - this.state.y}`
                    }}
                    onMouseDownCapture={(e)=>this.onMouseDownCaptureHandler(e)}
                    onMouseUpCapture={()=>this.onMouseUpCapture()}
                    onMouseMove={(e)=>this.boardOnMouseMoveHandler(e)}
                >
                    <img draggable={false} src={logo}/>
                </div>
                {/* <Node text='hihi'></Node> */}
            </div>
        );
    }
}