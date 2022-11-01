import React from 'react';
import Mindmap from '../Mindmap/Mindmap';
import Document from '../Document/Document';
import './Main.css';

export default class Main extends React.Component {
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

        this.state = {
            isMindmap: true,
            mindmapData: this.defaultMindmapData,
            documentData: null,
        }

        this.setMindmapData = this.setMindmapData.bind(this)
        // this.setDocumentData = this.setDocumentData.bind(this)
    }

    setMindmapData = (data) => {
        this.setState({
            mindmapData: {...this.state.mindmapData, ...data}
        })
    }

    render() {
        return (
            <div>
                {
                    this.state.isMindmap ? 
                    (<Mindmap
                        data={this.state.mindmapData}
                        setData={this.setMindmapData}
                    />) :
                    <Document/>
                }
                <button
                    style={{
                        position: 'sticky',
                        float: 'right',
                        fontSize: '100px',
                    }}
                    onClick={()=>this.setState({isMindmap: !this.state.isMindmap})}
                >Change</button>
            </div>
        )
    }
}