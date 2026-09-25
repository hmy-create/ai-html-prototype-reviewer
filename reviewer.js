// ============================================
// AI HTML Prototype Reviewer
// Day 3 - DOM Picker + Selector Generator
// ============================================


// 当前被选中的 DOM
let selectedElement = null;

let marks = [];

// ============================================
// 1. 判断元素是否可以被 Reviewer 操作
// ============================================

function isValidElement(element) {

  if (
    !(element instanceof HTMLElement)
  ) {
    return false;
  }


  if (
    element === document.body ||
    element === document.documentElement
  ) {
    return false;
  }


  // Reviewer 自己的 UI
  // 不允许再次被 Reviewer 选择
  if (
    element.closest(
      ".ai-review-ui"
    )
  ) {
    return false;
  }


  return true;
}


// ============================================
// 2. Hover Highlight
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
// 3. Selector Generator
// ============================================

function getSelector(element) {

  if (!(element instanceof Element)) {
    return "";
  }


  // 有 ID 时优先使用 ID
  if (element.id) {
    return `#${CSS.escape(element.id)}`;
  }


  const path = [];

  let current = element;


  while (
    current &&
    current !== document.body
  ) {

    let selector =
      current.tagName.toLowerCase();


    // ----------------------------
    // 处理 class
    // ----------------------------

    const classes =
      Array.from(current.classList)
        .filter(function (className) {

          // Reviewer 自己加的 class
          // 不允许进入 Selector
          return !className.startsWith(
            "ai-review-"
          );

        });


    if (classes.length > 0) {

      selector +=
        "." +
        classes
          .map(function (className) {
            return CSS.escape(className);
          })
          .join(".");

    }


    // ----------------------------
    // 处理同标签兄弟元素
    // ----------------------------

    if (current.parentElement) {

      const sameTagElements =
        Array.from(
          current.parentElement.children
        ).filter(function (item) {

          return (
            item.tagName ===
            current.tagName
          );

        });


      if (sameTagElements.length > 1) {

        const index =
          sameTagElements.indexOf(
            current
          ) + 1;

        selector +=
          `:nth-of-type(${index})`;
      }
    }


    path.unshift(selector);


    // ----------------------------
    // 检查目前 Selector 是否已经唯一
    // ----------------------------

    const candidate =
      path.join(" > ");


    try {

      if (
        document.querySelectorAll(
          candidate
        ).length === 1
      ) {

        return candidate;

      }

    } catch (error) {

      console.warn(
        "Selector validation failed:",
        candidate
      );

    }


    current =
      current.parentElement;
  }


  return path.join(" > ");
}

// ============================================
// Clean HTML Snapshot
// 移除 Reviewer 自己注入的 class
// ============================================

function getCleanOuterHTML(element) {

  const clone =
    element.cloneNode(true);


  const allElements = [
    clone,
    ...clone.querySelectorAll("*")
  ];


  allElements.forEach(function (node) {

    const reviewerClasses =
      Array.from(node.classList)
        .filter(function (className) {

          return className.startsWith(
            "ai-review-"
          );

        });


    reviewerClasses.forEach(
      function (className) {

        node.classList.remove(
          className
        );

      }
    );


    // 如果清理以后 class 已经为空
    // 删除空 class=""
    if (
      node.hasAttribute("class") &&
      node.classList.length === 0
    ) {

      node.removeAttribute(
        "class"
      );

    }

  });


  return clone.outerHTML;
}

// ============================================
// Create Mark Editor
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
// Open Mark Editor
// ============================================

function openMarkEditor(element) {

  const selector =
    getSelector(element);


  const text =
    element.innerText
      .trim();


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
    `${element.tagName.toLowerCase()} · 文本: ${text || "(无文本)"}`;


  selectorElement.textContent =
    selector;


  htmlElement.textContent =
    html;


  noteElement.value = "";


  markEditor.classList.add(
    "is-open"
  );


  // 自动把输入焦点放进修改意见
  setTimeout(function () {

    noteElement.focus();

  }, 0);
}

// ============================================
// Cancel Mark
// ============================================

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


function closeMarkEditor() {

  markEditor.classList.remove(
    "is-open"
  );

}

// ============================================
// Save Mark
// ============================================

document
  .getElementById(
    "ai-review-save"
  )
  .addEventListener(
    "click",
    saveCurrentMark
  );


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


  if (!note) {

    alert(
      "请填写修改意见"
    );

    noteElement.focus();

    return;
  }


  const mark = {

    id: Date.now(),

    selector:
      getSelector(
        selectedElement
      ),

    text:
      selectedElement.innerText
        .trim(),

    html:
      getCleanOuterHTML(
        selectedElement
      ),

    note: note,

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

// ============================================
// 4. Ctrl / Command + Click DOM Picker
// ============================================

document.addEventListener(
  "click",
  function (event) {

    // Windows / Linux：Ctrl
    // macOS：Command
    const isReviewClick =
      event.ctrlKey ||
      event.metaKey;


    // 普通点击：
    // 完全不干预原页面
    if (!isReviewClick) {
      return;
    }


    // Reviewer Click：
    // 阻止页面本来的行为
    event.preventDefault();

    event.stopPropagation();


    const element =
      event.target;


    if (!isValidElement(element)) {
      return;
    }


    // ----------------------------
    // 移除上一个 Selected
    // ----------------------------

    if (selectedElement) {

      selectedElement.classList.remove(
        "ai-review-selected"
      );

    }


    // ----------------------------
    // 保存新的 Selected DOM
    // ----------------------------

    selectedElement = element;


    selectedElement.classList.add(
      "ai-review-selected"
    );


    // ----------------------------
    // 生成 Selector
    // ----------------------------

    const selector =
      getSelector(
        selectedElement
      );


    // ----------------------------
    // 验证 Selector
    // ----------------------------

    const foundElement =
      document.querySelector(
        selector
      );


    const selectorValid =
      foundElement ===
      selectedElement;


    // ----------------------------
    // Console Debug
    // ----------------------------

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
      selectedElement.innerText
        .trim()
    );

    console.log(
      "Selector:",
      selector
    );

    console.log(
      "HTML:",
      getCleanOuterHTML(
        selectedElement
      )
    );

    console.log(
      "Selector valid:",
      selectorValid
    );

    console.log(
      "=============================="
    );

    openMarkEditor(
      selectedElement
    );

  },

  true
);