<template>
	<view>
		<button  :data-family-id="familyId" open-type="share">分享test</button>
		<button @click="goJoin"><text>加入</text> {{familyId}}</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				familyId: '1',
				isFromShare: false
			}
		},
		onLoad(options) {
		},
		onShareAppMessage(option) {
			this.isFromShare = true
			let path = `/pages/joinFamily/joinFamily?familyId=1`;
			return {
				title: '我给你分享了一个好东西', // 分享标题
				path: path, // 携带参数的分享路径
			}
		},
		methods: {
			goJoin() {
				uni.redirectTo({
					url: '/pages/joinFamily/joinFamily'
				})
			},
		}
	}
</script>

<style>

</style>