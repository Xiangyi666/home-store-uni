<template>
	<view>
		家庭管理
		<button @click="join" >加入家庭9</button>
	</view>
</template>

<script>
	import http from '@/utils/http.js';
	
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			async join(){
				const res = await http.post('/families/join',{familyId: 9})
				
			}
		}
	}
</script>

<style>

</style>
