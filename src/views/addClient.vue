<template>
  <div class="activity-customers">
    <!-- Header -->
    <div class="header">
      <div class="back-btn">
        <van-icon name="arrow-left" @click="$router.back()" />
      </div>
      <div class="title">活动参与客户</div>
      <div class="empty"></div>
    </div>

    <!-- Tabs -->
    <van-tabs v-model="activeTab" @change="onTabChange" class="tabs">
      <van-tab title="存量客户" name="1">
        <div class="tab-content">
          <div class="tab-header">
            <span class="invited-count">已邀约 ({{ invitedCount1 }})</span>
            <div class="invite-btn" @click="showInvitePopup">
              <van-icon name="add-square" class="invite-icon" />
              邀约客户
            </div>
          </div>
          <div class="customer-list">
            <van-swipe-cell
              v-for="customer in customerList1"
              :key="customer.customerId"
              :disabled="customer.signStatus !== 2"
              class="customer-swipe-cell"
            >
              <div class="customer-item">
                <div class="customer-info">
                  <img
                    :src="getAvatar(customer.gender)"
                    :alt="customer.customerName"
                    class="avatar"
                  />
                  <div class="info-content">
                    <div class="customer-header">
                      <span class="customer-name">{{
                        customer.customerName
                      }}</span>
                      <span class="customer-level">
                        {{ getLevelText(customer.custLevelCode) }}
                      </span>
                      <span
                        class="sign-status"
                        :class="`status-${customer.signStatus}`"
                      >
                        {{ getSignStatusText(customer.signStatus) }}
                      </span>
                    </div>
                    <div class="customer-owner">
                      客户归属人：{{ customer.customerEmpName }} ({{
                        customer.customerEmpNo
                      }})
                    </div>
                  </div>
                </div>
                <div class="actions">
                  <a
                    href="tel:"
                    class="phone-btn"
                    @click.prevent="makeCall(customer)"
                  >
                    <van-icon name="phone" />
                    电话
                  </a>
                </div>
              </div>
              <template #right>
                <van-button
                  v-if="customer.signStatus === 2"
                  type="danger"
                  text
                  class="delete-btn"
                  @click="deleteCustomer(customer)"
                >
                  删除
                </van-button>
              </template>
            </van-swipe-cell>
          </div>
        </div>
      </van-tab>

      <van-tab title="潜在客户" name="2">
        <div class="tab-content">
          <div class="tab-header">
            <span class="invited-count">已邀约 ({{ invitedCount2 }})</span>
            <div class="invite-btn" @click="showInvitePopup">
              <van-icon name="add-square" class="invite-icon" />
              邀约客户
            </div>
          </div>
          <div class="customer-list">
            <van-swipe-cell
              v-for="customer in customerList2"
              :key="customer.customerId"
              :disabled="customer.signStatus !== 2"
              class="customer-swipe-cell"
            >
              <div class="customer-item">
                <div class="customer-info">
                  <img
                    :src="getAvatar(customer.gender)"
                    :alt="customer.customerName"
                    class="avatar"
                  />
                  <div class="info-content">
                    <div class="customer-header">
                      <span class="customer-name">{{
                        customer.customerName
                      }}</span>
                      <span class="customer-level">
                        {{ getLevelText(customer.custLevelCode) }}
                      </span>
                      <span
                        class="sign-status"
                        :class="`status-${customer.signStatus}`"
                      >
                        {{ getSignStatusText(customer.signStatus) }}
                      </span>
                    </div>
                    <div class="customer-owner">
                      客户归属人：{{ customer.customerEmpName }} ({{
                        customer.customerEmpNo
                      }})
                    </div>
                  </div>
                </div>
                <div class="actions">
                  <a
                    href="tel:"
                    class="phone-btn"
                    @click.prevent="makeCall(customer)"
                  >
                    <van-icon name="phone" />
                    电话(营销岗不显示)
                  </a>
                </div>
              </div>
              <template #right>
                <van-button
                  v-if="customer.signStatus === 2"
                  type="danger"
                  text
                  class="delete-btn"
                  @click="deleteCustomer(customer)"
                >
                  删除
                </van-button>
              </template>
            </van-swipe-cell>
          </div>
        </div>
      </van-tab>
    </van-tabs>

    <!-- Invite Popup -->
    <van-popup v-model="showInvite" position="bottom" class="invite-popup">
      <div class="invite-content">
        <div class="popup-title">邀约客户</div>
        <van-search
          v-model="searchText"
          placeholder="搜索客户名称或ID"
          show-action
          @search="onSearch"
        >
          <template #action>
            <span class="search-cancel" @click="onCancelInvite">取消</span>
          </template>
        </van-search>
        <div class="invite-list">
          <div
            v-for="customer in searchResults"
            :key="customer.customerId"
            class="invite-item"
            @click="selectCustomer(customer)"
          >
            <div class="item-info">
              <span class="name">{{ customer.customerName }}</span>
              <span class="info">{{ customer.customerEmpName }}</span>
            </div>
            <van-icon name="arrow" />
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
export default {
  name: "ActivityCustomers",
  data() {
    return {
      activeTab: "1",
      customerList1: [],
      customerList2: [],
      invitedCount1: 0,
      invitedCount2: 0,
      showInvite: false,
      searchText: "",
      searchResults: [],
      qryld: "", // 从上一页接收
    };
  },
  computed: {
    invitedCount() {
      return this.activeTab === "1" ? this.invitedCount1 : this.invitedCount2;
    },
  },
  mounted() {
    // 从路由参数获取qryld
    this.qryld = this.$route.query.qryld || this.$route.params.qryld;
    this.fetchCustomers();
  },
  methods: {
    async fetchCustomers() {
      const qryType = this.activeTab;
      try {
        const response = await this.$api.post(
          "/businessOutreachTeam/addParticipatingCustomers",
          {
            qryld: this.qryld,
            qryType: qryType,
          }
        );

        if (response.code === "200") {
          const customers = response.resultList || [];
          this.count = res.result.count || 4;
          if (qryType === "1") {
            this.customerList1 = customers;
            this.invitedCount1 = customers.length;
          } else {
            this.customerList2 = customers;
            this.invitedCount2 = customers.length;
          }
        }
      } catch (error) {
        console.error("[v0] 获取客户列表失败:", error);
        this.$toast.fail("加载客户列表失败，已使用本地数据");

        const mockCustomers = [
          {
            customerId: `${qryType}-mock-001`,
            customerName: qryType === "1" ? "张三" : "李雷",
            gender: "02",
            custLevelCode: "03",
            signStatus: 2,
            customerEmpName: "王小美",
            customerEmpNo: "NB12345",
            phone: "13800000000",
          },
          {
            customerId: `${qryType}-mock-002`,
            customerName: qryType === "1" ? "赵敏" : "韩梅梅",
            gender: "03",
            custLevelCode: "04",
            signStatus: 1,
            customerEmpName: "王小美",
            customerEmpNo: "NB12345",
            phone: "13900000000",
          },
        ];

        if (qryType === "1") {
          this.customerList1 = mockCustomers;
          this.invitedCount1 = mockCustomers.length;
        } else {
          this.customerList2 = mockCustomers;
          this.invitedCount2 = mockCustomers.length;
        }
      }
    },

    onTabChange() {
      this.fetchCustomers();
    },

    getAvatar(gender) {
      // 根据性别返回不同的头像
      const avatarMap = {
        "02": "https://via.placeholder.com/50x50?text=M", // 男
        "03": "https://via.placeholder.com/50x50?text=F", // 女
        "01": "https://via.placeholder.com/50x50?text=U", // 未提供
        99: "https://via.placeholder.com/50x50?text=U", // 未知
      };
      return avatarMap[gender] || avatarMap["01"];
    },

    getLevelText(code) {
      const levelMap = {
        "00": "未评价",
        "01": "普通客户",
        "02": "潜力客户",
        "03": "金卡",
        "04": "白金",
        "05": "钻石",
        "06": "私人银行",
      };
      return levelMap[code] || "未知";
    },

    getSignStatusText(status) {
      const statusMap = {
        1: "已签到",
        2: "已报名",
      };
      return statusMap[status] || "未知";
    },

    makeCall(customer) {
      window.location.href = `tel:${customer.phone || ""}`;
    },

    async deleteCustomer(customer) {
      this.$dialog
        .confirm({
          title: "删除客户",
          message: `确认删除客户 ${customer.customerName} 吗？`,
        })
        .then(() => {
          // TODO: 调用删除API
          const list =
            this.activeTab === "1" ? this.customerList1 : this.customerList2;
          const index = list.findIndex(
            (c) => c.customerId === customer.customerId
          );
          if (index > -1) {
            list.splice(index, 1);
            if (this.activeTab === "1") {
              this.invitedCount1--;
            } else {
              this.invitedCount2--;
            }
          }
          this.$toast.success("删除成功");
        })
        .catch(() => {});
    },

    showInvitePopup() {
      this.showInvite = true;
      this.searchText = "";
      this.searchResults = [];
    },

    async onSearch() {
      if (!this.searchText.trim()) {
        this.searchResults = [];
        return;
      }

      try {
        const response = await this.$api.post(
          "/businessOutreachTeam/searchCustomers",
          {
            qryld: this.qryld,
            qryType: this.activeTab,
            keyword: this.searchText,
          }
        );

        if (response.code === "200") {
          this.searchResults = response.resultList || [];
        }
      } catch (error) {
        console.error("[v0] 搜索客户失败:", error);
        this.$toast.fail("搜索失败");
      }
    },

    async selectCustomer(customer) {
      try {
        const response = await this.$api.post(
          "/businessOutreachTeam/inviteCustomer",
          {
            qryld: this.qryld,
            customerId: customer.customerId,
            qryType: this.activeTab,
          }
        );

        if (response.code === "200") {
          this.$toast.success("邀约成功");
          this.showInvite = false;
          this.fetchCustomers();
        }
      } catch (error) {
        console.error("[v0] 邀约客户失败:", error);
        this.$toast.fail("邀约失败");
      }
    },

    onCancelInvite() {
      this.showInvite = false;
    },
  },
};
</script>

