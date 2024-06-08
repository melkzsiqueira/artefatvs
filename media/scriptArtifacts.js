/* eslint-disable no-undef */
// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();

// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener("load", main);

function main() {
  const downloadButton = document.getElementById("appserver-download-button");
  const binaryOption = document.getElementById("select-binary-option");
  const osOption = document.getElementById("select-os-option");
  const architectureOption = document.getElementById(
    "select-architecture-option"
  );
  const versionOption = document.getElementById("select-version-option");

  initializeOptions(binaryOption, "requestBinaryOption");
  initializeOptions(osOption, "requestOSOption");
  initializeOptions(architectureOption, "requestArchitectureOption");
  initializeOptions(versionOption, "requestVersionOption");

  downloadButton.addEventListener("click", () =>
    vscode.postMessage({ command: "requestDownloadButton" })
  );

  binaryOption.addEventListener("change", (e) => {
    if (!e.target.value) {
      e.preventDefault();
    } else {
      postVsCodeMessage("select-binary-option", {
        command: "requestBinaryOption",
        option: e.target.value,
      });
    }
  });

  osOption.addEventListener("change", (e) => {
    if (!e.target.value) {
      e.preventDefault();
    } else {
      postVsCodeMessage("select-os-option", {
        command: "requestOSOption",
        option: e.target.value,
      });
    }
  });

  architectureOption.addEventListener("change", (e) => {
    if (!e.target.value) {
      e.preventDefault();
    } else {
      postVsCodeMessage("select-architecture-option", {
        command: "requestArchitectureOption",
        option: e.target.value,
      });
    }
  });

  versionOption.addEventListener("change", (e) => {
    if (!e.target.value) {
      e.preventDefault();
    } else {
      postVsCodeMessage("select-version-option", {
        command: "requestVersionOption",
        option: e.target.value,
      });
    }
  });
}

function initializeOptions(elementId, options) {
  postVsCodeMessage("select-binary-option", {
    command: options,
    option: elementId.querySelector("vscode-option[selected]").textContent,
  });
}

function postVsCodeMessage(elementId, data) {
  vscode.postMessage(data);
}
