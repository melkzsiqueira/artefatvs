import * as vscode from "vscode";
import { ProtheusViewProvider } from "./providers/protheus-view/protheus-view.provider";

export async function activate(context: vscode.ExtensionContext) {
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

  const moreInformationsButton = 'Mais informações';
  const selectedButton = await vscode.window.showInformationMessage(
    `Atenção! Este projeto não está mais sendo mantido. As funcionalidades disponíveis aqui, foram incorporadas no Engpro Dev Kit (EDK) a partir da versão v1.15.0, em colaboração com o time de Engenharia Protheus da TOTVS. Para mais informações, clique no botão abaixo.`,
    moreInformationsButton
  );

  if (selectedButton === moreInformationsButton) {
    vscode.commands.executeCommand(
      'vscode.open', 
      vscode.Uri.parse('https://code.engpro.totvs.com.br/engpro/vscode-engpro-extension')
    );
  }
}
