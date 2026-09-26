// ============================================
// AI HTML Prototype Reviewer
// Day 5 - Persistent Review Session
// ============================================


// 当前正在评审的真实 DOM
let selectedElement = null;


// localStorage Key
const STORAGE_KEY =
  "ai-html-reviewer-marks-v1";


// 所有已保存的 Review Mark
let marks = [];


// ============================================
// 1. Basic Helpers
// ============================================

function isValidElement(element) {

  if (!(element instanceof HTMLElement)) {
    return false;
  }


  // 不允许选择 html / body
  if (
    element === document.body ||
    element === document.documentElement
  ) {
    return false;
  }


  // Reviewer 自己创建出来的 UI
  // 不能再次被 Reviewer 选中
  if (
    element.closest(".ai-review-ui")
  ) {
    return false;
  }


  return true;
}


function getElementText(element) {

  if (!element) {
    return "";
  }


  const text =
    element.innerText ??
    element.textContent ??
    "";


  return text.trim();
}


// ============================================
// 2. Hover Highlight
// ============================================

document.addEventListener(
  "mouseover",
  function (event) {

    const element =
      event.target;


    if (!isValidElement(element)) {
      return;
    }


    element.classList.add(
      "ai-review-hover"
    );
  }
);


document.addEventListener(
  "mouseout",
  function (event) {

    const element =
      event.target;


    if (!isValidElement(element)) {
      return;
    }


    element.classList.remove(
      "ai-review-hover"
    );
  }
);


// ============================================
// 3. Selector Generator
// ============================================

function getStableClasses(element) {

  return Array
    .from(element.classList)
    .filter(function (className) {

      return !className.startsWith(
        "ai-review-"
      );

    });
}


function buildSelectorSegment(element) {

  // 当前元素自身有 ID
  if (element.id) {

    return (
      "#" +
      CSS.escape(element.id)
    );
  }


  let selector =
    element.tagName.toLowerCase();


  // 原页面已有 class
  const classes =
    getStableClasses(element);


  if (classes.length > 0) {

    selector +=
      "." +
      classes
        .map(function (className) {

          return CSS.escape(
            className
          );

        })
        .join(".");
  }


  const parent =
    element.parentElement;


  // 同级存在多个同标签元素
  if (parent) {

    const sameTagElements =
      Array
        .from(parent.children)
        .filter(function (item) {

          return (
            item.tagName ===
            element.tagName
          );

        });


    if (sameTagElements.length > 1) {

      const index =
        sameTagElements.indexOf(
          element
        ) + 1;


      selector +=
        `:nth-of-type(${index})`;
    }
  }


  return selector;
}


function getSelector(element) {

  if (!(element instanceof Element)) {
    return "";
  }


  // 自身 ID 最高优先级
  if (element.id) {

    return (
      "#" +
      CSS.escape(element.id)
    );
  }


  const path = [];

  let current =
    element;


  while (
    current &&
    current instanceof Element
  ) {

    // 当前层存在 ID
    if (current.id) {

      path.unshift(
        "#" +
        CSS.escape(current.id)
      );


      break;
    }


    path.unshift(
      buildSelectorSegment(
        current
      )
    );


    if (
      current ===
      document.body
    ) {
      break;
    }


    const parent =
      current.parentElement;


    // 最近父元素存在 ID
    if (
      parent &&
      parent.id
    ) {

      path.unshift(
        "#" +
        CSS.escape(parent.id)
      );


      break;
    }


    current =
      parent;
  }


  return path.join(" > ");
}


function validateSelector(
  selector,
  expectedElement
) {

  if (!selector) {
    return false;
  }


  try {

    const matchedElements =
      document.querySelectorAll(
        selector
      );


    return (
      matchedElements.length === 1 &&
      matchedElements[0] ===
        expectedElement
    );

  } catch (error) {

    console.warn(
      "Selector validation failed:",
      selector,
      error
    );


    return false;
  }
}


// ============================================
// 4. Clean HTML Snapshot
// ============================================

function getCleanOuterHTML(element) {

  const clone =
    element.cloneNode(true);


  const allElements = [
    clone,
    ...clone.querySelectorAll("*")
  ];


  allElements.forEach(
    function (node) {

      const reviewerClasses =
        Array
          .from(node.classList)
          .filter(
            function (className) {

              return (
                className.startsWith(
                  "ai-review-"
                )
              );

            }
          );


      reviewerClasses.forEach(
        function (className) {

          node.classList.remove(
            className
          );

        }
      );


      // 清理 class=""
      if (
        node.hasAttribute(
          "class"
        ) &&
        node.classList.length === 0
      ) {

        node.removeAttribute(
          "class"
        );
      }

    }
  );


  return clone.outerHTML;
}


