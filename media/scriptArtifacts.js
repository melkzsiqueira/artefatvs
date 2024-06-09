/* eslint-disable no-undef */
const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {
  const artifactOption = document.getElementById("artifact-dropdown");
  const binaryOption = document.getElementById("binary-dropdown");
  const osOption = document.getElementById("os-dropdown");
  const architectureOption = document.getElementById("architecture-dropdown");
  const versionOption = document.getElementById("version-dropdown");
  const downloadButton = document.getElementById("download-button");

  initializeOptions(artifactOption, "requestArtifactOption");
  initializeOptions(binaryOption, "requestBinaryOption");
  initializeOptions(osOption, "requestOSOption");
  initializeOptions(architectureOption, "requestArchitectureOption");
  initializeOptions(versionOption, "requestVersionOption");

  artifactOption.addEventListener("change", (e) => {
    if (!e.target.value) {
      e.preventDefault();
    } else {
      switch (e.target.value) {
        case "appserver":
          enableDropdown("binary-dropdown");
          addOption("binary-dropdown", "panthera_onca", "Onça-pintada");
          setOption("binary-dropdown", "panthera_onca");
          break;

        case "smartclientwebapp":
          enableDropdown("binary-dropdown");
          addOption("binary-dropdown", "panthera_onca", "Onça-pintada");
          setOption("binary-dropdown", "panthera_onca");
          break;

        case "web-agent":
          addOption("binary-dropdown", " ", "-");
          setOption("binary-dropdown", " ");
          disableDropdown("binary-dropdown");

        case "dbaccess":
          addOption("binary-dropdown", " ", "-");
          setOption("binary-dropdown", " ");
          disableDropdown("binary-dropdown");

        default:
          removeOption("binary-dropdown", "panthera_onca");
          break;
      }

      postVsCodeMessage("artifact-dropdown", {
        command: "requestArtifactOption",
        option: e.target.value,
      });
    }
  });

  binaryOption.addEventListener("change", (e) => {
    if (!e.target.value) {
      e.preventDefault();
    } else {
      postVsCodeMessage("binary-dropdown", {
        command: "requestBinaryOption",
        option: e.target.value,
      });
    }
  });

  osOption.addEventListener("change", (e) => {
    if (!e.target.value) {
      e.preventDefault();
    } else {
      postVsCodeMessage("os-dropdown", {
        command: "requestOSOption",
        option: e.target.value,
      });
    }
  });

  architectureOption.addEventListener("change", (e) => {
    if (!e.target.value) {
      e.preventDefault();
    } else {
      postVsCodeMessage("architecture-dropdown", {
        command: "requestArchitectureOption",
        option: e.target.value,
      });
    }
  });

  versionOption.addEventListener("change", (e) => {
    if (!e.target.value) {
      e.preventDefault();
    } else {
      postVsCodeMessage("version-dropdown", {
        command: "requestVersionOption",
        option: e.target.value,
      });
    }
  });

  downloadButton.addEventListener("click", () =>
    vscode.postMessage({ command: "requestDownloadButton" })
  );
}

function addOption(elementId, value, text) {
  const newOption = document.createElement("vscode-option");

  removeOption(elementId, value);

  newOption.value = value;
  newOption.textContent = text;

  document.getElementById(elementId).appendChild(newOption);
}

function removeOption(elementId, value) {
  const dropdown = document.getElementById(elementId);
  const options = dropdown.querySelectorAll("vscode-option");

  options.forEach((option) => {
    if (option.value === value) {
      dropdown.removeChild(option);
    }
  });
}

function setOption(elementId, value) {
  const dropdown = document.getElementById(elementId);
  const options = dropdown.querySelectorAll("vscode-option");

  options.forEach((option) => {
    if (option.value === value) {
      option.setAttribute("selected", "true");
    } else {
      option.removeAttribute("selected");
    }
  });

  dropdown.value = value;
}

function disableDropdown(elementId) {
  const dropdown = document.getElementById(elementId);

  dropdown.setAttribute("disabled", "true");
}

function enableDropdown(elementId) {
  const dropdown = document.getElementById(elementId);

  dropdown.removeAttribute("disabled");
}

function initializeOptions(elementRef, options) {
  postVsCodeMessage("", {
    command: options,
    option: elementRef.value,
  });
}

function postVsCodeMessage(elementId, data) {
  vscode.postMessage(data);
}
