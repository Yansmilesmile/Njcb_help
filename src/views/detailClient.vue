<template>
  <div class="activity-detail">
    <!-- 页面头部 -->
    <div class="detail-header">
      <van-nav-bar
        title="活动详情"
        left-arrow
        @click-left="$router.back()"
        safe-area-inset-top
      />
    </div>

    <!-- 内容区域 -->
    <div class="detail-content">
      <!-- 第一排：标题和状态 -->
      <div class="father-content">
        <div class="detail-title-row">
          <div class="title-left">
            <div class="theme-text">{{ activityDetail.busThem }}</div>
            <div class="tag-group">
              <span class="tag tag-mode">{{
                getModeText(activityDetail.busMode)
              }}</span>
              <span class="tag tag-type">{{ activityDetail.busType }}</span>
            </div>
          </div>
          <div class="title-right">
            <span
              class="status-badge"
              :class="`status-${activityDetail.busStatus}`"
            >
              {{ getStatusText(activityDetail.busStatus) }}
            </span>
          </div>
        </div>

        <!-- 第二排：创建信息 -->
        <div class="create-info">
          由 {{ activityDetail.busCreatorName }}({{
            activityDetail.busCreator
          }}) 于 {{ formatDateTime(activityDetail.busCreateTime) }} 新建
        </div>

        <!-- 信息卡片 -->
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">开始时间</span>
            <span class="info-value">{{
              formatDateTime(activityDetail.busStartTime)
            }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">结束时间</span>
            <span class="info-value">{{
              formatDateTime(activityDetail.busEndTime)
            }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">关联渠道</span>
            <span class="info-value">{{ activityDetail.channelName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">举办地点</span>
            <span class="info-value"
              >{{ activityDetail.busLocal
              }}{{ activityDetail.busLocalCode }}</span
            >
          </div>
          <div class="info-row">
            <span class="info-label">签到范围</span>
            <span class="info-value">{{ activityDetail.busScope }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">备注</span>
            <span class="info-value">{{ activityDetail.busDesc }}</span>
          </div>
        </div>
      </div>

      <!-- 协助人和参与客户 -->
      <div class="action-buttons">
        <div
          class="action-btn"
          @click="goToAssistants"
          style="border-right: 1px solid #efefef"
        >
          <span>协助人</span>
          <span class="count">{{ assistantCount }}</span>
          <van-icon name="arrow" />
        </div>
        <div class="action-btn" @click="goToCustomers">
          <span>参与客户</span>
          <span class="count">{{ customerCount }}</span>
          <van-icon name="arrow" />
        </div>
      </div>

      <!-- 邀请海报 -->
      <div class="poster-section">
        <div class="section-title">邀请海报：</div>
        <div class="poster-container">
          <div style="display: flex; align-items: center; width: 100%">
            <div class="poster-placeholder" style="margin-right: 16px">
              <van-icon name="photo" size="40" />
            </div>
            <div style="flex: 1"></div>
            <div class="share-btn">分享</div>
          </div>
        </div>
      </div>

      <!-- 报名素材 -->
      <div class="material-section">
        <div class="section-title">报名素材</div>
        <div class="material-text">{{ activityDetail.busApplySc }}</div>
      </div>

      <!-- 签到素材 -->
      <div class="material-section">
        <div class="section-title">签到素材</div>
        <div class="material-text">{{ activityDetail.bussignsc }}</div>
      </div>

      <!-- 占位符，为底部按钮留空间 -->
      <div class="bottom-spacer"></div>
    </div>

    <!-- 底部按钮（固定定位） -->
    <div class="bottom-actions">
      <van-button plain class="btn-cancel" @click="showCancelDialog = true">
        取消活动
      </van-button>
      <van-button type="primary" class="btn-edit" @click="goToEdit">
        编辑
      </van-button>
    </div>

    <!-- 取消活动确认对话框 -->
    <van-dialog
      v-model="showCancelDialog"
      message="是否确认取消该活动？"
      show-cancel-button
      confirm-button-text="取消活动"
      cancel-button-text="再想想"
      @confirm="confirmCancel"
      confirm-button-color="#02A7F0"
    />
  </div>
</template>

<script>
export default {
  name: "ActivityDetail",
  data() {
    return {
      showCancelDialog: false,
      assistantCount: 0,
      customerCount: 0,
      activityDetail: {
        busThem: "理财产品分享会",
        busMode: 1, // 1沙龙 2外拓团办
        busType: "理财",
        busStatus: 2, // 2未开始 3进行中 4已结束 5已取消
        busCreatorName: "罗兆乐",
        busCreateTime: "2024-07-18 09:31",
        busStartTime: "2024-08-13 14:00",
        busEndTime: "2024-08-13 18:00",
        channelName: "向阳花园",
        busLocal: "江苏省南京市建邺区泸州街道户山路242号南京金融城-A楼103",
        busLocalCode: "",
        busScope: "500m",
        busDesc: "备注内容备注内容备注内容备注内容",
        busApplySc: "N Card 2.0版",
        bussignsc: "企牌名片",
        busCreator: "123",
      },
    };
  },
  mounted() {
    this.fetchActivityDetail();
  },
  methods: {
    async fetchActivityDetail() {
      try {
        // 调用接口获取详情数据
        const response = await this.$http.get(
          "businessOutreachTeam/grySaloninfo",
          {
            params: {
              qryld: this.$route.params.id || "1",
            },
          }
        );
        if (response && response.data) {
          this.activityDetail = response.data;
        }
      } catch (error) {
        console.error("获取活动详情失败:", error);
        // 接口失败时使用假数据（已在data中初始化）
        this.$toast.fail("获取活动详情失败");
      }
    },
    getModeText(mode) {
      const modeMap = {
        1: "沙龙",
        2: "外拓团办",
      };
      return modeMap[mode] || "";
    },
    getStatusText(status) {
      const statusMap = {
        2: "未开始",
        3: "进行中",
        4: "已结束",
        5: "已取消",
      };
      return statusMap[status] || "";
    },
    formatDateTime(datetime) {
      if (!datetime) return "";
      return datetime;
    },
    goToAssistants() {
      this.$router.push({
        name: "ActivityAssistants",
        params: { activityId: this.$route.params.id },
      });
    },
    goToCustomers() {
      this.$router.push({
        name: "ActivityCustomers",
        params: { activityId: this.$route.params.id },
      });
    },
    goToEdit() {
      this.$router.push({
        name: "CreateActivity",
        params: { id: this.$route.params.id },
      });
    },
    confirmCancel() {
      this.showCancelDialog = false;
      this.$http
        .post("businessOutreachTeam/cancelActivity", {
          qryld: this.$route.params.id,
        })
        .then(() => {
          this.$toast.success("活动已取消");
          setTimeout(() => {
            this.$router.back();
          }, 1000);
        })
        .catch((error) => {
          this.$toast.fail("取消活动失败");
          console.error("取消活动失败:", error);
        });
    },
  },
};
</script>

<style scoped lang="less">
.activity-detail {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;

  .detail-header {
    background: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 100px;

    .detail-title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: #fff;
      padding: 12px;

      .title-left {
        flex: 1;
        display: flex;
        align-items: center;
        .theme-text {
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }

        .tag-group {
          display: flex;
          gap: 8px;

          .tag {
            font-size: 12px;
            padding: 2px 10px;
            border-radius: 4px;
            white-space: nowrap;

            &.tag-mode {
              background: #fff8ea;
              color: #ffcb4b;
              border-radius: 12px;
              margin-left: 8px;
            }

            &.tag-type {
              background: #ffffff;
              border: 1px solid #68b9ff;
              color: #68b9ff;
              border-radius: 2px;
            }
          }
        }
      }

      .title-right {
        margin-left: 12px;

        .status-badge {
          display: inline-block;
          font-size: 12px;
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: bold;
          color: #fff;

          &.status-2 {
            color: #f5222d;
          }

          &.status-3 {
            color: #1aa7f0;
          }

          &.status-4 {
            color: #52c41a;
          }

          &.status-5 {
            color: #333;
          }
        }
      }
    }

    .create-info {
      font-size: 13px;
      color: #999;
      padding: 0 12px 8px 12px;
      background: #fff;
    }

    .info-card {
      background: #f8f8fa;
      border-radius: 10px;
      padding: 0px 12px;
      margin: 0px 12px;
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        font-size: 14px;

        &:last-child {
          border-bottom: none;
        }

        .info-label {
          color: #999;
          font-weight: 500;
          display: inline-block;
          min-width: 64px;
          flex-shrink: 0;
        }

        .info-value {
          color: #333;
          flex: 1;
          margin-left: 12px;
        }
      }
    }

    .action-buttons {
      display: flex;
      margin: 12px 0px;
      .action-btn {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #fff;
        padding: 12px;
        font-size: 14px;
        cursor: pointer;

        .count {
          color: #02a7f0;
          font-weight: bold;
          margin: 0 8px;
        }
      }
    }

    .poster-section {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #fff;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;

      .section-title {
        font-size: 14px;
        color: #333;
        font-weight: bold;
        flex-shrink: 0;
        min-width: 64px;
      }

      .poster-container {
        flex: 1;
        display: flex;
        gap: 12px;
        align-items: center;

        .poster-placeholder {
          width: 80px;
          height: 80px;
          background: #f0f0f0;
          border-radius: 8px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #ccc;
          flex-shrink: 0;
        }

        .share-btn {
          padding: 8px 16px;
          border: 1px solid #02a7f0;
          background: transparent;
          color: #02a7f0;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
        }
      }
    }

    .material-section {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #fff;
      border-radius: 8px;
      padding: 12px;

      .section-title {
        font-size: 14px;
        color: #333;
        font-weight: bold;
        flex-shrink: 0;
        min-width: 64px;
      }

      .material-text {
        flex: 1;
        font-size: 13px;
        color: #666;
      }
    }

    .bottom-spacer {
      height: 20px;
    }
  }

  .bottom-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    gap: 12px;
    padding: 12px;
    background: #fff;
    border-top: 1px solid #efefef;
    z-index: 10;

    .btn-cancel {
      flex: 1;
      border-color: #02a7f0;
      color: #02a7f0;
    }

    .btn-edit {
      flex: 1;
      background: #02a7f0;
      border-color: #02a7f0;
    }
  }
}
.father-content {
  background-color: #fff;
  padding-bottom: 10px;
}
</style>
