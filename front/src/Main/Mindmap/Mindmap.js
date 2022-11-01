import React from 'react';
import Element from './Element/Element';
import Node from './Node/Node';
import './Mindmap.css';
import logo from '../../logo.svg';

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
            selectedId: 0,
            writingId: null,
        }
        this.origPos = []

        window.addEventListener('mousemove', (e)=>this.onMouseMoveHandler(e))
        window.addEventListener('mouseup', (e)=>this.onMouseUpCaptureHandler(e))
        // window.addEventListener('focusout', (e)=>{console.log(e)})

        this.zoomSpeed = 0.003;

        this.changeNodePosition = this.changeNodePosition.bind(this)
        this.saveOriginalPositions = this.saveOriginalPositions.bind(this)
        this.freeOriginalPositions = this.freeOriginalPositions.bind(this)
        this.changeGroupPosition = this.changeGroupPosition.bind(this)
        this.changeBoardDrag = this.changeBoardDrag.bind(this)
        this.selectNode = this.selectNode.bind(this)
        this.writeNode = this.writeNode.bind(this)
        this.setNodeText = this.setNodeText.bind(this)
    }

    findElement = (id) => {
        return this.props.data.elements.find((element) => element.id === id)
    }

    _findNode = (arr, id) => {
        var ret = null
        for(let node of arr) {
            if(node.id === id) {
                ret = node
            }
            else if(ret === null){
                ret = this._findNode(node.children, id)
            }
        }
        return ret
    }

    findNode = (id) => {
        var ret = this._findNode(this.props.data.tree, id)
        return ret
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
            node.offsetX = parentOffsetX + this.props.data.nodeWidth * 1.5
            node.offsetY = parentOffsetY + (0.5 * (node.leafSize - 1) + (sum) - middle) * this.props.data.nodeHeight * 1.5
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
        var newElements = this.props.data.elements
        for(let node of newTree) {
            var element = this.findElement(node.id)
            this._calculatePositions(node.children, newElements, element.x, element.y)
        }
        return newElements
    }

    updatePositions = () => {
        this.calculateLeafSize(this.props.data.tree)
        var newTree = this.props.data.tree.map((root) => {
            root.children = this.calculateOffsets(root.children, 0, 0)
            return root
        })
        this.props.setData({
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
        for(let node of this.props.data.tree) {
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
        var newTree = this.props.data.tree
        return this._treeInsert(newTree, parentId, insertId)
    }

    addChildNode = (parentId) => {
        var parentElement = this.props.data.elements.find((element) => element.id === parentId)
        var newElement = {
            id: this.props.data.lastId + 1, 
            x: parentElement.x, 
            y: parentElement.y, 
            width: this.props.data.nodeWidth, 
            height: this.props.data.nodeHeight,
            text: (this.props.data.lastId + 1) + ''
        }
        var newElements = this.props.data.elements
        newElements.push(newElement)
        this.props.setData({
            elements: newElements,
            tree: this.treeInsert(parentElement.id, newElement.id),
            lastId: this.props.data.lastId + 1,
            selectedId: this.props.data.lastId + 1,
            writingId: null
        })
        this.updatePositions()
    }

    changeNodePosition = (id, x, y) => {
        var newElements = this.props.data.elements.map((element) => {
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
        this.props.setData({
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
        var newElements = this.props.data.elements.map((element) => {
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
        this.props.setData({
            elements: newElements
        })

    }

    changeBoardDrag = (drag) => {
        this.props.setData({
            dragged: drag
        })
    }

    selectNode = (id) => {
        this.props.setData({
            selectedId: id,
        })
    }

    writeNode = (id) => {
        this.props.setData({
            writingId: id
        })
    }

    setNodeText = (id, text) => {
        var newElements = this.props.data.elements
        newElements.map((element) => {
            if(element.id === id) {
                element.text = text
            }
        })
        this.props.setData({
            elements: newElements
        })
    }

    onWheelHandler = (e) => {
        var newZoomRatio = this.props.data.zoomRatio - e.deltaY * this.zoomSpeed;
        newZoomRatio = newZoomRatio >= 1 ? newZoomRatio : 1;
        var newX = this.props.data.x + ((this.props.data.x - e.clientX) / this.props.data.zoomRatio) * (newZoomRatio - this.props.data.zoomRatio);
        var newY = this.props.data.y + ((this.props.data.y - e.clientY) / this.props.data.zoomRatio) * (newZoomRatio - this.props.data.zoomRatio);
        if(newX >= 0) {
            newX = 0;
        }
        if(newX <= this.props.data.frameWidth * (1 - newZoomRatio)) {
            newX = this.props.data.frameWidth * (1 - newZoomRatio);
        }
        if(newY >= 0) {
            newY = 0;
        }
        if(newY <= this.props.data.frameHeight * (1 - newZoomRatio)) {
            newY = this.props.data.frameHeight * (1 - newZoomRatio);
        }

        this.props.setData({
            zoomRatio: newZoomRatio,
            x: newX,
            y: newY,
        });
    }

    onMouseDownCaptureHandler = (e) => {
        this.props.setData({
            dragged: true,
            origX: this.props.data.x,
            origY: this.props.data.y,
            clickX: e.clientX,
            clickY: e.clientY,
        })
    }

    onMouseMoveHandler = (e) => {
        if(this.props.data.dragged){
            var newX = this.props.data.origX + (e.clientX - this.props.data.clickX);
            var newY = this.props.data.origY + (e.clientY - this.props.data.clickY);
            var zoomRatio = this.props.data.zoomRatio;
            if(newX >= 0) {
                newX = 0;
            }
            if(newX <= this.props.data.frameWidth * (1 - zoomRatio)) {
                newX = this.props.data.frameWidth * (1 - zoomRatio);
            }
            if(newY >= 0) {
                newY = 0;
            }
            if(newY <= this.props.data.frameHeight * (1 - zoomRatio)) {
                newY = this.props.data.frameHeight * (1 - zoomRatio);
            }

            this.props.setData({
                x: newX, 
                y: newY,
            });
        }
    }

    onMouseUpCaptureHandler = () => {
        this.props.setData({
            dragged: false,
            origX: this.props.data.x,
            origY: this.props.data.y,
        })
    }

    onClickHandler = (e) => {
        if(e.target.className.toString() !== 'input') {
            this.props.setData({
                writingId: null,
            })
            if(e.target.className !== 'element') {
                this.props.setData({
                    selectedId: null,
                })
            }
        }
    }

    onKeyDownCaptureHandler = (e) => {
        if(this.props.data.selectedId !== null) {
            var node = this.findNode(this.props.data.selectedId)
            if(e.key === ' '){
                if(this.props.data.writingId !== null) {
                    return
                }
                this.addChildNode(node.parentId)
                this.frameRef.current.focus()
            }
            else if(e.key === 'Tab'){
                e.preventDefault()
                this.addChildNode(this.props.data.selectedId)
                this.frameRef.current.focus()
            }
            else if(e.key === 'Backspace') {
                //remove
            }
            else if(e.key === 'Enter') {
                if(this.props.data.writingId === null) {
                    this.props.setData({
                        writingId: this.props.data.selectedId
                    })
                }
                else {
                    this.props.setData({
                        writingId: null
                    })
                }
                this.frameRef.current.focus()
            }
            else if(e.key === 'ArrowLeft') {
                if(this.props.data.writingId !== null) {
                    return
                }
                this.props.setData({
                    selectedId: node.parentId,
                })
            }
            else if(e.key === 'ArrowRight' && node.children.length > 0) {
                if(this.props.data.writingId !== null) {
                    return
                }
                this.props.setData({
                    selectedId: node.children[0].id
                })
            }
            else if(e.key === 'ArrowUp') {
                if(this.props.data.writingId !== null) {
                    return
                }
                var parent = this.findNode(node.parentId)
                var currIdx = parent.children.findIndex((child) => (child === node))
                if(currIdx === 0 || node.parentId === node.id) {
                    return
                }
                this.props.setData({
                    selectedId: parent.children[currIdx - 1].id,
                })
            }
            else if(e.key === 'ArrowDown') {
                if(this.props.data.writingId !== null) {
                    return
                }
                parent = this.findNode(node.parentId)
                currIdx = parent.children.findIndex((child) => (child === node))
                if(currIdx === parent.children.length - 1) {
                    return
                }
                this.props.setData({
                    selectedId: parent.children[currIdx + 1].id
                })
            }
        }
        
    }

    render() {
        if(this.props.data.frameWidth && this.props.data.frameHeight){
            return (
                <div
                     className='frame'
                     ref={this.frameRef}
                     style={{userSelect: 'none', position: 'absolute'}}
                     onWheel={(e)=>this.onWheelHandler(e)}
                     onMouseDownCapture={(e)=>this.onMouseDownCaptureHandler(e)}
                     onClick={(e)=>this.onClickHandler(e)}
                     onKeyDownCapture={(e)=>this.onKeyDownCaptureHandler(e)}
                     tabIndex='0'
                >
                    <div
                        className='board'
                        style={{
                            left: this.props.data.x,
                            top: this.props.data.y,
                            width: 100 * this.props.data.zoomRatio + '%',
                            height: 100 * this.props.data.zoomRatio + '%',
                        }}
                    >
                        {
                            this.props.data.elements.map((element, index) => {
                                return (
                                    <Node 
                                        key={index}
                                        id={element.id}
                                        x={element.x} 
                                        y={element.y} 
                                        width={element.width}
                                        height={element.height}
                                        text={element.text}
                                        zoomRatio={this.props.data.zoomRatio}
                                        frameWidth={this.props.data.frameWidth}
                                        frameHeight={this.props.data.frameHeight}
                                        boardX={this.props.data.x}
                                        boardY={this.props.data.y}
                                        selected={this.props.data.selectedId === element.id}
                                        writing={this.props.data.writingId === element.id}
                                        changeNodePosition={this.changeNodePosition}
                                        saveOriginalPositions={this.saveOriginalPositions}
                                        freeOriginalPositions={this.freeOriginalPositions}
                                        changeGroupPosition={this.changeGroupPosition}
                                        changeBoardDrag={this.changeBoardDrag}
                                        selectNode={this.selectNode}
                                        writeNode={this.writeNode}
                                        setText={this.setNodeText}
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
                                            strokeWidth={this.props.data.zoomRatio * 5}
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
                        left: this.props.data.x,
                        top: this.props.data.y,
                        width: 100 * this.props.data.zoomRatio + '%',
                        height: 100 * this.props.data.zoomRatio + '%',
                    }}
                >
                    <img draggable={false} src={logo} alt=''/>
                </div>
            </div>
        );
    }

    componentDidMount() {
        if(!this.props.data.frameWidth || !this.props.data.frameHeight) {
            this.props.setData({
                frameWidth: this.frameRef.current.clientWidth,
                frameHeight: this.frameRef.current.clientHeight
            })
        }
    }
}