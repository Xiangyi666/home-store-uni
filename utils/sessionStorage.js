// utils/sessionStorage.js
const SESSION_PREFIX = 'session_'
const SESSION_TIMEOUT = 10 * 60 * 1000 // 30分钟

export default {
  // 设置会话数据
  set(key, value) {
    const sessionData = {
      value: value,
      timestamp: new Date().getTime()
    }
    uni.setStorageSync(SESSION_PREFIX + key, JSON.stringify(sessionData))
  },
  
  // 获取会话数据（自动检查过期）
  get(key) {
    try {
      const dataStr = uni.getStorageSync(SESSION_PREFIX + key)
      if (!dataStr) return null
      
      const sessionData = JSON.parse(dataStr)
      const now = new Date().getTime()
      
      // 检查是否过期
      if (now - sessionData.timestamp > SESSION_TIMEOUT) {
        this.remove(key)
        return null
      }
      
      return sessionData.value
    } catch (e) {
      return null
    }
  },
  
  // 删除会话数据
  remove(key) {
    uni.removeStorageSync(SESSION_PREFIX + key)
  },
  
  // 清空所有会话数据
  clear() {
    const res = uni.getStorageInfoSync()
    res.keys.forEach(key => {
      if (key.startsWith(SESSION_PREFIX)) {
        uni.removeStorageSync(key)
      }
    })
  },
  
  // 更新会话时间戳（续期）
  refresh(key) {
    const value = this.get(key)
    if (value !== null) {
      this.set(key, value)
    }
  }
}