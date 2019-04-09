<template>
    <div>
        <el-col :span="24">
            <h1>监控 {{socketError}}</h1>
            <el-col :span="12">
                <el-table :data="collectors" v-loading="isConnecting">
                    <el-table-column prop="name" label="名称">
                    </el-table-column>
                    <el-table-column prop="key" label="标识">
                    </el-table-column>
                    <el-table-column>
                        <template slot-scope="scope">
                            <el-button v-if="scope.row.connected" type="primary" @click="call(scope.row)">添加</el-button>
                            <el-button v-else type="danger" @click="hangUp(scope.row.key)">关闭</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
            <el-col :span="4" v-for="pc in peerConnects" :key="pc.key" style="padding:15px">
                <el-card class="box-card">
                    <div slot="header" class="clearfix">
                        <span>远端图像{{pc.name}}</span>
                    </div>
                    <video :ref="pc.key" :data-id="pc.key" playsinline style="width:100%" autoplay></video>
                </el-card>
            </el-col>

        </el-col>
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

    interface PeerConnection extends User {
        connect: RTCPeerConnection
    }

    @Component
    export default class Watcher extends mixins(LiveMixin) {
        /** data */
        name = '';
        type: 'watcher' = 'watcher';
        isConnecting = false;
        // 缓存所有的rtc peer connection
        peerConnects: Array < PeerConnection > = [];

        /** computeds */
        get collectors() {
            let cs = this.users.filter(s => s.type === 'collector');
            let peerConnects = this.peerConnects;
            let formatCollectors = cs.map(c => {
                let pc = peerConnects.find(pc => pc.key === c.key);
                return {
                    key: c.key,
                    name: c.name,
                    connected: !pc,
                }
            })
            return formatCollectors;
        }

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
         * 询问对端是否建立RTC连接
         * @param collector 采集端
         */
        call(collector: User) {
            this.isConnecting = true;
            let message: SendMessage = {
                event: 'call',
                to: collector.key
            }
            this.send(message);
        }

        /** 
         * 处理对端是否建立RTC的应答
         */
        handleAccept(message: ReceiveMessage) {
            let from = message.from as User;
            if (message.accept) {
                // 对端同意，发送offer到对端
                let pc = this.createConnection(
                    from,
                    (user, e) => {
                        console.log('ontrack-------->', user.name, e.streams)
                        let peerConnect = this.peerConnects.find(p => p.key === user.key)

                        if (peerConnect) {
                            this.isConnecting = false;

                            this.$nextTick(() => {
                                let elements = this.$refs[user.key as string];
                                let mediaElement = (elements as HTMLMediaElement[])[0];
                                console.log('elements', mediaElement, e.streams[0])
                                mediaElement.srcObject = e.streams[0];
                            })
                        }
                    });

                this.peerConnects.push(Object.assign(from, {
                    connect: pc
                }));

                pc.createOffer({ //接收视频音频
                    // offerToReceiveAudio: true,
                    offerToReceiveVideo: true
                }).then((offer) => {
                    let message: SendMessage = {
                        event: 'offer',
                        to: from.key,
                        offer
                    }
                    this.send(message);
                    pc.setLocalDescription(offer);
                });

            } else {
                this.$message({
                    message: `${from.name}拒绝视频连接`,
                    type: 'warning'
                })
            }
        }
        /** 
         * 处理该offer的answer应答
         */
        handleAnswer(message: ReceiveMessage) {
            let from = message.from as User;
            let pconnect = this.peerConnects.find(pconnect => pconnect.key == from.key);
            if (pconnect) {
                let pc = pconnect.connect;
                pc.setRemoteDescription(new RTCSessionDescription(message.answer));
            } else {
                console.warn(`来自${from.name}[${from.key}]的无效answer`)
            }
        }

        /**
         * 断开连接
         */
        hangUp(key: string) {
            let message: SendMessage = {
                event: 'leave',
                to: key
            }

            this.send(message);
            this.removeConnectedPeerConn(key);
        }
        /*
        	断开已连接peerConn
         */
        removeConnectedPeerConn(remoteKey: string) {
            let hangUpConnectIndex = this.peerConnects.findIndex(vc => vc.key === remoteKey);
            if (hangUpConnectIndex > -1) {
                let hangUpPeerConn = this.peerConnects[hangUpConnectIndex].connect;
                hangUpPeerConn.close();
                this.peerConnects.splice(hangUpConnectIndex, 1);
            }
        }
    }
</script>