import React from 'react';
import './Node.css';

export default class Node extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            can_move: false, 
            x: 600, 
            y: 400,
            orig_x: 600,
            orig_y: 400,
            click_x: 600,
            click_y: 400
        };
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
            {this.state.can_move.toString()}
        </div>
        );
        return node;
    }
}