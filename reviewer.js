// ============================================
// AI HTML Prototype Reviewer
// Day 4 - DOM Picker + Context Capture
// ============================================


// 当前被选中的真实 DOM
let selectedElement = null;


// 已保存的 Review Marks
let marks = [];


// ============================================
// 1. 判断元素是否可以被 Reviewer 操作
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


  // Reviewer 自己创建的 UI
  // 绝对不能再次被 Reviewer 选中
  if (
    element.closest(".ai-review-ui")
  ) {
    return false;
  }


  return true;
}


// ============================================
// 2. 获取元素可读文本
// ============================================

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
// 3. Hover Highlight
// ============================================

document.addEventListener(
  "mouseover",
  function (event) {

    const element = event.target;


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

    const element = event.target;


    if (!isValidElement(element)) {
      return;
    }


    element.classList.remove(
      "ai-review-hover"
    );
  }
);


// ============================================
// 4. 获取原始页面中的有效 class
// ============================================

function getStableClasses(element) {

  return Array
    .from(element.classList)
    .filter(function (className) {

      // Reviewer 自己注入的 class
      // 绝对不能进入 Selector
      return !className.startsWith(
        "ai-review-"
      );

    });
}


// ============================================
// 5. 构造单层 Selector
// ============================================

function buildSelectorSegment(element) {

  // 如果当前元素自己有 ID
  // ID 永远优先
  if (element.id) {

    return (
      "#" +
      CSS.escape(element.id)
    );
  }


  let selector =
    element.tagName.toLowerCase();


  // -----------------------------------------
  // 添加原始 class
  // -----------------------------------------

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


  // -----------------------------------------
  // 如果同一父级存在多个同标签元素
  // 使用 nth-of-type 区分
  // -----------------------------------------

  const parent =
    element.parentElement;


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


// ============================================
// 6. Selector Generator
//
// 规则：
// 1. 元素自身 ID 优先
// 2. 否则向上寻找最近 ID
// 3. ID 作为稳定锚点
// 4. 无 ID 时构建完整 DOM Path
// ============================================

function getSelector(element) {

  if (!(element instanceof Element)) {
    return "";
  }


  // -----------------------------------------
  // 当前元素本身存在 ID
  // -----------------------------------------

  if (element.id) {

    return (
      "#" +
      CSS.escape(element.id)
    );
  }


  const path = [];

  let current = element;


  while (
    current &&
    current instanceof Element
  ) {

    // ---------------------------------------
    // 如果当前层已经遇到 ID
    // 用 ID 锚定并结束
    // ---------------------------------------

    if (current.id) {

      path.unshift(
        "#" +
        CSS.escape(current.id)
      );

      break;
    }


    // ---------------------------------------
    // 添加当前元素路径
    // ---------------------------------------

    path.unshift(
      buildSelectorSegment(current)
    );


    // body 已经是最顶层
    if (current === document.body) {
      break;
    }


    const parent =
      current.parentElement;


    // ---------------------------------------
    // 父元素有 ID
    // 直接把 ID 放在路径最前面
    // ---------------------------------------

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


    current = parent;
  }


  const selector =
    path.join(" > ");


  return selector;
}


// ============================================
// 7. Selector Validation
// ============================================

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
// 8. Clean HTML Snapshot
//
// Clone DOM 后清理 Reviewer 自己注入的 class。
// 不修改真实页面 DOM。
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
          .filter(function (
            className
          ) {

            return (
              className.startsWith(
                "ai-review-"
              )
            );

          });


      reviewerClasses.forEach(
        function (className) {

          node.classList.remove(
            className
          );

        }
      );


      // 清理空 class=""
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
// 9. Create Mark Editor
// ============================================

function createMarkEditor() {

  const overlay =
    document.createElement("div");


  overlay.className =
    "ai-review-ui ai-review-overlay";


  overlay.innerHTML = `

    <div class="ai-review-modal">

      <div class="ai-review-modal-header">

        <h3>
          添加修改意见
        </h3>

        <button
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
// 10. Open Mark Editor
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


  const currentElement =
    document.getElementById(
      "ai-review-current"
    );


  const selectorElement =
    document.getElementById(
      "ai-review-selector"
    );


  const htmlElement =
    document.getElementById(
      "ai-review-html"
    );


  const noteElement =
    document.getElementById(
      "ai-review-note"
    );


  currentElement.textContent =
    (
      `${element.tagName.toLowerCase()} · ` +
      `文本: ${text || "(无文本)"}`
    );


  selectorElement.textContent =
    selector;


  htmlElement.textContent =
    html;


  // 每次打开新的 Mark
  // 清空上一条输入
  noteElement.value = "";


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


// ============================================
// 11. Close Mark Editor
// ============================================

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
  .querySelector(
    ".ai-review-close"
  )
  .addEventListener(
    "click",
    closeMarkEditor
  );


// ============================================
// 12. Save Mark
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


  // 保存前再验证一次 Selector
  const selectorValid =
    validateSelector(
      selector,
      selectedElement
    );


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
// 13. Ctrl / Command + Click DOM Picker
// ============================================

document.addEventListener(
  "click",
  function (event) {

    // Windows / Linux
    // Ctrl + Click
    //
    // macOS
    // Command + Click

    const isReviewClick =
      event.ctrlKey ||
      event.metaKey;


    // 普通点击完全交还给原页面
    if (!isReviewClick) {
      return;
    }


    const element =
      event.target;


    // ---------------------------------------
    // 先判断是不是合法的被评审元素
    //
    // 必须放在 preventDefault 前面，
    // 避免 Reviewer 自己 UI 被 Ctrl 点击时
    // 误伤自己的按钮。
    // ---------------------------------------

    if (!isValidElement(element)) {
      return;
    }


    // ---------------------------------------
    // Reviewer 接管本次 Click
    // ---------------------------------------

    event.preventDefault();

    event.stopPropagation();


    // ---------------------------------------
    // 移除旧 Selected
    // ---------------------------------------

    if (selectedElement) {

      selectedElement
        .classList
        .remove(
          "ai-review-selected"
        );
    }


    // ---------------------------------------
    // 保存当前 Selected DOM
    // ---------------------------------------

    selectedElement =
      element;


    selectedElement
      .classList
      .add(
        "ai-review-selected"
      );


    // ---------------------------------------
    // Context Capture
    // ---------------------------------------

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


    // ---------------------------------------
    // Debug
    // ---------------------------------------

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


    // ---------------------------------------
    // Selector 不合法时不打开 Editor
    // ---------------------------------------

    if (!selectorValid) {

      console.error(
        "DOM Picker failed:",
        selector
      );


      return;
    }


    // ---------------------------------------
    // 打开 Mark Editor
    // ---------------------------------------

    openMarkEditor(
      selectedElement
    );

  },

  // Capture Phase
  true
);