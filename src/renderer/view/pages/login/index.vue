<template>
    <Form :model="loginForm" :label-width="80">
        <FormItem label="用户名">
            <Input v-model="loginForm.username" placeholder="请输入用户名"></Input>
        </FormItem>
        <FormItem label="密码">
            <Input v-model="loginForm.password" placeholder="请输入密码"></Input>
        </FormItem>
        <FormItem>
            <Button type="primary" @click="login">登陆</Button>
            <Button style="margin-left: 8px" @click="toRegister">注册</Button>
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
				}
			}
		},
		mounted() {
			console.log(store);
		},
		methods: {
			login() {
				store.dispatch('Login', this.loginForm).then(res => {
					this.$router.push({ name: 'index' });
				}).catch(e => console.log(e)).finally(() => {
				});
			},
			toRegister() {
				this.$router.push({ name: 'register' })
			}
		}
	}
</script>

<style scoped>

</style>
