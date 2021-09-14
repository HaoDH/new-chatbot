import React, { Component } from 'react'
import { Form, Icon, Input, Button, Row, Col, } from 'antd';
import io from "socket.io-client";
import { connect } from "react-redux";
import moment from "moment";
import { getChats, afterPostMessage } from "../../../_actions/chat_actions"
import ChatCard from "./Sections/ChatCard"
import Dropzone from 'react-dropzone';
import SignaturePad from "react-signature-canvas";
import Popup from "reactjs-popup";
import Axios from 'axios';

import "./Chatpage.css"

export class ChatPage extends Component {

    sigCanvas = React.createRef(); s
    state = {
        chatMessage: "",
        canvasURL: "",
    }

    clear = () => this.sigCanvas.current.clear();

    save = () => {
        this.setState({
            canvasURL: this.sigCanvas.current.getTrimmedCanvas().toDataURL("image/png")
        });
    }

   DownloadCanvasAsImage = () => {
        // this.save()
        let downloadLink = document.createElement('a');
        downloadLink.setAttribute('download', Date.now()+'.png');
        if(this.sigCanvas.current.getTrimmedCanvas().toDataURL("image/png") !== ""){
            let dataURL = this.sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
            let url = dataURL.replace(/^data:image\/png/, 'data:application/octet-stream');
            downloadLink.setAttribute('href', url);
            downloadLink.click();
        }
    }
 

    componentDidMount() {
        let server = "http://localhost:5000";

        this.props.dispatch(getChats());

        this.socket = io(server);

        this.socket.on("Output Chat Message", messageFromBackEnd => {
            console.log(messageFromBackEnd)
            this.props.dispatch(afterPostMessage(messageFromBackEnd));
        })
    }

    componentDidUpdate() {
        this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
    }

    hanleSearchChange = (e) => {
        this.setState({
            chatMessage: e.target.value,
            // canvasURL: this.sigCanvas.current.getTrimmedCanvas().toDataURL("image/png")
        })
    }

    renderCards = () =>
        this.props.chats.chats
        && this.props.chats.chats.map((chat) => (
            <ChatCard key={chat._id}  {...chat} />
        ));

    onDrop = (files) => {
        console.log(files)


        if (this.props.user.userData && !this.props.user.userData.isAuth) {
            return alert('Please Log in first');
        }



        let formData = new FormData();

        const config = {
            header: { 'content-type': 'multipart/form-data' }
        }

        formData.append("file", files[0])

        Axios.post('api/chat/uploadfiles', formData, config)
            .then(response => {
                if (response.data.success) {
                    let chatMessage = response.data.url;
                    let userId = this.props.user.userData._id
                    let userName = this.props.user.userData.name;
                    let userImage = this.props.user.userData.image;
                    let nowTime = moment();
                    let type = "VideoOrImage"

                    this.socket.emit("Input Chat Message", {
                        chatMessage,
                        userId,
                        userName,
                        userImage,
                        nowTime,
                        type
                    });
                }
            })
    }

    submitChatMessage = (e) => {
        e.preventDefault();

        if (this.props.user.userData && !this.props.user.userData.isAuth) {
            return alert('Please Log in first');
        }

        let chatMessage = this.state.chatMessage
        let userId = this.props.user.userData._id
        let userName = this.props.user.userData.name;
        let userImage = this.props.user.userData.image;
        let nowTime = moment();
        let type = "Text"

        this.socket.emit("Input Chat Message", {
            chatMessage,
            userId,
            userName,
            userImage,
            nowTime,
            type
        });
        this.setState({ chatMessage: "" })
    }

    render() {
        return (
            <React.Fragment>
                <div>
                    <p style={{ fontSize: '2rem', textAlign: 'center' }}> Real Time Chat</p>
                </div>

                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="infinite-container" style={{ height: '500px', overflowY: 'scroll' }}>
                        {this.props.chats && (
                            this.renderCards()
                        )}
                        <div
                            ref={el => {
                                this.messagesEnd = el;
                            }}
                            style={{ float: "left", clear: "both" }}
                        />
                    </div>

                    <Row >
                        <Form layout="inline" onSubmit={this.submitChatMessage}>
                            <Col span={16}>
                                <Input
                                    id="message"
                                    prefix={<Icon type="message" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    placeholder="Let's start talking"
                                    type="text"
                                    value={this.state.chatMessage}
                                    onChange={this.hanleSearchChange}
                                />
                            </Col>
                            <Col span={2}>
                                <Dropzone onDrop={this.onDrop}>
                                    {({ getRootProps, getInputProps }) => (
                                        <section>
                                            <div {...getRootProps()}>
                                                <input {...getInputProps()} />
                                                <Button>
                                                    <Icon type="upload" />
                                                </Button>
                                            </div>
                                        </section>
                                    )}
                                </Dropzone>
                            </Col>
                            <Col span={2} style={{ paddingRight: '6px' }}>
                                <div className="Canvas">
                                    <Popup
                                        modal
                                        trigger={<p>Pad</p>}
                                        closeOnDocumentClick={false}
                                    >
                                        {close => (
                                            <>
                                                <SignaturePad
                                                    ref={this.sigCanvas}
                                                    canvasProps={{
                                                        className: "signatureCanvas"
                                                    }}
                                                />
                                                {/* Button to trigger save canvas image */}
                                                <button onClick={this.DownloadCanvasAsImage}>Save</button>
                                                <button onClick={this.clear}>Clear</button>
                                                <button onClick={close}>Close</button>
                                            </>
                                        )}
                                    </Popup>                          
                                </div>
                            </Col>
                            <Col span={3}>
                                <Button type="primary" style={{ width: '100%' }} onClick={this.submitChatMessage} htmlType="submit">
                                    <Icon type="enter" />
                                </Button>
                            </Col>
                        </Form>
                    </Row>
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
        chats: state.chat
    }
}


export default connect(mapStateToProps)(ChatPage);
