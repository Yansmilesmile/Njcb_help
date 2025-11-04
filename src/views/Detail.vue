<template>
  <div class="home">
    <van-nav-bar title="重点指标" fixed />

    <div class="page-container" style="padding-top: 46px">
      <div class="card">
        <div class="tabs-header">
          <van-tabs
            v-model="activeTab"
            @click="onTabClick"
            :ellipsis="false"
            color="#1989fa"
          >
            <van-tab
              v-for="tab in orderedTabs"
              :key="tab.key"
              :title="tab.name"
            >
              <div class="tab-content">
                <!-- Current Value -->
                <div class="metric-section">
                  <div class="metric-label">当前 ({{ tab.unit }})</div>
                  <div class="metric-value">
                    {{ formatNumber(tab.current) }}
                    <span class="metric-unit">{{ tab.unit }}</span>
                  </div>
                </div>

                <!-- Change Indicators -->
                <div class="change-indicators">
                  <div class="change-item">
                    <span class="change-label">较上日</span>
                    <span
                      :class="[
                        'change-value',
                        getChangeClass(tab.changes.daily),
                      ]"
                    >
                      {{ formatChange(tab.changes.daily) }}
                      <van-icon :name="getArrowIcon(tab.changes.daily)" />
                    </span>
                    <van-icon
                      name="arrow"
                      class="arrow-icon"
                      @click="goToDetail(tab.key)"
                    />
                  </div>
                  <div class="change-item">
                    <span class="change-label">较上月</span>
                    <span
                      :class="[
                        'change-value',
                        getChangeClass(tab.changes.monthly),
                      ]"
                    >
                      {{ tab.changes.monthly }}
                    </span>
                  </div>
                  <div class="change-item">
                    <span class="change-label">较年初</span>
                    <span
                      :class="[
                        'change-value',
                        getChangeClass(tab.changes.yearly),
                      ]"
                    >
                      {{ tab.changes.yearly }}
                      <van-icon :name="getArrowIcon(tab.changes.yearly)" />
                    </span>
                  </div>
                </div>

                <!-- Chart -->
                <div class="chart-container">
                  <div class="chart-title">近30天{{ tab.name }}趋势图</div>
                  <div class="chart-subtitle">单位：{{ tab.unit }}</div>
                  <div
                    :ref="`chart-${tab.key}`"
                    style="width: 100%; height: 200px"
                  ></div>
                </div>
              </div>
            </van-tab>
          </van-tabs>

          <van-icon
            name="apps-o"
            class="sort-icon"
            @click="showSortPopup = true"
          />
        </div>
      </div>
    </div>

    <!-- Sort Popup -->
    <van-popup
      v-model="showSortPopup"
      position="bottom"
      :style="{ height: '50%' }"
      round
    >
      <div class="sort-popup">
        <div class="sort-header">
          <span>排序</span>
          <van-button type="primary" size="small" @click="saveSortOrder">
            完成
          </van-button>
        </div>
        <div class="sort-list" ref="sortList">
          <div
            v-for="tab in sortableTabs"
            :key="tab.key"
            class="sort-item"
            :data-key="tab.key"
          >
            <van-icon name="bars" class="drag-handle" />
            <span>{{ tab.name }}</span>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import * as echarts from "echarts";
import Sortable from "sortablejs";
import { tabsData } from "../utils/mockData";

