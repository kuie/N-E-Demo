<template>
    <div class="wscn-http404">
        <div class="bullshit">
            <div class="bullshit__message">{{ message }}</div>
            <div class="bullshit__code">Code:{{ code }}</div>
            <div class="bullshit__info">{{ info }}</div>
            <a href="/" class="bullshit__return-home">返回首页</a>
        </div>
    </div>
</template>

<script>
export default {
    computed: {
        message() {
            return '抱歉！找不到此页面~';
        },
        code() {
            return '404';
        },
        info() {
            return '您请求访问的页面，暂时找不到。请检查您输入的网址是否正确，或点击以下按钮返回主页。';
        }
    }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.wscn-http404 {
    background: #f0f2f5;
    height: 100vh;
    padding: 0 100px;
    .bullshit {
        width: 340px;
        padding: 100px 0;
        &__message {
            font-size: 32px;
            font-weight: bold;
            line-height: 40px;
            color: #1482f0;
            opacity: 0;
            margin-bottom: 20px;
            animation-name: slideUp;
            animation-duration: 0.5s;
            animation-fill-mode: forwards;
        }
        &__code {
            font-size: 20px;
            line-height: 24px;
            color: #1482f0;
            opacity: 0;
            margin-bottom: 10px;
            animation-name: slideUp;
            animation-duration: 0.5s;
            animation-delay: 0.1s;
            animation-fill-mode: forwards;
        }
        &__info {
            font-size: 13px;
            line-height: 21px;
            color: grey;
            opacity: 0;
            margin-bottom: 30px;
            animation-name: slideUp;
            animation-duration: 0.5s;
            animation-delay: 0.2s;
            animation-fill-mode: forwards;
        }
        &__return-home {
            display: block;
            float: left;
            width: 110px;
            height: 36px;
            background: #1482f0;
            border-radius: 100px;
            text-align: center;
            color: #ffffff;
            opacity: 0;
            font-size: 14px;
            line-height: 36px;
            cursor: pointer;
            animation-name: slideUp;
            animation-duration: 0.5s;
            animation-delay: 0.3s;
            animation-fill-mode: forwards;
        }
        @keyframes slideUp {
            0% {
                transform: translateY(60px);
                opacity: 0;
            }
            100% {
                transform: translateY(0);
                opacity: 1;
            }
        }
    }
}
</style>
