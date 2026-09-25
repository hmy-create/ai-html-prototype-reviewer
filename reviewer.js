// ============================================
// AI HTML Prototype Reviewer
// Day 3 - DOM Picker + Selector Generator
// ============================================


// 当前被选中的 DOM
let selectedElement = null;


// ============================================
// 1. 判断元素是否可以被 Reviewer 操作
// ============================================

function isValidElement(element) {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  if (
    element === document.body ||
    element === document.documentElement
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
      selectedElement.outerHTML
    );

    console.log(
      "Selector valid:",
      selectorValid
    );

    console.log(
      "=============================="
    );

  },

  true
);