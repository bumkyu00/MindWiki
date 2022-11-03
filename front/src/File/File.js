import React from 'react';
import Mindmap from './Mindmap/Mindmap';
import Document from './Document/Document';
import './File.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default class File extends React.Component {
    constructor(props) {
        super(props)
        this.defaultMindmapData = {
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

        this.defaultDocumentData = {
            documentText: "1"
        }

        this.state = {
            isMindmap: true,
            ...this.defaultMindmapData,
            ...this.defaultDocumentData
        }

        this.setData = this.setData.bind(this)

        this.loading = true
        this.getData()
    }

    getData = () => {
        axios(
            {
                url: '/api/file',
                method: 'get',
                params: {
                    id: 1
                }
            }
        ).then((response) => {
            console.log(response.data)
        }).catch((e) => {
            console.log(e)
        }).then(()=>this.loading = false)
    }

    findElement = (id) => {
        return this.state.elements.find((element) => element.id === id)
    }

    // _findNode = (arr, id) => {
    //     var ret = null
    //     for(let node of arr) {
    //         if(node.id === id) {
    //             ret = node
    //         }
    //         else if(ret === null){
    //             ret = this._findNode(node.children, id)
    //         }
    //     }
    //     return ret
    // }

    // findNode = (id) => {
    //     var ret = this._findNode(this.props.data.tree, id)
    //     return ret
    // }

    setData = (data) => {
        this.setState({
            ...data
        })
        this.mindmapToDocument()
    }

    _mindmapToDocument = (node, text, level) => {
        var element = this.findElement(node.id)
        // text += element.text
        // text += '/\n'
        // for(let child of node.children) {
        //     text = this._mindmapToDocument(child, text)
        // }
        text.push(<div style={{marginLeft: level * 20}}>{element.text}</div>)
        for(let child of node.children) {
            text = this._mindmapToDocument(child, text, level + 1)
        }
        return text
    }

    mindmapToDocument = () => {
        var text = []
        for(let node of this.state.tree) {
            // text += this._mindmapToDocument(node, '')
            text.push(this._mindmapToDocument(node, [], 0))
        }
        this.setState({
            documentText: text
        })
    }

    render() {
        return (
            this.loading ? <div></div> : 
            <div>
                {
                    this.state.isMindmap ? 
                    (<Mindmap
                        data={this.state}
                        setData={this.setData}
                    />) :
                    (<Document
                        data={this.state}
                        setData={this.setData}
                    />)
                }
                <Link
                    style={{
                        position: 'fixed',
                        fontSize: '100px',
                    }}
                    tabIndex='-1'
                    to='/'
                >Main</Link>
                <button
                    style={{
                        position: 'fixed',
                        right: 0,
                        fontSize: '100px',
                    }}
                    onClick={()=>this.setState({isMindmap: !this.state.isMindmap})}
                    tabIndex='-1'
                >Change</button>
            </div>
        )
    }
}