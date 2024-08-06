/**
 * @file LanguageEditor.ts
 * @author zr
 * @date 2024-05-31
 * @description 编辑器环境下，多语言缓存接口处理
 */
import { oops } from "@oops/assets/core/Oops";
import { LanguageManager } from "@oops/assets/libs/gui/language/Language";
import { EDITOR } from "cc/env";

if (EDITOR) {
    oops.language = oops.language || new LanguageManager();
    
    console.info(`[LanguageEditor] ---->  仅供插件查询当前语言使用`);
    const win = window as any;
    win.languageManager = win.languageManager || {    
        // 设置语言
        setLanguage(lang: string) {
            // console.warn(`setLanguage ${oops.language}`);
            oops.language = oops.language || new LanguageManager();
            oops.language.setLanguage(lang, (success: boolean) => {
                console.info(`[LanguageEditor] update language: ${oops.language.current} ${success ? "success" : "failed"}`);
            });
        },
        // 查询当前语言对应翻译文本
        getLangByID(labId: string) {
            return oops.language.getLangByID(labId);
        }
    };
}