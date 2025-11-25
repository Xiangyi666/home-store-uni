<template>
	<view class="main">
		<!-- <button @click="getAllGoods">刷新test</button> -->
		<view class="home-line">
			<uni-icons class="h-icon" type="home-filled" size="24"></uni-icons>
			<uni-icons @click="goConfig" class="g-icon" type="gear" size="24"></uni-icons>
		<uni-data-select v-model="curHome" :clear="false" :localdata="homes" @change="getAllGoods()"></uni-data-select>
		</view>
		<uni-swipe-action>
			<uni-swipe-action-item @click="(e) => clickSwipeBtn(e,item, index)" :autoClose="false" :show="isOpened[index]"
				:right-options="options1" v-for="(item, index) in goodsList" :key="index">
				<view class="product-card">
					<view class="accent-line"></view>
					<view class="card-content">
						<div class="product-name">
							{{item.itemName}}
							<span style="font-size:26rpx; color:#e3e3e3">- {{item.warehouseName}}</span>
							<span class="tag red" v-if="item.expireDays<0">已经过期</span>
							<span class="tag orange" v-else-if="item.expireDays<=3">临期</span>
							<span class="tag green" v-else-if="item.expireDays>0 && item.expireDays <= 30">
								{{item.expireDays}}天内过期</span>
						</div>
						<div class="product-stock">
							<span class="stock-label">库存</span>
							<span class="stock-value">{{item.quantity}}{{item.unit}}</span>
							<span style="color:#f9f9f9">batchId: {{item.id}} {{item.status}}</span>
						</div>
						<div class="expiry-date">
							<span>到期日期</span>
							<span>2025-11-05</span>
						</div>
						<view class="stockOut">
							<button @click="stockOut(item)">-</button>
							<button @click="stockIn(item)">+</button>
						</view>
					</view>
				</view>
			</uni-swipe-action-item>
		</uni-swipe-action>
		<view>
			<uni-popup ref="inputDialog" title="出库" type="dialog">
				<view class="dialog stock-in-dialog">
					<view class="d-title"><text>出库</text></view>
					<view class="out-input-area">
						<uni-easyinput v-model="outQuantity" placeholder="出库数量"></uni-easyinput>
						<text>{{curItem.unit}}</text>
					</view>
					<view class="btns">
						<view @click="cancelStock" class="cancel-btn">取消</view>
						<view @click="doStockOut" class="confirm-btn">确认</view>
					</view>
				</view>
			</uni-popup>
			<uni-popup ref="stockInDialog" title="入库" type="dialog">
				<view class="dialog">
					<view class="d-title"><text>入库</text></view>
					<view class="out-input-area">
						<uni-easyinput v-model="inQuantity" placeholder="入库数量"></uni-easyinput>
						<text>{{curItem.unit}}</text>
					</view>
					<view class="out-input-area" style="margin-top:12rpx" v-if="stockInType == 2">
						<uni-easyinput class="uni-input" v-model="shelfLifeDays" :clearable="false" placeholder="多久后过期？">
						</uni-easyinput>
						<text>天</text>
					</view>
					<view class="uni-px-5 uni-pb-5">
						<uni-data-checkbox v-model="stockInType" :localdata="stockInTypes"></uni-data-checkbox>
					</view>
					<view class="btns">
						<view @click="cancelStock" class="cancel-btn">取消</view>
						<view @click="doStockIn" class="confirm-btn">确认</view>
					</view>
				</view>
			</uni-popup>
		</view>
	</view>
</template>

