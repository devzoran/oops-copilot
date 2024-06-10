"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
// @ts-ignore
const package_json_1 = __importDefault(require("../package.json"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mustache_1 = __importDefault(require("mustache"));
/**
 * @en
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    /**
     * @en Open the i18n panel
     */
    openI18nPanel() {
        Editor.Panel.open(package_json_1.default.name);
    },
    /**
     * 资源变化监听
     * @param uuid
     * @param args
     */
    async onAssetChange(uuid, args) {
        const config = await Editor.Profile.getProject(package_json_1.default.name);
        const path = `db://${config['Language Directory'].replace('project://', '')}`;
        if (args.url.startsWith(path)) {
            const refreshLanguage = args.url.replace(`${path}/`, '').replace('.json', '');
            const language = config['Current Language'];
            if (refreshLanguage !== language) {
                return;
            }
            Editor.Message.send('scene', 'execute-scene-script', {
                name: package_json_1.default.name,
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
            name: package_json_1.default.name,
            method: 'refreshLanguage',
            args: []
        });
    }
};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
function load() {
    Editor.Message.send('scene', 'execute-scene-script', {
        name: package_json_1.default.name,
        method: 'refreshLanguage',
        args: []
    });
}
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
function unload() { }
exports.unload = unload;
/**
 * @en Generate game UI configuration
 */
async function genGameUIConfig() {
    const uuid = await Editor.Message.request('asset-db', 'query-uuid', 'db://assets/script/game/ccomp/CUIConfig.ts');
    const prefix = `${uuid === null || uuid === void 0 ? void 0 : uuid.substring(0, 5)}`;
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
    let items = [];
    assets.forEach((asset) => {
        let path = asset.file;
        let url = asset.url;
        try {
            let data = fs_1.default.readFileSync(path, 'utf8');
            let prefabInfo = JSON.parse(data);
            prefabInfo.forEach((item) => {
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
        }
        catch (err) {
            console.error(err);
        }
    });
    const view = {
        items: items,
    };
    const templatePath = path_1.default.join(__dirname, '../mustache/GameUIConfig.mustache');
    const template = fs_1.default.readFileSync(templatePath, 'utf8');
    const output = mustache_1.default.render(template, view);
    let projectPath = Editor.Project.path;
    fs_1.default.writeFileSync(path_1.default.join(projectPath, 'assets/script/game/common/config/GameUIConfig.ts'), output, 'utf8');
    console.log('Generate GameUIConfig.ts success!');
}
var LayerType;
(function (LayerType) {
    /** 二维游戏层 */
    LayerType[LayerType["Game"] = 0] = "Game";
    /** 主界面层 */
    LayerType[LayerType["UI"] = 1] = "UI";
    /** 弹窗层 */
    LayerType[LayerType["PopUp"] = 2] = "PopUp";
    /** 模式窗口层 */
    LayerType[LayerType["Dialog"] = 3] = "Dialog";
    /** 系统触发模式窗口层 */
    LayerType[LayerType["System"] = 4] = "System";
    /** 滚动消息提示层 */
    LayerType[LayerType["Notify"] = 5] = "Notify";
    /** 新手引导层 */
    LayerType[LayerType["Guide"] = 6] = "Guide";
})(LayerType || (LayerType = {}));
/**
 * 首字母大写转换
 */
function capitalizeFirstLetter(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGFBQWE7QUFDYixtRUFBMEM7QUFDMUMsNENBQW1CO0FBQ25CLGdEQUF3QjtBQUN4Qix3REFBZ0M7QUFFaEM7OztHQUdHO0FBQ1UsUUFBQSxPQUFPLEdBQTRDO0lBQzVEOztPQUVHO0lBQ0gsYUFBYTtRQUNULE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLHNCQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUNEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJO1FBQzFCLE1BQU0sTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsc0JBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRSxNQUFNLElBQUksR0FBRyxRQUFRLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM5RSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDNUIsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzVDLElBQUksZUFBZSxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUMvQixPQUFPO1lBQ1gsQ0FBQztZQUNELE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRTtnQkFDakQsSUFBSSxFQUFFLHNCQUFXLENBQUMsSUFB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NkNBQVUsQ0FBQTtJQUNWLGNBQWM7SUFDZCw2Q0FBVSxDQUFBO0lBQ1YsWUFBWTtJQUNaLDJDQUFTLENBQUE7QUFDYixDQUFDLEVBZkksU0FBUyxLQUFULFNBQVMsUUFlYjtBQUNEOztHQUVHO0FBQ0gsU0FBUyxxQkFBcUIsQ0FBQyxDQUFTO0lBQ3BDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAdHMtaWdub3JlXG5pbXBvcnQgcGFja2FnZUpTT04gZnJvbSAnLi4vcGFja2FnZS5qc29uJztcbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IE11c3RhY2hlIGZyb20gJ211c3RhY2hlJztcblxuLyoqXG4gKiBAZW4gXG4gKiBAemgg5Li65omp5bGV55qE5Li76L+b56iL55qE5rOo5YaM5pa55rOVXG4gKi9cbmV4cG9ydCBjb25zdCBtZXRob2RzOiB7IFtrZXk6IHN0cmluZ106ICguLi5hbnk6IGFueSkgPT4gYW55IH0gPSB7XG4gICAgLyoqXG4gICAgICogQGVuIE9wZW4gdGhlIGkxOG4gcGFuZWxcbiAgICAgKi9cbiAgICBvcGVuSTE4blBhbmVsKCkge1xuICAgICAgICBFZGl0b3IuUGFuZWwub3BlbihwYWNrYWdlSlNPTi5uYW1lKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIOi1hOa6kOWPmOWMluebkeWQrFxuICAgICAqIEBwYXJhbSB1dWlkIFxuICAgICAqIEBwYXJhbSBhcmdzIFxuICAgICAqL1xuICAgIGFzeW5jIG9uQXNzZXRDaGFuZ2UodXVpZCwgYXJncykge1xuICAgICAgICBjb25zdCBjb25maWcgPSBhd2FpdCBFZGl0b3IuUHJvZmlsZS5nZXRQcm9qZWN0KHBhY2thZ2VKU09OLm5hbWUpO1xuICAgICAgICBjb25zdCBwYXRoID0gYGRiOi8vJHtjb25maWdbJ0xhbmd1YWdlIERpcmVjdG9yeSddLnJlcGxhY2UoJ3Byb2plY3Q6Ly8nLCAnJyl9YDtcbiAgICAgICAgaWYgKGFyZ3MudXJsLnN0YXJ0c1dpdGgocGF0aCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZnJlc2hMYW5ndWFnZSA9IGFyZ3MudXJsLnJlcGxhY2UoYCR7cGF0aH0vYCwgJycpLnJlcGxhY2UoJy5qc29uJywgJycpO1xuICAgICAgICAgICAgY29uc3QgbGFuZ3VhZ2UgPSBjb25maWdbJ0N1cnJlbnQgTGFuZ3VhZ2UnXTtcbiAgICAgICAgICAgIGlmIChyZWZyZXNoTGFuZ3VhZ2UgIT09IGxhbmd1YWdlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2Uuc2VuZCgnc2NlbmUnLCAnZXhlY3V0ZS1zY2VuZS1zY3JpcHQnLCB7XG4gICAgICAgICAgICAgICAgbmFtZTogcGFja2FnZUpTT04ubmFtZSxcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdyZWZyZXNoTGFuZ3VhZ2UnLFxuICAgICAgICAgICAgICAgIGFyZ3M6IFtdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgYXN5bmMgZ2VuZXJhdGVHYW1lVUlDb25maWcoKSB7XG4gICAgICAgIGdlbkdhbWVVSUNvbmZpZygpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICog5Zy65pmv5YeG5aSH5a6M5q+VXG4gICAgICovXG4gICAgYXN5bmMgb25TY2VuZVJlYWR5KCkge1xuICAgICAgICBFZGl0b3IuTWVzc2FnZS5zZW5kKCdzY2VuZScsICdleGVjdXRlLXNjZW5lLXNjcmlwdCcsIHtcbiAgICAgICAgICAgIG5hbWU6IHBhY2thZ2VKU09OLm5hbWUsXG4gICAgICAgICAgICBtZXRob2Q6ICdyZWZyZXNoTGFuZ3VhZ2UnLFxuICAgICAgICAgICAgYXJnczogW11cbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBAZW4gSG9va3MgdHJpZ2dlcmVkIGFmdGVyIGV4dGVuc2lvbiBsb2FkaW5nIGlzIGNvbXBsZXRlXG4gKiBAemgg5omp5bGV5Yqg6L295a6M5oiQ5ZCO6Kem5Y+R55qE6ZKp5a2QXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkKCkge1xuICAgIEVkaXRvci5NZXNzYWdlLnNlbmQoJ3NjZW5lJywgJ2V4ZWN1dGUtc2NlbmUtc2NyaXB0Jywge1xuICAgICAgICBuYW1lOiBwYWNrYWdlSlNPTi5uYW1lLFxuICAgICAgICBtZXRob2Q6ICdyZWZyZXNoTGFuZ3VhZ2UnLFxuICAgICAgICBhcmdzOiBbXVxuICAgIH0pO1xufVxuXG4vKipcbiAqIEBlbiBIb29rcyB0cmlnZ2VyZWQgYWZ0ZXIgZXh0ZW5zaW9uIHVuaW5zdGFsbGF0aW9uIGlzIGNvbXBsZXRlXG4gKiBAemgg5omp5bGV5Y246L295a6M5oiQ5ZCO6Kem5Y+R55qE6ZKp5a2QXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bmxvYWQoKSB7IH1cblxuXG4vKipcbiAqIEBlbiBHZW5lcmF0ZSBnYW1lIFVJIGNvbmZpZ3VyYXRpb25cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2VuR2FtZVVJQ29uZmlnKCkge1xuICAgIGNvbnN0IHV1aWQgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsXG4gICAgICAgICdxdWVyeS11dWlkJyxcbiAgICAgICAgJ2RiOi8vYXNzZXRzL3NjcmlwdC9nYW1lL2Njb21wL0NVSUNvbmZpZy50cycpO1xuICAgIGNvbnN0IHByZWZpeCA9IGAke3V1aWQ/LnN1YnN0cmluZygwLCA1KX1gO1xuXG4gICAgbGV0IGFzc2V0c0d1aSA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LWFzc2V0cycsIHtcbiAgICAgICAgY2NUeXBlOiAnY2MuUHJlZmFiJyxcbiAgICAgICAgcGF0dGVybjogJ2RiOi8vYXNzZXRzL3Jlc291cmNlcy9ndWkvKiovKi5wcmVmYWInLFxuICAgIH0pO1xuICAgIGxldCBhc3NldHNDb21tb24gPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldHMnLCB7XG4gICAgICAgIGNjVHlwZTogJ2NjLlByZWZhYicsXG4gICAgICAgIHBhdHRlcm46ICdkYjovL2Fzc2V0cy9yZXNvdXJjZXMvY29tbW9uLyoqLyoucHJlZmFiJyxcbiAgICB9KTtcbiAgICBsZXQgYXNzZXRzTG9hZGluZyA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LWFzc2V0cycsIHtcbiAgICAgICAgY2NUeXBlOiAnY2MuUHJlZmFiJyxcbiAgICAgICAgcGF0dGVybjogJ2RiOi8vYXNzZXRzL3Jlc291cmNlcy9sb2FkaW5nLyoqLyoucHJlZmFiJyxcbiAgICB9KTtcbiAgICBsZXQgYXNzZXRzID0gYXNzZXRzR3VpLmNvbmNhdChhc3NldHNDb21tb24sIGFzc2V0c0xvYWRpbmcpO1xuXG4gICAgbGV0IGl0ZW1zOiBhbnlbXSA9IFtdO1xuXG4gICAgYXNzZXRzLmZvckVhY2goKGFzc2V0OiBhbnkpID0+IHtcbiAgICAgICAgbGV0IHBhdGggPSBhc3NldC5maWxlO1xuICAgICAgICBsZXQgdXJsID0gYXNzZXQudXJsO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyhwYXRoLCAndXRmOCcpO1xuICAgICAgICAgICAgbGV0IHByZWZhYkluZm8gPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgICAgcHJlZmFiSW5mby5mb3JFYWNoKChpdGVtOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5fX3R5cGVfXy5zdGFydHNXaXRoKHByZWZpeCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS53YXJuKGBwcmVmYWIgJHtwcmVmYWJJbmZvWzBdLl9uYW1lfSBsYXllciBpcyAke2l0ZW0ubGF5ZXJUeXBlfSAmIHVybCBpcyAke3VybH1gKTtcbiAgICAgICAgICAgICAgICAgICAgaXRlbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5lbnVtTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyOiBMYXllclR5cGVbaXRlbS5sYXllclR5cGVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiOiB1cmwucmVwbGFjZSgnZGI6Ly9hc3NldHMvcmVzb3VyY2VzLycsICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKCcucHJlZmFiJywgJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzYzogaXRlbS5kZXNjLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgdmlldyA9IHtcbiAgICAgICAgaXRlbXM6IGl0ZW1zLFxuICAgIH1cblxuICAgIGNvbnN0IHRlbXBsYXRlUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9tdXN0YWNoZS9HYW1lVUlDb25maWcubXVzdGFjaGUnKTtcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IGZzLnJlYWRGaWxlU3luYyh0ZW1wbGF0ZVBhdGgsICd1dGY4Jyk7XG4gICAgY29uc3Qgb3V0cHV0ID0gTXVzdGFjaGUucmVuZGVyKHRlbXBsYXRlLCB2aWV3KTtcblxuICAgIGxldCBwcm9qZWN0UGF0aCA9IEVkaXRvci5Qcm9qZWN0LnBhdGg7XG4gICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4ocHJvamVjdFBhdGgsICdhc3NldHMvc2NyaXB0L2dhbWUvY29tbW9uL2NvbmZpZy9HYW1lVUlDb25maWcudHMnKSwgb3V0cHV0LCAndXRmOCcpO1xuICAgIGNvbnNvbGUubG9nKCdHZW5lcmF0ZSBHYW1lVUlDb25maWcudHMgc3VjY2VzcyEnKTtcbn1cblxuZW51bSBMYXllclR5cGUge1xuICAgIC8qKiDkuoznu7TmuLjmiI/lsYIgKi9cbiAgICBHYW1lID0gMCxcbiAgICAvKiog5Li755WM6Z2i5bGCICovXG4gICAgVUkgPSAxLFxuICAgIC8qKiDlvLnnqpflsYIgKi9cbiAgICBQb3BVcCA9IDIsXG4gICAgLyoqIOaooeW8j+eql+WPo+WxgiAqL1xuICAgIERpYWxvZyA9IDMsXG4gICAgLyoqIOezu+e7n+inpuWPkeaooeW8j+eql+WPo+WxgiAqL1xuICAgIFN5c3RlbSA9IDQsXG4gICAgLyoqIOa7muWKqOa2iOaBr+aPkOekuuWxgiAqL1xuICAgIE5vdGlmeSA9IDUsXG4gICAgLyoqIOaWsOaJi+W8leWvvOWxgiAqL1xuICAgIEd1aWRlID0gNixcbn1cbi8qKlxuICog6aaW5a2X5q+N5aSn5YaZ6L2s5o2iXG4gKi9cbmZ1bmN0aW9uIGNhcGl0YWxpemVGaXJzdExldHRlcihzOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gcy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHMuc2xpY2UoMSk7XG59Il19