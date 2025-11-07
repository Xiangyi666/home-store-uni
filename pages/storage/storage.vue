<template>
	<view class="main">
		<button @click="getAllGoods">刷新test</button>
		<view v-for="(item, index) in goodsList" :key="index" class="product-card">
			<view class="accent-line"></view>
			<view class="card-content">
				<div class="product-name">
					{{item.itemName}}
					<span class="tag red" v-if="item.expireDays<0">已经过期</span>
					<span class="tag orange" v-else-if="item.expireDays<=3">临期</span>
					<span class="tag green" v-else-if="item.expireDays>0 && item.expireDays <= 30"> {{item.expireDays}}天内过期</span>
				</div>
				<div class="product-stock">
					<span class="stock-label">库存</span>
					<span class="stock-value">3件</span>
				</div>
				<div class="expiry-date">
					<span>到期日期</span>
					<span>2025-11-05</span>
				</div>
			</view>
		</view>
	</view>
</template>

<script>
	import http from '@/utils/http.js';

	export default {
		data() {
			return {
				warehouses: [],
				goodsList: [],
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
		mounted() {
			this.getAllGoods()
		},
		methods: {
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
				const res = await http.post('/warehouses/family/getAllGoods', {
					familyId: 9
				})
				this.goodsList = res.data
				this.goodsList.map(item => {
					item.expireDays = this.getDaysUntil(item.expiryDate)
				})
				console.log(this.goodsList[0])
			}
		}
	}
</script>

<style scoped lang="stylus">
	.main {
		padding: 24rpx
	}

	.product-card {
		width: 100%;
		background: white;
		border-radius: 12rpx;
		box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
		overflow: hidden;
		display: flex;
		transition: transform 0.3s ease, box-shadow 0.3s ease;
		margin: 16rpx 0 
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
		top: 12rpx ;
		right: 12rpx;

	}
	.tag.green {
		background-color: #E8F5E9;
		color: #4CAF50;
	}
	.tag.orange{
		background-color: #FFFAF5;
		color: #FA8C16;
	}
	.tag.red{
		background-color: #FFF6F7;
		color: #F94D50;
	}
</style>