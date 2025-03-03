import { ExtensionContext, workspace,window,WorkspaceEdit,Range } from "vscode";
const obj = {
  locale: "st_local",
  list: "st_list",
};
export function getLocale(context: ExtensionContext): string {
  const data: any = context.globalState.get(obj.locale);
  return data ? data : "";
}
export function updateLocale(context: ExtensionContext, data: string) {
  context.globalState.update(obj.locale, data);
}

export function getList(context: ExtensionContext): any {
  const globalStateData: any = context.globalState.get(obj.list);
  const data = JSON.parse(globalStateData);
  return data.length > 0 ? data : ["Add"];
}
export function updateList(context: ExtensionContext, data: string) {
  const list = getList(context);
  list.push(data);
  context.globalState.update(obj.list, JSON.stringify(list));
}
export function getTimeStamp(date: string) {
  if (!date) {
    return 0;
  }
  // 一小时
  const hour = 3600000;
  // 一分钟
  const minute = 60000;
  const list = date.split(":");
  return parseInt(list[0]) * hour + parseInt(list[1]) * minute;
}
export function getSetting(): {
  time: string;
  open: boolean;
  message: string;
  before: number;
  times: number;
} {
  const config = workspace.getConfiguration("config");
  const open: any = config.get("open"); // 是否开启
  const time: any = config.get("time"); // 提醒时间
  const message: any = config.get("customMessage"); // 自定义消息
  const before: any = config.get("before"); // 提前提醒时间 n/m
  const times: any = config.get("times"); // 提醒次数
  return { open, time, message, before, times };
}
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function removeConsole() {
  const editor = window.activeTextEditor;
  if (editor) {
    const document = editor.document;
    const text = document.getText();
    const regex = /console\.log\(.*\);?/g;
    const newText = text.replace(regex, "");
    const edit = new WorkspaceEdit();
    const fullRange = new Range(
      document.positionAt(0),
      document.positionAt(text.length)
    );
    edit.replace(document.uri, fullRange, newText);
    workspace.applyEdit(edit).then((success) => {
      if (success) {
        window.showInformationMessage("Success remove console.log");
      } else {
        window.showErrorMessage("Failed");
      }
    });
  }
}
