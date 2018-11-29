<template></template>

<script>
    /* Tips:
    * lock-screen:      锁屏事件
    * unlock-screen:    屏幕解锁事件
    * suspend:          进入睡眠事件
    * resume:           唤醒事件
    * */
    export default {
        name: "screen-state",
        created() {
            window.addEventListener('lock-screen', this.lockScreen);
            window.addEventListener('unlock-screen', this.unlockScreen);
            window.addEventListener('suspend', this.suspend);
            window.addEventListener('resume', this.resume);
        },
        methods: {
            lockScreen(obj) {
                this.$emit('lock-screen', obj);
            },
            unlockScreen(obj) {
                this.$emit('unlock-screen', obj);
            },
            suspend(obj) {
                this.$emit('suspend', obj);
            },
            resume(obj) {
                this.$emit('resume', obj);
            }
        },
        beforeDestroy() {
            window.removeEventListener('lock-screen', this.lockScreen);
            window.removeEventListener('unlock-screen', this.unlockScreen);
            window.removeEventListener('suspend', this.suspend);
            window.removeEventListener('resume', this.resume);
        }
    }
</script>
