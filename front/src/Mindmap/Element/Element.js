import React from 'react';
import './Element.css';

export default class Element extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dragged: false,
            origX: this.props.x,
            origY: this.props.y,
            clickX: this.props.x,
            clickY: this.props.y
        }
        window.addEventListener('mousemove', (e)=>this.onMouseMoveHandler(e));
        window.addEventListener('mouseup', (e)=>this.onMouseUpCaptureHandler(e));
    }

    _absoluteToPercentX = (abX) => {
        return (abX - this.props.boardX) / (this.props.frameWidth * this.props.zoomRatio) * 100
    }

    _absoluteToPercentY = (abY) => {
        return (abY - this.props.boardY) / (this.props.frameHeight * this.props.zoomRatio) * 100
    }

    onMouseDownCaptureHandler = (e) => {
        this.props.changeParentDrag(false)
        this.setState({
            dragged: true,
            origX: this.props.x,
            origY: this.props.y,
            clickX: this._absoluteToPercentX(e.clientX),
            clickY: this._absoluteToPercentY(e.clientY),
        });
    }

    onMouseMoveHandler = (e) => {
        if(this.state.dragged){
            this.props.changeParentDrag(false)
            var newX = this.state.origX + (this._absoluteToPercentX(e.clientX) - this.state.clickX);
            var newY = this.state.origY + (this._absoluteToPercentY(e.clientY) - this.state.clickY);
            if(newX < 0) {
                newX = 0;
            }
            if(newX > 100 - this.props.width) {
                newX = 100 - this.props.width;
            }
            if(newY < 0) {
                newY = 0;
            }
            if(newY > 100 - this.props.height) {
                newY = 100 - this.props.height;
            }
            this.props.changeChildPosition(this.props.id, newX, newY)
        }
    }

    onMouseUpCaptureHandler = () => {
        this.setState({
            dragged: false,
            origX: this.props.x,
            origY: this.props.y,
        })
    }

    render() {
        return (
        <div 
            className='element' 
            style={{
                left: this.props.x + '%', 
                top: this.props.y + '%',
                width: this.props.width + '%',
                height: this.props.height + '%',
                fontSize: this.props.zoomRatio * 50
            }}
            onMouseDownCapture={(e)=>this.onMouseDownCaptureHandler(e)}
        >
            {this.props.text}
        </div>
        );
    }

}