// @ts-ignore
import { AssetInfo } from '@cocos/creator-types/editor/packages/asset-db/@types/public';
import packageJSON from '../package.json';
import { onAssetChange } from './node-path-plugin';

/**
 * @en 
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    openPanel() {
        Editor.Panel.open(packageJSON.name);
    },
    // 监听多语言文件资源变化
    async onAssetWatcher(uuid: string, assetInfo: AssetInfo, param3) {
        // console.log(`[oops-copilot] onAssetWatcher `);
        // console.log(uuid);
        // console.warn(assetInfo);
        if (assetInfo.importer === "json") {
            const config = await Editor.Profile.getProject(packageJSON.name);
            const path = `db://${config['Language Directory'].replace("project://", "")}`;
            if (assetInfo.url.startsWith(path)) {
                const refreshLanguage = assetInfo.url.replace(`${path}/`, "").replace(".json", "");
                const language = config["Current Language"];
                if (refreshLanguage !== language) {
                    console.log(`[oops-copilot] refresh ${refreshLanguage}.json, but current language is ${language}.json, ignore it~`);
                    return;
                }
                console.log(`[oops-copilot] language update: ${language}`);

                Editor.Message.send('scene', 'execute-scene-script', {
                    name: 'oops-copilot',
                    method: 'setCurrentLanguage',
                    args: [],
                });
            }
        }
        onAssetChange(uuid, assetInfo);
    },
    // 场景准备完成
    async onSceneReady() {
        // console.log(`[oops copilot] scene ready`);
        Editor.Message.send('scene', 'execute-scene-script', {
            name: 'oops-copilot',
            method: 'setCurrentLanguage',
            args: [],
        });
    }
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export async function load() {
    console.log(`[oops-copilot] =====> load`);
}

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export function unload() { }