<template>
    <view class="login-container">
        <button @click="wechatLogin" type="primary">微信一键登录</button>
    </view>
</template>

<script>
import http from '@/utils/http.js';

export default {
		data() {
			return {
				dev: true,
			}
		},
		mounted() {
			// this.wechatLogin()
		},
    methods: {
    // 检查用户是否注册
     async checkUserRegistered (openid){
        try {
            const response = await http.get(`/users/wechat/check?openid=${encodeURIComponent(openid)}`);
            return response;
        } catch (error) {
            console.error('检查用户失败:', error);
            throw error;
        }
    },
    
    // 完整的登录流程
    async wechatLogin() {
    try {
				let openidResult = null;
				if(!this.dev) {
					// 1. 获取微信 code
					const loginRes = await new Promise((resolve, reject) => {
					    uni.login({
					        provider: 'weixin',
					        success: resolve,
					        fail: reject
					    });
					});
					console.log('loginRes--', loginRes)
					// 2. 用 code 换取 openid（调用后端接口）
					 openidResult = await http.post('/users/wechat/get-openid', {
					    code: loginRes.code
					});
				}
       
        openidResult = {openid: 'test_openid_123'}
        const openid = openidResult.openid;

        // 3. 检查用户是否已注册
        const checkResult = await this.checkUserRegistered(openid);
        
        if (checkResult.registered) {
            // 已注册用户 - 直接登录
            const loginResult = await http.post('/users/wechat/login-by-openid', {
                openid: openid
            });
            
            // 保存 token 和用户信息
            uni.setStorageSync('token', loginResult.token);
            uni.setStorageSync('user', loginResult.user);
            
            uni.showToast({ title: '登录成功', icon: 'success' });
            
        } else {
            // 新用户 - 需要获取用户信息并注册
            uni.showModal({
                title: '提示',
                content: '欢迎新用户，请授权个人信息完成注册',
                showCancel: false,
                success: async () => {
                    // 获取用户信息
                    const userInfo = await new Promise((resolve, reject) => {
                        uni.getUserProfile({
                            desc: '用于完善会员资料',
                            success: resolve,
                            fail: reject
                        });
                    });
                    
                    // 注册新用户
                    const registerResult = await http.post('/users/wechat/register', {
                        openid: openid,
                        nickname: userInfo.userInfo.nickName,
                        avatarUrl: userInfo.userInfo.avatarUrl
                    });
                    
                    // 保存 token 和用户信息
                    uni.setStorageSync('token', registerResult.token);
                    uni.setStorageSync('user', registerResult.user);
                    
                    uni.showToast({ title: '注册成功', icon: 'success' });
                }
            });
        }
        
    } catch (error) {
        console.error('登录流程失败:', error);
        uni.showToast({ title: '登录失败', icon: 'none' });
    }
}
    }
}
</script>