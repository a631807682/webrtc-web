import Vue from 'vue'
import Component from 'vue-class-component'
import io from 'socket.io-client'

/** interface */
export interface User {
    name: string;
    type: 'guest' | 'watcher' | 'collector';
    key ? : string;
}

interface BaseMessage {
    event: 'regist' | 'show' | 'call' | 'accept' | 'offer' | 'answer' | 'candidate' | 'leave';
}

export declare interface ReceiveMessage extends BaseMessage {
    from ? : User;
    [key: string]: any;
}

export declare interface SendMessage extends BaseMessage {
    to ? : string;
    [key: string]: any;
}

interface TrackHandle {
    (to: User, event: RTCTrackEvent): void
}

// interface IcecandidateHandle {
//     (to: User, event: RTCPeerConnectionIceEvent): void
// }

// 服务地址配置
const wsHost = process.env.WS_HOST;
const iceServers: Array < RTCIceServer > = [{
    urls: process.env.STUN_HOST as string
}, {
    urls: process.env.TURN_HOST as string,
    username: process.env.TURN_USERNAME as string,
    credential: process.env.TURN_CREDENTIAL as string
}]

console.log(iceServers)

@Component
export class LiveMixin extends Vue {
    /** data */
    name = '';
    type = 'guest';

    socket: SocketIOClient.Socket | null = null;
    socketError: string = '';
    rtcConfig: RTCConfiguration = {
        iceServers
    };

    users: Array < User > = [];
    own: User | null = null

    /** hooks */
    errorCaptured(error: Error, vm: Vue.Component, info: string): boolean {
        this.$message({
            message: `${error.name}:${error.message}`,
            type: 'error'
        });
        return false;
    }

    /** methods */
    connect2Signal() {
        // let socket = io.connect(wsHost as string);
        let socket = io.connect('https://live-sign.products.d3dstore.com:3001');
        let disMessage = '网络异常 websocket已断开'
        socket.on('disconnect', () => {
            this.socketError = disMessage;
        })

        socket.on('connect', () => {
            if (this.socketError === disMessage) this.socketError = ''
        });
        return socket
    }

    registSocketHandle() {
        (this.socket as SocketIOClient.Socket).on('message', (data: ReceiveMessage) => {
            console.log('recive message', data.event, data);
            switch (data.event) {
                case 'show':
                    this.handleShow(data);
                    break;
                case 'call':
                    this.handleCall(data);
                    break;
                case 'accept':
                    this.handleAccept(data);
                    break;
                case 'offer':
                    this.handleOffer(data);
                    break;
                case 'answer':
                    this.handleAnswer(data);
                    break;
                case 'candidate':
                    this.handleCandidate(data);
                    break;
                case 'leave':
                    this.handleLeave(data);
                    break;
            }
        })
    }

    // 打开摄像头 
    createStream() {
        return navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        })
        // .catch((error) => {
        //     this.$message({
        //         message: error,
        //         type: 'error'
        //     });
        // })
    };


    /**
     * 链接rtc服务器
     * @param tokey 对端标识
     * @param onaddstreamCb addstream事件回调
     * @param onicecandidateCb icecandidate事件回调
     */
    createConnection(
        to: User,
        trackHandle ? : TrackHandle
    ) {
        let cutPeerConn = new RTCPeerConnection(this.rtcConfig);
        if (trackHandle) {
            cutPeerConn.ontrack = (trackHandle as TrackHandle).bind(cutPeerConn, to);
            // cutPeerConn.addEventListener(
            //     "track", e => (trackHandle as TrackHandle).bind(cutPeerConn, to), {
            //         once: true
            //     });
        }

        cutPeerConn.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
            if (e.candidate) {
                let message: SendMessage = {
                    event: 'candidate',
                    to: to.key,
                    candidate: e.candidate,
                }
                this.send(message);
                console.log('send candidate', message)
            }
        }
        return cutPeerConn;
    }

    // 注册用户
    registUser(user: User) {
        let message: SendMessage = {
            event: 'regist',
            type: user.type,
            name: user.name
        };
        this.send(message)
    }

    /** methods: socket handles */
    handleShow(data: ReceiveMessage) {
        this.users = data.users;
        this.own = data.own;
    }

    handleCall(data: ReceiveMessage) {}
    handleAccept(data: ReceiveMessage) {}
    handleOffer(data: ReceiveMessage) {}
    handleAnswer(data: ReceiveMessage) {}
    handleCandidate(data: ReceiveMessage) {}
    handleLeave(data: ReceiveMessage) {}

    send(message: SendMessage) {
        // console.log('send', message);
        (this.socket as SocketIOClient.Socket).send(message);
    }
}