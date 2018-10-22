<template>
    <Form :model="loginForm" :label-width="80">
        <FormItem label="用户名">
            <Input v-model="loginForm.username" placeholder="请输入用户名"></Input>
        </FormItem>
        <FormItem label="密码">
            <Input v-model="loginForm.password" placeholder="请输入密码"></Input>
        </FormItem>
        <FormItem>
            <Tag color="orange" v-for="(user,index) in userList" :key="index">{{user.username}}</Tag>
        </FormItem>
        <FormItem>
            <Button type="primary" @click="login">登陆</Button>
        </FormItem>
    </Form>
</template>

<script>
    import store from '../../../store'

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
        /*computed: {
            async userList() {
                let list = [1];
                await this.userDB.account.toArray().then(arr => {
                    list = arr;
                });
                return list
            }
        },*/
        methods: {
            login() {
                store.dispatch('Login', this.loginForm).then(data => {
                    // this.$router.push({name: 'index'});
                    //以id作为用户唯一标识
                    this.account.where("id").equals(data.id).first(result => {
                        console.log(result);
                        if (result) {
                            //更新
                            this.account.update(result.index, {
                                id: data.id,
                                username: '测试1',
                                lastModify: new Date() - 0,
                                lastToken: data.token
                            });
                        } else {
                            //新增
                            this.account.add({
                                id: data.id,
                                username: '测试1',
                                lastModify: new Date() - 0,
                                lastToken: data.token
                            });
                        }
                    })

                }).catch(e => {
                    console.log(e);
                    this.$Message.info({content: '登陆错误', duration: 5});
                });
            }
        }
    }
</script>

<style scoped>

</style>
