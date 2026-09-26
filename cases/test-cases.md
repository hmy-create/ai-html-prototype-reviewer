# AI HTML Prototype Reviewer - Real Case Test

## 1. Test Case

Case Name:

AI Product Operations Dashboard

File:

ai_product_dashboard_prototype.html

Purpose:

验证 AI HTML Prototype Reviewer 能否在比 demo.html 更复杂的真实业务型 HTML 原型中完成：

- DOM Hover
- Ctrl / Command + Click DOM Picker
- Selector Generator
- HTML Snapshot
- Review Mark
- localStorage 持久化
- Pin
- Review History
- Copy For AI
- Structured Prompt

测试数据全部为虚构脱敏数据。

---

## 2. Environment

Browser:

Chrome

Runtime:

VS Code Live Server

Reviewer:

reviewer.js
reviewer.css

Case URL:

http://127.0.0.1:5500/cases/ai_product_dashboard_prototype.html

---

## 3. Basic System Test

### ST-01 Reviewer 加载

Expected:

- 页面正常显示
- Console 无 JavaScript Error
- 页面右下角出现 Review 0
- Reviewer 不破坏原 Dashboard 布局

Result:

[×] Pass
[ ] Fail

Notes:


---

### ST-02 原页面交互

测试：

- 时间范围 Select
- 导出报告按钮
- Agent 名称点击
- Agent Drawer
- Drawer 关闭

Expected:

普通 Click 时原有业务交互全部正常。

Result:

[×] Pass
[ ] Fail

Notes:


---

### ST-03 DOM Picker

测试：

Ctrl + Click 以下元素：

- 82.4%
- 首轮成功率
- 88.2%
- Agent B
- 待优化
- Badcase 数量
- 定位错误
- 更新 FAQ Agent 回答格式
- 导出报告

Expected:

- DOM 被正确锁定
- Selector valid = true
- Mark Editor 正常打开
- Text 正确
- HTML Snapshot 正确

Result:

[×] Pass
[ ] Fail

Notes:


---

### ST-04 重复文本定位

页面存在多个百分比和重复类型元素。

分别选择：

- KPI 中的 82.4%
- Summary 中的 82.4%
- Agent A 的 88.2%
- 其他 Agent 的成功率

Expected:

相同或相似文本能够通过不同 Selector 精确定位，不依赖文字本身定位。

Result:

[×] Pass
[ ] Fail

Notes:


---

### ST-05 localStorage

步骤：

1. 保存 3 条 Mark
2. 刷新页面
3. 再次打开 Review History

Expected:

- Review 数量保持
- Mark 保持
- Pin 恢复
- History 恢复

Result:

[×] Pass
[ ] Fail

Notes:


---

### ST-06 Page Storage Isolation

步骤：

1. 在 ai_product_dashboard_prototype.html 保存 1 条 Mark
2. 打开 demo.html
3. 检查 Review History
4. 再返回 ai_product_dashboard_prototype.html

Expected:

两个 HTML 页面 Review 数据互不影响。

Result:

[×] Pass
[ ] Fail

Notes:


---

### ST-07 Pin Mapping

步骤：

1. 创建至少 3 条 Mark
2. 点击 Pin 1
3. 点击 Pin 2
4. 点击 Pin 3

Expected:

每个 Pin 都能打开 Review History，并高亮对应的 Mark。

Result:

[×] Pass
[ ] Fail

Notes:


---

### ST-08 Delete / Clear

步骤：

1. 删除其中一条 Mark
2. 检查 Review Count
3. 刷新页面
4. 清空全部
5. 再次刷新

Expected:

删除和清空操作均能同步更新：

- marks
- localStorage
- Pin
- Review Count
- History

Result:

[×] Pass
[ ] Fail

Notes:


---

### ST-09 Copy For AI

步骤：

1. 创建至少 3 条 Mark
2. 打开 Review History
3. 点击 Copy For AI
4. 检查 Prompt
5. 点击复制到剪贴板
6. 粘贴到文本编辑器

