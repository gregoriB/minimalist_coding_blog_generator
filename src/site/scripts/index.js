hljs.debugMode();
hljs.addPlugin(
  new CopyButtonPlugin({
    autohide: true,
    callback: (text) => {
      console.log("Copied to clipboard:\n");
      console.log(text.trim());
    },
    hook: (text) => text.trim(),
  }),
);

hljs.highlightAll();
hljs.initLineNumbersOnLoad();

function isInsideIframe() {
  return window.location !== window.parent.location;
}

function selectivelyHideInIframe() {
  if (!isInsideIframe()) return;

  document.body.classList.add("in-iframe");
}

selectivelyHideInIframe();
