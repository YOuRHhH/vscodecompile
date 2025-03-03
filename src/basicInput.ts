
import { window,ExtensionContext,ThemeIcon,QuickPickItem,commands } from 'vscode';
import {getList} from "./utils";
export async function showQuickPick(context: ExtensionContext) {
	const st_list:QuickPickItem[] = getList(context);

	const result:QuickPickItem | any = await showQuickPickCom(context,st_list,{title:'工具'});
	if(!result){
		return;
	}
	const id = result.id;
	switch (id) {
		case 3:
			calcInput();
			break;
		case 4:
			// 打开设置页 @ext:SHOWTIME.zztool
			commands.executeCommand('workbench.action.openSettings',"@ext:SHOWTIME.zztool");
			break;
		case 2:
			const links:any[] = [
				{id:0,label:'ChatGpt',link:'https://chatgpt.com/',iconPath:'xxx'},
				{id:1,label:'Youtube',link:'https://www.youtube.com/',iconPath:'xxx'},
				{id:2,label:'GitHub',link:'https://github.com/',iconPath:'mark-github'},
				{id:3,label:'StackOverflow',link:'https://stackoverflow.com/',iconPath:'xxx'},
				{id:4,label:'Npm',link:'https://www.npmjs.com/',iconPath:'package'},
				{id:5,label:'Mdn',link:'https://developer.mozilla.org/',iconPath:'remote-explorer-documentation'},
				{id:6,label:'图片压缩',link:'https://tinypng.com/',iconPath:'xxx'},
				{id:7,label:'百度翻译',link:'https://fanyi.baidu.com/',iconPath:'xxx'},
				{id:8,label:'百度',link:'https://www.baidu.com/',iconPath:'xxx'},
			];
			const link:QuickPickItem | any = await showQuickPickCom(context,links,{title:'链接'});
			if(!link){
				return;
			}
			// 打开链接
			commands.executeCommand('vscode.open',link.link);
			break;
		default:
			break;
	}
}
export async function showQuickPickCom(context:ExtensionContext,data:any[],options:any){
	const defaultOptions = {
		value:'',
		placeHolder: '',
		title:'提示',
	};
	data.forEach((item:any) => {
		if(item.iconPath){
			item.iconPath = new ThemeIcon(item.iconPath);
		}
	});
	const newOptions = Object.assign(defaultOptions,options);
	const result:any = await window.showQuickPick(data, newOptions);
	if(!result){
		return;
	}
	return result;
}
async function calcInput() {
	const result:any = await window.showInputBox({
		value:'',
		valueSelection: [2, 4],
		placeHolder: '',
	});
	if(!result){
		return;
	}
	const value = result.match(/[*\/\-+]/);
	if(!value) {
		return;
	}
	const list = value.input.split(value[0]);
	const val = eval(list[0]+value[0]+list[1]);
	window.showInformationMessage(`calc: ${val}`);
}

function loadIcon(){

}