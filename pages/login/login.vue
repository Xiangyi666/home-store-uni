<template>
	<view class="login-container">
		<!-- 用户信息展示 -->
		<view class="user-card">
			<image v-if="avatarUrl" :src="avatarUrl" class="avatar"></image>
			<image v-else src="/static/理财.png" class="avatar"></image>
			<view class="nameLine">
				<text v-if="!editName" style="font-size:32rpx">{{ nickName || '屯屯鼠' }}</text>
				<input v-else class="input-n" v-model="nickName" type="nickname" placeholder="请输入昵称" @confirm="onNicknameInput"
					@blur="onNicknameInput" />
				<text v-if="editName" style="marginLeft:12rpx;color:#298EF7" @click="updateUserName">确认</text>
				<image v-else src="/static/编辑-2.png" class="edit" @click="edit"></image>
			</view>
			<!-- 获取头像 -->
			<button open-type="chooseAvatar" @chooseavatar="onChooseAvatar" class="avatar-btn">
				选择头像
			</button>
		</view>
		<text class="title">我加入的家庭</text>
		<view class="blocks">
			<view v-bind:class="{'block':true, 'selected': selectedId == home.id}" v-for="(home, index) in homes"
				:key="index">
				<view v-bind:class="{'home-block': true}">
					{{home.name}}
				</view>
				<view  @click="invite">
					<button class="addPerson" open-type="share">
						<uni-icons type="personadd" color="#999999" size="24"></uni-icons>
					</button>
				</view>
			</view>
			<view @click="createFamily" class=" add-block">
				<uni-icons type="plusempty" color="#999999" size="30"></uni-icons>
			</view>
		</view>
		
		<text class="title">家庭成员</text>
		<view class="blocks">
			<view class="mem-line" v-for="(member,index) in members" :key="index">
				{{member.username}}-
				<text style="color: #2190FF">{{member.role}}</text>
			</view>
		</view>
		<!-- 输入框示例 -->
		<uni-popup ref="inputDialog" type="dialog">
			<uni-popup-dialog ref="inputClose" mode="input" title="创建家庭" :before-close="true" v-model="familyName"
				placeholder="请输入家庭名称" @close="cancelDialog" @confirm="dialogInputConfirm"></uni-popup-dialog>
		</uni-popup>
		<!-- 获取昵称 -->
		<button @click="wechatLogin" class="footer" type="primary">微信一键登录</button>
		<!-- <button @click="refreshToken" type="primary">refreshToken</button>-->
	</view>
</template>