<script>
	import http from '@/utils/http.js';

	export default {
		data() {
			return {
				isOpened: [],
				warehouses: [],
				shelfLifeDays: '',
				curItem: {},
				inQuantity: '',
				goodsList: [],
				curHome: '',
				homes: [],
				outQuantity: '',
				stockInType: 1,
				stockInTypes: [{
					text: '同一批次',
					value: 1
				}, {
					text: '不同批次（生产/到期日期不同）',
					value: 2
				}],
				options1: [{
					text: '丢弃',
					style: {
						backgroundColor: '#FF3B30',
						fontSize: '28rpx'
					}
				}],
				colorMap: {
					3: '#F94D50',
					7: '#FA8C16',
					10: '#52C41B'
				},
				bgColorMap: {
					3: '#FFF6F7',
					7: '#FFFAF5'
				}
			}
		},
		async onPullDownRefresh() {
			console.log('下拉刷新触发')
			this.page = 1
			await this.getAllGoods()
			uni.stopPullDownRefresh()
		},
		mounted() {},
		onShow() {
			// 缓存中获取
			this.getFamilys()
			this.curHome = uni.getStorageSync('recent-used-home')
			this.getAllGoods()
		},
		methods: {
			goConfig(){
				uni.switchTab({
					url:'/pages/login/login'
				})
			},
			homeSwitch(v) {
				console.log('======switch', v.detail?.value)
				this.curHome = v.detail?.value
			},
			async getFamilys() {
				const homes=  uni.getStorageSync('homes')
				if(homes?.length) {
					homes.map(item => {
						this.homes.push({
							value: item.id,
							text: item.name
						})
					})
				}
			},
			async doStockIn() {
				if (!this.inQuantity) {
					uni.showToast({
						title: '请输入入库数量',
						icon: 'none'
					})
					return
				}
				if (this.stockInType == 1) {
					// 相同批次入库，仅修改那条批次的数量
				} else {
					const {
						itemName,
						unit,
						warehouseId
					} = this.curItem
					// 不同批次入库，相当于首页的入库
					const res = await http.post('/warehouses/stock-in', {
						ingredientName: itemName,
						unit,
						warehouseId,
						shelfLifeDays: this.shelfLifeDays,
						quantity: this.inQuantity,
					})
					if (res.success) {
						uni.showToast({
							title: '入库成功',
							icon: 'none'
						})
						this.$refs.stockInDialog?.close()
						this.getAllGoods()
					}
				}
			},
			stockIn(item) {
				this.curItem = item
				this.$refs.stockInDialog.open()
			},
			async doStockOut() {
				if (!this.outQuantity) {
					console.log('-----', this.outQuantity)
					uni.showToast({
						title: '请输入需要出库数量',
						icon: 'none'
					})
					return true
				}
				if (this.outQuantity > this.curItem.quantity) {
					uni.showToast({
						title: `物品数量不足${this.outQuantity}${this.curItem.unit}`,
						icon: 'none'
					})
					return true
				}
				const res = await http.post('/warehouses/stock-out', {
					warehouseId: this.curItem.warehouseId,
					ingredientId: this.curItem.ingredientId,
					batchId: this.curItem.id,
					quantity: this.outQuantity,

				})
				if (res.success) {
					uni.showToast({
						title: '出库成功',
						icon: 'none'
					})
					this.$refs.inputDialog?.close()
					this.getAllGoods()
				}
				console.log('res--', res)

			},
			cancelStock() {
				this.curItem = {}
				this.$refs.inputDialog?.close()
				this.$refs.stockInDialog?.close()
			},
			stockOut(item) {
				this.curItem = item
				this.$refs.inputDialog.open()
			},
			async clickSwipeBtn(e, item, i) {
				console.log('点击了' + (e.position === 'left' ? '左侧' : '右侧') + e.content.text + '按钮')
				if (e.content.text == '丢弃') {
					await this.disCardBatch(item)
					this.goodsList.splice(i, 1)
					this.isOpened = new Array(this.goodsList.length).fill('none')

				}
			},
			async disCardBatch(item) {
				const res = await http.post('/warehouses/discard-batch', {
					batchId: item.id,
					warehouseId: item.warehouseId
				})
				if (res.success) {
					uni.showToast({
						title: '食材已经被丢弃～',
						icon: 'none'
					})
					this.$refs.inputDialog?.close()
					// this.getAllGoods()
				}
			},
			getDaysUntil(targetDate) {
				// 创建今日日期对象，并设置为零点以确保计算准确
				const today = new Date();
				today.setHours(0, 0, 0, 0);

				// 创建目标日期对象
				const target = new Date(targetDate);
				target.setHours(0, 0, 0, 0);

				// 计算毫秒差
				const timeDiff = target.getTime() - today.getTime();

				// 转换为天数并返回
				const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
				return daysDiff;
			},
			async getAllGoods() {
				const recent = this.curHome
				if (!recent) {
					uni.showToast({
						text: '请先创建家庭',
						icon: 'none'
					})
					return
				}
				const res = await http.post('/warehouses/family/getAllGoods', {
					familyId: recent
				})
				this.goodsList = res.data
				this.goodsList.map(item => {
					item.expireDays = this.getDaysUntil(item.expiryDate)
				})
				this.isOpened = new Array(this.goodsList.length).fill('none')
				console.log(this.goodsList[0])
			}
		}
	}
</script>

