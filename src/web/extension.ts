import * as vscode from 'vscode';
import { getNonce, getUri } from './utils';

class TerminalViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'webcontainer.terminalview';

	private _view?: vscode.WebviewView;
	private _disposables: vscode.Disposable[] = [];

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, this._extensionUri);
		this._setWebviewMessageListener(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'colorSelected':
					{
						vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`#${data.value}`));
						break;
					}
			}
		});
	}

	private _getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri) {
		const stylesUri = getUri(webview, extensionUri, ["webview", "build", "assets", "index.css"]);
		const scriptUri = getUri(webview, extensionUri, ["webview", "build", "assets", "index.js"]);

		const nonce = getNonce();

		return /*html*/ `
		<!DOCTYPE html>
		<html lang="en">
			<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<!-- <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; frame-src https://*; "> -->
			<link rel="stylesheet" type="text/css" href="${stylesUri}">
			<title>Hello World</title>
			</head>
			<body>
			<div id="root"></div>
			<script type="module" nonce="${nonce}" src="${scriptUri}"></script>
			</body>
		</html>
		`;
	}

	private _setWebviewMessageListener(webview: vscode.Webview) {
		webview.onDidReceiveMessage((message: any) => {
			const command = message.command;
			const text = message.text;
	
			switch (command) {
				case "hello":
					vscode.window.showInformationMessage(text);
					return;

				case "open":
					vscode.env.openExternal(vscode.Uri.parse(text));
					return;
					
			}
		}, undefined, this._disposables);
	}
};

export function activate(context: vscode.ExtensionContext) {
	const provider = new TerminalViewProvider(context.extensionUri);
	const logger = vscode.window.createOutputChannel("Webcontainer");
	if (vscode.workspace.workspaceFolders){
		logger.appendLine(JSON.stringify(vscode.workspace.findFiles("**/*.md")));
	}

	context.subscriptions.push(vscode.window.registerWebviewViewProvider(TerminalViewProvider.viewType, provider));

	let disposable = vscode.commands.registerCommand('webcontainer.helloWorld', () => {
		if (vscode.workspace.workspaceFolders){
			// JSON.stringify();
			logger.appendLine(JSON.stringify(vscode.workspace.findFiles("**/*.json")));
			// vscode.window.showInformationMessage();
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}