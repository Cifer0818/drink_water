// 弹出窗口脚本
document.addEventListener('DOMContentLoaded', function() {
    const statusText = document.getElementById('status-text');
    const reminderToggle = document.getElementById('reminder-toggle');
    const totalReminders = document.getElementById('total-reminders');
    const lastReminder = document.getElementById('last-reminder');
    const testNotificationBtn = document.getElementById('test-notification');

    // 加载状态
    loadStatus();

    // 监听开关变化
    reminderToggle.addEventListener('change', function() {
        const isEnabled = this.checked;
        toggleReminder(isEnabled);
    });

    // 测试通知按钮
    testNotificationBtn.addEventListener('click', function() {
        showTestNotification();
    });
    


    // 加载插件状态
    function loadStatus() {
        chrome.runtime.sendMessage({action: 'getStatus'}, function(response) {
            if (response) {
                updateUI(response);
            }
        });
    }

    // 更新UI显示
    function updateUI(data) {
        // 更新状态文本
        if (data.isEnabled) {
            statusText.textContent = '已启用';
            statusText.className = 'status-text enabled';
            reminderToggle.checked = true;
        } else {
            statusText.textContent = '已禁用';
            statusText.className = 'status-text disabled';
            reminderToggle.checked = false;
        }

        // 更新统计数据
        totalReminders.textContent = data.totalReminders || 0;
        
        // 更新上次提醒时间
        if (data.lastReminder) {
            const lastTime = new Date(data.lastReminder);
            const now = new Date();
            const diffMinutes = Math.floor((now - lastTime) / (1000 * 60));
            
            if (diffMinutes < 1) {
                lastReminder.textContent = '刚刚';
            } else if (diffMinutes < 60) {
                lastReminder.textContent = `${diffMinutes}分钟前`;
            } else {
                const diffHours = Math.floor(diffMinutes / 60);
                lastReminder.textContent = `${diffHours}小时前`;
            }
        } else {
            lastReminder.textContent = '--';
        }
    }

    // 切换提醒状态
    function toggleReminder(enabled) {
        chrome.runtime.sendMessage({
            action: 'toggleReminder',
            enabled: enabled
        }, function(response) {
            if (response && response.success) {
                // 更新本地存储
                chrome.storage.local.set({isEnabled: enabled});
                
                // 更新UI
                if (enabled) {
                    statusText.textContent = '已启用';
                    statusText.className = 'status-text enabled';
                } else {
                    statusText.textContent = '已禁用';
                    statusText.className = 'status-text disabled';
                }
            }
        });
    }

    // 显示测试通知
    function showTestNotification() {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: '测试通知 💧',
            message: '这是一个测试通知！喝水提醒功能正常工作。',
            requireInteraction: false,
            silent: false,
            priority: 2
        }, (notificationId) => {
            if (chrome.runtime.lastError) {
                console.error('测试通知创建失败:', chrome.runtime.lastError);
                alert('测试通知创建失败: ' + chrome.runtime.lastError.message);
            } else {
                console.log('测试通知创建成功，ID:', notificationId);
            }
        });
    }

    // 定期刷新状态（每30秒）
    setInterval(loadStatus, 30000);
}); 