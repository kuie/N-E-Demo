<template>
    <transition name="fade" mode="out-in">
        <section class="app-main">
            <keep-alive>
                <router-view :key="key" v-if='$route.meta.keepAlive'></router-view>
            </keep-alive>
            <router-view :key="key" v-if='!$route.meta.keepAlive'></router-view>
        </section>
    </transition>
</template>

<script>
	export default {
		name: 'AppMain',
		computed: {
			key() {
				return this.$route.name !== undefined ? this.$route.name : this.$route.path;
				// return this.$route.name !== undefined ? this.$route.name + +new Date() : this.$route + +new Date();
			}
		}
	};
</script>

<style scoped>
    section {
        padding: 20px;
    }
</style>
