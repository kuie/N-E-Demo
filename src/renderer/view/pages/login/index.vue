<template>
    <Form :model="loginForm" :label-width="80">
        <FormItem label="用户名">
            <Input v-model="loginForm.username" placeholder="请输入用户名"></Input>
        </FormItem>
        <FormItem label="密码">
            <Input v-model="loginForm.password" placeholder="请输入密码"></Input>
        </FormItem>
        <FormItem>
            <Button type="info" v-for="(user,index) in userList" :key="index" @click="selectAccount(user)">
                {{user.username}}
            </Button>
        </FormItem>
        <FormItem>
            <Button type="primary" @click="login">登陆</Button>
        </FormItem>
    </Form>
</template>

<script>
    import store from '../../../store'
    import api from '../../../../nodeAPI';

    export default {
        data() {
            return {
                loginForm: {
                    id: '测试id',
                    identity: 'clientServer',
                    username: '',
                    password: ''
                },
                userList: []
            }
        },
        mounted() {
            this.account.toArray().then(arr => this.userList = arr);
        },
        methods: {
            login() {
                const loginForm = JSON.parse(JSON.stringify(this.loginForm));
                store.dispatch('Login', loginForm).then(data => {
                    const accountItem = {
                        id: data.id,
                        username: loginForm.username,
                        lastModify: new Date() - 0,
                        lastToken: data.token
                    };
                    //打开新窗口
                    // api.newBusinessWin(accountItem);
                    //以id作为用户唯一标识
                    this.account.where("id").equals(data.id).first(result => {
                        if (result) {
                            //更新
                            this.account.update(result.index, accountItem);
                        } else {
                            //新增
                            this.account.add(accountItem);
                        }
                    });
                    console.log(this.$router);
                    this.$router.push({name: 'index'});
                }).catch(e => {
                    console.log(e);
                    this.$Message.info({content: '登陆错误', duration: 5});
                });
            },
            selectAccount(user) {
                this.loginForm.username = user.username;

            }
        }
    }
</script>

<style scoped>

</style>
