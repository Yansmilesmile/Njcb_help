<template>
  <div class="activity-form-container">
    <!-- 表单内容 -->
    <van-form @submit="onSubmit">
      <!-- 活动基本信息 -->
      <div class="form-section">
        <div class="section-title">活动基本信息</div>

        <!-- 活动模式 -->
        <van-field
          readonly
          clickable
          name="activityMode"
          label="活动模式"
          placeholder="请选择"
          :value="formData.activityMode"
          @click="showModePopup = true"
          required
        />
        <van-popup v-model="showModePopup" position="bottom">
          <van-picker
            show-toolbar
            :columns="modeOptions"
            @confirm="onModeConfirm"
            @cancel="showModePopup = false"
          />
        </van-popup>

        <!-- 活动类型 -->
        <van-field
          readonly
          clickable
          name="activityType"
          label="活动类型"
          placeholder="请选择"
          :value="formData.activityType"
          :disabled="!formData.activityMode"
          @click="showTypePopup = true"
          required
        />
        <van-popup v-model="showTypePopup" position="bottom">
          <van-picker
            show-toolbar
            :columns="typeOptions"
            @confirm="onTypeConfirm"
            @cancel="showTypePopup = false"
          />
        </van-popup>

        <!-- 活动主题 -->

        <van-field
          v-model="formData.activityTheme"
          name="activityTheme"
          rows="2"
          autosize
          label="活动主题"
          type="textarea"
          maxlength="30"
          placeholder="请输入"
          show-word-limit
          required
        />
        <!-- 开始时间/结束时间 -->
        <div class="time-group">
          <van-field
            readonly
            clickable
            name="startTime"
            label="开始时间"
            placeholder="请选择"
            :value="formData.startTime"
            @click="openTimePicker"
            required
          />
          <van-field
            readonly
            clickable
            name="endTime"
            label="结束时间"
            placeholder="请选择"
            :value="formData.endTime"
            @click="openTimePicker"
            required
          />
        </div>

        <!-- 时间选择器 -->
        <van-popup
          v-model="showTimePicker"
          position="bottom"
          :style="{ height: '50%' }"
        >
          <div class="time-picker-wrapper">
            <div
              class="time-picker-header"
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <div
                @click="onTimeCancel"
                style="font-size: 12px; flex: 1; text-align: left"
              >
                取消
              </div>
              <span class="picker-title" style="flex: 2; text-align: center"
                >选择时间范围</span
              >
              <div style="flex: 1; text-align: right">
                <van-button
                  plain
                  type="default"
                  size="small"
                  @click="onTimeConfirm"
                  style="margin: 0 auto"
                  >确认</van-button
                >
              </div>
            </div>
            <div class="time-picker-content" style="text-align: center">
              <div class="time-item">
                <div class="time-label" style="text-align: center">
                  开始时间
                </div>
                <div class="picker-header">
                  <div class="header-item">年</div>
                  <div class="header-item">月</div>
                  <div class="header-item">日</div>
                  <div class="header-item">时</div>
                  <div class="header-item">分</div>
                </div>
                <van-datetime-picker
                  v-model="tempStartTime"
                  type="datetime"
                  :min-date="minDate"
                  :max-date="maxDate"
                  title=""
                />
              </div>
              <div class="time-item">
                <div class="time-label" style="text-align: center">
                  结束时间
                </div>
                <div class="picker-header">
                  <div class="header-item">年</div>
                  <div class="header-item">月</div>
                  <div class="header-item">日</div>
                  <div class="header-item">时</div>
                  <div class="header-item">分</div>
                </div>
                <van-datetime-picker
                  v-model="tempEndTime"
                  type="datetime"
                  :min-date="tempStartTime > minDate ? tempStartTime : minDate"
                  :max-date="maxDate"
                  title=""
                />
              </div>
            </div>
          </div>
        </van-popup>
      </div>

      <!-- 活动地点 -->
      <div class="form-section">
        <div class="section-title">活动地点</div>

        <!-- 渠道名称 -->
        <div class="channel-wrapper">
          <van-field
            v-model="formData.channelName"
            name="channelName"
            label="渠道名称"
            placeholder="请输入"
            @input="onChannelNameChange"
            required
          />
          <div v-if="channelOptions.length > 0" class="channel-list">
            <div
              v-for="(item, index) in channelOptions"
              :key="index"
              class="channel-item"
              @click="selectChannel(item)"
            >
              {{ item.text }}
            </div>
          </div>
        </div>

        <!-- 举办地点 -->
        <van-field
          readonly
          clickable
          name="halfOfficeLocation"
          label="举办地点"
          placeholder="请选择"
          :value="formData.halfOfficeLocation"
          @click="showLocationPopup = true"
          required
        />
        <van-popup v-model="showLocationPopup" position="bottom">
          <van-picker
            show-toolbar
            :columns="locationOptions"
            @confirm="onLocationConfirm"
            @cancel="showLocationPopup = false"
          />
        </van-popup>

        <!-- 门牌号 -->
        <van-field
          v-model="formData.doorNumber"
          name="doorNumber"
          label="门牌号"
          placeholder="请输入"
        />

        <!-- 签到范围 -->
        <van-field
          readonly
          clickable
          name="signInRange"
          label="签到范围"
          placeholder="请选择"
          :value="formData.signInRange"
          @click="showSignInPopup = true"
          required
        />
        <van-popup v-model="showSignInPopup" position="bottom">
          <van-picker
            show-toolbar
            :columns="signInRangeOptions"
            @confirm="onSignInConfirm"
            @cancel="showSignInPopup = false"
          />
        </van-popup>
      </div>

      <!-- 活动营销素材 -->
      <div class="form-section">
        <div class="section-title">活动营销素材</div>

        <!-- 活动海报 -->
        <div class="poster-section">
          <div class="label">活动海报</div>
          <div class="poster-grid">
            <div
              v-for="(item, index) in posterList"
              :key="index"
              class="poster-item"
              @click="selectPoster(item, index)"
            >
              <img :src="item.url" :alt="`poster-${index}`" />
              <!-- 未选中状态的白色圆圈 -->
              <div
                v-if="formData.poster !== item.url + index"
                class="unselected-circle"
              ></div>
              <!-- 选中状态的图标 -->
              <van-icon
                v-if="formData.poster === item.url + index"
                name="checked"
                class="check-icon"
              />
            </div>
          </div>
        </div>

        <!-- 报名素材 -->
        <van-field
          readonly
          name="signUpMaterial"
          label="报名素材"
          :value="formData.signUpMaterial"
        />

        <!-- 签到素材 -->
        <van-field
          readonly
          name="signInMaterial"
          label="签到素材"
          :value="formData.signInMaterial"
        />
      </div>

      <!-- 备注 -->
      <div class="form-section">
        <van-field
          v-model="formData.remarks"
          name="remarks"
          label="备注"
          placeholder="请输入"
          type="textarea"
          maxlength="200"
          rows="3"
        />
        <div class="char-count">{{ formData.remarks.length }}/200</div>
      </div>

      <!-- 提交按钮 -->
      <div class="button-section">
        <van-button
          :disabled="!isSubmitEnabled"
          type="info"
          native-type="submit"
          block
        >
          提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
