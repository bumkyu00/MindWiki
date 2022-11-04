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

    render() {
        return (
            <div style={{padding: '20%'}}>
                {
                    this.state.files.map((file, index) => {
                        return (
                            <Link key={index} to={'/file/' + file.id}>{file.name === '' ? 'file ' + file.id : file.name}</Link>
                        )
                    })
                }
            </div>
        )
    }
}