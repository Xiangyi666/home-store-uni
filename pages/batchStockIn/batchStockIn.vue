<template>
	<view class="main">
		<view class="title-line">
			<text>当前商品数: {{recoList.length}}</text>
			<view>
				<button @click="addItem" class="btn">+添加商品</button>
			</view>
		</view>
		<view style="height:720rpx;overflow-y:scroll;overflow-x:hidden;padding-bottom:100rpx">

		<view class="item-box" v-for="(item, index) in recoList" :key="index">
			<view style="display: flex;">
				<uni-icons @click="delItem(index)" class="close-icon" type="clear" color="#B3B3B3" size="24"></uni-icons>
				<view>
					<text class="f-title">商品名称</text>
					<input class="uni-input" v-model="item.name"></input>
				</view>
				<view>
					<text class="f-title">数量</text>
					<input style="width: 120rpx" class="uni-input" v-model="item.quantity"></input>
				</view>
				<view>
					<text class="f-title">单位</text>
					<uni-data-select  class="uni-select" v-model="item.unit" :localdata="unitRange" @change="changeUnit(item)" placement="bottom"
						:clear="false"></uni-data-select>
				</view>
			</view>
			<uni-easyinput class="uni-input-date" style="width:320rpx" v-model="item.shelfLifeDays" :clearable="false" placeholder="">
				<template #right>
					<text style="font-size:24rpx;margin-right:24rpx">天后过期</text>
				</template>
			</uni-easyinput>
		</view>
		</view>
		<view class="addStore-area">
			<text class="title-tag">存放位置: {{storages[0]?.text}}<text style="color:#999999"> (可在物品列表中修改)</text></text>
			<view class="store-checks">
		<!-- 		<uni-data-checkbox mode="tag" class="store-tag" :multiple="false" v-model="storeId" :localdata="storages">
				</uni-data-checkbox> -->
			</view>
		</view>
		<button @click="doBatch" class="btn" style="line-height:80rpx;height:80rpx;border-radius:54rpx;position: fixed; bottom:20rpx;right:20rpx">批量入库</button>
	</view>
</template>

<script>
	import http from '@/utils/http.js';

	export default {
		data() {
			return {
				storeId: '',
				storages: [],
				unitRange: [{
					value: 'g',
					text: 'g'
				}, {
					value: '个',
					text: '个'
				}, {
					value: 'ml',
					text: 'ml'
				}],
				recoList: []
			}
		},
		activated() {},
		onLoad(options) {
			this.getStores()
			const eventChannel = this.getOpenerEventChannel();
			eventChannel.on('acceptData', (data) => {
				console.log('事件通道参数:', data.path);
				if (data.path) {
					this.readFileAndAna(data.path)
				}
			});
		},
		methods: {
			async doBatch() {
				const recentHome = uni.getStorageSync('recent-used-home')
				console.log(recentHome)
				console.log(this.recoList)
				const stockInRequests= []
				this.recoList.map(item => {
					if(!item.name || !item.unit || !item.shelfLifeDays || !item.quantity) {
						throw new Error('请检查商品是否录入完备')
					}
					stockInRequests.push({
						ingredientName: item.name,
						unit: item.unit,
						warehouseId: recentHome,
						shelfLifeDays: item.shelfLifeDays,
						quantity: item.quantity,
					})
				})
				const res = await http.post('/warehouses/stock-in-batch', {
					stockInRequests,
					warehouseId: recentHome,
				})
				if (res.success) {
					uni.showToast({
						title: '入库成功',
						icon: 'success'
					})
					uni.navigateBack();
				}
			},
		async getStores() {
		const recentHome = uni.getStorageSync('recent-used-home')
		
			const res = await http.post('/warehouses/getAllByFamily', {
				familyId: recentHome
			})
			console.log('stores---', res)
			if (res?.data.length) {
				this.storages = []
				res.data.map(item => {
					this.storages.push({
						value: item.id,
						text: item.name
					})
				})
			}
			const recentUsed = this.storages[0]?.value
			this.storeId = recentUsed
		},
			addItem() {
				this.recoList.push({
					name:'',
					quantity: '',
					unit: '',
				})
			},
			delItem(index) {
				this.recoList.splice(index,1)
			},
			changeUnit(item) {},
			readFileAndAna(path) {
				if (!path) return
				const _this = this
				const fileManager = uni.getFileSystemManager()
				fileManager.readFile({
					filePath: path,
					encoding: 'base64',
					success: async (readRes) => {
						uni.showLoading({
							title: '识别中'
						});
						try {
							const res = await http.post('http://localhost:8090/api/mobile/identify-from-image', {
								image_base64: readRes.data,
								url: ''
							})
							_this.recoList = JSON.parse(res?.data)
							_this.recoList.map(item => {
								item.quantity = '',
								item.unit = 'g'
							})
							console.log('dattttta', _this.recoList)
						} catch {}

						uni.hideLoading();
					},
					fail: (err) => {}
				})
			}
		}
	}
</script>

<style scoped lang="stylus">
	.main {
		padding: 30rpx 24rpx;
		color: #333
	}

	.title-line {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 34rpx;
		border-bottom: 1rpx solid #e6e6e6
	}
	.store-checks {
		margin-top: 24rpx;
		display: flex;
		flex-direction: row
	}
	.addStore-area{
		display: flex;
		align-items: center;
		margin-top:24rpx;
		justify-content: center
	}
	.title-tag{
		margin-right:12rpx;
		text-align: center;
		color:#666;
	}
	>>>.uni-data-checklist .checklist-group .checklist-box.is--tag.is-checked {
		background-color: #2979ff !important
	}

	.store-checks>>>.uni-data-checklist .checklist-group .checklist-box.is--tag {
		background: #EFF6FF;
		padding: 20rpx 24rpx;
		align-items: center;
		justify-content: center;
		border-radius: 34rpx !important
	}


	.item-box {
		background: #f9f9f9;
		padding: 24rpx 12rpx;
		border-radius: 12rpx;
		margin-top: 20rpx;
		position: relative;
	}
	.uni-input {
		margin-right:12rpx;
		padding: 6rpx;
		height: 64rpx;
		background: #fff
	}
	.close-icon{
		position:absolute;
		top:-16rpx;
		right:-2rpx;
		font-size:40rpx;
	}
	>>>.uni-stat__select {
	background: #fff !important;
	
	}
	>>> .uni-select{
		background: #fff;
		height: 78rpx;
	}
	.f-title{
		display: inline-block;
		margin-bottom:8rpx
	}

	.btn {
		background: #2979ff;
		border-radius: 12rpx;
		width: 225rpx;
		padding: 0;
		height: 66rpx;
		line-height: 66rpx;
		color: #fff;
		font-size: 28rpx;
		margin: 0 12rpx
	}
	>>>.uni-easyinput__content {
		width:650rpx;
		margin-top:16rpx
	}
</style>