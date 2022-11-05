import axios from 'axios';
import React from 'react';
import { Link } from 'react-router-dom';

export default class Main extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            files: []
        }
        this.getFileList()
    }

    getFileList = () => {
        axios(
            {
                url: '/api/main',
                method: 'get',
            }
        ).then((response) => {
            this.setState({
                files: response.data
            })
        }).catch((e) => console.log(e))
    }

    createFile = () => {
        axios(
            {
                url: '/api/file',
                method: 'post'
            }
        ).then(() => {
            this.getFileList()
        }).catch((e) => console.log(e))
    }

    deleteFile = (fileId) => {
        axios(
            {
                url: '/api/file/' + fileId,
                method: 'delete'
            }
        ).then(() => {
            this.getFileList()
        }).catch((e) => console.log(e))
    }

    render() {
        return (
            <div style={{padding: '15%'}}>
                <div style={{marginBottom: '5%'}}>File List</div>
                
                {
                    this.state.files.map((file, index) => {
                        return (
                            <div key={index} style={{border: '0.12rem solid black'}}>
                                <Link to={'/file/' + file.id}>{file.name === '' ? 'file ' + file.id : file.name}</Link>
                                <a href='#' onClick={()=>this.deleteFile(file.id)} style={{float:'right'}}>삭제</a>
                            </div>
                        )
                    })
                }
                <div style={{marginTop: '5%'}}>
                    <a href='#' onClick={()=>this.createFile()}>새 파일</a>
                </div>
            </div>
        )
    }
}