<style scoped>
.activity-customers {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  padding: 0 16px;
}

.header .title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
}

.back-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty {
  width: 30px;
}

.tabs {
  flex: 1;
  overflow: hidden;
}

.tab-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.tab-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #f5f5f5;
}

.invited-count {
  font-size: 15px;
  color: #4c4b4c;
}

.invite-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #1890ff;
  font-size: 14px;
  cursor: pointer;
}

.invite-icon {
  color: #1890ff;
  font-size: 18px;
}

.customer-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 0 8px 0;
}

.customer-swipe-cell {
  margin: 0 10px 8px;
}

.customer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #fff;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  border-radius: 10px;
}

.customer-info {
  display: flex;
  align-items: flex-start;
  flex: 1;
  gap: 12px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
  min-width: 0;
}

.customer-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.customer-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.customer-level {
  font-size: 13px;
  padding: 2px 6px;
  border-radius: 3px;
  color: #fafeff;
  background-color: #85c2ff;
  border-radius: 10px;
}

.sign-status {
  font-size: 13px;
  padding: 2px 6px;
  border-radius: 3px;
  color: #fff;
}
.status-1 {
  color: #1daf29;
}

.status-2 {
  color: #333333;
}

.customer-owner {
  font-size: 14px;
  color: #999;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.phone-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #1890ff;
  text-decoration: none;
}

.phone-btn .van-icon {
  font-size: 16px;
}

.delete-btn {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
}

.invite-popup {
  max-height: 80vh;
}

.invite-content {
  padding: 16px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.popup-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.invite-list {
  flex: 1;
  overflow-y: auto;
  margin-top: 12px;
}

.invite-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-info .name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.item-info .info {
  font-size: 14px;
  color: #999;
}

.search-cancel {
  color: #21adf0;
  font-size: 14px;
}
</style>
