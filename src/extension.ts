import * as vscode from "vscode";
import moment from "moment";
import { showQuickPick } from "./basicInput";
import { getTimeStamp, getSetting, sleep,removeConsole } from "./utils";

const commandIDs = ["zztool.show", "zztool.opensetting","zztool.removeConsole"];

export function activate(context: vscode.ExtensionContext) {
  context.globalState.update(
    "st_list",
    JSON.stringify([
      { id:1, label: "小工具箱", iconPath: "homesss" },
      { id:2, label: "链接", iconPath: "ports-open-browser-icon" },
      { id:3, label: "计算器", iconPath: "symbol-operator" },
      { id:4, label: "设置", iconPath: "debug-configure" },
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
function editSelect(){

}
exports.activate = activate;
