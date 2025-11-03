<template>
  <div class="salon-page">
    <!-- 顶部标题 -->
    <van-nav-bar
      title="沙龙/外拓团办"
      left-arrow
      @click-left="onBack"
      fixed
      placeholder
    />

    <div class="content">
      <!-- 机构名称面包屑 -->
      <div class="org-breadcrumb">{{ orgNamePath }}</div>

      <!-- 时间选择器 -->
      <div
        @click="openDatePicker"
        style="
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        "
        class="dateClass"
      >
        <span style="margin-right: 5px">{{ dateRangeText }}</span>
        <img
          src="@/assets/down.png"
          alt="下拉"
          style="width: 16px; height: 16px"
        />
      </div>
      <van-popup
        v-model="showDatePicker"
        position="bottom"
        :style="{ height: '50%' }"
      >
        <div class="date-picker-wrapper">
          <div
            class="date-picker-header"
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <div
              @click="
                showDatePicker = false;
                startDate = dateRange[0];
                endDate = dateRange[1];
              "
              style="font-size: 12px; flex: 1; text-align: left"
            >
              取消
            </div>
            <span class="picker-title" style="flex: 2; text-align: center"
              >选择日期范围</span
            >
            <div style="flex: 1; text-align: right">
              <van-button
                plain
                type="default"
                size="small"
                @click="onDateConfirm"
                style="margin: 0 auto"
                >确认</van-button
              >
            </div>
          </div>
          <div class="date-picker-content" style="text-align: center">
            <div class="date-item">
              <div class="date-label" style="text-align: center">开始日期</div>
              <van-datetime-picker
                v-model="startDate"
                type="date"
                :min-date="minDate"
                :max-date="maxDate"
                title=""
              />
            </div>
            <div class="date-item">
              <div class="date-label" style="text-align: center">结束日期</div>
              <van-datetime-picker
                v-model="endDate"
                type="date"
                :min-date="startDate > minDate ? startDate : minDate"
                :max-date="maxDate"
                title=""
              />
            </div>
          </div>
        </div>
      </van-popup>

      <!-- 统计卡片 -->
      <div class="stats-card">
        <div class="stats-item">
          <div class="stats-label">沙龙/外拓团办场次</div>
          <div class="stats-value">{{ statistics.sessionCount || 0 }}</div>
        </div>
        <div class="stats-item">
          <div class="stats-label">签到(人)</div>
          <div class="stats-value">{{ statistics.signInCount || 0 }}</div>
        </div>
      </div>

      <!-- 机构列表 (isAdmin=true) -->
      <div v-if="isAdmin" class="org-list">
        <div class="list-header">
          <span>沙龙/外拓团办场次</span>
          <span>签到人数</span>
        </div>
        <van-list
          v-model="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="item in orgList"
            :key="item.orgId"
            class="org-item"
            @click="drillDown(item)"
          >
            <div
              style="
                display: flex;
                justify-content: space-between;
                width: 100%;
                margin-bottom: 20px;
              "
            >
              <div class="org-name">{{ item.orgName }}</div>
              <van-icon name="arrow" class="arrow-icon" />
            </div>
            <div class="org-stats">
              <span class="session-count"
                >沙龙/外拓团办场次(场)<br /><span
                  style="color: #333333; font-size: 20px; font-weight: 500"
                >
                  {{ item.sessionCount }}
                </span></span
              >
              <span class="sign-count"
                >签到(人)<br /><span
                  style="color: #333333; font-size: 20px; font-weight: 500"
                >
                  {{ item.signInCount }}
                </span></span
              >
            </div>
          </div>
        </van-list>
      </div>

      <!-- 人员活动列表 (isAdmin=false) -->
      <div v-else class="activity-list">
        <!-- 筛选器 -->
        <div class="filter-bar">
          <van-dropdown-menu>
            <van-dropdown-item
              v-model="filters.activityMode"
              :options="activityModeOptions"
              @change="onFilterChange"
            />
            <van-dropdown-item
              v-model="filters.activityType"
              :options="activityTypeOptions"
              @change="onFilterChange"
            />
            <van-dropdown-item
              v-model="filters.activityStatus"
              :options="activityStatusOptions"
              @change="onFilterChange"
            />
          </van-dropdown-menu>
        </div>

        <!-- 活动列表 -->
        <van-list
          v-model="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="activity in activityList"
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-header">
              <van-tag :type="getActivityModeType(activity.activityMode)">
                {{ activity.activityMode }}
              </van-tag>
              <span class="activity-name">{{ activity.activityName }}</span>
              <van-tag :type="getStatusType(activity.status)" plain>
                {{ activity.status }}
              </van-tag>
            </div>
            <div class="activity-body">
              <div class="activity-info-row">
                <span class="label">活动类型:</span>
                <span class="value">{{ activity.activityType }}</span>
              </div>
              <div class="activity-info-row">
                <span class="label">渠道名称:</span>
                <span class="value">{{ activity.channelName }}</span>
              </div>
              <div class="activity-info-row">
                <span class="label">活动时间:</span>
                <span class="value">{{ activity.activityTime }}</span>
              </div>
            </div>
          </div>
        </van-list>
      </div>

      <!-- 更新时间 -->
      <div class="update-time">更新时间：{{ updateTime }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SalonStatistics",
  data() {
    const now = new Date();
    // T+1时效，今天能看到昨天的数据，所以最早日期是昨天
    const yesterday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1
    );
    // minDate是上个月的当天
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    // maxDate是未来一个月的当天
    const oneMonthLater = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate()
    );
    // 默认选择范围：上个月的今天到昨天（T+1，今天能看到昨天的数据）
    const defaultStartDate = oneMonthAgo;
    const defaultEndDate = yesterday;

    return {
      // 日期相关
      showDatePicker: false,
      dateRange: [defaultStartDate, defaultEndDate],
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      minDate: oneMonthAgo,
      maxDate: oneMonthLater,

      // 机构路径
      orgNamePath: "总行",
      orgPathArray: ["总行"],

      // 统计数据
      statistics: {
        sessionCount: 0,
        signInCount: 0,
      },

      // 列表状态
      isAdmin: true,
      loading: false,
      finished: false,

      // 机构列表
      orgList: [],

      // 活动列表
      activityList: [],

      // 分页参数
      page: 1, // 当前页码
      pageSize: 10, // 每页数量
      total: 0, // 总记录数

      // 筛选条件
      filters: {
        activityMode: "",
        activityType: "",
        activityStatus: "",
      },

      // 筛选选项
      activityModeOptions: [
        { text: "全部", value: "" },
        { text: "沙龙", value: "沙龙" },
        { text: "外拓团办", value: "外拓团办" },
      ],
      activityTypeOptions: [
        { text: "全部", value: "" },
        { text: "理财", value: "理财" },
        { text: "基金", value: "基金" },
        { text: "保险", value: "保险" },
        { text: "个贷", value: "个贷" },
        { text: "信用卡", value: "信用卡" },
        { text: "财富客户主题沙龙", value: "财富客户主题沙龙" },
        { text: "客户主题沙龙", value: "客户主题沙龙" },
        { text: "烟草主题沙龙", value: "烟草主题沙龙" },
        { text: "投资策略会", value: "投资策略会" },
        { text: "财富之旅", value: "财富之旅" },
        { text: "观影活动", value: "观影活动" },
        { text: "其他私行沙龙", value: "其他私行沙龙" },
      ],
      activityStatusOptions: [
        { text: "全部", value: "" },
        { text: "未开始", value: "未开始" },
        { text: "进行中", value: "进行中" },
        { text: "已结束", value: "已结束" },
      ],

      // 更新时间
      updateTime: "",

      // 当前查询参数
      currentQueryParams: null,
    };
  },
  computed: {
    dateRangeText() {
      if (this.dateRange && this.dateRange.length === 2) {
        const start = this.formatDate(this.dateRange[0]);
        const end = this.formatDate(this.dateRange[1]);
        return `${start} 至 ${end}`;
      }
      return "请选择日期范围";
    },
  },
  mounted() {
    this.loadData();
  },
  methods: {
    // 打开日期选择器
    openDatePicker() {
      // 同步当前选择的日期范围
      this.startDate = this.dateRange[0];
      this.endDate = this.dateRange[1];
      this.showDatePicker = true;
    },

    // 格式化日期
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    // 日期确认
    onDateConfirm() {
      // 确保开始日期不大于结束日期
      if (this.startDate > this.endDate) {
        this.$toast("开始日期不能大于结束日期");
        return;
      }
      this.dateRange = [this.startDate, this.endDate];
      this.showDatePicker = false;
      // 重置分页
      this.page = 1;
      this.orgList = [];
      this.activityList = [];
      this.finished = false;
      this.loadData();
    },

    // 加载数据
    async loadData(params = null, isLoadMore = false) {
      // 如果是加载更多，不设置loading状态（由van-list控制）
      if (!isLoadMore) {
        this.loading = true;
      }

      try {
        // 构建请求参数
        const queryParams = params ||
          this.currentQueryParams || {
            startDate: this.formatDate(this.dateRange[0]),
            endDate: this.formatDate(this.dateRange[1]),
          };

        // 添加分页参数
        queryParams.page = this.page;
        queryParams.pageSize = this.pageSize;

        // 如果是人员列表，添加筛选条件
        if (!this.isAdmin) {
          Object.assign(queryParams, {
            activityMode: this.filters.activityMode,
            activityType: this.filters.activityType,
            activityStatus: this.filters.activityStatus,
          });
        }

        // 调用接口 - 这里需要替换为实际的API调用
        const response = await this.searchData(queryParams);

        // 更新统计数据（只有首次加载或刷新时更新）
        if (!isLoadMore) {
          this.statistics = {
            sessionCount: response.sessionCount || 0,
            signInCount: response.signInCount || 0,
          };
        }

        // 更新isAdmin状态（只有首次加载时更新）
        if (!isLoadMore) {
          this.isAdmin = response.isAdmin;
        }

        // 更新总记录数
        this.total = response.total || 0;

        // 根据isAdmin更新列表
        if (this.isAdmin) {
          const newOrgList = response.orgList || [];
          if (isLoadMore) {
            // 加载更多：追加数据
            this.orgList = [...this.orgList, ...newOrgList];
          } else {
            // 首次加载或刷新：替换数据
            this.orgList = newOrgList;
          }
        } else {
          const newActivityList = response.activityList || [];
          if (isLoadMore) {
            // 加载更多：追加数据
            this.activityList = [...this.activityList, ...newActivityList];
          } else {
            // 首次加载或刷新：替换数据
            this.activityList = newActivityList;
          }
        }

        // 更新时间
        if (!isLoadMore) {
          this.updateTime = response.updateTime || this.formatDate(new Date());
        }

        // 判断是否已加载完所有数据
        const currentList = this.isAdmin ? this.orgList : this.activityList;
        this.finished = currentList.length >= this.total;
      } catch (error) {
        console.error("加载数据失败:", error);
        this.$toast("加载数据失败");
        this.finished = true;
      } finally {
        this.loading = false;
      }
    },

    // 模拟API调用 - 实际使用时替换为真实接口
    async searchData(params) {
      // 模拟延迟
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 获取分页参数
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;

      // 模拟返回数据
      if (params.orgId) {
        // 如果有orgId，判断是否还有下级
        if (params.isLastLevel) {
          // 生成模拟活动列表数据（总共30条）
          const allActivityList = [];
          const activityModes = ["沙龙", "外拓团办"];
          const statuses = ["未开始", "进行中", "已结束"];
          const activityTypes = ["理财", "基金", "保险", "个贷", "信用卡"];
          const channelNames = [
            "实网社店",
            "南京市人工智能有限公司",
            "-",
            "某渠道公司",
          ];

          for (let i = 1; i <= 30; i++) {
            allActivityList.push({
              id: i,
              activityMode: activityModes[i % 2],
              activityName: `活动名称${i}`,
              status: statuses[i % 3],
              activityType: activityTypes[i % 5],
              channelName: channelNames[i % 4],
              activityTime: `2024-08-${String(14 + (i % 10)).padStart(
                2,
                "0"
              )} 10:00 至 2024-08-${String(14 + (i % 10)).padStart(
                2,
                "0"
              )} 12:00`,
            });
          }

          // 分页处理
          const start = (page - 1) * pageSize;
          const end = start + pageSize;
          const pageData = allActivityList.slice(start, end);

          return {
            isAdmin: false,
            sessionCount: 45,
            signInCount: 245,
            total: 30,
            activityList: pageData,
            updateTime: "2024-08-13",
          };
        } else {
          // 生成模拟机构列表数据（总共25条）
          const allOrgList = [];
          const orgNames = [
            "李乐乐",
            "郑安司",
            "四通",
            "李玉才",
            "张三",
            "李四",
            "王五",
            "赵六",
            "钱七",
            "孙八",
          ];

          for (let i = 1; i <= 25; i++) {
            allOrgList.push({
              orgId: String(3 + i),
              orgName: `${orgNames[i % 10]}${i > 10 ? i : ""}`,
              sessionCount: 45 + (i % 10),
              signInCount: 245 + (i % 20),
              isAdmin: false,
            });
          }

          // 分页处理
          const start = (page - 1) * pageSize;
          const end = start + pageSize;
          const pageData = allOrgList.slice(start, end);

          return {
            isAdmin: true,
            sessionCount: 400,
            signInCount: 245,
            total: 25,
            orgList: pageData,
            updateTime: "2024-08-13",
          };
        }
      } else {
        // 生成模拟顶级机构列表数据（总共30条）
        const allOrgList = [];
        const topOrgNames = [
          "南京分行",
          "上海分行",
          "苏州分行",
          "杭州分行",
          "城东支行",
          "城西支行",
          "城南支行",
          "城北支行",
        ];

        for (let i = 1; i <= 30; i++) {
          allOrgList.push({
            orgId: String(i),
            orgName: `${topOrgNames[i % 8]}${i > 8 ? (i % 8) + 1 : ""}`,
            sessionCount: 45 + (i % 10),
            signInCount: 245 + (i % 20),
            isAdmin: true,
          });
        }

        // 分页处理
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const pageData = allOrgList.slice(start, end);

        return {
          isAdmin: true,
          sessionCount: 4040,
          signInCount: 245,
          total: 30,
          orgList: pageData,
          updateTime: "2024-08-13",
        };
      }
    },

    // 下钻
    async drillDown(item) {
      // 添加到路径
      this.orgPathArray.push(item.orgName);
      this.orgNamePath = this.orgPathArray.join("-");

      // 保存当前查询参数
      this.currentQueryParams = {
        orgId: item.orgId,
        orgName: item.orgName,
        isLastLevel: !item.isAdmin,
        startDate: this.formatDate(this.dateRange[0]),
        endDate: this.formatDate(this.dateRange[1]),
      };

      // 重置列表和分页
      this.page = 1;
      this.orgList = [];
      this.activityList = [];
      this.finished = false;

      // 加载新数据
      await this.loadData(this.currentQueryParams);
    },

    // 返回上一级
    onBack() {
      if (this.orgPathArray.length > 1) {
        // 移除最后一级
        this.orgPathArray.pop();
        this.orgNamePath = this.orgPathArray.join("-");

        // 重置查询参数
        this.currentQueryParams = null;

        // 重置列表和分页
        this.page = 1;
        this.orgList = [];
        this.activityList = [];
        this.finished = false;

        // 重新加载数据
        this.loadData();
      } else {
        // 已经是顶级，执行真正的返回
        this.$toast("返回上一页");
      }
    },

    // 列表加载（分页加载更多）
    async onLoad() {
      // 如果已经加载完，直接返回
      if (this.finished) {
        return;
      }

      // 页码加1
      this.page += 1;

      // 加载下一页数据
      await this.loadData(null, true);
    },

    // 筛选变化
    onFilterChange() {
      // 重置分页和列表
      this.page = 1;
      this.activityList = [];
      this.finished = false;
      this.loadData();
    },

    // 获取活动模式标签类型
    getActivityModeType(mode) {
      return mode === "沙龙" ? "warning" : "danger";
    },

    // 获取状态标签类型
    getStatusType(status) {
      const typeMap = {
        未开始: "danger",
        进行中: "primary",
        已结束: "success",
      };
      return typeMap[status] || "default";
    },
  },
};
</script>