// ============================================
// 5. LocalStorage
// ============================================

function saveMarksToStorage() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(marks)
    );

  } catch (error) {

    console.error(
      "Failed to save marks:",
      error
    );
  }
}


function loadMarksFromStorage() {

  try {

    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!raw) {
      return [];
    }


    const parsed =
      JSON.parse(raw);


    if (!Array.isArray(parsed)) {
      return [];
    }


    return parsed;

  } catch (error) {

    console.warn(
      "Failed to load marks:",
      error
    );


    return [];
  }
}


// ============================================
// 6. Create Mark Editor
// ============================================

function createMarkEditor() {

  const overlay =
    document.createElement(
      "div"
    );


  overlay.className =
    "ai-review-ui ai-review-overlay";


  overlay.innerHTML = `

    <div class="ai-review-modal">

      <div class="ai-review-modal-header">

        <h3>
          添加修改意见
        </h3>

        <button
          id="ai-review-editor-close"
          class="ai-review-close"
          type="button"
          aria-label="关闭"
        >
          ×
        </button>

      </div>


      <div class="ai-review-modal-body">

        <div
          class="ai-review-current"
          id="ai-review-current"
        >
        </div>


        <div class="ai-review-field">

          <span class="ai-review-label">
            Selector
          </span>

          <div
            class="ai-review-code"
            id="ai-review-selector"
          >
          </div>

        </div>


        <div class="ai-review-field">

          <span class="ai-review-label">
            HTML Snapshot
          </span>

          <div
            class="ai-review-code"
            id="ai-review-html"
          >
          </div>

        </div>


        <div class="ai-review-field">

          <label
            class="ai-review-label"
            for="ai-review-note"
          >
            修改意见
          </label>

          <textarea
            id="ai-review-note"
            class="ai-review-textarea"
            placeholder="例如：出现率改为蓝色胶囊样式，并保持列内容居中"
          ></textarea>

        </div>

      </div>


      <div class="ai-review-modal-footer">

        <button
          id="ai-review-cancel"
          class="ai-review-btn"
          type="button"
        >
          取消
        </button>


        <button
          id="ai-review-save"
          class="
            ai-review-btn
            ai-review-btn-primary
          "
          type="button"
        >
          保存 Mark
        </button>

      </div>

    </div>
  `;


  document.body.appendChild(
    overlay
  );


  return overlay;
}


const markEditor =
  createMarkEditor();


// ============================================
// 7. Open / Close Mark Editor
// ============================================

function openMarkEditor(element) {

  if (!element) {
    return;
  }


  const selector =
    getSelector(element);


  const text =
    getElementText(element);


  const html =
    getCleanOuterHTML(
      element
    );


  document
    .getElementById(
      "ai-review-current"
    )
    .textContent =
      (
        `${element.tagName.toLowerCase()} · ` +
        `文本: ${text || "(无文本)"}`
      );


  document
    .getElementById(
      "ai-review-selector"
    )
    .textContent =
      selector;


  document
    .getElementById(
      "ai-review-html"
    )
    .textContent =
      html;


  const noteElement =
    document.getElementById(
      "ai-review-note"
    );


  noteElement.value =
    "";


  markEditor.classList.add(
    "is-open"
  );


  setTimeout(
    function () {

      noteElement.focus();

    },
    0
  );
}


function closeMarkEditor() {

  markEditor.classList.remove(
    "is-open"
  );
}


document
  .getElementById(
    "ai-review-cancel"
  )
  .addEventListener(
    "click",
    closeMarkEditor
  );


document
  .getElementById(
    "ai-review-editor-close"
  )
  .addEventListener(
    "click",
    closeMarkEditor
  );


// ============================================
// 8. Create Pin Layer
// ============================================

function createPinLayer() {

  const layer =
    document.createElement(
      "div"
    );


  layer.className =
    "ai-review-ui ai-review-pin-layer";


  document.body.appendChild(
    layer
  );


  return layer;
}


const pinLayer =
  createPinLayer();


// ============================================
// 9. Render Pins
// ============================================

