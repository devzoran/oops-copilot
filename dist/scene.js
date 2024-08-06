'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = exports.unload = exports.load = void 0;
// @ts-ignore
const package_json_1 = __importDefault(require("../package.json"));
const node_path_plugin_1 = require("./node-path-plugin");
function load() { }
exports.load = load;
function unload() { }
exports.unload = unload;
exports.methods = {
    async setCurrentLanguage(lang) {
        const win = window;
        debugger;
        const config = await Editor.Profile.getProject(package_json_1.default.name);
        const curLng = config["Current Language"] || 'zh';
        win.languageManager.setLanguage(curLng);
        // @ts-ignore
        cce.Engine.repaintInEditMode();
    },
    /** 需要在scene中做处理，否则在onNodeMenu方法中调用的NodePathPlugin感觉不是同一个内存，会导致数据无法处理（搞不懂为什么） */
    async queryNodePathsObj() {
        let ret = await node_path_plugin_1.NodePathPlugin.getNodePathsObj();
        return ret;
    },
    /** 需要在scene中做处理，否则在onNodeMenu方法中调用的NodePathPlugin感觉不是同一个内存，会导致数据无法处理（搞不懂为什么） */
    async nodePathPluginResetData() {
        node_path_plugin_1.NodePathPlugin.resetData();
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NlbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2Uvc2NlbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7QUFDYixhQUFhO0FBQ2IsbUVBQTBDO0FBQzFDLHlEQUFvRDtBQUVwRCxTQUFnQixJQUFJLEtBQUksQ0FBQztBQUF6QixvQkFBeUI7QUFDekIsU0FBZ0IsTUFBTSxLQUFJLENBQUM7QUFBM0Isd0JBQTJCO0FBRWQsUUFBQSxPQUFPLEdBQUc7SUFDbkIsS0FBSyxDQUFDLGtCQUFrQixDQUFDLElBQVk7UUFDakMsTUFBTSxHQUFHLEdBQUcsTUFBYSxDQUFDO1FBQzFCLFFBQVEsQ0FBQztRQUVULE1BQU0sTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsc0JBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRSxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDbEQsR0FBRyxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEMsYUFBYTtRQUNiLEdBQUcsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0lBRUQsZ0ZBQWdGO0lBQ2hGLEtBQUssQ0FBQyxpQkFBaUI7UUFDbkIsSUFBSSxHQUFHLEdBQUcsTUFBTSxpQ0FBYyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ2pELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVELGdGQUFnRjtJQUNoRixLQUFLLENBQUMsdUJBQXVCO1FBQ3pCLGlDQUFjLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDL0IsQ0FBQztDQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcbi8vIEB0cy1pZ25vcmVcclxuaW1wb3J0IHBhY2thZ2VKU09OIGZyb20gJy4uL3BhY2thZ2UuanNvbic7XHJcbmltcG9ydCB7IE5vZGVQYXRoUGx1Z2luIH0gZnJvbSAnLi9ub2RlLXBhdGgtcGx1Z2luJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBsb2FkKCkge31cclxuZXhwb3J0IGZ1bmN0aW9uIHVubG9hZCgpIHt9XHJcblxyXG5leHBvcnQgY29uc3QgbWV0aG9kcyA9IHtcclxuICAgIGFzeW5jIHNldEN1cnJlbnRMYW5ndWFnZShsYW5nOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCB3aW4gPSB3aW5kb3cgYXMgYW55O1xyXG4gICAgICAgIGRlYnVnZ2VyO1xyXG5cclxuICAgICAgICBjb25zdCBjb25maWcgPSBhd2FpdCBFZGl0b3IuUHJvZmlsZS5nZXRQcm9qZWN0KHBhY2thZ2VKU09OLm5hbWUpO1xyXG4gICAgICAgIGNvbnN0IGN1ckxuZyA9IGNvbmZpZ1tcIkN1cnJlbnQgTGFuZ3VhZ2VcIl0gfHwgJ3poJztcclxuICAgICAgICB3aW4ubGFuZ3VhZ2VNYW5hZ2VyLnNldExhbmd1YWdlKGN1ckxuZyk7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGNjZS5FbmdpbmUucmVwYWludEluRWRpdE1vZGUoKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqIOmcgOimgeWcqHNjZW5l5Lit5YGa5aSE55CG77yM5ZCm5YiZ5Zyob25Ob2RlTWVudeaWueazleS4reiwg+eUqOeahE5vZGVQYXRoUGx1Z2lu5oSf6KeJ5LiN5piv5ZCM5LiA5Liq5YaF5a2Y77yM5Lya5a+86Ie05pWw5o2u5peg5rOV5aSE55CG77yI5pCe5LiN5oeC5Li65LuA5LmI77yJICovXHJcbiAgICBhc3luYyBxdWVyeU5vZGVQYXRoc09iaigpIHtcclxuICAgICAgICBsZXQgcmV0ID0gYXdhaXQgTm9kZVBhdGhQbHVnaW4uZ2V0Tm9kZVBhdGhzT2JqKCk7XHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqIOmcgOimgeWcqHNjZW5l5Lit5YGa5aSE55CG77yM5ZCm5YiZ5Zyob25Ob2RlTWVudeaWueazleS4reiwg+eUqOeahE5vZGVQYXRoUGx1Z2lu5oSf6KeJ5LiN5piv5ZCM5LiA5Liq5YaF5a2Y77yM5Lya5a+86Ie05pWw5o2u5peg5rOV5aSE55CG77yI5pCe5LiN5oeC5Li65LuA5LmI77yJICovXHJcbiAgICBhc3luYyBub2RlUGF0aFBsdWdpblJlc2V0RGF0YSgpIHtcclxuICAgICAgICBOb2RlUGF0aFBsdWdpbi5yZXNldERhdGEoKTtcclxuICAgIH0sXHJcbn07Il19