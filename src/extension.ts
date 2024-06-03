import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { promisify } from 'util';
import { pipeline, Readable } from 'stream';
import { getUri } from './utils/utils';

const streamPipeline = promisify(pipeline);

export function activate(context: vscode.ExtensionContext) {
  const appServerViewProvider = new AppServerViewProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      AppServerViewProvider.viewType,
      appServerViewProvider
    )
  );
}

class AppServerViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'appserverSidebar';
  private readonly _extensionUri: vscode.Uri;
  private readonly _extensionTestMode: boolean;

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
        case 'requestDownloadButton':
          const folderUri = await vscode.window.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            canSelectMany: false,
          });

          if (folderUri && folderUri.length > 0) {
            this.downloadFile(folderUri[0].fsPath);
          }
          break;
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const toolkitUri = getUri(webview, this._extensionUri, [
      'node_modules',
      '@vscode',
      'webview-ui-toolkit',
      'dist',
      !this._extensionTestMode ? 'toolkit.min.js' : 'toolkit.js',
    ]);
    const scriptArtifacts = getUri(webview, this._extensionUri, [
      'media',
      'scriptArtifacts.js',
    ]);
    const styleUri = getUri(webview, this._extensionUri, [
      'media',
      'styleArtifacts.css',
    ]);
    const nonce = getNonce();

    return `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <script type="module" src="${toolkitUri}"></script>
                    <script type="module" src="${scriptArtifacts}"></script>
                    <link rel="stylesheet" href="${styleUri}">
                    <title>Artefatos</title>
                </head>
                <body id="webview-body">
                    <section class="component">
                        <p>AppServer</p>
                        <vscode-divider role="separator"></vscode-divider>
                    </section>

                    <section class="component-row">
                        <section class="component">
                            <vscode-dropdown id="select-version-option">
                                <vscode-option>latest</vscode-option>
                            </vscode-dropdown>
                        </section>

                        <section class="component">
                            <vscode-button id="download-button">Download</vscode-button>
                        </section>
                    </section>
                </body>
            </html>`;
  }

  private async downloadFile(folderPath: string) {
    const url = process.env.APPSERVER_URL ?? '';
    const filePath = path.join(folderPath, 'appserver.zip');

    const file = fs.createWriteStream(filePath);
    const request = https.get(url, (response) => {
      response.pipe(file);
    });

    await streamPipeline(request as unknown as Readable, file);
    vscode.window.showInformationMessage('Download complete!');
  }
}

function getNonce() {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function deactivate() {}
