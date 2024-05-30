// @ts-ignore
import packageJSON from '../package.json';
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
