import * as vscode from "vscode";
import { ProtheusViewProvider } from "./providers/protheus-view/protheus-view.provider";

export function activate(context: vscode.ExtensionContext) {
  const viewProvider = [
    {
      provider: new ProtheusViewProvider(context),
      viewType: ProtheusViewProvider.viewType,
    },
  ];

  viewProvider.forEach((provider) => {
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        provider.viewType,
        provider.provider
      )
    );
  });
}