function renderPins() {

  pinLayer.innerHTML =
    "";


  marks.forEach(
    function (mark, index) {

      let target =
        null;


      try {

        target =
          document.querySelector(
            mark.selector
          );

      } catch (error) {

        console.warn(
          "Invalid Mark selector:",
          mark.selector
        );


        return;
      }


      if (!target) {

        console.warn(
          "Mark target not found:",
          mark.selector
        );


        return;
      }


      const rect =
        target.getBoundingClientRect();


      // 元素不在当前视口内
      // 暂时不显示 Pin
      if (
        rect.bottom < 0 ||
        rect.top >
          window.innerHeight ||
        rect.right < 0 ||
        rect.left >
          window.innerWidth
      ) {

        return;
      }


      const pin =
        document.createElement(
          "button"
        );


      pin.type =
        "button";


      pin.className =
        "ai-review-ui ai-review-pin";


      pin.textContent =
        String(index + 1);


      pin.dataset.markId =
        String(mark.id);


      pin.title =
        (
          `Review ${index + 1}: ` +
          `${mark.text || "(无文本)"}`
        );


      pin.style.left =
        `${
          Math.max(
            4,
            rect.right - 7
          )
        }px`;


      pin.style.top =
        `${
          Math.max(
            4,
            rect.top - 7
          )
        }px`;


      pin.addEventListener(
        "click",
        function () {

          openReviewHistory(
            mark.id
          );

        }
      );


      pinLayer.appendChild(
        pin
      );
    }
  );
}


// ============================================
// 10. Review Floating Button
// ============================================

function createReviewButton() {

  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "ai-review-ui ai-review-fab";


  button.addEventListener(
    "click",
    function () {

      openReviewHistory();

    }
  );


  document.body.appendChild(
    button
  );


  return button;
}


const reviewButton =
  createReviewButton();


function updateReviewButton() {

  reviewButton.textContent =
    `Review ${marks.length}`;
}


// ============================================
// 11. Review History Drawer
// ============================================

function createReviewDrawer() {

  const drawer =
    document.createElement(
      "aside"
    );


  drawer.className =
    "ai-review-ui ai-review-drawer";


  drawer.setAttribute(
    "aria-label",
    "Review History"
  );


  drawer.innerHTML = `

    <div class="ai-review-drawer-header">

      <div>

        <h3>
          Review History
        </h3>

        <span
          id="ai-review-history-count"
          class="ai-review-history-count"
        >
        </span>

      </div>


      <button
        id="ai-review-history-close"
        class="ai-review-close"
        type="button"
        aria-label="关闭 Review History"
      >
        ×
      </button>

    </div>


    <div
      id="ai-review-history-list"
      class="ai-review-history-list"
    >
    </div>


    <div class="ai-review-drawer-footer">

      <button
        id="ai-review-clear"
        class="ai-review-clear-btn"
        type="button"
      >
        清空全部
      </button>

    </div>
  `;


  document.body.appendChild(
    drawer
  );


  return drawer;
}


const reviewDrawer =
  createReviewDrawer();
// ============================================
// Day 6 - Copy For AI Button
// ============================================

function createCopyForAIButton() {

  const footer =
    reviewDrawer.querySelector(
      ".ai-review-drawer-footer"
    );


  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "ai-review-ui ai-review-copy-btn";


  button.textContent =
    "Copy For AI";


  button.addEventListener(
    "click",
    function () {

      openCopyForAIModal();

    }
  );


  footer.appendChild(
    button
  );


  return button;
}


const copyForAIButton =
  createCopyForAIButton();


function updateCopyForAIButton() {

  copyForAIButton.disabled =
    marks.length === 0;
}

// ============================================
// Structured Prompt Builder
// ============================================

function buildCopyForAIPrompt() {

  if (marks.length === 0) {
    return "";
  }


  const sections =
    marks.map(
      function (mark, index) {

        return `
【修改 ${index + 1}】

目标元素 Selector：
${mark.selector}

当前文本：
${mark.text || "(无文本)"}

当前 HTML：
${mark.html}

修改要求：
${mark.note}
        `.trim();

      }
    );


  return `
请修改当前 HTML 原型。仅修改下列明确标注的元素。

${sections.join("\n\n")}

【约束】

1. 不修改未标注的业务逻辑与数据；
2. 优先复用现有样式；
3. 上下文不足时先说明歧义，不要猜测修改。
  `.trim();
}

