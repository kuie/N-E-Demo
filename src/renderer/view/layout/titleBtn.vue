<template>
    <div class="titlebtn" v-bind:style="style" @click="click"></div>
</template>

<script>
    import api from '../../../nodeAPI';

    const style = {
        min: {
            backgroundColor: 'green',
            right: '100px'
        },
        max: {
            backgroundColor: 'yellow',
            right: '60px'
        },
        close: {
            backgroundColor: 'black',
            right: '20px'
        }
    };
    export default {
        name: 'Titlebtn',
        props: {
            type: {
                type: String,
                request: true
            }
        },
        computed: {
            style() {
                return style[this.type];
            }
        },
        methods: {
            click() {
                api.windowHandle(this.type);
            }
        }
    }
</script>

<style scoped>
    .titlebtn {
        position: absolute;
        width: 20px;
        height: 20px;
        top: 3px;
        bottom: 3px;
        margin: 0;
        -webkit-app-region: no-drag;
    }
</style>
