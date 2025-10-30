<template>
  <div class="home">
    <!-- 首页路由入口演示卡片 -->
    <div class="demo-card">
      <h2>页面导航入口 Demo</h2>
      <!-- 导航按钮：自动列出所有路由 -->
      <div class="nav-list">
        <!-- v-for 遍历路由表，自动生成按钮 -->
        <van-button
          v-for="route in navRoutes"
          :key="route.path"
          type="primary"
          block
          style="margin-bottom: 10px"
          @click="goTo(route.path)"
          >跳转到 {{ route.name }} 页面</van-button
        >
      </div>
      <div class="desc">
        全局所有路由均会出现在此 Demo 首页。后续如添加页面只需配置 router
        添加路由即可自动生效。
      </div>
    </div>
    <!--
      原首页内容已整体注释，仅作演示，无实际渲染
      如需查看原业务内容请取消注释块
    -->
  </div>
</template>

<script>
// 使用 JavaScript + 中文注释风格，无类型约束
export default {
  name: "Home",
  data() {
    return {
      /**
       * 路由列表，形如 [{ path, name }]
       * @type {Array<{ path: string, name: string }>}
       */
      navRoutes: [],
    };
  },
  created() {
    // 自动收集全部带 name 的页面路由，便于首页展示入口
    // @ts-ignore
    this.navRoutes = this.$router.options.routes
      .filter((route) => route.name)
      .map((route) => ({ path: route.path, name: route.name }));
  },
  methods: {
    /** 跳转到目标页面（输入路由路径） */
    goTo(path) {
      this.$router.push(path);
    },
  },
};
</script>

<style scoped>
.demo-card {
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  margin: 32px 16px 8px 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
}
.nav-list {
  margin: 14px 0 20px 0;
}
.desc {
  margin-top: 10px;
  font-size: 12px;
  color: #999;
}
</style>