// ============================================
// Create Copy For AI Modal
// ============================================

function createCopyForAIModal() {

  const overlay =
    document.createElement(
      "div"
    );


  overlay.className =
    "ai-review-ui ai-review-overlay";


  overlay.innerHTML = `

    <div class="ai-review-copy-modal">

      <div class="ai-review-modal-header">

        <h3>
          Copy For AI
        </h3>


        <button
          id="ai-review-copy-close"
          class="ai-review-close"
          type="button"
          aria-label="关闭"
        >
          ×
        </button>

      </div>


      <div class="ai-review-modal-body">

        <p class="ai-review-copy-description">

          已将 DOM 级修改意见整理为
          Coding Agent 可直接使用的结构化上下文。

        </p>


        <textarea
          id="ai-review-copy-content"
          class="ai-review-copy-content"
          readonly
        ></textarea>

      </div>


      <div class="ai-review-modal-footer">

        <button
          id="ai-review-copy-back"
          class="ai-review-btn"
          type="button"
        >
          返回编辑
        </button>


        <button
          id="ai-review-copy-confirm"
          class="
            ai-review-btn
            ai-review-btn-primary
          "
          type="button"
        >
          复制到剪贴板
        </button>

      </div>

    </div>
  `;


  document.body.appendChild(
    overlay
  );


  return overlay;
}


const copyForAIOverlay =
  createCopyForAIModal();

// ============================================
// Open / Close Copy For AI Modal
// ============================================

function openCopyForAIModal() {

  if (marks.length === 0) {
    return;
  }


  const prompt =
    buildCopyForAIPrompt();


  const content =
    document.getElementById(
      "ai-review-copy-content"
    );


  content.value =
    prompt;


  copyForAIOverlay.classList.add(
    "is-open"
  );
}


function closeCopyForAIModal() {

  copyForAIOverlay.classList.remove(
    "is-open"
  );
}


document
  .getElementById(
    "ai-review-copy-close"
  )
  .addEventListener(
    "click",
    closeCopyForAIModal
  );


document
  .getElementById(
    "ai-review-copy-back"
  )
  .addEventListener(
    "click",
    closeCopyForAIModal
  );

// ============================================
// Success Toast
// ============================================

function createToast() {

  const toast =
    document.createElement(
      "div"
    );


  toast.className =
    "ai-review-ui ai-review-toast";


  toast.textContent =
    "✓ 已复制，可直接粘贴给 Coding Agent。";


  document.body.appendChild(
    toast
  );


  return toast;
}


const reviewToast =
  createToast();


let toastTimer =
  null;


function showCopyToast() {

  reviewToast.classList.add(
    "is-visible"
  );


  if (toastTimer) {

    clearTimeout(
      toastTimer
    );
  }


  toastTimer =
    setTimeout(
      function () {

        reviewToast.classList.remove(
          "is-visible"
        );

      },
      2000
    );
}
// ============================================
// Clipboard
// ============================================

async function copyPromptToClipboard() {

  const prompt =
    buildCopyForAIPrompt();


  if (!prompt) {
    return;
  }


  try {

    await navigator.clipboard.writeText(
      prompt
    );


    showCopyToast();


  } catch (error) {

    console.warn(
      "Clipboard API failed, using fallback.",
      error
    );


    fallbackCopyText(
      prompt
    );
  }
}

function fallbackCopyText(text) {

  const textarea =
    document.createElement(
      "textarea"
    );


  textarea.value =
    text;


  textarea.style.position =
    "fixed";


  textarea.style.left =
    "-9999px";


  textarea.className =
    "ai-review-ui";


  document.body.appendChild(
    textarea
  );


  textarea.select();


  try {

    const success =
      document.execCommand(
        "copy"
      );


    if (!success) {

      throw new Error(
        "execCommand copy failed"
      );
    }


    showCopyToast();


  } catch (error) {

    console.error(
      "Copy failed:",
      error
    );


    alert(
      "复制失败，请手动复制 Prompt"
    );


  } finally {

    textarea.remove();
  }
}
document
  .getElementById(
    "ai-review-copy-confirm"
  )
  .addEventListener(
    "click",
    copyPromptToClipboard
  );
// ============================================
// 12. Format Mark Time
// ============================================

