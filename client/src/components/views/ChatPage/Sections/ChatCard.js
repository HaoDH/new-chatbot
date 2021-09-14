import React from "react";
import moment from 'moment';
import { create, all } from 'mathjs';
import { Comment, Tooltip, Avatar } from 'antd';

function ChatCard(props) {
    //Lay message input
    const message = props.message;
    console.log(message);
    const config = { };
    const math = create(all, config);

    //Check user message input and bot return message
    function checkMessage(message) {
        try {
            return math.evaluate(message);
        } catch (e) {
            return 'dont understand';
        }
    }

    return (
        <div style={{ width: '100%' }}>
            <Comment
                author={props.sender.name}
                avatar={
                    <Avatar
                        src={props.sender.image} alt={props.sender.name}
                    />
                }
                content={
                    props.message.substring(0, 7) === "uploads" ?
                        // this will be either video or image 
                        props.message.substring(props.message.length - 3, props.message.length) === 'mp4' ?
                            <video
                                style={{ maxWidth: '200px' }}
                                src={`http://localhost:5000/${props.message}`} alt="video"
                                type="video/mp4" controls
                            />
                            :
                            <img
                                style={{ maxWidth: '200px' }}
                                src={`http://localhost:5000/${props.message}`}
                                alt="img"
                            />
                        :
                        <p>
                           {props.message}
                        </p>
                }
                datetime={
                    <Tooltip title={moment().format('YYYY-MM-DD HH:mm:ss')}>
                        <span>{moment().fromNow()}</span>
                    </Tooltip>
                }
            />
            <Comment
                author='Bot'
                avatar={
                    <Avatar
                        src='https://i.fbcd.co/products/resized/resized-750-500/02b97ed3b56578072605fdbe056b319418d7eedf0f815bc0407b12fd0cff0626.jpg' alt={props.sender.name}
                    />
                }
                content={
                        <p>
                           {checkMessage(props.message)}
                        </p>
                }
            />
        </div>
    )
}

export default ChatCard;

