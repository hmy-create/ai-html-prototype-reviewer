# ProtoLens — AI HTML Prototype Reviewer

> 将网页原型中的视觉反馈转化为 Coding Agent 可直接执行的 DOM 级结构化修改上下文。

## Why

截图 + 自然语言的原型反馈存在三个问题：

- “这里改一下”缺少精确 DOM 上下文；
- 多条修改意见难以持续保存和管理；
- 产品反馈到 Coding Agent 之间需要重复解释页面结构。

ProtoLens 在真实 HTML DOM 上建立：

Visual Review
→ DOM Selection
→ Review Mark
→ Structured Context
→ Coding Agent

的完整闭环。

## Core Workflow

Ctrl / Cmd + Click DOM
→ Selector
→ HTML Snapshot
→ Modification Intent
→ Review History
→ Copy For AI
→ Coding Agent

## Core Features

### DOM Picker

通过 Ctrl / Cmd + Click 直接选择真实页面元素，并生成可复用 Selector。

### Review Mark

为目标 DOM 绑定修改意见，而不是只在截图上添加视觉批注。

### Review History

使用本地持久化保存多条 Review，并通过 Pin 与页面元素建立对应关系。

### Copy For AI

自动将：

- Selector
- Current Text
- HTML Snapshot
- Modification Intent

整理为 Coding Agent 可直接使用的结构化上下文。

### Page-level Isolation

不同 HTML Case 使用独立 Review Session，避免 Mark 跨页面污染。

## Evaluation

项目共进行了三层评测：

### Functional Benchmark

10 个基础修改任务。

A / B 首轮成功率均为 100%，说明对简单任务 Reviewer 不具有明显优势。

### Stress Test

5 个高歧义任务。

平均 E2E 时间：

- Natural Language: 67.8s
- Reviewer: 60.2s

本轮测试中下降约 11.2%。

### Controlled Localization Benchmark

进一步通过相同 Prompt 的受控 A/B 实验验证 DOM 定位能力。

12 组复杂任务中：

- Natural Language Localization Accuracy: 100%
- Reviewer Localization Accuracy: 100%

结果表明：

Reviewer 的主要价值并不是提升强 Coding Agent 的基础 DOM 定位能力，而是将产品反馈结构化、持久化，并减少高歧义任务中的上下文组织成本。

详见：

[evaluation/README.md](evaluation/README.md)

## Representative Badcases

### Long HTML Snapshot

组件级 DOM Snapshot 过长曾导致 Mark Editor Footer 超出 viewport。

通过 Modal 高度约束与独立滚动区域完成修复。

### CSS Isolation

Reviewer CSS 曾污染宿主页面。

通过 Reviewer namespace 隔离解决。

### Element-level Selection

V1.0 Picker 以 Element 为最小选择粒度。

对于：

```html
<td>351</td>