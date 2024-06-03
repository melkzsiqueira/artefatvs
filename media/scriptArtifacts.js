/* eslint-disable no-undef */
// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();

// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener("load", main);

function main() {
  const downloadButton = document.getElementById("download-button");
  
  downloadButton.addEventListener("click", () =>
    vscode.postMessage({ command: "requestDownloadButton" })
  );
}
