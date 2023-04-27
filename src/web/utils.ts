import * as vscode from 'vscode';

export const getNonce = (): string => {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

export const getUri = (webview: vscode.Webview, extensionUri: vscode.Uri, pathList: string[]) => {
	return webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...pathList));
};