export default {
  name: "CreateActivity",
  data() {
    return {
      formData: {
        activityMode: "",
        activityType: "",
        activityTheme: "",
        startTime: "",
        endTime: "",
        channelName: "",
        halfOfficeLocation: "",
        doorNumber: "",
        signInRange: "",
        poster: "",
        signUpMaterial: "报名素材",
        signInMaterial: "签到素材",
        remarks: "",
      },
      tempStartTime: new Date(),
      tempEndTime: new Date(),
      minDate: new Date(),
      maxDate: null,
      showModePopup: false,
      showTypePopup: false,
      showTimePicker: false,
      showLocationPopup: false,
      showSignInPopup: false,
      channelOptions: [],
      channelTimeout: null,
      modeOptions: ["外拓团办", "沙龙"],
      locationOptions: ["500m", "1000m"],
      signInRangeOptions: ["500m", "1000m"],
      posterList: [
        { url: require("@/assets/logo.png") },
        { url: require("@/assets/logo.png") },
        { url: require("@/assets/logo.png") },
        { url: require("@/assets/logo.png") },
        { url: require("@/assets/logo.png") },
        { url: require("@/assets/logo.png") },
        { url: require("@/assets/logo.png") },
      ],
    };
  },
  computed: {
    channelShow() {
      return this.channelOptions.length > 0;
    },
    typeOptions() {
      if (this.formData.activityMode === "沙龙") {
        return [
          "理财",
          "基金",
          "保险",
          "贵金属",
          "个贷",
          "信用卡",
          "客户主题沙龙",
          "财富客户主题沙龙",
          "烟草主题沙龙",
          "财富之旅",
          "投资策略会",
          "观影活动",
          "其他私行沙龙",
        ];
      } else if (this.formData.activityMode === "外拓团办") {
        return ["渠道驻点", "商户活动"];
      }
      return [];
    },
    isSubmitEnabled() {
      return (
        this.formData.activityMode &&
        this.formData.activityType &&
        this.formData.activityTheme &&
        this.formData.startTime &&
        this.formData.endTime &&
        this.formData.channelName &&
        this.formData.halfOfficeLocation &&
        this.formData.signInRange
      );
    },
  },
  mounted() {
    // 设置最大日期为当天加一个月
    const today = new Date();
    this.maxDate = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    );
  },
  methods: {
    onModeConfirm(value) {
      this.formData.activityMode = value;
      this.formData.activityType = ""; // 重置活动类型
      this.showModePopup = false;
    },
    onTypeConfirm(value) {
      this.formData.activityType = value;
      this.showTypePopup = false;
    },
    openTimePicker() {
      // 同步当前选择的时间
      if (this.formData.startTime) {
        this.tempStartTime = this.parseDateTime(this.formData.startTime);
      } else {
        this.tempStartTime = new Date();
      }
      if (this.formData.endTime) {
        this.tempEndTime = this.parseDateTime(this.formData.endTime);
      } else {
        this.tempEndTime = new Date();
      }
      this.showTimePicker = true;
    },
    onTimeConfirm() {
      // 确保开始时间不大于结束时间
      if (this.tempStartTime > this.tempEndTime) {
        this.$toast("开始时间不能大于结束时间");
        return;
      }
      this.formData.startTime = this.formatDateTime(this.tempStartTime);
      this.formData.endTime = this.formatDateTime(this.tempEndTime);
      this.showTimePicker = false;
    },
    onTimeCancel() {
      // 恢复为原来的时间值
      if (this.formData.startTime) {
        this.tempStartTime = this.parseDateTime(this.formData.startTime);
      } else {
        this.tempStartTime = new Date();
      }
      if (this.formData.endTime) {
        this.tempEndTime = this.parseDateTime(this.formData.endTime);
      } else {
        this.tempEndTime = new Date();
      }
      this.showTimePicker = false;
    },
    parseDateTime(dateTimeStr) {
      // 解析格式: "2024-08-14 10:00"
      if (!dateTimeStr) return new Date();
      const [datePart, timePart] = dateTimeStr.split(" ");
      const [year, month, day] = datePart.split("-").map(Number);
      const [hours, minutes] = timePart
        ? timePart.split(":").map(Number)
        : [0, 0];
      return new Date(year, month - 1, day, hours, minutes);
    },
    onLocationConfirm(value) {
      this.formData.halfOfficeLocation = value;
      this.showLocationPopup = false;
    },
    onSignInConfirm(value) {
      this.formData.signInRange = value;
      this.showSignInPopup = false;
    },
    formatDateTime(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    onChannelNameChange(value) {
      // 清除之前的超时
      if (this.channelTimeout) {
        clearTimeout(this.channelTimeout);
      }

      // 500ms延时后请求
      this.channelTimeout = setTimeout(() => {
        this.fetchChannelOptions(value);
      }, 500);
    },
    fetchChannelOptions(keyword) {
      console.log(keyword);

      // 如果关键词为空，清空选项列表
      if (!keyword || keyword.trim() === "") {
        this.channelOptions = [];
        return;
      }

      // 模拟API请求
      const mockData = [
        { text: "向阳小区" },
        { text: "向阳花园" },
        { text: "向阳大厦" },
      ];

      // 根据输入过滤数据
      this.channelOptions = mockData.filter((item) =>
        item.text.includes(keyword.trim())
      );
      console.log(this.channelOptions, "this.channelOptions");
    },
    selectChannel(item) {
      this.formData.channelName = item.text;
      this.channelOptions = [];
    },
    selectPoster(item, index) {
      const posterId = item.url + index;
      // 如果已选中，则取消选中；否则选中
      if (this.formData.poster === posterId) {
        this.formData.poster = "";
      } else {
        this.formData.poster = posterId;
      }
    },
    onSubmit() {
      // 提交表单
      console.log("提交表单数据:", this.formData);
      this.$toast.success("提交成功");
    },
  },
};
</script>

