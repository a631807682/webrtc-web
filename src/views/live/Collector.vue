<template>
    <div>
        <el-col :span="12">
            <h1>采集({{own&&own.key}}) {{socketError}}</h1>

            <video ref="test" playsinline class="mini" autoplay></video>
        </el-col>

        <el-dialog title="提示" :visible.sync="showAccept" width="30%" center>
            <span>您有来自{{acceptFrom.name}}的视频邀请，是否接受?</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="accept(false)">拒 绝</el-button>
                <el-button type="primary" @click="accept(true)">同 意</el-button>
            </span>
        </el-dialog>

    </div>
</template>
<script lang="ts">
    import Vue from 'vue'
    import io from 'socket.io-client'
    import Component, {
        mixins
    } from 'vue-class-component'
    import {
        LiveMixin,
        ReceiveMessage,
        SendMessage,
        User
    } from '../../mixins/live'



    @Component
    export default class Collector extends mixins(LiveMixin) {
        /** data */
        name = '';
        type: 'collector' = 'collector';
        isConnecting = false;
        showAccept = false;
        acceptFrom: User | {} = {};
        cutPeerConnect: RTCPeerConnection | null = null;

        /** hooks */
        created() {
            this.name = this.$route.params.name;
            this.socket = this.connect2Signal()
            this.registSocketHandle();
            this.registUser({
                name: this.name,
                type: this.type
            });
        };

        /** methods */

        /**
         * 处理对端的连接询问
         * @param message 
         */
        handleCall(message: ReceiveMessage) {
            // 因繁忙而拒绝
            if (this.isConnecting) {
                this.accept(false);
                return;
            }
            this.isConnecting = true;
            this.showAccept = true;
            this.acceptFrom = message.from as User;
        }

        /**
         * 告诉对端询问的结果
         * @param status 同意/拒绝
         */
        accept(status: boolean) {
            let message: SendMessage = {
                event: 'accept',
                accept: status,
                to: (this.acceptFrom as User).key
            }
            this.send(message)
            this.showAccept = false;
        }

        /** 
         * 处理对端offer
         */
        handleOffer(message: ReceiveMessage) {
            let from = message.from as User;

            let pc = this.cutPeerConnect = this.createConnection(from);
            this.createStream().then(stream => {
                stream.getTracks().forEach((track) => {
                    console.log('getTracks', track, stream);
                    pc.addTrack(track, stream);
                    (this.$refs.test as HTMLMediaElement).srcObject = stream;
                });

                let sessionDesc = new RTCSessionDescription(message.offer as RTCSessionDescriptionInit)
                pc.setRemoteDescription(sessionDesc);
                pc.createAnswer().then(answer => {
                    pc.setLocalDescription(new RTCSessionDescription(answer));
                    let message: SendMessage = {
                        event: 'answer',
                        to: from.key,
                        answer
                    }
                    this.send(message)
                })
            })
        }

        handleCandidate(message: ReceiveMessage) {
            let pc = this.cutPeerConnect as RTCPeerConnection;
            if (pc.remoteDescription && pc.remoteDescription.type) {
                console.log('push candidate onto queue...', pc.remoteDescription.type)
                //ClientB通过PeerConnection的AddIceCandidate方法保存起来
                pc.addIceCandidate(new RTCIceCandidate(message.candidate as RTCIceCandidateInit))
                    .catch(error => {
                        console.log('[addIceCandidate error]', message.candidate, error)
                    });
            }
        }

        handleLeave(message: ReceiveMessage) {
            if (this.cutPeerConnect) {
                (this.cutPeerConnect as RTCPeerConnection).close();
                this.cutPeerConnect = null;
                (this.$refs.test as HTMLMediaElement).srcObject = null;
                this.isConnecting = false;
            }
        }
    }
</script>