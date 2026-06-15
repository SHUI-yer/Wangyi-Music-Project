<script setup>
import { Search, Bell, Mail, Settings, User } from 'lucide-vue-next'
</script>

<template>
  <header class="header">
    <div class="logo">
      <div class="logo-icon">
        <div class="inner-circle"></div>
      </div>
      <span class="logo-text">网易云音乐</span>
    </div>

    <div class="nav-controls">
      <button class="control-btn">&lt;</button>
      <button class="control-btn">&gt;</button>
    </div>

    <div class="search-bar">
      <Search class="search-icon" :size="16" />
      <input type="text" placeholder="搜索音乐, 视频, 歌词, 电台" />
    </div>

    <div class="user-actions">
      <div class="user-info">
        <div class="avatar">
          <User :size="16" />
        </div>
        <span>未登录</span>
      </div>
      <Mail :size="20" class="action-icon" />
      <Bell :size="20" class="action-icon" />
      <Settings :size="20" class="action-icon" />
    </div>
  </header>
</template>

<style scoped>
.header {
  height: 60px;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  padding: 0 20px;
  color: white;
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 200px;
}

.logo-icon {
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inner-circle {
  width: 12px;
  height: 12px;
  border: 2px solid var(--primary-color);
  border-radius: 50%;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 2px;
}

.nav-controls {
  display: flex;
  gap: 10px;
  margin-left: 40px;
}

.control-btn {
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-size: 14px;
}

.search-bar {
  margin-left: 20px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  padding: 5px 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 240px;
}

.search-icon {
  opacity: 0.7;
}

.search-bar input {
  font-size: 12px;
  width: 100%;
}

.search-bar input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.user-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  opacity: 0.8;
}

.avatar {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon {
  opacity: 0.7;
  cursor: pointer;
}

.action-icon:hover {
  opacity: 1;
}
</style>