<style scoped lang="less">
.activity-form-container {
  padding-bottom: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;

  ::v-deep .van-form {
    background-color: white;

    .van-cell {
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
    }
  }
}

.form-section {
  margin-bottom: 0;
  background-color: white;
  margin-top: 10px;

  .section-title {
    padding: 12px 16px;
    font-size: 14px;
    color: #666;
    font-weight: 500;
    background-color: #f5f5f5;
  }
}

.time-group {
  ::v-deep .van-cell {
    padding: 12px 16px;
  }
}

.char-count {
  padding: 8px 16px;
  font-size: 12px;
  color: #999;
  text-align: right;
}

.channel-wrapper {
  position: relative;
}

.channel-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #eee;
  border-top: none;
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .channel-item {
    padding: 10px 16px;
    border-bottom: 1px solid #eee;
    font-size: 14px;
    color: #333;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: #f0f0f0;
    }

    &:active {
      background-color: #e0e0e0;
    }
  }
}

.poster-section {
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 16px;

  .label {
    font-size: 14px;
    color: #333;
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
  }
}

.poster-grid {
  display: flex;
  flex-wrap: wrap;
  margin-left: -5px;
  margin-right: -5px;
  flex: 1;

  .poster-item {
    position: relative;
    border-radius: 4px;
    overflow: hidden;
    box-sizing: border-box;
    width: calc(25% - 10px);
    margin: 0 5px 10px 5px;
    padding-bottom: calc(25% - 10px);

    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .unselected-circle {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 16px;
      height: 16px;
      background-color: #ffffff;
      border-radius: 50%;
      z-index: 1;
    }

    .check-icon {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 16px;
      height: 16px;
      font-size: 16px;
      color: #1989fa;
      z-index: 1;
      display: block;
      line-height: 16px;
      text-align: center;
    }
  }
}