function formatMarkTime(
  createdAt
) {

  const time =
    new Date(
      createdAt
    ).getTime();


  if (!Number.isFinite(time)) {
    return "";
  }


  const diff =
    Date.now() - time;


  const minute =
    60 * 1000;


  const hour =
    60 * minute;


  if (diff < minute) {

    return "刚刚";
  }


  if (diff < hour) {

    return (
      Math.floor(
        diff / minute
      ) +
      " 分钟前"
    );
  }


  if (
    diff <
    24 * hour
  ) {

    return (
      Math.floor(
        diff / hour
      ) +
      " 小时前"
    );
  }


  return new Date(
    createdAt
  ).toLocaleString(
    "zh-CN"
  );
}


// ============================================
// 13. Render Review History
// ============================================

function renderReviewHistory(
  activeMarkId = null
) {

  const list =
    document.getElementById(
      "ai-review-history-list"
    );


  const count =
    document.getElementById(
      "ai-review-history-count"
    );


  list.innerHTML =
    "";


  count.textContent =
    `${marks.length} 条修改意见`;


  // 没有任何 Mark
  if (marks.length === 0) {

    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "ai-review-history-empty";


    empty.textContent =
      "暂无修改意见";


    list.appendChild(
      empty
    );


    return;
  }


  marks.forEach(
    function (mark, index) {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "ai-review-history-item";


      item.dataset.markId =
        String(mark.id);


      if (
        activeMarkId !== null &&
        Number(activeMarkId) ===
          Number(mark.id)
      ) {

        item.classList.add(
          "is-active"
        );
      }


      // ----------------------------
      // Header
      // ----------------------------

      const top =
        document.createElement(
          "div"
        );


      top.className =
        "ai-review-history-top";


      const target =
        document.createElement(
          "div"
        );


      target.className =
        "ai-review-history-target";


      target.textContent =
        (
          `${index + 1}  Target: ` +
          `${mark.text || "(无文本)"}`
        );


      const deleteButton =
        document.createElement(
          "button"
        );


      deleteButton.type =
        "button";


      deleteButton.className =
        "ai-review-delete";


      deleteButton.textContent =
        "删除";


      deleteButton.addEventListener(
        "click",
        function () {

          deleteMark(
            mark.id
          );

        }
      );


      top.appendChild(
        target
      );


      top.appendChild(
        deleteButton
      );


      // ----------------------------
      // Note
      // ----------------------------

      const note =
        document.createElement(
          "div"
        );


      note.className =
        "ai-review-history-note";


      note.textContent =
        mark.note;


      // ----------------------------
      // Selector
      // ----------------------------

      const selector =
        document.createElement(
          "div"
        );


      selector.className =
        "ai-review-history-selector";


      selector.textContent =
        mark.selector;


      // ----------------------------
      // Time
      // ----------------------------

      const time =
        document.createElement(
          "div"
        );


      time.className =
        "ai-review-history-time";


      time.textContent =
        formatMarkTime(
          mark.createdAt
        );


      // ----------------------------
      // Assemble Item
      // ----------------------------

      item.appendChild(
        top
      );


      item.appendChild(
        note
      );


      item.appendChild(
        selector
      );


      item.appendChild(
        time
      );


      list.appendChild(
        item
      );
    }
  );


  // 如果由 Pin 打开 History
  // 自动定位对应 Mark
  if (
    activeMarkId !== null
  ) {

    requestAnimationFrame(
      function () {

        const active =
          list.querySelector(
            ".ai-review-history-item.is-active"
          );


        if (active) {

          active.scrollIntoView({
            block: "nearest"
          });
        }

      }
    );
  }
}


// ============================================
// 14. Open / Close Review History
// ============================================

function openReviewHistory(
  activeMarkId = null
) {

  renderReviewHistory(
    activeMarkId
  );


  reviewDrawer.classList.add(
    "is-open"
  );
}


function closeReviewHistory() {

  reviewDrawer.classList.remove(
    "is-open"
  );
}


document
  .getElementById(
    "ai-review-history-close"
  )
  .addEventListener(
    "click",
    closeReviewHistory
  );


// ============================================
// 15. Refresh All Review UI
// ============================================

function refreshReviewUI() {

  saveMarksToStorage();

  renderPins();

  updateReviewButton();

  renderReviewHistory();

  updateCopyForAIButton();
}


// ============================================
// 16. Delete Mark
// ============================================

