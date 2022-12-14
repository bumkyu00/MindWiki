import React from 'react';
import Element from './Element/Element';
import Node from './Node/Node';
import './Mindmap.css';
import logo from '../logo.svg';

export default class Mindmap extends React.Component {
    constructor(props) {
        super(props)
        this.frameRef = React.createRef()
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
                {id:0, x:50, y:50, width: 2, height: 2, text:'0'},
            ],
            tree:[
                {id: 0, parentId: 0, children: [], leafSize: 1, offsetX: 0, offsetY: 0}
            ],
            nodeWidth: 2,
            nodeHeight: 2,
            lastId: 0,
            selectedId: 0
        }
        this.origPos = []

        window.addEventListener('mousemove', (e)=>this.onMouseMoveHandler(e))
        window.addEventListener('mouseup', (e)=>this.onMouseUpCaptureHandler(e))

        this.zoomSpeed = 0.003;

        this.changeNodePosition = this.changeNodePosition.bind(this)
        this.saveOriginalPositions = this.saveOriginalPositions.bind(this)
        this.freeOriginalPositions = this.freeOriginalPositions.bind(this)
        this.changeGroupPosition = this.changeGroupPosition.bind(this)
        this.changeBoardDrag = this.changeBoardDrag.bind(this)
        this.selectNode = this.selectNode.bind(this)

    }

    findElement = (id) => {
        return this.state.elements.find((element) => element.id === id)
    }

    findNode = (id) => {
        var queue = [this.state.tree[0]]
        while(queue.length > 0) {
            var tmp = queue.pop()
            if(tmp.id === id) {
                return tmp
            }
            else {
                queue.push(...tmp.children)
            }
        }
        return null
    }

    calculateLeafSize = (arr) => {
        var sum = 0
        for(let node of arr) {
            node.leafSize = this.calculateLeafSize(node.children)
            sum += node.leafSize
        }
        return sum === 0 ? 1 : sum
    }

    calculateOffsets = (arr, parentOffsetX, parentOffsetY) => {
        var middle = 0
        for(let node of arr) {
            middle += node.leafSize
        }
        middle = 0.5 * (middle - 1)
        var sum = 0
        for(let node of arr) {
            node.offsetX = parentOffsetX + this.state.nodeWidth * 1.5
            node.offsetY = parentOffsetY + (0.5 * (node.leafSize - 1) + (sum) - middle) * this.state.nodeHeight * 1.5
            sum += node.leafSize
            this.calculateOffsets(node.children, node.offsetX, node.offsetY)
        }
        return arr
    }

    _calculatePositions = (arr, newElements, rootX, rootY) => {
        for(let node of arr) {
            var idx = newElements.findIndex(element => element.id === node.id)
            newElements[idx].x = rootX + node.offsetX
            newElements[idx].y = rootY + node.offsetY
            this._calculatePositions(node.children, newElements, rootX, rootY)
        }
    }

    calculatePositions = (newTree) => {
        var newElements = this.state.elements
        for(let node of newTree) {
            var element = this.findElement(node.id)
            this._calculatePositions(node.children, newElements, element.x, element.y)
        }
        return newElements
    }

    updatePositions = () => {
        this.calculateLeafSize(this.state.tree)
        var newTree = this.state.tree.map((root) => {
            root.children = this.calculateOffsets(root.children, 0, 0)
            return root
        })
        this.setState({
            elements: this.calculatePositions(newTree),
            tree: newTree,
        })
    }

    _generateLines = (lines, node) => {
        for(let child of node.children) {
            var p1 = this.findElement(node.id)
            var p2 = this.findElement(child.id)
            lines.push([
                p1.x + p1.width *0.5, 
                p1.y + p1.height * 0.5, 
                p2.x + p2.width * 0.5, 
                p2.y + p2.height * 0.5
            ])
            this._generateLines(lines, child)
        }
    }

    generateLines = () => {
        var lines = []
        for(let node of this.state.tree) {
            this._generateLines(lines, node)
        }
        return lines
    }

    _treeInsert = (arr, parentId, insertId) => {
        for(let node of arr) {
            if(node.id === parentId) {
                node.children.push({
                    id: insertId, 
                    parentId:node.id , 
                    children: [], 
                    leafSize: 1, 
                    offsetX: 0, 
                    offsetY: 0, 
                })
                return arr
            }
            this._treeInsert(node.children, parentId, insertId)
        }
        return arr
    }

    treeInsert = (parentId, insertId) => {
        var newTree = this.state.tree
        return this._treeInsert(newTree, parentId, insertId)
    }

    addChildNode = (parentId) => {
        var parentElement = this.state.elements.find((element) => element.id === parentId)
        var newElement = {
            id: this.state.lastId + 1, 
            x: parentElement.x, 
            y: parentElement.y, 
            width: this.state.nodeWidth, 
            height: this.state.nodeHeight,
            text: (this.state.lastId + 1) + ''
        }
        var newElements = this.state.elements
        newElements.push(newElement)
        this.setState({
            elements: newElements,
            tree: this.treeInsert(parentElement.id, newElement.id),
            lastId: this.state.lastId + 1,
            selectedId: this.state.lastId + 1
        })
        this.updatePositions()
    }

    changeNodePosition = (id, x, y) => {
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

    // calculateGroupSize = (id) => {
    //     var maxX = 0, maxY = 0
    //     var node = this.findNode(id)
    //     var element = this.findElement(id)
        
    // }

    saveOriginalPositions = (id) => {
        var node = this.findNode(id)
        var queue = []
        queue.push(node)
        while(queue.length > 0) {
            var tmp = queue.pop()
            var element = this.findElement(tmp.id)
            this.origPos.push([tmp.id, element.x, element.y])
            queue.push(...tmp.children)
        }
    }

    freeOriginalPositions = () => {
        this.origPos = []
    }

    changeGroupPosition = (xDiff, yDiff) => {
        var newElements = this.state.elements.map((element) => {
            for(let pos of this.origPos) {
                if(pos[0] === element.id) {
                    return {
                        ...element,
                        x: pos[1] + xDiff,
                        y: pos[2] + yDiff
                    }
                }
            }
            return element
        })
        this.setState({
            elements: newElements
        })

    }

    changeBoardDrag = (drag) => {
        this.setState({
            dragged: drag
        })
    }

    selectNode = (id) => {
        this.setState({
            selectedId: id
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

    onClickHandler = (e) => {
        if(e.target.className !== 'element') {
            this.setState({
                selectedId: null
            })
        }
    }

    onKeyDownCaptureHandler = (e) => {
        if(e.key === 'Enter' && this.state.selectedId !== null){
            this.addChildNode(this.findNode(this.state.selectedId).parentId)
        }
        else if(e.key === 'Tab' && this.state.selectedId !== null){
            e.preventDefault()
            this.addChildNode(this.state.selectedId)
        }
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
                     onClick={(e)=>this.onClickHandler(e)}
                     onKeyDownCapture={(e)=>this.onKeyDownCaptureHandler(e)}
                     tabIndex='0'
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
                        {
                            this.state.elements.map((element, index) => {
                                return (
                                    <Node 
                                        key={index}
                                        id={element.id}
                                        x={element.x} 
                                        y={element.y} 
                                        width={element.width}
                                        height={element.height}
                                        text={element.text}
                                        zoomRatio={this.state.zoomRatio}
                                        frameWidth={this.state.frameWidth}
                                        frameHeight={this.state.frameHeight}
                                        boardX={this.state.x}
                                        boardY={this.state.y}
                                        selected={this.state.selectedId === element.id}
                                        changeNodePosition={this.changeNodePosition}
                                        saveOriginalPositions={this.saveOriginalPositions}
                                        freeOriginalPositions={this.freeOriginalPositions}
                                        changeGroupPosition={this.changeGroupPosition}
                                        changeBoardDrag={this.changeBoardDrag}
                                        selectNode={this.selectNode}
                                    />
                                );
                            })
                        }
                        {/* <img draggable={false} src={logo} alt=''/> */}
                        <svg width='100%' height='100%'>
                            {
                                this.generateLines().map((line, index) => {
                                    return (
                                        <line 
                                            key={index}
                                            x1={line[0] + '%'} y1={line[1] + '%'}
                                            x2={line[2] + '%'} y2={line[3] + '%'}
                                            stroke='black' 
                                            strokeWidth={this.state.zoomRatio * 5}
                                        />
                                    )
                                })
                            }
                        </svg>
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
                    <img draggable={false} src={logo} alt=''/>
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