/* 原生 CSS 备选方案：如果 flex 不支持时使用 */
@supports not (display: flex) {
  .poster-section {
    .label {
      display: inline-block;
      vertical-align: top;
      margin-right: 16px;
    }

    .poster-grid {
      display: inline-block;
      vertical-align: top;
      width: calc(100% - 80px);
      font-size: 0;
      margin-left: -5px;
      margin-right: -5px;
    }

    .poster-grid .poster-item {
      display: inline-block;
      vertical-align: top;
      font-size: 14px;
    }
  }
}

.button-section {
  padding: 20px 16px;
  background-color: white;

  ::v-deep .van-button {
    height: 44px;
  }
}

.time-picker-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.time-picker-header {
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

.time-picker-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.time-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #ebedf0;
}

.time-item:last-child {
  border-right: none;
}

.time-label {
  padding: 12px 16px;
  font-size: 14px;
  color: #646566;
  text-align: center;
  background-color: #f7f8fa;
  border-bottom: 1px solid #ebedf0;
}

.picker-header {
  display: flex;
  align-items: center;
  padding: 8px 0;
  background-color: #f7f8fa;
  border-bottom: 1px solid #ebedf0;
  position: relative;
  z-index: 1;
}

.header-item {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: #646566;
  font-weight: 500;
  padding: 0;
  box-sizing: border-box;
}

/* 确保表头与 picker 列对齐 */
.time-item ::v-deep .van-picker__columns {
  display: flex;
}

.time-item ::v-deep .van-picker-column {
  flex: 1;
}

::v-deep.van-datetime-picker {
  .van-picker__toolbar {
    display: none;
  }
  .van-ellipsis {
    font-size: 12px !important;
  }
}
</style>