<script>
	import http from '@/utils/http.js';

	export default {
		data() {
			return {
				dev: false,
				nickName: '屯屯鼠',
				avatarUrl: '',
				familyName: '',
				editName: false,
				homes: [],
				selectedId: '',
				members: [],
				selectedName: ''
			}
		},
		async onShow() {
			this.checkCurUserInfo()
			await this.getFamilys()
			this.getFamilyMembers()
		},
		onShareAppMessage(option) {
			let path = `/pages/joinFamily/joinFamily?familyId=${this.selectedId}&familyName=${encodeURI(this.selectedName)}`;
			return {
				title: '加入我的家庭', // 分享标题
				path: path, // 携带参数的分享路径
			}
		},
		methods: {
		async	invite() {
			
		},
		async dialogInputConfirm() {
			if (!this.familyName) {
				uni.showToast({
					title: '请输入',
					icon: 'none'
				})
				return
			}
			const res = await http.post('/families/createFamily', {
				name: this.familyName
			})
			if (res.success) {
				this.$refs.inputDialog.close()
				uni.showToast({
					title: '创建成功！',
					icon: 'success'
				})
			}
			console.log(this.familyName)
			this.getFamilys()
		},
		createFamily() {
			this.$refs.inputDialog.open()
		},
		cancelDialog() {
			this.$refs.inputDialog.close()
		},
		async getFamilys() {
			this.homes = []
			const res = await http.get('/families/getAll')
			console.log('familys-----', res)
			this.homes = res?.data
			const curHome = uni.getStorageSync('recent-used-home')
			if (curHome) {
				this.selectedId = curHome
			} else {
				this.selectedId = res?.data[0].id
			}
			const selectItem = this.homes.find(item => item.id == this.selectedId)

		},
		checkCurUserInfo() {
			const user = uni.getStorageSync('user');
			console.log('user--', user)
			if (!user) this.wechatLogin()
			this.nickName = user?.username
		},
		edit() {
			this.editName = true
		},
		saveNickName() {
			this.editName = false
		},
		// 选择头像
		onChooseAvatar(e) {
			console.log('头像选择结果:', e)
			this.avatarUrl = e.detail.avatarUrl
			uni.showToast({
				title: '头像选择成功',
				icon: 'success'
			})
		},
		async updateUserName() {
			const response = await http.post(`/users/updateUserName`, {
				newUsername: this.nickName
			});
			if (response.success) {
				this.editName = false
				uni.showToast({
					title: '修改成功',
					icon: 'none'
				})
				const user = uni.getStorageSync('user');
				user.username = this.nickName
				uni.setStorageSync('user', user)
			}
		},
		// 输入昵称
		onNicknameInput(e) {
			this.nickname = e.detail.value
		},
		// 检查用户是否注册
		async checkUserRegistered(openid) {
			try {
				const response = await http.get(`/users/wechat/check?openid=${encodeURIComponent(openid)}`);
				return response;
			} catch (error) {
				console.error('检查用户失败:', error);
				throw error;
			}
		},
		refreshToken() {
			http.cleanRefresh()
			http.refreshToken()
		},
		async getFamilyMembers() {
			console.log('curHome', this.selectedId)
			const members = await http.get(`/families/${this.selectedId}/members`)
			this.members = members
			console.log(members)
			},
		async refresh() {
			this.checkCurUserInfo()
			await this.getFamilys()
			this.getFamilyMembers()
		},
		// 完整的登录流程
		async wechatLogin() {
			uni.clearStorageSync()
			console.log('do wechatlogin')
			try {
				let openidResult = null;
				if (!this.dev) {
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
				console.log('openidResult---', openidResult)
				// openidResult = {openid: 'test_openid_123'}
				const openid = openidResult.openid;

				// 3. 检查用户是否已注册
				const checkResult = await this.checkUserRegistered(openid);

				if (checkResult?.data && checkResult.data.registered) {
					// 已注册用户 - 直接登录
					const res = await http.post('/users/wechat/login-by-openid', {
						openid: openid
					});
					const loginResult = res.data
					console.log(res)
					// 保存 token 和用户信息
					uni.setStorageSync('token', loginResult.token);
					uni.setStorageSync('refreshToken', loginResult.refreshToken);
					uni.setStorageSync('user', loginResult.user);

					uni.showToast({
						title: '登录成功',
						icon: 'success'
					});
					this.refresh()
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
							console.log('userInfo--', userInfo)
							// 注册新用户
							const res = await http.post('/users/wechat/register', {
								openid: openid,
								nickname: userInfo.userInfo.nickName,
								avatarUrl: userInfo.userInfo.avatarUrl
							});
							console.log(res)
							const registerResult = res && res.data
							// 保存 token 和用户信息
							uni.setStorageSync('token', registerResult.token);
							uni.setStorageSync('refreshToken', registerResult.refreshToken);
							uni.setStorageSync('user', registerResult.user);
							await http.post('/users/wechat/login-by-openid', {
								openid: openid
							});
							uni.showToast({
								title: '注册成功',
								icon: 'success'
							});
							this.refresh()
						}
					});
				}

			} catch (error) {
				console.error('登录流程失败:', error);
				uni.showToast({
					title: '登录失败',
					icon: 'none'
				});
			}
		}
	}
	}
</script>
<style scoped lang="stylus">
	.user-card {
		display: flex;
		position: relative;
		flex-direction: column;
		justify-content: center;
		align-items: center
	}

	.avatar-btn {
		position: absolute;
		width: 150rpx;
		height: 130rpx;
		top: 20rpx;
		left: 260rpx;
		opacity: 0;
	}
	

	.footer {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%
	}

	.edit {
		width: 32rpx;
		height: 32rpx;
		margin-left: 10rpx
	}

	.blocks {
		display: flex;
		border: 1rpx solid #e3e3e3;
		margin: 24rpx;
		padding-left: 20rpx;
		border-radius: 24rpx;
		flex-wrap: wrap
	}

	.block {
		width: 194rpx;
		box-shadow: 0 4px 12px rgba(39, 150, 245, 0.3);
		height:192rpx;
		margin: 24rpx 12rpx;
		border-radius: 12rpx;
		overflow: hidden
	}
	
	.mem-line{
		padding: 24rpx;
		color: #999
	}
	.title {
		color: #666666;
		margin-bottom: 16rpx;
		margin-left: 40rpx;
	}

	.add-block {
		border: 1rpx solid #e8e8e8;
		color: #666666;
		box-shadow: 0 4px 12px rgba(39, 150, 245, 0.3);
		text-align: center;
		line-height: 122rpx;
		margin: 16rpx;
		height: 122rpx;
		width: 180rpx;
	}

	.home-block {
		border: 1rpx solid #e8e8e8;
		color: #666666;
		box-shadow: 0 4px 12px rgba(39, 150, 245, 0.3);
		text-align: center;
		line-height: 122rpx;
		margin-bottom: 0
	}

	.addPerson {
		text-align: center;
		border-top: none;
		border: none !important;
		background: #fff;
		line-height: 66rpx;
		height: 66rpx;
	}

	.selected {
		border: 1rpx solid #298EF7;
		border-color: #298EF7
	}

	.nameLine {
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
	}

	.input-n {}

	.avatar {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		display: block;
		margin: 0 auto 20rpx;
		border: 3rpx solid #e8e8e8;
	}
</style>