<style scoped>
.van-picker__toolbar {
  display: none;
}
.salon-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.content {
  padding: 12px;
}
.dateClass {
  padding: 12px 16px;
  border-radius: 8px;
  background: white;
}
.org-breadcrumb {
  padding: 12px 16px;
  background: white;
  margin-bottom: 12px;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.stats-card {
  display: flex;
  background: white;
  padding: 16px;
  margin: 0px 0px 12px 0;
  border-radius: 8px;
}

.stats-item {
  flex: 1;
  text-align: center;
}

.stats-item:not(:last-child) {
  margin-right: 20px;
}

.stats-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.list-header {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  margin-bottom: 8px;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
}

.org-item {
  background: white;
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.org-name {
  flex: 1;
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.org-stats {
  display: flex;
  font-size: 12px;
  color: #666;
  width: 100%;
}

.session-count,
.sign-count {
  line-height: 1.6;
  flex: 1;
}

.session-count:not(:last-child),
.sign-count:not(:last-child) {
  margin-right: 20px;
}

.arrow-icon {
  margin-left: 12px;
  color: #c8c9cc;
}

.filter-bar {
  margin-bottom: 12px;
}

.activity-item {
  background: white;
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 8px;
}

.activity-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.activity-header > *:not(:last-child) {
  margin-right: 8px;
}

.activity-name {
  flex: 1;
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.activity-body {
  display: flex;
  flex-direction: column;
}

.activity-info-row {
  display: flex;
  font-size: 13px;
  line-height: 1.6;
}

.activity-info-row:not(:last-child) {
  margin-bottom: 8px;
}

.activity-info-row .label {
  color: #999;
  min-width: 70px;
}

.activity-info-row .value {
  color: #333;
  flex: 1;
}

.update-time {
  text-align: center;
  padding: 16px;
  font-size: 12px;
  color: #999;
}

.date-picker-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.date-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #ebedf0;
}

.picker-title {
  font-size: 16px;
  font-weight: 500;
  color: #323233;
}

.date-picker-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.date-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #ebedf0;
}

.date-item:last-child {
  border-right: none;
}

.date-label {
  padding: 12px 16px;
  font-size: 14px;
  color: #646566;
  text-align: center;
  background-color: #f7f8fa;
  border-bottom: 1px solid #ebedf0;
}
</style>
