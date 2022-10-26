import React from 'react';
import Element from './Element/Element';
import Node from './Node/Node';
import './Mindmap.css';
import logo from '../logo.svg';

export default class Mindmap extends React.Component {
    constructor(props) {
        super(props);
        this.frameRef = React.createRef();
        this.state = {
            frameWidth: null,
            frameHeight: null,
            zoomRatio: 1.,
            x: 0, 
            y: 0,
            dragged: false,
            origX: 0,
            origY: 0,
            clickX: 0,
            clickY: 0,
            elements: [
                {id:0, x:50, y:50, text:'1111'},
            ],
            tree:[
                {id: 0, parentId: null, children: []}
            ],
            lastId: 0
        }
        window.addEventListener('mousemove', (e)=>this.onMouseMoveHandler(e));
        window.addEventListener('mouseup', (e)=>this.onMouseUpCaptureHandler(e));

        this.zoomSpeed = 0.003;

        this.changeChildPosition = this.changeChildPosition.bind(this);
        this.changeParentDrag = this.changeParentDrag.bind(this);
    }

    _treeInsert = (newTree, parentId, insertId) => {
        for(let node of newTree) {
            if(node.id === parentId) {
                node.children.push({id: insertId, children: []})
                return newTree
            }
            this._treeInsert(node.children, parentId, insertId)
        }
        return newTree
    }

    treeInsert = (parentId, insertId) => {
        var newTree = this.state.tree
        return this._treeInsert(newTree, parentId, insertId)
    }

    addChildNode = (parentId) => {
        var parentElement = this.state.elements.find((element) => element.id === parentId)
        var newElement = {id: this.state.lastId + 1, x: parentElement.x + 5, y: parentElement.y + 5, text: this.state.lastId + 1 + ''}
        var newElements = this.state.elements
        newElements.push(newElement)
        this.setState({
            elements: newElements,
            tree: this.treeInsert(parentElement.id, newElement.id),
            lastId: this.state.lastId + 1
        })
    }

    changeChildPosition = (id, x, y) => {
        var newElements = this.state.elements.map((element) => {
            if(element.id === id) {
                return {
                    ...element,
                    x: x,
                    y: y
                }
            }
            else {
                return element
            }
        })
        this.setState({
            elements: newElements
        })
    }

    changeParentDrag = (drag) => {
        this.setState({
            dragged: drag
        })
    }

    onWheelHandler = (e) => {
        var newZoomRatio = this.state.zoomRatio - e.deltaY * this.zoomSpeed;
        newZoomRatio = newZoomRatio >= 1 ? newZoomRatio : 1;
        var newX = this.state.x + ((this.state.x - e.clientX) / this.state.zoomRatio) * (newZoomRatio - this.state.zoomRatio);
        var newY = this.state.y + ((this.state.y - e.clientY) / this.state.zoomRatio) * (newZoomRatio - this.state.zoomRatio);
        if(newX >= 0) {
            newX = 0;
        }
        if(newX <= this.state.frameWidth * (1 - newZoomRatio)) {
            newX = this.state.frameWidth * (1 - newZoomRatio);
        }
        if(newY >= 0) {
            newY = 0;
        }
        if(newY <= this.state.frameHeight * (1 - newZoomRatio)) {
            newY = this.state.frameHeight * (1 - newZoomRatio);
        }

        this.setState({
            zoomRatio: newZoomRatio,
            x: newX,
            y: newY,
        });
    }

    onMouseDownCaptureHandler = (e) => {
        this.setState({
            dragged: true,
            origX: this.state.x,
            origY: this.state.y,
            clickX: e.clientX,
            clickY: e.clientY,
        })
    }

    onMouseMoveHandler = (e) => {
        if(this.state.dragged){
            var newX = this.state.origX + (e.clientX - this.state.clickX);
            var newY = this.state.origY + (e.clientY - this.state.clickY);
            var zoomRatio = this.state.zoomRatio;
            if(newX >= 0) {
                newX = 0;
            }
            if(newX <= this.state.frameWidth * (1 - zoomRatio)) {
                newX = this.state.frameWidth * (1 - zoomRatio);
            }
            if(newY >= 0) {
                newY = 0;
            }
            if(newY <= this.state.frameHeight * (1 - zoomRatio)) {
                newY = this.state.frameHeight * (1 - zoomRatio);
            }

            this.setState({
                x: newX, 
                y: newY,
            });
        }
    }

    onMouseUpCaptureHandler = () => {
        this.setState({
            dragged: false,
            origX: this.state.x,
            origY: this.state.y,
        })
    }

    render() {
        if(this.state.frameWidth && this.state.frameHeight){
            return (
                <div
                     className='frame'
                     ref={this.frameRef}
                     style={{userSelect: 'none'}}
                     onWheel={(e)=>this.onWheelHandler(e)}
                     onMouseDownCapture={(e)=>this.onMouseDownCaptureHandler(e)}
                >
                    <div
                        className='board'
                        style={{
                            left: this.state.x,
                            top: this.state.y,
                            width: 100 * this.state.zoomRatio + '%',
                            height: 100 * this.state.zoomRatio + '%',
                        }}
                    >
                        {this.state.elements.map((element) => {
                        return (
                            <Node 
                                id={element.id}
                                x={element.x} 
                                y={element.y} 
                                width={5}
                                height={5}
                                text={element.text}
                                zoomRatio={this.state.zoomRatio}
                                frameWidth={this.state.frameWidth}
                                frameHeight={this.state.frameHeight}
                                boardX={this.state.x}
                                boardY={this.state.y}
                                changeChildPosition={this.changeChildPosition}
                                changeParentDrag={this.changeParentDrag}
                            />
                        );
                    })}
                        <img draggable={false} src={logo}/>
                    </div>
                </div>
            );
        }
        return (
            <div
                 className='frame'
                 ref={this.frameRef}
                 style={{userSelect: 'none'}}
                 onWheel={(e)=>this.onWheelHandler(e)}
                 onMouseDownCapture={(e)=>this.onMouseDownCaptureHandler(e)}
            >
                <div
                    className='board'
                    style={{
                        left: this.state.x,
                        top: this.state.y,
                        width: 100 * this.state.zoomRatio + '%',
                        height: 100 * this.state.zoomRatio + '%',
                    }}
                >
                    <img draggable={false} src={logo}/>
                </div>
            </div>
        );
    }

    componentDidMount() {
        if(!this.state.frameWidth || !this.state.frameHeight) {
            this.setState({
                frameWidth: this.frameRef.current.clientWidth,
                frameHeight: this.frameRef.current.clientHeight
            })
        }
    }
}