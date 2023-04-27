import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { WebContainer } from '@webcontainer/api';
import { useEffect, useRef, useState } from "react";
import { vscode } from "./utils"
import { Terminal } from "xterm";
import { FitAddon } from 'xterm-addon-fit';
import { files } from './files';
import './xterm.css';

function App() {
  const webcontainerRef = useRef<null | WebContainer>(null);
  const terminalContainerRef = useRef<null | HTMLDivElement>(null)
  const terminalRef = useRef<null | Terminal>(null)

  const jsh = async () => {
    if (!webcontainerRef.current) return;
    if (!terminalRef.current) return;

    const process = await webcontainerRef.current.spawn('jsh', {
      terminal: {
        cols: terminalRef.current.cols,
        rows: terminalRef.current.rows,
      },
    });

    process.output.pipeTo(new WritableStream({
      write(data) {
        terminalRef.current?.write(data)
      }
    }));

    const input = process.input.getWriter();

    terminalRef.current.onData((data) => {
      input.write(data);
    });

    window.addEventListener('resize', () => {
      if (!terminalRef.current) return;
      process.resize({
        cols: terminalRef.current.cols,
        rows: terminalRef.current.rows,
      });
    })

    return process;
  }

  const getCssValue = (value: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(value)
  }

  useEffect(() => {
    if (!terminalContainerRef.current) return
    if (terminalRef.current) return

    const fitAddon = new FitAddon();
    const terminal = new Terminal({
      convertEol: true,
      fontFamily: getCssValue('--vscode-editor-font-family'),
      fontSize: parseInt(getCssValue('--vscode-editor-font-size').replace("px", "")),
      theme: {
        foreground: getCssValue('--vscode-terminal-foreground'),
        background: getCssValue('--vscode-panel-background'),
        cursor: getCssValue('--vscode-terminalCursor-foreground'),
        selectionBackground: getCssValue('--vscode-terminal-selectionBackground'),
        selectionInactiveBackground: getCssValue('--vscode-terminal-inactiveSelectionBackground'),
        black: getCssValue('--vscode-terminal-ansiBlack'),
        red: getCssValue('--vscode-terminal-ansiRed'),
        green: getCssValue('--vscode-terminal-ansiGreen'),
        yellow: getCssValue('--vscode-terminal-ansiYellow'),
        blue: getCssValue('--vscode-terminal-ansiBlue'),
        magenta: getCssValue('--vscode-terminal-ansiMagenta'),
        cyan: getCssValue('--vscode-terminal-ansiCyan'),
        white: getCssValue('--vscode-terminal-ansiWhite'),
        brightBlack: getCssValue('--vscode-terminal-ansiBrightBlack'),
        brightRed: getCssValue('--vscode-terminal-ansiBrightRed'),
        brightGreen: getCssValue('--vscode-terminal-ansiBrightGreen'),
        brightYellow: getCssValue('--vscode-terminal-ansiBrightYellow'),
        brightBlue: getCssValue('--vscode-terminal-ansiBrightBlue'),
        brightMagenta: getCssValue('--vscode-terminal-ansiBrightMagenta'),
        brightCyan: getCssValue('--vscode-terminal-ansiBrightCyan'),
        brightWhite: getCssValue('--vscode-terminal-ansiBrightWhite')
      }
    });
    terminal.loadAddon(fitAddon);
    fitAddon.fit();

    terminalRef.current = terminal
    terminal.open(terminalContainerRef.current);
    
    window.addEventListener('resize', () => {
      fitAddon.fit();
    })
  }, [terminalContainerRef.current])

  useEffect(() => {
    if (crossOriginIsolated && !webcontainerRef.current && terminalRef.current){
      (async() => {
        const webcontainerInstance = await WebContainer.boot();
        webcontainerRef.current = webcontainerInstance;
        
        await webcontainerInstance.mount(files);
        webcontainerInstance.on('server-ready', (port, url) => {
          console.log(url)
        });

        await jsh();
      })();
    }
  }, [terminalRef.current]);

  return (
    <main>
      {crossOriginIsolated ?
        <>
          <div ref={terminalContainerRef} />
        </>
        :
        <>
          <h3>
            This extension requires cross-origin isolated
            <br/>
            To enable, give vscode the vscode-coi flag. (e.g. https://vscode.dev?vscode-coi)
          </h3>
        </>
      }
    </main>
  )
}

export default App;
