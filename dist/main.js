"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
const package_json_1 = __importDefault(require("../package.json"));
const node_path_plugin_1 = require("./node-path-plugin");
/**
 * @en
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    openPanel() {
        Editor.Panel.open(package_json_1.default.name);
    },
    // 监听多语言文件资源变化
    async onAssetWatcher(uuid, assetInfo, param3) {
        // console.log(`[oops-copilot] onAssetWatcher `);
        // console.log(uuid);
        // console.warn(assetInfo);
        if (assetInfo.importer === "json") {
            const config = await Editor.Profile.getProject(package_json_1.default.name);
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
        (0, node_path_plugin_1.onAssetChange)(uuid, assetInfo);
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
async function load() {
    console.log(`[oops-copilot] =====> load`);
}
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
function unload() { }
exports.unload = unload;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUVBLG1FQUEwQztBQUMxQyx5REFBbUQ7QUFFbkQ7OztHQUdHO0FBQ1UsUUFBQSxPQUFPLEdBQTRDO0lBQzVELFNBQVM7UUFDTCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxzQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFDRCxjQUFjO0lBQ2QsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFZLEVBQUUsU0FBb0IsRUFBRSxNQUFNO1FBQzNELGlEQUFpRDtRQUNqRCxxQkFBcUI7UUFDckIsMkJBQTJCO1FBQzNCLElBQUksU0FBUyxDQUFDLFFBQVEsS0FBSyxNQUFNLEVBQUUsQ0FBQztZQUNoQyxNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLHNCQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakUsTUFBTSxJQUFJLEdBQUcsUUFBUSxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDOUUsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNqQyxNQUFNLGVBQWUsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ25GLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLGVBQWUsS0FBSyxRQUFRLEVBQUUsQ0FBQztvQkFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsZUFBZSxrQ0FBa0MsUUFBUSxtQkFBbUIsQ0FBQyxDQUFDO29CQUNwSCxPQUFPO2dCQUNYLENBQUM7Z0JBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFFM0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHNCQUFzQixFQUFFO29CQUNqRCxJQUFJLEVBQUUsY0FBYztvQkFDcEIsTUFBTSxFQUFFLG9CQUFvQjtvQkFDNUIsSUFBSSxFQUFFLEVBQUU7aUJBQ1gsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztRQUNMLENBQUM7UUFDRCxJQUFBLGdDQUFhLEVBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFDRCxTQUFTO0lBQ1QsS0FBSyxDQUFDLFlBQVk7UUFDZCw2Q0FBNkM7UUFDN0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHNCQUFzQixFQUFFO1lBQ2pELElBQUksRUFBRSxjQUFjO1lBQ3BCLE1BQU0sRUFBRSxvQkFBb0I7WUFDNUIsSUFBSSxFQUFFLEVBQUU7U0FDWCxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0osQ0FBQztBQUVGOzs7R0FHRztBQUNJLEtBQUssVUFBVSxJQUFJO0lBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUM5QyxDQUFDO0FBRkQsb0JBRUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFnQixNQUFNLEtBQUssQ0FBQztBQUE1Qix3QkFBNEIiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAdHMtaWdub3JlXHJcbmltcG9ydCB7IEFzc2V0SW5mbyB9IGZyb20gJ0Bjb2Nvcy9jcmVhdG9yLXR5cGVzL2VkaXRvci9wYWNrYWdlcy9hc3NldC1kYi9AdHlwZXMvcHVibGljJztcclxuaW1wb3J0IHBhY2thZ2VKU09OIGZyb20gJy4uL3BhY2thZ2UuanNvbic7XHJcbmltcG9ydCB7IG9uQXNzZXRDaGFuZ2UgfSBmcm9tICcuL25vZGUtcGF0aC1wbHVnaW4nO1xyXG5cclxuLyoqXHJcbiAqIEBlbiBcclxuICogQHpoIOS4uuaJqeWxleeahOS4u+i/m+eoi+eahOazqOWGjOaWueazlVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IG1ldGhvZHM6IHsgW2tleTogc3RyaW5nXTogKC4uLmFueTogYW55KSA9PiBhbnkgfSA9IHtcclxuICAgIG9wZW5QYW5lbCgpIHtcclxuICAgICAgICBFZGl0b3IuUGFuZWwub3BlbihwYWNrYWdlSlNPTi5uYW1lKTtcclxuICAgIH0sXHJcbiAgICAvLyDnm5HlkKzlpJror63oqIDmlofku7botYTmupDlj5jljJZcclxuICAgIGFzeW5jIG9uQXNzZXRXYXRjaGVyKHV1aWQ6IHN0cmluZywgYXNzZXRJbmZvOiBBc3NldEluZm8sIHBhcmFtMykge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGBbb29wcy1jb3BpbG90XSBvbkFzc2V0V2F0Y2hlciBgKTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyh1dWlkKTtcclxuICAgICAgICAvLyBjb25zb2xlLndhcm4oYXNzZXRJbmZvKTtcclxuICAgICAgICBpZiAoYXNzZXRJbmZvLmltcG9ydGVyID09PSBcImpzb25cIikge1xyXG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSBhd2FpdCBFZGl0b3IuUHJvZmlsZS5nZXRQcm9qZWN0KHBhY2thZ2VKU09OLm5hbWUpO1xyXG4gICAgICAgICAgICBjb25zdCBwYXRoID0gYGRiOi8vJHtjb25maWdbJ0xhbmd1YWdlIERpcmVjdG9yeSddLnJlcGxhY2UoXCJwcm9qZWN0Oi8vXCIsIFwiXCIpfWA7XHJcbiAgICAgICAgICAgIGlmIChhc3NldEluZm8udXJsLnN0YXJ0c1dpdGgocGF0aCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlZnJlc2hMYW5ndWFnZSA9IGFzc2V0SW5mby51cmwucmVwbGFjZShgJHtwYXRofS9gLCBcIlwiKS5yZXBsYWNlKFwiLmpzb25cIiwgXCJcIik7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsYW5ndWFnZSA9IGNvbmZpZ1tcIkN1cnJlbnQgTGFuZ3VhZ2VcIl07XHJcbiAgICAgICAgICAgICAgICBpZiAocmVmcmVzaExhbmd1YWdlICE9PSBsYW5ndWFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbb29wcy1jb3BpbG90XSByZWZyZXNoICR7cmVmcmVzaExhbmd1YWdlfS5qc29uLCBidXQgY3VycmVudCBsYW5ndWFnZSBpcyAke2xhbmd1YWdlfS5qc29uLCBpZ25vcmUgaXR+YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtvb3BzLWNvcGlsb3RdIGxhbmd1YWdlIHVwZGF0ZTogJHtsYW5ndWFnZX1gKTtcclxuXHJcbiAgICAgICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5zZW5kKCdzY2VuZScsICdleGVjdXRlLXNjZW5lLXNjcmlwdCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnb29wcy1jb3BpbG90JyxcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdzZXRDdXJyZW50TGFuZ3VhZ2UnLFxyXG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtdLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgb25Bc3NldENoYW5nZSh1dWlkLCBhc3NldEluZm8pO1xyXG4gICAgfSxcclxuICAgIC8vIOWcuuaZr+WHhuWkh+WujOaIkFxyXG4gICAgYXN5bmMgb25TY2VuZVJlYWR5KCkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGBbb29wcyBjb3BpbG90XSBzY2VuZSByZWFkeWApO1xyXG4gICAgICAgIEVkaXRvci5NZXNzYWdlLnNlbmQoJ3NjZW5lJywgJ2V4ZWN1dGUtc2NlbmUtc2NyaXB0Jywge1xyXG4gICAgICAgICAgICBuYW1lOiAnb29wcy1jb3BpbG90JyxcclxuICAgICAgICAgICAgbWV0aG9kOiAnc2V0Q3VycmVudExhbmd1YWdlJyxcclxuICAgICAgICAgICAgYXJnczogW10sXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogQGVuIEhvb2tzIHRyaWdnZXJlZCBhZnRlciBleHRlbnNpb24gbG9hZGluZyBpcyBjb21wbGV0ZVxyXG4gKiBAemgg5omp5bGV5Yqg6L295a6M5oiQ5ZCO6Kem5Y+R55qE6ZKp5a2QXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZCgpIHtcclxuICAgIGNvbnNvbGUubG9nKGBbb29wcy1jb3BpbG90XSA9PT09PT4gbG9hZGApO1xyXG59XHJcblxyXG4vKipcclxuICogQGVuIEhvb2tzIHRyaWdnZXJlZCBhZnRlciBleHRlbnNpb24gdW5pbnN0YWxsYXRpb24gaXMgY29tcGxldGVcclxuICogQHpoIOaJqeWxleWNuOi9veWujOaIkOWQjuinpuWPkeeahOmSqeWtkFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHVubG9hZCgpIHsgfSJdfQ==