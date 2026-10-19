"use strict";
(() => {
  const dialog = document.getElementById("analysis-dialog");
  const image = document.getElementById("analysis-full");
  const caption = document.getElementById("analysis-caption");
  let trigger = null;
  if (!dialog || typeof dialog.showModal !== "function") return;
  document.querySelectorAll("[data-enlarge]").forEach(button => {
    button.addEventListener("click", () => {
      trigger = button;
      image.src = button.dataset.enlarge;
      caption.textContent = button.dataset.caption;
      dialog.showModal();
    });
  });
  document.getElementById("close-analysis").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) { const r=dialog.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) dialog.close(); } });
  dialog.addEventListener("close", () => { if(trigger) trigger.focus({preventScroll:true}); });
})();
