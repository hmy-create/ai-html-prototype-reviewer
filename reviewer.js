// ================================
// AI HTML Prototype Reviewer
// Day 2 - DOM Hover Highlight
// ================================


// 鼠标进入某个 DOM 元素时
document.addEventListener(
  "mouseover",
  function (event) {

    const element = event.target;

    element.classList.add(
      "ai-review-hover"
    );

    console.log(
      "Hover DOM:",
      element
    );
  }
);


// 鼠标离开某个 DOM 元素时
document.addEventListener(
  "mouseout",
  function (event) {

    const element = event.target;

    element.classList.remove(
      "ai-review-hover"
    );
  }
);