function deleteMark(markId) {

  marks =
    marks.filter(
      function (mark) {

        return (
          Number(mark.id) !==
          Number(markId)
        );

      }
    );


  refreshReviewUI();
}


// ============================================
// 17. Clear All Marks
// ============================================

document
  .getElementById(
    "ai-review-clear"
  )
  .addEventListener(
    "click",
    function () {

      if (marks.length === 0) {
        return;
      }


      const confirmed =
        window.confirm(
          "确认清空全部修改意见？"
        );


      if (!confirmed) {
        return;
      }


      marks = [];


      refreshReviewUI();
    }
  );


// ============================================
// 18. Save Current Mark
// ============================================

function saveCurrentMark() {

  if (!selectedElement) {
    return;
  }


  const noteElement =
    document.getElementById(
      "ai-review-note"
    );


  const note =
    noteElement.value.trim();


  // 修改意见不能为空
  if (!note) {

    alert(
      "请填写修改意见"
    );


    noteElement.focus();


    return;
  }


  const selector =
    getSelector(
      selectedElement
    );


  const selectorValid =
    validateSelector(
      selector,
      selectedElement
    );


  // 保存前再次检查 Selector
  if (!selectorValid) {

    console.error(
      "Cannot save Mark: invalid selector",
      selector
    );


    alert(
      "当前元素定位失败，请重新选择元素"
    );


    return;
  }


  const mark = {

    id:
      Date.now(),

    selector:
      selector,

    text:
      getElementText(
        selectedElement
      ),

    html:
      getCleanOuterHTML(
        selectedElement
      ),

    note:
      note,

    createdAt:
      new Date().toISOString()

  };


  marks.push(
    mark
  );


  // 一次性更新：
  // localStorage
  // Pin
  // Review Count
  // History
  refreshReviewUI();


  console.log(
    "Saved Mark:",
    mark
  );


  console.table(
    marks
  );


  closeMarkEditor();
}


document
  .getElementById(
    "ai-review-save"
  )
  .addEventListener(
    "click",
    saveCurrentMark
  );


// ============================================
// 19. Ctrl / Command + Click DOM Picker
// ============================================

document.addEventListener(
  "click",
  function (event) {

    const isReviewClick =
      event.ctrlKey ||
      event.metaKey;


    // 普通点击
    // Reviewer 完全不干预
    if (!isReviewClick) {
      return;
    }


    const element =
      event.target;


    if (!isValidElement(element)) {
      return;
    }


    // Reviewer 接管本次点击
    event.preventDefault();

    event.stopPropagation();


    // 移除之前 Selected
    if (selectedElement) {

      selectedElement
        .classList
        .remove(
          "ai-review-selected"
        );
    }


    // 保存新的 Selected DOM
    selectedElement =
      element;


    selectedElement
      .classList
      .add(
        "ai-review-selected"
      );


    // Context Capture
    const selector =
      getSelector(
        selectedElement
      );


    const selectorValid =
      validateSelector(
        selector,
        selectedElement
      );


    const text =
      getElementText(
        selectedElement
      );


    const html =
      getCleanOuterHTML(
        selectedElement
      );


    // Debug
    console.log(
      "=============================="
    );


    console.log(
      "Selected DOM:",
      selectedElement
    );


    console.log(
      "Tag:",
      selectedElement.tagName
    );


    console.log(
      "Text:",
      text
    );


    console.log(
      "Selector:",
      selector
    );


    console.log(
      "HTML:",
      html
    );


    console.log(
      "Selector valid:",
      selectorValid
    );


    console.log(
      "=============================="
    );


    if (!selectorValid) {

      console.error(
        "DOM Picker failed:",
        selector
      );


      return;
    }


    openMarkEditor(
      selectedElement
    );

  },

  // Capture Phase
  true
);


// ============================================
// 20. Pin Position Sync
// ============================================

// 注意：这里只注册一次。
// 不能放进 saveCurrentMark()。

window.addEventListener(
  "resize",
  renderPins
);


window.addEventListener(
  "scroll",
  renderPins,
  true
);


// ============================================
// 21. Reviewer Init
// ============================================

function initReviewer() {

  // 从 localStorage 恢复
  marks =
    loadMarksFromStorage();


  // 恢复所有 Reviewer UI
  renderPins();

  updateReviewButton();

  renderReviewHistory();

  updateCopyForAIButton();


  console.log(
    "Loaded Marks:",
    marks
  );
}


initReviewer();