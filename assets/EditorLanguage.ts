/**
 * @file EditorLanguage.ts
 * @author zoran
 * @date 2024-06-02
 * @description 编辑器模式下Language代理监听
 */

import { EDITOR } from "cc/env";
import { oops } from "@oops/assets/core/Oops";
import { LanguageManager } from "@oops/assets/libs/gui/language/Language";


// 编辑器环境下，挂载到window上
if (EDITOR) {
    oops.language = oops.language || new LanguageManager();

    const win = window as any;
    win.languageManager = win.languageManager || {
        setLanguage: (lang: string) => {
            console.warn(`editor set language ${lang}`);
            oops.language.setLanguage(lang, (success: boolean) => {
                console.warn(`update language ${oops.language.current} ${success ? 'success' : 'fail'}`);
            });
        },
        getLangByID(labId: string): string {
            return oops.language.getLangByID(labId);
        }
    }
}