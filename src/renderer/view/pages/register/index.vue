<template>
    <Form :model="registerForm" :label-width="80">
        <FormItem label="用户名">
            <Input v-model="registerForm.username" placeholder="请输入用户名"></Input>
        </FormItem>
        <FormItem label="密码">
            <Input v-model="registerForm.password" placeholder="请输入密码"></Input>
        </FormItem>
        <FormItem>
            <Button type="primary" @click="register">注册</Button>
            <Button style="margin-left: 8px" @click="toLogin">登陆</Button>
        </FormItem>
    </Form>
</template>

<script>
	import store from '../../../store'

	export default {
		data() {
			return {
				registerForm: {
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
			register() {
				store.dispatch('Register', this.registerForm).then(res => {

				})
			},
			toLogin() {
				this.$router.push({ name: 'login' })
			}
		}
	}
</script>

<style scoped>

</style>
