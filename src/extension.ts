import * as vscode from "vscode";
import moment from "moment";
import { showQuickPick } from "./basicInput";
import { getTimeStamp, getSetting, sleep, removeConsole } from "./utils";
import { zztoolFunctions } from "./zztoollist";

const commandIDs = [
  "zztool.show",
  "zztool.opensetting",
  "zztool.removeConsole",
];

export function activate(context: vscode.ExtensionContext) {
  context.globalState.update(
    "st_list",
    JSON.stringify([
      { id: 1, label: "小工具箱", iconPath: "homesss" },
      { id: 2, label: "链接", iconPath: "ports-open-browser-icon" },
      { id: 3, label: "计算器", iconPath: "symbol-operator" },
      { id: 4, label: "设置", iconPath: "debug-configure" },
    ])
  );

  const status = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    99999
  );
  context.subscriptions.push(status);
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => updateStatus(status))
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(commandIDs[0], async () => {
      showQuickPick(context);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(commandIDs[2], async () => {
      removeConsole();
    })
  );
  // @zzcpt/zztool 代码提示
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      [
        { scheme: "file", language: "javascript" },
        { scheme: "file", language: "typescript" },
        { scheme: "file", language: "typescriptreact" },
        { scheme: "file", language: "javascriptreact" },
        { scheme: "file", language: "vue" },
      ],
      {
        provideCompletionItems(document, position) {
          const fileName = document.fileName;
          const isVue = fileName.endsWith('.vue');
          const isReact = fileName.endsWith('.jsx') || fileName.endsWith('.tsx');

          return zztoolFunctions.map((fn, index) => {
            const item = new vscode.CompletionItem(
              fn,
              vscode.CompletionItemKind.Function
            );
            item.detail = `${fn}`;
            item.insertText = `${fn}()`;
            item.sortText = "000_" + index.toString().padStart(3, "0");

            const fullText = document.getText();
            const importRegex = /import\s+\{\s*([^\}]+)\}\s+from\s+['"]@zzcpt\/zztool['"]/;

            let edits = [];

            if (importRegex.test(fullText)) {
              const match:any = fullText.match(importRegex);
              if (match && !match[1].split(',').map((s:string) => s.trim()).includes(fn)) {
                const start = document.positionAt(match.index);
                const end = start.translate(0, match[0].length);
                edits.push(
                  vscode.TextEdit.replace(
                    new vscode.Range(start, end),
                    `import { ${match[1].trim()}, ${fn} } from '@zzcpt/zztool'`
                  )
                );
              }
            } else {
              if (isVue) {
                const scriptRegex = /<script[^>]*>/i;
                const scriptMatch = scriptRegex.exec(fullText);
                if (scriptMatch) {
                  const pos = document.positionAt(scriptMatch.index + scriptMatch[0].length);
                  edits.push(
                    vscode.TextEdit.insert(pos, `\nimport { ${fn} } from '@zzcpt/zztool';`)
                  );
                } else {
                  // 没有 <script>，不建议插
                  vscode.window.showErrorMessage("Failed");
                }
              } else if (isReact) {
                // React 一般直接在最顶头插入
                edits.push(
                  vscode.TextEdit.insert(new vscode.Position(0, 0), `import { ${fn} } from '@zzcpt/zztool';\n`)
                );
              } else {
                // 普通 JS 文件
                edits.push(
                  vscode.TextEdit.insert(new vscode.Position(0, 0), `import { ${fn} } from '@zzcpt/zztool';\n`)
                );
              }
            }

            item.additionalTextEdits = edits;
            return item;
          });
        },
      },
      // "." // 触发符
    )
  );
  // 监听配置文件变化
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      timeList = [];
    })
  );
  updateStatus(status);
  let timeList: any[] = [];

  setInterval(() => {
    const { time, open, message, before, times } = getSetting();
    if (open) {
      async function active() {
        const beforeTime = before * 60000; // 提前提醒时间，毫秒级

        if (timeList.length === 0) {
          timeList = time.split(",").map((item: string) => ({
            times: 0, // 初始化提醒次数
            time: getTimeStamp(item), // 转换为时间戳
          }));
        }
        const nowTime = getTimeStamp(moment().format("HH:mm"));
        for (let i = 0; i < timeList.length; i++) {
          const item = timeList[i];
          const diff = item.time - nowTime;
          if (diff <= beforeTime && diff > 0) {
            if (item.times < times) {
              item.times++;
              vscode.window.showInformationMessage(message);
            }
          }
        }
        await sleep(2000); // 等待 1 秒
      }
      active();
    }
    updateStatus(status); // 更新状态
  }, 1000);
}
function updateStatus(status: vscode.StatusBarItem) {
  status.text = moment().format("HH:mm:ss");
  status.command = commandIDs[0];
  status.show();
}
function editSelect() {}
exports.activate = activate;
