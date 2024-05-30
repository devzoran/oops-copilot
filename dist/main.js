"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
// @ts-ignore
const package_json_1 = __importDefault(require("../package.json"));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGFBQWE7QUFDYixtRUFBMEM7QUFDMUM7OztHQUdHO0FBQ1UsUUFBQSxPQUFPLEdBQTRDO0lBQzVEOztPQUVHO0lBQ0gsYUFBYTtRQUNULE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLHNCQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUNEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJO1FBQzFCLE1BQU0sTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsc0JBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRSxNQUFNLElBQUksR0FBRyxRQUFRLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM5RSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDNUIsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzVDLElBQUksZUFBZSxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUMvQixPQUFPO1lBQ1gsQ0FBQztZQUNELE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRTtnQkFDakQsSUFBSSxFQUFFLHNCQUFXLENBQUMsSUFBSTtnQkFDdEIsTUFBTSxFQUFFLGlCQUFpQjtnQkFDekIsSUFBSSxFQUFFLEVBQUU7YUFDWCxDQUFDLENBQUM7UUFDUCxDQUFDO0lBQ0wsQ0FBQztJQUNEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLFlBQVk7UUFDZCxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUU7WUFDakQsSUFBSSxFQUFFLHNCQUFXLENBQUMsSUFBSTtZQUN0QixNQUFNLEVBQUUsaUJBQWlCO1lBQ3pCLElBQUksRUFBRSxFQUFFO1NBQ1gsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKLENBQUM7QUFFRjs7O0dBR0c7QUFDSCxTQUFnQixJQUFJO0lBQ2hCLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRTtRQUNqRCxJQUFJLEVBQUUsc0JBQVcsQ0FBQyxJQUFJO1FBQ3RCLE1BQU0sRUFBRSxpQkFBaUI7UUFDekIsSUFBSSxFQUFFLEVBQUU7S0FDWCxDQUFDLENBQUM7QUFDUCxDQUFDO0FBTkQsb0JBTUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFnQixNQUFNLEtBQUssQ0FBQztBQUE1Qix3QkFBNEIiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAdHMtaWdub3JlXG5pbXBvcnQgcGFja2FnZUpTT04gZnJvbSAnLi4vcGFja2FnZS5qc29uJztcbi8qKlxuICogQGVuIFxuICogQHpoIOS4uuaJqeWxleeahOS4u+i/m+eoi+eahOazqOWGjOaWueazlVxuICovXG5leHBvcnQgY29uc3QgbWV0aG9kczogeyBba2V5OiBzdHJpbmddOiAoLi4uYW55OiBhbnkpID0+IGFueSB9ID0ge1xuICAgIC8qKlxuICAgICAqIEBlbiBPcGVuIHRoZSBpMThuIHBhbmVsXG4gICAgICovXG4gICAgb3BlbkkxOG5QYW5lbCgpIHtcbiAgICAgICAgRWRpdG9yLlBhbmVsLm9wZW4ocGFja2FnZUpTT04ubmFtZSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiDotYTmupDlj5jljJbnm5HlkKxcbiAgICAgKiBAcGFyYW0gdXVpZCBcbiAgICAgKiBAcGFyYW0gYXJncyBcbiAgICAgKi9cbiAgICBhc3luYyBvbkFzc2V0Q2hhbmdlKHV1aWQsIGFyZ3MpIHtcbiAgICAgICAgY29uc3QgY29uZmlnID0gYXdhaXQgRWRpdG9yLlByb2ZpbGUuZ2V0UHJvamVjdChwYWNrYWdlSlNPTi5uYW1lKTtcbiAgICAgICAgY29uc3QgcGF0aCA9IGBkYjovLyR7Y29uZmlnWydMYW5ndWFnZSBEaXJlY3RvcnknXS5yZXBsYWNlKCdwcm9qZWN0Oi8vJywgJycpfWA7XG4gICAgICAgIGlmIChhcmdzLnVybC5zdGFydHNXaXRoKHBhdGgpKSB7XG4gICAgICAgICAgICBjb25zdCByZWZyZXNoTGFuZ3VhZ2UgPSBhcmdzLnVybC5yZXBsYWNlKGAke3BhdGh9L2AsICcnKS5yZXBsYWNlKCcuanNvbicsICcnKTtcbiAgICAgICAgICAgIGNvbnN0IGxhbmd1YWdlID0gY29uZmlnWydDdXJyZW50IExhbmd1YWdlJ107XG4gICAgICAgICAgICBpZiAocmVmcmVzaExhbmd1YWdlICE9PSBsYW5ndWFnZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnNlbmQoJ3NjZW5lJywgJ2V4ZWN1dGUtc2NlbmUtc2NyaXB0Jywge1xuICAgICAgICAgICAgICAgIG5hbWU6IHBhY2thZ2VKU09OLm5hbWUsXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAncmVmcmVzaExhbmd1YWdlJyxcbiAgICAgICAgICAgICAgICBhcmdzOiBbXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIOWcuuaZr+WHhuWkh+WujOavlVxuICAgICAqL1xuICAgIGFzeW5jIG9uU2NlbmVSZWFkeSgpIHtcbiAgICAgICAgRWRpdG9yLk1lc3NhZ2Uuc2VuZCgnc2NlbmUnLCAnZXhlY3V0ZS1zY2VuZS1zY3JpcHQnLCB7XG4gICAgICAgICAgICBuYW1lOiBwYWNrYWdlSlNPTi5uYW1lLFxuICAgICAgICAgICAgbWV0aG9kOiAncmVmcmVzaExhbmd1YWdlJyxcbiAgICAgICAgICAgIGFyZ3M6IFtdXG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbi8qKlxuICogQGVuIEhvb2tzIHRyaWdnZXJlZCBhZnRlciBleHRlbnNpb24gbG9hZGluZyBpcyBjb21wbGV0ZVxuICogQHpoIOaJqeWxleWKoOi9veWujOaIkOWQjuinpuWPkeeahOmSqeWtkFxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9hZCgpIHtcbiAgICBFZGl0b3IuTWVzc2FnZS5zZW5kKCdzY2VuZScsICdleGVjdXRlLXNjZW5lLXNjcmlwdCcsIHtcbiAgICAgICAgbmFtZTogcGFja2FnZUpTT04ubmFtZSxcbiAgICAgICAgbWV0aG9kOiAncmVmcmVzaExhbmd1YWdlJyxcbiAgICAgICAgYXJnczogW11cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBAZW4gSG9va3MgdHJpZ2dlcmVkIGFmdGVyIGV4dGVuc2lvbiB1bmluc3RhbGxhdGlvbiBpcyBjb21wbGV0ZVxuICogQHpoIOaJqeWxleWNuOi9veWujOaIkOWQjuinpuWPkeeahOmSqeWtkFxuICovXG5leHBvcnQgZnVuY3Rpb24gdW5sb2FkKCkgeyB9XG4iXX0=