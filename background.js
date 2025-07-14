// 后台脚本 - 处理定时提醒
const ALARM_NAME = 'water-reminder';
const REMINDER_INTERVAL = 30; // 30分钟

// 插件安装时初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('喝水提醒助手已安装');
  
  // 检查通知权限
  chrome.notifications.getPermissionLevel((level) => {
    console.log('通知权限级别:', level);
    if (level === 'denied') {
      console.error('通知权限被拒绝，请手动开启');
    }
  });
  
  // 创建定时器
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: REMINDER_INTERVAL,
    periodInMinutes: REMINDER_INTERVAL
  });
  
  // 设置默认状态
  chrome.storage.local.set({
    isEnabled: true,
    lastReminder: Date.now(),
    totalReminders: 0
  });
});

// 处理定时器触发
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    showWaterReminder();
  }
});

// 显示喝水提醒通知
function showWaterReminder() {
  chrome.storage.local.get(['isEnabled'], (result) => {
    if (result.isEnabled) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: '喝水提醒 💧',
        message: '已经30分钟了，该喝水了！保持水分补充，健康每一天！',
        requireInteraction: false,
        silent: false,
        priority: 2
      }, (notificationId) => {
        if (chrome.runtime.lastError) {
          console.error('通知创建失败:', chrome.runtime.lastError);
        }
      });
      
      // 更新统计数据
      chrome.storage.local.get(['totalReminders'], (data) => {
        const newTotal = (data.totalReminders || 0) + 1;
        chrome.storage.local.set({
          lastReminder: Date.now(),
          totalReminders: newTotal
        });
      });
    }
  });
}

// 处理通知点击
chrome.notifications.onClicked.addListener(() => {
  chrome.notifications.clear('water-reminder');
  // 可以在这里添加更多功能，比如打开特定页面
});

// 处理来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleReminder') {
    if (request.enabled) {
      chrome.alarms.create(ALARM_NAME, {
        delayInMinutes: REMINDER_INTERVAL,
        periodInMinutes: REMINDER_INTERVAL
      });
    } else {
      chrome.alarms.clear(ALARM_NAME);
    }
    sendResponse({success: true});
  }
  
  if (request.action === 'getStatus') {
    chrome.storage.local.get(['isEnabled', 'lastReminder', 'totalReminders'], (data) => {
      sendResponse(data);
    });
    return true; // 保持消息通道开放
  }
  

}); 