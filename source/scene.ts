'use strict';
// @ts-ignore
import packageJSON from '../package.json';
import { NodePathPlugin } from './node-path-plugin';

export function load() {}
export function unload() {}

export const methods = {
    async setCurrentLanguage(lang: string) {
        const win = window as any;
        debugger;

        const config = await Editor.Profile.getProject(packageJSON.name);
        const curLng = config["Current Language"] || 'zh';
        win.languageManager.setLanguage(curLng);
        // @ts-ignore
        cce.Engine.repaintInEditMode();
    },

    /** 需要在scene中做处理，否则在onNodeMenu方法中调用的NodePathPlugin感觉不是同一个内存，会导致数据无法处理（搞不懂为什么） */
    async queryNodePathsObj() {
        let ret = await NodePathPlugin.getNodePathsObj();
        return ret;
    },

    /** 需要在scene中做处理，否则在onNodeMenu方法中调用的NodePathPlugin感觉不是同一个内存，会导致数据无法处理（搞不懂为什么） */
    async nodePathPluginResetData() {
        NodePathPlugin.resetData();
    },
};