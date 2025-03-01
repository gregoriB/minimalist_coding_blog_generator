hljs.debugMode();
hljs.addPlugin(
  new CopyButtonPlugin({
    autohide: true,
    callback: (text) => console.log("Copied to clipboard", text),
  }),
);

hljs.highlightAll();

function isInsideIframe() {
  return window.location !== window.parent.location;
}

function selectivelyHideInIframe() {
  if (!isInsideIframe()) return;

  document.querySelectorAll(".hide-in-iframe").forEach((el) => {
    el.style.display = "none";
  });
}

selectivelyHideInIframe();
