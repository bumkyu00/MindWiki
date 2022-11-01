import React from 'react';
import './Element.css';

export default class Element extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dragged: false,
            origX: this.props.x,
            origY: this.props.y,
            clickX: this.props.x,
            clickY: this.props.y,
        }
        window.addEventListener('mousemove', (e)=>this.onMouseMoveHandler(e))
        window.addEventListener('mouseup', (e)=>this.onMouseUpCaptureHandler(e))
    }

    _absoluteToPercentX = (abX) => {
        return (abX - this.props.boardX) / (this.props.frameWidth * this.props.zoomRatio) * 100
    }

    _absoluteToPercentY = (abY) => {
        return (abY - this.props.boardY) / (this.props.frameHeight * this.props.zoomRatio) * 100
    }

    onMouseDownCaptureHandler = (e) => {
        this.props.changeBoardDrag(false)
            this.setState({
                dragged: true,
                origX: this.props.x,
                origY: this.props.y,
                clickX: this._absoluteToPercentX(e.clientX),
                clickY: this._absoluteToPercentY(e.clientY),
            });
            this.props.saveOriginalPositions(this.props.id)
    }

    onMouseMoveHandler = (e) => {
        if(this.state.dragged && !this.props.writing){
            this.props.changeBoardDrag(false)
            // var newX = this.state.origX + (this._absoluteToPercentX(e.clientX) - this.state.clickX);
            // var newY = this.state.origY + (this._absoluteToPercentY(e.clientY) - this.state.clickY);
            // if(newX < 0) {
            //     newX = 0;
            // }
            // if(newX > 100 - this.props.width) {
            //     newX = 100 - this.props.width;
            // }
            // if(newY < 0) {
            //     newY = 0;
            // }
            // if(newY > 100 - this.props.height) {
            //     newY = 100 - this.props.height;
            // }
            this.props.changeGroupPosition(
                (this._absoluteToPercentX(e.clientX) - this.state.clickX), 
                (this._absoluteToPercentY(e.clientY) - this.state.clickY)
            )
        }
    }

    onMouseUpCaptureHandler = () => {
        this.setState({
            dragged: false,
            origX: this.props.x,
            origY: this.props.y,
        })
        this.props.freeOriginalPositions()
    }

    onClickHandler = () => {
        this.props.selectNode(this.props.id)
    }

    onDoubleClickHandler = () => {
        this.props.writeNode(this.props.id)
    }

    inputHandler = (e) => {
        this.props.setText(this.props.id, e.target.value)
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
                fontSize: this.props.zoomRatio * this.props.frameWidth * 0.0003 + 'rem',
                display: 'block',
                textOverflow: 'ellipsis',
                border: this.props.zoomRatio * 1 + 'px solid ' + (this.props.selected ? 'blue' : 'black'),
                borderRadius: this.props.zoomRatio * 10,
                boxSizing: 'border-box'
            }}
            onMouseDownCapture={(e)=>this.onMouseDownCaptureHandler(e)}
            onClick={()=>this.onClickHandler()}
            onDoubleClick={()=>this.onDoubleClickHandler()}
        >
            {this.props.writing ?
                <input 
                    className='input'
                    type='text' 
                    autoFocus
                    value={this.props.text}
                    onChange={(e)=>this.inputHandler(e)}
                    style={{
                        position: 'relative',
                        top: '5%',
                        width: '90%',
                        height: '40%',
                        fontSize: '50%',
                    }}
                />
                : this.props.text
                }
        </div>
        );
    }

    // componentDidUpdate() {
    //     if(!this.props.selected && this.state.writing) {
    //         console.log(this.props.selected)
    //         this.setState({
    //             writing: false
    //         })
    //     }
    // }

}