function changeTheme(theme) {
  document.getElementById("hljs-theme").href =
    `../libs/highlight/styles/${theme}.min.css`;
}

hljs.debugMode();
hljs.addPlugin(
  new CopyButtonPlugin({
    autohide: true,
    callback: (text) => console.log("Copied to clipboard", text),
  }),
);

hljs.highlightAll();
