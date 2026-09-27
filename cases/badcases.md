# AI HTML Prototype Reviewer - Badcase Log

## Purpose

记录 Reviewer 与 Coding Agent 工作流中出现的真实失败案例，用于后续分析：

- DOM 定位错误
- Selector 不稳定
- Context 不足
- Coding Agent 修改范围扩大
- Prompt 歧义
- 原页面交互被破坏
- Pin 定位异常

---

## Badcase Template

### BC-001

Task:

TXX

Target:


Problem:


Expected:


Actual:


Root Cause:


Reviewer Context:

Selector:

Text:

HTML Snapshot:

Modification Intent:


Fix:


Result After Fix:


Status:

[ ] Open
[ ] Fixed

### BC-001

Task:

T05-B

Problem:

选择 Agent Performance 等组件级 DOM 时，HTML Snapshot 内容较长，Mark Editor 被内容撑高，导致底部“保存 Mark”按钮超出浏览器可视区域，无法点击。

Expected:

无论目标 DOM Snapshot 长短，Mark Editor 均应限制在当前 viewport 内，内容区域可滚动，操作按钮始终可见。

Actual:

长 Snapshot 导致 Modal 高度超过 viewport，Footer 不可操作。

Root Cause:

Mark Editor 未设置 max-height，Modal Body 也未实现独立纵向滚动。

Fix:

为 Mark Editor 增加 viewport 高度约束与 flex column 布局；Modal Body 设置 overflow-y:auto；Header/Footer 禁止收缩；HTML Snapshot 设置独立最大高度和滚动。

Result After Fix:

长 DOM Snapshot 可正常查看和滚动，保存 Mark 按钮始终保持可见，Selector、Snapshot 和 Prompt 内容未发生截断。

Status:

[x] Fixed

BC-001
长 HTML Snapshot 导致 Modal Footer 不可见
→ 已修复

BC-002
Reviewer CSS 污染宿主页面
→ 已修复

BC-003
Element-level DOM Picker 粒度限制
→ Known Limitation