export default {
  name: "Home",
  data() {
    return {
      activeTab: 0,
      tabsData: tabsData,
      tabOrder: [
        "loanBalance",
        "creditCustomers",
        "usageCustomers",
        "loanInvestment",
      ],
      showSortPopup: false,
      sortableTabs: [],
      sortableInstance: null,
    };
  },
  computed: {
    orderedTabs() {
      return this.tabOrder.map((key) => this.tabsData[key]);
    },
  },
  mounted() {
    this.loadTabOrder();
    this.$nextTick(() => {
      this.initCharts();
    });
  },
  watch: {
    activeTab() {
      this.$nextTick(() => {
        this.initCharts();
      });
    },
    showSortPopup(val) {
      if (val) {
        this.sortableTabs = [...this.orderedTabs];
        this.$nextTick(() => {
          this.initSortable();
        });
      }
    },
  },
  methods: {
    formatNumber(num) {
      return num.toFixed(2);
    },
    formatChange(num) {
      return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
    },
    getChangeClass(value) {
      if (value > 0) return "positive";
      if (value < 0) return "negative";
      return "neutral";
    },
    getArrowIcon(value) {
      if (value > 0) return "arrow-up";
      if (value < 0) return "arrow-down";
      return "";
    },
    onTabClick(index) {
      this.activeTab = index;
    },
    goToDetail(type) {
      const targetRoute = `/detail/${type}`;
      console.log(targetRoute);

      // 判断当前路由路径是否等于目标路由
      if (this.$route.path !== targetRoute) {
        this.$router.push(targetRoute);
      }
    },
    initCharts() {
      this.orderedTabs.forEach((tab, index) => {
        if (index === this.activeTab) {
          const chartRef = this.$refs[`chart-${tab.key}`];
          if (chartRef && chartRef[0]) {
            const chart = echarts.init(chartRef[0]);

            const option = {
              grid: {
                left: "10%",
                right: "5%",
                top: "15%",
                bottom: "15%",
              },
              xAxis: {
                type: "category",
                data: tab.chartData.map((item) => item.date),
                axisLine: {
                  lineStyle: { color: "#e5e5e5" },
                },
                axisLabel: {
                  color: "#969799",
                  fontSize: 11,
                },
              },
              yAxis: {
                type: "value",
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                  color: "#969799",
                  fontSize: 11,
                },
                splitLine: {
                  lineStyle: { color: "#f0f0f0" },
                },
              },
              series: [
                {
                  data: tab.chartData.map((item) => item.value),
                  type: "line",
                  smooth: true,
                  symbol: "circle",
                  symbolSize: 6,
                  lineStyle: {
                    color: "#1989fa",
                    width: 2,
                  },
                  itemStyle: {
                    color: "#1989fa",
                  },
                  areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: "rgba(25, 137, 250, 0.3)" },
                      { offset: 1, color: "rgba(25, 137, 250, 0.05)" },
                    ]),
                  },
                },
              ],
              tooltip: {
                trigger: "axis",
                formatter: "{b}<br/>{c} " + tab.unit,
              },
            };

            chart.setOption(option);

            window.addEventListener("resize", () => {
              chart.resize();
            });
          }
        }
      });
    },
    loadTabOrder() {
      const saved = localStorage.getItem("tabOrder");
      if (saved) {
        try {
          this.tabOrder = JSON.parse(saved);
        } catch (e) {
          console.error("Failed to load tab order:", e);
        }
      }
    },
    saveTabOrder() {
      localStorage.setItem("tabOrder", JSON.stringify(this.tabOrder));
    },
    initSortable() {
      if (this.sortableInstance) {
        this.sortableInstance.destroy();
      }

      const el = this.$refs.sortList;
      if (el) {
        this.sortableInstance = Sortable.create(el, {
          animation: 150,
          handle: ".drag-handle",
          onEnd: (evt) => {
            const item = this.sortableTabs.splice(evt.oldIndex, 1)[0];
            this.sortableTabs.splice(evt.newIndex, 0, item);
          },
        });
      }
    },
    saveSortOrder() {
      this.tabOrder = this.sortableTabs.map((tab) => tab.key);
      this.saveTabOrder();
      this.showSortPopup = false;
      this.$nextTick(() => {
        this.initCharts();
      });
    },
  },
};
</script>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.tabs-header {
  position: relative;
}

.sort-icon {
  position: absolute;
  right: 16px;
  top: 12px;
  font-size: 20px;
  color: #969799;
  cursor: pointer;
  z-index: 10;
}

.tab-content {
  padding: 16px 0;
}

.metric-section {
  margin-bottom: 16px;
}

.metric-label {
  font-size: 13px;
  color: #969799;
  margin-bottom: 4px;
}

.chart-subtitle {
  font-size: 12px;
  color: #969799;
  margin-bottom: 8px;
}

.sort-popup {
  padding: 16px;
}

.sort-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
}

.sort-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sort-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
  cursor: move;
}

.drag-handle {
  font-size: 18px;
  color: #969799;
}
.van-picker__toolbar {
  display: none;
}
</style>
