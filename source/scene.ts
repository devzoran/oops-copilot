'use strict';

// @ts-ignore
import packageJSON from '../package.json';

export function load() { }

export function unload() { }

export const methods = {
    /**
     * 刷新语言缓存
     */
    async refreshLanguage() {
        const win = window as any;
        debugger;

        const config = await Editor.Profile.getProject(packageJSON.name);
        const currentLanguage = config['Current Language'] || 'zh';

        win.language
        win.languageManager.setLanguage(currentLanguage);
        // @ts-ignore
        cce.Engine.repaintInEditMode();
    }
}