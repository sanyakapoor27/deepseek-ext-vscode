"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const ollama_1 = __importDefault(require("ollama"));
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    const disposable = vscode.commands.registerCommand('sanya-kapoor.start', () => {
        const panel = vscode.window.createWebviewPanel('deepChat', 'Deep Seek Chat', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = getWebviewContent();
        console.log("Webview HTML:", getWebviewContent());
        panel.webview.onDidReceiveMessage(async (message) => {
            console.log("Received message from webview:", message);
            if (message.command === 'chat') {
                const userPrompt = message.text;
                let responseText = '';
                try {
                    console.log("Sending prompt to Ollama:", userPrompt);
                    const streamResponse = await ollama_1.default.chat({
                        model: 'deepseek-r1:7b',
                        messages: [{ role: 'user', content: userPrompt }],
                        stream: true
                    });
                    for await (const part of streamResponse) {
                        console.log("Received part:", part);
                        const content = part?.message?.content;
                        responseText += content || ''; // Ensure content exists
                        panel.webview.postMessage({ command: 'chatResponse', text: responseText }); // Delay by 500ms					  
                    }
                }
                catch (err) {
                    console.error("Error fetching response from Ollama:", err);
                    panel.webview.postMessage({ command: 'chatResponse', text: "Error fetching response from Ollama." });
                }
            }
        });
    });
    context.subscriptions.push(disposable);
}
function getWebviewContent() {
    return /*html*/ `
	<!DOCTYPE html>
	<html lang = "en">
	<head>
		<meta charset="UTF-8"/>
		<style>
			body { font-family: sans-serif; margin: 1rem; }
			#prompt {width: 100%; box-sizing: border-box; }
			#response { border: 1px solid #FFC0CB; margin-top: 1rem; padding: 0.5rem; min-height: 20rem;}
		</style>
	</head>
	<body>
		<h2 style ="color: #FFC0CB;"> DeepSeek VS Code Extension </h2>
		<textarea id="prompt" rows="3" placeholder="Ask something!"></textarea><br/>
		<button id = "askBtn">Ask</button>
		<div id="response"></div>

		<script>
		const vscode = acquireVsCodeApi();

		document.getElementById('askBtn').addEventListener('click', () => {
			const text = document.getElementById('prompt').value;
			vscode.postMessage({ command: 'chat', text });
		});

		window.addEventListener('message', (event) => {
			const { command, text } = event.data;
			if (command === 'chatResponse') {
			const responseElement = document.getElementById('response');
			if (responseElement) {
				responseElement.innerText = text;
				console.log("Response updated in webview:", text);
			} else {
				console.warn("Response element not found in the webview.");
			}
			}
		});
		</script>

	</body>
	</html>
	`;
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map