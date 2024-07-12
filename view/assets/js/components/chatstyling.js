

export function styling(){
    return     `@keyframes slideIn {
        from {
            transform: translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .container {
        display: flex;
        height: 100vh;
        color: black
    }
    .sidebar {
        width: 30%;
        background-color: #fff;
        border-right: 1px solid #ddd;
        overflow-y: auto;
        padding: 20px;
    }
    .sidebar h2 {
        font-size: 18px;
        margin-bottom: 10px;
        color: #000;
    }
    .user-item {
        display: flex;
        align-items: center;
        padding: 10px;
        color: #000;
        text-decoration: none;
        transition: background-color 0.3s ease;
        border-bottom: 1px solid #f0f0f0;
    }
    .user-item:hover {
        background-color: #f5f5f5;
    }
    .avatar {
        width: 40px;
        height: 40px;
        background-color: #0084ff;
        color: white;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 18px;
        margin-right: 15px;
    }
    .username {
        font-weight: bold;
        font-size: 16px;
        color: #000;
    }
    .chat-container {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        background-color: #efeae2;
    }
    .chat-header {
        padding: 20px;
        background-color: #f5f5f5;
        border-bottom: 1px solid #ddd;
        color: #000;
    }
    .chat-header h3 {
        margin: 0;
        font-size: 20px;
    }
    #chat {
        flex-grow: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column-reverse;
    }
    .message {
        display: flex;
        align-items: flex-end;
        margin-bottom: 10px;
    }
    .message.sent {
        justify-content: flex-end;
    }
    .message.received {
        justify-content: flex-start;
    }
    .message.sent .text {
        background-color: #dcf8c6;
        border: 1px solid #c1e5b0;
    }
    .message.received .text {
        background-color: #fff;
        border: 1px solid #ddd;
    }
    .text {
        max-width: 60%;
        padding: 10px;
        border-radius: 20px;
        font-size: 14px;
        margin: 0 10px;
        position: relative;
    }
    .text:before {
        content: "";
        position: absolute;
        top: 10px;
        width: 0;
        height: 0;
        border-style: solid;
    }
    .message.sent .text:before {
        right: -10px;
        border-width: 10px 0 10px 10px;
        border-color: transparent transparent transparent #dcf8c6;
    }
    .message.received .text:before {
        left: -10px;
        border-width: 10px 10px 10px 0;
        border-color: transparent #fff transparent transparent;
    }
    .input-container {
        display: flex;
        padding: 10px;
        background-color: #f5f5f5;
        border-top: 1px solid #ddd;
    }
    #message {
        flex-grow: 1;
        padding: 10px;
        margin-right: 10px;
        border: 1px solid #ccc;
        border-radius: 20px;
        font-size: 14px;
        outline: none;
        color: #000;
    }
    #send {
        padding: 10px 20px;
        background-color: #25d366;
        color: #fff;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
    }
    #send:hover {
        background-color: #128c7e;
    }

    .message-preview {
        font-size: 12px;
        color: #888;
        margin-left: 55px;
        max-width: 150px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }`;
}