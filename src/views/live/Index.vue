<template>
    <div>
        <el-col :span="6">
            <el-col :span="24">
                <div class="title">采集监控</div>
            </el-col>
            <el-col :span="24">
                <el-form :model="form" ref="form" :rules="formRules" label-width="120px">
                    <el-form-item label="名称" prop="name">
                        <el-input type="text" v-model="form.name"></el-input>
                    </el-form-item>
                    <el-form-item label="类型">
                        <el-radio-group v-model="form.type">
                            <el-radio label="collector">采集端</el-radio>
                            <el-radio label="watcher">监控端</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submit()">确定</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-col>
    </div>
</template>
<script lang="ts">
    import Vue from 'vue'
    import {
        ElForm
    } from 'element-ui/types/form';
    export default Vue.extend({
        data() {
            return {
                form: {
                    name: '',
                    type: 'collector'
                },
                formRules: {
                    name: [{
                        required: true,
                        message: '请填写终端名称',
                        trigger: 'blur'
                    }],
                }
            }
        },
        methods: {
            submit() {
                (this.$refs.form as ElForm).validate((valid) => {
                    if (valid) {
                        this.$router.push(`${this.form.type}/${this.form.name}`);
                    }
                })
            }
        }
    })
</script>
<style lang="scss" scoped>
    .title {
        padding: 20px;
        text-align: center;
        font-size: 14px;
        color: #606266;
    }
</style>