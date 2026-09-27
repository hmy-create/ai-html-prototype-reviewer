# Evaluation

本目录记录 AI HTML Prototype Reviewer V1.0 的产品评测过程与结果。

评测目标不是证明 Reviewer 在所有 HTML 修改任务中都优于自然语言，而是验证 DOM 级结构化反馈在不同任务复杂度下的实际价值与边界。

---

## 1. Functional Benchmark

包含 10 个基础 HTML 修改任务，覆盖：

- Text
- Style
- Layout
- Structure

### Group A

输入：

- Original HTML
- Natural-language modification request

### Group B

输入：

- Original HTML
- Reviewer-generated structured context
- Selector
- Current Text
- HTML Snapshot
- Modification Intent

### Results

| Metric | Group A | Group B |
| --- | ---: | ---: |
| First-round Success Rate | 100% | 100% |
| Final Success Rate | 100% | 100% |
| Average Conversation Rounds | 1.0 | 1.0 |
| Wrong DOM Count | 0 | 0 |
| Average Agent Time | 32.8s | 32.5s |

### Finding

对于目标明确、自然语言已经能够准确描述的简单 HTML 修改任务，Reviewer 与直接自然语言工作流表现接近，没有观察到明显准确率或效率优势。

---

## 2. Stress Test

进一步设计 5 个高歧义任务，包括：

- 相同文本位于不同 DOM
- 重复组件实例
- 无文本 DOM
- 组件级结构修改
- 子节点定位与父级结构操作

### Results

| Metric | Group A | Group B |
| --- | ---: | ---: |
| First-round Success Rate | 100% | 100% |
| Final Success Rate | 100% | 100% |
| Average Conversation Rounds | 1.0 | 1.0 |
| Average Agent Time | 35.4s | 33.0s |
| Average E2E Time | 67.8s | 60.2s |

本轮测试中，Reviewer 工作流平均 E2E 时间：

67.8s → 60.2s

下降约：

11.2%

5 个 Stress Test 中，Reviewer 工作流的 E2E 时间均低于直接自然语言工作流。

### Finding

Reviewer 的价值更多体现在高歧义场景下减少需求表达、上下文组织和元素定位成本，而不是提升简单任务的基础执行能力。

---

## 3. Controlled Localization Benchmark

为了进一步验证 Reviewer 是否能够提高 DOM 定位准确率，设计受控 A/B 测试。

实验中严格控制：

A 组：

Natural-language Prompt P

B 组：

相同 Prompt P
+
Reviewer DOM Context

即：

A Prompt = B Modification Intent

唯一核心差异是 Reviewer 自动增加：

- Selector
- Current Text
- HTML Snapshot
- Structured Constraints

共完成 12 组复杂定位与修改任务。

### Result

在当前测试条件下：

- Group A Localization Accuracy: 100%
- Group B Localization Accuracy: 100%

因此，本实验未观察到 Reviewer 提高强 Coding Agent 的 DOM 定位准确率。

这说明当 Coding Agent 已获得完整 HTML 且模型具有较强代码理解能力时，仅依赖自然语言也能够完成多数 DOM 定位任务。

---

## 4. Representative Findings

### F07 — Element-level Selection Granularity

当目标文本直接位于：

```html
<td>351</td>