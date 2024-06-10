// @ts-ignore
import packageJSON from '../package.json';
import fs from 'fs'
import path from 'path';
import Mustache from 'mustache';

/**
 * @en 
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    /**
     * @en Open the i18n panel
     */
    openI18nPanel() {
        Editor.Panel.open(packageJSON.name);
    },
    /**
     * 资源变化监听
     * @param uuid 
     * @param args 
     */
    async onAssetChange(uuid, args) {
        const config = await Editor.Profile.getProject(packageJSON.name);
        const path = `db://${config['Language Directory'].replace('project://', '')}`;
        if (args.url.startsWith(path)) {
            const refreshLanguage = args.url.replace(`${path}/`, '').replace('.json', '');
            const language = config['Current Language'];
            if (refreshLanguage !== language) {
                return;
            }
            Editor.Message.send('scene', 'execute-scene-script', {
                name: packageJSON.name,
                method: 'refreshLanguage',
                args: []
            });
        }
    },
    async generateGameUIConfig() {
        genGameUIConfig();
    },
    /**
     * 场景准备完毕
     */
    async onSceneReady() {
        Editor.Message.send('scene', 'execute-scene-script', {
            name: packageJSON.name,
            method: 'refreshLanguage',
            args: []
        });
    }
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export function load() {
    Editor.Message.send('scene', 'execute-scene-script', {
        name: packageJSON.name,
        method: 'refreshLanguage',
        args: []
    });
}

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export function unload() { }


/**
 * @en Generate game UI configuration
 */
async function genGameUIConfig() {
    const uuid = await Editor.Message.request('asset-db',
        'query-uuid',
        'db://assets/script/game/ccomp/CUIConfig.ts');
    const prefix = `${uuid?.substring(0, 5)}`;

    let assetsGui = await Editor.Message.request('asset-db', 'query-assets', {
        ccType: 'cc.Prefab',
        pattern: 'db://assets/resources/gui/**/*.prefab',
    });
    let assetsCommon = await Editor.Message.request('asset-db', 'query-assets', {
        ccType: 'cc.Prefab',
        pattern: 'db://assets/resources/common/**/*.prefab',
    });
    let assetsLoading = await Editor.Message.request('asset-db', 'query-assets', {
        ccType: 'cc.Prefab',
        pattern: 'db://assets/resources/loading/**/*.prefab',
    });
    let assets = assetsGui.concat(assetsCommon, assetsLoading);

    let items: any[] = [];

    assets.forEach((asset: any) => {
        let path = asset.file;
        let url = asset.url;

        try {
            let data = fs.readFileSync(path, 'utf8');
            let prefabInfo = JSON.parse(data);
            prefabInfo.forEach((item: any) => {
                if (item.__type__.startsWith(prefix)) {
                    // console.warn(`prefab ${prefabInfo[0]._name} layer is ${item.layerType} & url is ${url}`);
                    items.push({
                        id: item.enumName,
                        layer: LayerType[item.layerType],
                        prefab: url.replace('db://assets/resources/', '')
                            .replace('.prefab', ''),
                        desc: item.desc,
                    });
                    return;
                }
            });
        } catch (err) {
            console.error(err);
        }
    });

    const view = {
        items: items,
    }

    const templatePath = path.join(__dirname, '../mustache/GameUIConfig.mustache');
    const template = fs.readFileSync(templatePath, 'utf8');
    const output = Mustache.render(template, view);

    let projectPath = Editor.Project.path;
    fs.writeFileSync(path.join(projectPath, 'assets/script/game/common/config/GameUIConfig.ts'), output, 'utf8');
    console.log('Generate GameUIConfig.ts success!');
}

enum LayerType {
    /** 二维游戏层 */
    Game = 0,
    /** 主界面层 */
    UI = 1,
    /** 弹窗层 */
    PopUp = 2,
    /** 模式窗口层 */
    Dialog = 3,
    /** 系统触发模式窗口层 */
    System = 4,
    /** 滚动消息提示层 */
    Notify = 5,
    /** 新手引导层 */
    Guide = 6,
}
/**
 * 首字母大写转换
 */
function capitalizeFirstLetter(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}