Expected:

每条修改均包含：

- Selector
- Current Text
- HTML Snapshot
- Modification Intent

Prompt 末尾包含约束条件。

Result:

[×] Pass
[ ] Fail

Notes:


---

## 4. Formal Modification Tasks

### T01 - Table Alignment

Task:

将 Agent Performance 表格的“首轮成功率”标题及整列数值水平居中。

Target:

首轮成功率表头

Category:

Layout / Alignment

Expected Change:

表头和该列数据统一水平居中。


---

### T02 - Success Rate Badge

Task:

将 Agent A 的 88.2% 改为蓝色胶囊样式。

Target:

Agent A → 88.2%

Category:

Style

Expected Change:

88.2% 显示为蓝色圆角 Badge，同时不修改其他 Agent 成功率。

Result:

[x] Pass
[ ] Fail

Conversation Rounds:

1

Result Notes:

Coding Agent 根据 Selector + HTML Snapshot + Modification Intent 正确定位 Agent A 的 88.2%，仅修改目标元素，未影响其他 Agent 成功率及原页面交互。

---

### T03 - Page Title

Task:

将页面标题：

AI 产品运行与评测看板

修改为：

AI 产品运营分析看板

Target:

页面主标题

Category:

Text

Expected Change:

仅修改标题文字，不修改副标题。


---

### T04 - Badcase Highlight

Task:

将 Badcase 数量卡片中的数值 37 改为更明显的橙色强调样式。

Target:

37

Category:

Style

Expected Change:

仅突出数字，不改变卡片其他信息。


---

### T05 - Card Spacing

Task:

增加 Agent Performance 卡片的上下内边距。

Target:

Agent Performance Card

Category:

Layout

Expected Change:

增加上下留白，不影响表格列宽和内容。


---

### T06 - Duration Column

Task:

将 Agent Performance 表格中的“平均耗时”列统一显示为蓝灰色文字。

Target:

平均耗时表头或该列元素

Category:

Style

Expected Change:

整列数值统一使用蓝灰色。


---

### T07 - Delete Agent Row

Task:

删除 Agent D 这一行。

Target:

Agent D

Category:

Structure / Data

Expected Change:

只删除 Agent D 对应 tr，不删除表头或其他 Agent。


---

### T08 - Error Highlight

Task:

将 Badcase Distribution 中“定位错误”的数量 14 改为红色强调样式。

Target:

14

Category:

Style

Expected Change:

仅强调对应数量。


---

### T09 - Agent Column Width

Task:

增加 Agent Performance 表格中 Agent 名称列的宽度。

Target:

Agent 表头

Category:

Layout

Expected Change:

Agent 名称列更宽，其他列仍正常显示。


---

### T10 - Export Button Text

Task:

将：

导出报告

修改为：

导出评测报告

Target:

导出报告按钮

Category:

Text

Expected Change:

按钮原有点击和 Toast 功能保持正常。


---

## 5. End-to-End Test

Selected Task:

T02 - 将 Agent A 的 88.2% 改为蓝色胶囊样式。

Workflow:

Visual Element
→ Hover
→ Ctrl + Click
→ DOM Picker
→ Selector
→ HTML Snapshot
→ Modification Intent
→ Save Mark
→ Pin
→ Review History
→ Copy For AI
→ Structured Prompt
→ Coding Agent
→ HTML Modification

Expected:

Coding Agent 能够基于 Reviewer 生成的结构化 Prompt，正确修改目标 DOM，同时不修改无关元素。

Result:

[ ] Pass
[ ] Fail

Conversation Rounds:

Result Notes:


---

## 6. Day 7 Result

System Test:

[ ] Passed
[ ] Failed

Real Case Integration:

[ ] Passed
[ ] Failed

End-to-End Test:

[ ] Passed
[ ] Failed

Ready For Day 8 A/B Evaluation:

[ ] Yes
[ ] No