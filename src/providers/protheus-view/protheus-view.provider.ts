import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import { getUri } from "../../utils/get-uri.util";

export class ProtheusViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "protheus";

  private readonly _extensionUri: vscode.Uri;
  private readonly _extensionTestMode: boolean;
  private _binary: string = "";
  private _os: string = "";
  private _architecture: string = "";
  private _version: string = "";

  constructor(private readonly _context: vscode.ExtensionContext) {
    this._extensionUri = this._context.extensionUri;
    this._extensionTestMode =
      this._context.extensionMode === vscode.ExtensionMode.Test;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "requestDownloadButton":
          const folderUri = await vscode.window.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            canSelectMany: false,
          });

          if (folderUri && folderUri.length > 0) {
            this.download(folderUri[0].fsPath);
          }

          break;

        case "requestBinaryOption":
          this._binary = message.option;

          break;

        case "requestOSOption":
          this._os = message.option;

          break;

        case "requestArchitectureOption":
          this._architecture = message.option;

          break;

        case "requestVersionOption":
          this._version = message.option;

          break;
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const toolkitUri = getUri(webview, this._extensionUri, [
      "node_modules",
      "@vscode",
      "webview-ui-toolkit",
      "dist",
      !this._extensionTestMode ? "toolkit.min.js" : "toolkit.js",
    ]);
    const scriptArtifacts = getUri(webview, this._extensionUri, [
      "media",
      "scriptArtifacts.js",
    ]);
    const styleUri = getUri(webview, this._extensionUri, [
      "media",
      "styleArtifacts.css",
    ]);

    return `<!DOCTYPE html>
              <html lang="en">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <script type="module" src="${toolkitUri}"></script>
                  <script type="module" src="${scriptArtifacts}"></script>
                  <link rel="stylesheet" href="${styleUri}" />
                  <title>Artefatos</title>
                </head>
                <body id="webview-body">
                  <section class="component-row">
                    <section class="component">
                      <label for="my-dropdown">Binário:</label>
                      <vscode-dropdown id="select-binary-option">
                        <vscode-option>harpia</vscode-option>
                        <vscode-option selected>panthera_onca</vscode-option>
                      </vscode-dropdown>
                    </section>
              
                    <section class="component">
                      <label for="my-dropdown">Sistema operacional:</label>
                      <vscode-dropdown id="select-os-option">
                        <vscode-option selected>windows</vscode-option>
                      </vscode-dropdown>
                    </section>
              
                    <section class="component">
                      <label for="my-dropdown">Arquitetura:</label>
                      <vscode-dropdown id="select-architecture-option">
                        <vscode-option selected>64</vscode-option>
                      </vscode-dropdown>
                    </section>
              
                    <section class="component">
                      <label for="my-dropdown">Versão:</label>
                      <vscode-dropdown id="select-version-option">
                        <vscode-option selected>latest</vscode-option>
                      </vscode-dropdown>
                    </section>
              
                    <section class="component">
                      <vscode-button id="appserver-download-button">Download</vscode-button>
                    </section>
                  </section>
                </body>
              </html>`;
  }

  private async download(folderPath: string) {
    const fileName = "appserver.zip";

    try {
      const url = `${process.env.BASE_URL}/tec/appserver/${this._binary}/${this._os}/${this._architecture}/${this._version}/${fileName}`;
      const options = {
        headers: {
          Authorization: process.env.AUTH_TOKEN,
        },
      };
      const filePath = path.join(folderPath, fileName);
      const file = fs.createWriteStream(filePath);

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `${fileName} downloading...`,
          cancellable: true,
        },
        async (progress, token) => {
          token.onCancellationRequested(() => {
            vscode.window.showInformationMessage(
              `User canceled the long running ${fileName} download operation`
            );
          });

          return new Promise<void>((resolve, reject) => {
            const request = https.get(url, options, (response) => {
              const contentLength = response.headers["content-length"] ?? 0;
              const totalLength =
                typeof contentLength === "number"
                  ? contentLength
                  : parseInt(contentLength, 10);

              if (response.statusCode !== 200) {
                vscode.window.showErrorMessage(
                  `Failed to download ${fileName}: ${response.statusCode}`
                );
                return reject();
              }

              response.on("data", (chunk) => {
                progress.report({
                  increment: (chunk.length / totalLength) * 100,
                });
              });
              response.pipe(file);
            });

            request.on("error", (err) => {
              vscode.window.showErrorMessage(
                `${fileName} download request error: ${err.message}`
              );
              reject(err);
            });

            file.on("finish", async () => {
              const openButton = "Open file location";
              const selectedButton = await vscode.window.showInformationMessage(
                `${fileName} download complete!`,
                openButton
              );

              if (selectedButton === openButton) {
                vscode.commands.executeCommand(
                  "revealFileInOS",
                  vscode.Uri.file(filePath)
                );
              }

              resolve();
            });

            file.on("close", resolve);
            file.on("error", reject);
          });
        }
      );
    } catch (error) {
      vscode.window.showErrorMessage(`${fileName} download failed: ${error}`);
    }
  }
}
