<template>
	<view class="main">
		<image class="scan-img" src="/static/房间-2.png" />
		<button class="join-btn" @click="join">加入{{familyName}}</button>
	</view>
</template>

<script>
	import http from '@/utils/http.js';
	export default {
		data() {
			return {
				familyId: '',
				isFromShare: false,
				familyName: ''
			}
		},
		onLoad(options) {
			console.log('ops----', options)
			if (options.familyId) this.isFromShare = true
			this.familyId = options.familyId
			this.familyName = options.familyName
		},
		methods: {
			async join() {
				// mock
				uni.switchTab({
					url: '/pages/packing-in/packing-in'
				})
				return
				const res = await http.post('/families/join', {
					familyId: this.familyId
				})
				if(res.success) {
				uni.showToast({ title: '加入成功', icon: 'success' });
				}
			},
		}
	}
</script>

<style scoped lang="stylus">
	.main {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		padding-top: 210rpx
	}

	.scan-img {
		width: 224rpx;
		 height: 200rpx;
	}

	.join-btn {
		color: #1f1f1f;
		background: #fff;
		margin-top: 24rpx;
		box-shadow: 0 4px 12px rgba(39, 150, 245, 0.3);
	}
</style>