<style scoped lang="stylus">
	.main {
		padding:16rpx 24rpx 24rpx 24rpx;
		overflow-x: hidden;
	}

	>>>.uni-swipe_button {
		height: 220rpx;
		border-radius: 0 12rpx 12rpx 0;
		width: 90rpx;
	}

	.product-card {
		width: 100%;
		overflow-x: hidden;
		background: white;
		border-radius: 12rpx;
		box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
		overflow: hidden;
		display: flex;
		transition: transform 0.3s ease, box-shadow 0.3s ease;
		margin: 16rpx 0
	}

	.stockOut {
		display: flex;
		position: absolute;
		bottom: 20rpx;
		right: 20rpx;


	}

	.stockOut button {
		margin: 0 8rpx;
		width: 54rpx;
		height: 54rpx;
		font-size: 32rpx;
		font-weight: bold;
		padding: 0 0;
		line-height: 48rpx;
		background: #3B81F6;
		color: #fff;
		border-radius: 50%;

		border: none;

		&:first-child {
			background: #fff;
			border: 1px solid #3B81F6;
			color: #3B81F6;
		}
	}

	.accent-line {
		width: 8rpx;
		background: linear-gradient(to bottom, #4CAF50, #8BC34A);
	}

	.card-content {
		position: relative;
		flex: 1;
		padding: 20rpx;
		padding-left: 40rpx
	}

	.product-name {
		font-size: 20px;
		font-weight: 600;
		color: #333;
		margin-bottom: 12px;
		line-height: 1.4;
	}

	.product-spec {
		display: flex;
		justify-content: space-between;
		margin-bottom: 15px;
		padding-bottom: 15px;
		border-bottom: 1px dashed #e0e0e0;
	}

	.spec-label {
		font-size: 14px;
		color: #666;
	}

	.spec-value {
		font-size: 14px;
		color: #333;
		font-weight: 500;
	}

	.product-stock {
		display: flex;
		justify-content: left;
		margin-bottom: 6rpx;
	}

	.stock-label {
		font-size: 14px;
		color: #666;
		margin-right: 12rpx
	}

	.stock-value {
		font-size: 14px;
		color: #2563EB;
		font-weight: 500;
	}

	.expiry-date {
		display: flex;
		justify-content: left;
		font-size: 13px;
		color: #999;
	}

	.tag {
		padding: 4rpx 16rpx;
		border-radius: 10rpx;
		font-size: 28rpx;
		position: absolute;
		top: 12rpx;
		right: 12rpx;

	}
	.home-line{
		display: flex;
		justify-content: space-between;
		position: relative
	}
	>>> .uni-select{
	width: 340rpx
}
.g-icon{
	position: absolute;
	top: 10rpx;
	font-size:24rpx !important;
	right:6rpx
}
.h-icon{
	position: absolute;
	top: 10rpx;
	font-size:24rpx !important;
	left:12rpx
}
	>>> .uni-select__input-box {
	margin-left: 44rpx
}
	.uni-px-5 {
		height: 188rpx;
		margin-top:20rpx;
		font-size: 24rpx;
	}

	.dialog {
		padding: 24rpx 24rpx;
		border-radius: 24rpx;
		background: #fff;
		min-height: 260rpx;
		width: 480rpx;
		position: relative;
	}

	.d-title {
		width: 100%;
		text-align: center;
		font-weight: bold;
		font-size: 32rpx;
		color: #1a1a1a
	}

	.out-input-area {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 40rpx
	}

	.btns {
		position: absolute;
		bottom: 0;
		width: 100%;
		left: 0;
		display: flex;
		justify-content: space-between
	}

	.cancel-btn {
		width: 240rpx;
		text-align: center;
		font-size: 32rpx;
		color: #666;
		border: none;
		padding: 24rpx;
		background: transparent
	}

	.confirm-btn {
		width: 240rpx;
		text-align: center;
		font-size: 32rpx;
		padding: 24rpx;
		color: #2563EB;
		border: none;
		background: none
	}

	.out-input-area text {
		font-weight: bold;
		color: #3B81F6;
		font-size: 32rpx;
		margin-left: 22rpx;
		display: inline-block
	}

	.tag.green {
		background-color: #E8F5E9;
		color: #4CAF50;
	}

	.tag.orange {
		background-color: #FFFAF5;
		color: #FA8C16;
	}

	.tag.red {
		background-color: #FFF6F7;
		color: #F94D50;
	}
</style>