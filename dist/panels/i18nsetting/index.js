"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const vue_1 = require("vue");
// @ts-ignore
const package_json_1 = __importDefault(require("../../../package.json"));
const panelDataMap = new WeakMap();
let config;
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
    listeners: {
        show() { console.log('show'); },
        hide() { console.log('hide'); },
    },
    template: (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/i18nsetting/index.html'), 'utf-8'),
    style: (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/style/i18nsetting/index.css'), 'utf-8'),
    $: {
        app: '#app',
        // text: '#text',
    },
    methods: {
        hello() {
        },
    },
    ready() {
        if (this.$.app) {
            const app = (0, vue_1.createApp)({});
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.component('i18nSetting', {
                template: (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/vue/i18nSetting.html'), 'utf-8'),
                data() {
                    return {
                        path: '',
                        lang: 'zh',
                        list: [],
                        showAddInput: false,
                    };
                },
                watch: {
                    async lang() {
                        // console.log('item change current language:', this.lang);
                        await Editor.Profile.setProject(package_json_1.default.name, "Current Language", this.lang);
                        Editor.Message.send('scene', 'execute-scene-script', {
                            name: package_json_1.default.name,
                            method: 'setCurrentLanguage',
                            args: [],
                        });
                    },
                },
                methods: {
                    add() {
                        this.showAddInput = true;
                        requestAnimationFrame(() => {
                            this.$refs.addInput.focus();
                        });
                        // console.log('add');
                    },
                    select(language) {
                        this.lang = language;
                        // console.log('select', language);
                    },
                    async del(name) {
                        const result = await Editor.Dialog.info(`确定删除 ${name} 语言文件？`, {
                            buttons: ['确认', '取消'],
                            default: 0,
                            cancel: 1,
                        });
                        if (result.response === 0) {
                            console.log('del', name);
                            await Editor.Message.request('asset-db', 'delete-asset', `db://${this.path}/${name}.json`);
                            this.refresh();
                        }
                    },
                    async refresh() {
                        if (this.path === '') {
                            config = await Editor.Profile.getProject(package_json_1.default.name);
                            this.path = config['Language Directory'].replace("project://", "");
                        }
                        const dir = (0, path_1.join)(Editor.Project.path, `${this.path}`);
                        if (!(0, fs_1.existsSync)(dir)) {
                            console.warn(`路径不存在: ${dir}`);
                            return;
                        }
                        this.lang = config["Current Language"] || 'zh';
                        const names = (0, fs_1.readdirSync)(dir);
                        this.list = [];
                        names.forEach((name) => {
                            const language = name.replace(/\.[^\.]+$/, '');
                            if (!/\./.test(language)) {
                                this.list.push(language);
                            }
                        });
                        // console.log('refresh');
                    },
                    async generateLanguageFile(event) {
                        //@ts-ignore
                        const language = event.target.value;
                        if (!/[a-zA-Z]/.test(language)) {
                            console.warn(`语言名称只允许使用 a-z A-Z, ${language} 不合法`);
                            return;
                        }
                        this.showAddInput = false;
                        await Editor.Message.request('asset-db', 'create-asset', `db://${this.path}/${language}.json`, `{}`);
                        this.refresh();
                        // console.log('generateLanguageFile');
                    },
                    changeLang() {
                        // this.lang = this.lang === 'zh' ? 'en' : 'zh';
                    },
                },
                async mounted() {
                    console.log('[i18n setting panel] mounted to refresh');
                    this.refresh();
                },
            });
            app.mount(this.$.app);
            panelDataMap.set(this, app);
        }
    },
    beforeClose() { },
    close() {
        const app = panelDataMap.get(this);
        if (app) {
            app.unmount();
        }
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvcGFuZWxzL2kxOG5zZXR0aW5nL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkJBQTJEO0FBQzNELCtCQUE0QjtBQUM1Qiw2QkFBcUM7QUFDckMsYUFBYTtBQUNiLHlFQUFnRDtBQUNoRCxNQUFNLFlBQVksR0FBRyxJQUFJLE9BQU8sRUFBWSxDQUFDO0FBRTdDLElBQUksTUFBVyxDQUFDO0FBQ2hCOzs7R0FHRztBQUNILHlGQUF5RjtBQUN6RixNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ2pDLFNBQVMsRUFBRTtRQUNQLElBQUksS0FBSyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQixJQUFJLEtBQUssT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbEM7SUFDRCxRQUFRLEVBQUUsSUFBQSxpQkFBWSxFQUFDLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSxpREFBaUQsQ0FBQyxFQUFFLE9BQU8sQ0FBQztJQUNuRyxLQUFLLEVBQUUsSUFBQSxpQkFBWSxFQUFDLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSw2Q0FBNkMsQ0FBQyxFQUFFLE9BQU8sQ0FBQztJQUM1RixDQUFDLEVBQUU7UUFDQyxHQUFHLEVBQUUsTUFBTTtRQUNYLGlCQUFpQjtLQUNwQjtJQUNELE9BQU8sRUFBRTtRQUNMLEtBQUs7UUFDTCxDQUFDO0tBQ0o7SUFDRCxLQUFLO1FBQ0QsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2IsTUFBTSxHQUFHLEdBQUcsSUFBQSxlQUFTLEVBQUMsRUFBRSxDQUFDLENBQUM7WUFDMUIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsZUFBZSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzVFLEdBQUcsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFO2dCQUN6QixRQUFRLEVBQUUsSUFBQSxpQkFBWSxFQUFDLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSwrQ0FBK0MsQ0FBQyxFQUFFLE9BQU8sQ0FBQztnQkFDakcsSUFBSTtvQkFDQSxPQUFPO3dCQUNILElBQUksRUFBRSxFQUFFO3dCQUNSLElBQUksRUFBRSxJQUFJO3dCQUNWLElBQUksRUFBRSxFQUFFO3dCQUNSLFlBQVksRUFBRSxLQUFLO3FCQUN0QixDQUFDO2dCQUNOLENBQUM7Z0JBQ0QsS0FBSyxFQUFFO29CQUNILEtBQUssQ0FBQyxJQUFJO3dCQUNOLDJEQUEyRDt3QkFDM0QsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxzQkFBVyxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ2pGLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRTs0QkFDakQsSUFBSSxFQUFFLHNCQUFXLENBQUMsSUFBSTs0QkFDdEIsTUFBTSxFQUFFLG9CQUFvQjs0QkFDNUIsSUFBSSxFQUFFLEVBQUU7eUJBQ1gsQ0FBQyxDQUFDO29CQUNQLENBQUM7aUJBQ0o7Z0JBQ0QsT0FBTyxFQUFFO29CQUNMLEdBQUc7d0JBQ0MsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7d0JBQ3pCLHFCQUFxQixDQUFDLEdBQUcsRUFBRTs0QkFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7d0JBQ2hDLENBQUMsQ0FBQyxDQUFDO3dCQUNILHNCQUFzQjtvQkFDMUIsQ0FBQztvQkFDRCxNQUFNLENBQUMsUUFBZ0I7d0JBQ25CLElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO3dCQUNyQixtQ0FBbUM7b0JBQ3ZDLENBQUM7b0JBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFZO3dCQUNsQixNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxRQUFRLEVBQUU7NEJBQzFELE9BQU8sRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUM7NEJBQ3JCLE9BQU8sRUFBRSxDQUFDOzRCQUNWLE1BQU0sRUFBRSxDQUFDO3lCQUNaLENBQUMsQ0FBQzt3QkFDSCxJQUFJLE1BQU0sQ0FBQyxRQUFRLEtBQUssQ0FBQyxFQUFFLENBQUM7NEJBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOzRCQUN6QixNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsUUFBUSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLENBQUM7NEJBQzNGLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzt3QkFDbkIsQ0FBQztvQkFDTCxDQUFDO29CQUNELEtBQUssQ0FBQyxPQUFPO3dCQUNULElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLEVBQUUsQ0FBQzs0QkFDbkIsTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsc0JBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDM0QsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDO3dCQUN2RSxDQUFDO3dCQUNELE1BQU0sR0FBRyxHQUFHLElBQUEsV0FBSSxFQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7d0JBQ3RELElBQUksQ0FBQyxJQUFBLGVBQVUsRUFBQyxHQUFHLENBQUMsRUFBRSxDQUFDOzRCQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUMsQ0FBQzs0QkFDOUIsT0FBTzt3QkFDWCxDQUFDO3dCQUNELElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQUksSUFBSSxDQUFDO3dCQUMvQyxNQUFNLEtBQUssR0FBRyxJQUFBLGdCQUFXLEVBQUMsR0FBRyxDQUFDLENBQUM7d0JBQy9CLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO3dCQUNmLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTs0QkFDbkIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7NEJBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0NBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDOzRCQUM3QixDQUFDO3dCQUNMLENBQUMsQ0FBQyxDQUFDO3dCQUNILDBCQUEwQjtvQkFDOUIsQ0FBQztvQkFDRCxLQUFLLENBQUMsb0JBQW9CLENBQUMsS0FBWTt3QkFDbkMsWUFBWTt3QkFDWixNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQzt3QkFFcEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQzs0QkFDN0IsT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsUUFBUSxNQUFNLENBQUMsQ0FBQzs0QkFDbkQsT0FBTzt3QkFDWCxDQUFDO3dCQUVELElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO3dCQUUxQixNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsUUFBUSxJQUFJLENBQUMsSUFBSSxJQUFJLFFBQVEsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUNyRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQ2YsdUNBQXVDO29CQUMzQyxDQUFDO29CQUNELFVBQVU7d0JBQ04sZ0RBQWdEO29CQUNwRCxDQUFDO2lCQUNKO2dCQUNELEtBQUssQ0FBQyxPQUFPO29CQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMseUNBQXlDLENBQUMsQ0FBQztvQkFDdkQsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNuQixDQUFDO2FBQ0osQ0FBQyxDQUFDO1lBQ0gsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7SUFDTCxDQUFDO0lBQ0QsV0FBVyxLQUFLLENBQUM7SUFDakIsS0FBSztRQUNELE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNOLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNsQixDQUFDO0lBQ0wsQ0FBQztDQUNKLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgcmVhZGRpclN5bmMgfSBmcm9tICdmcyc7XHJcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgQXBwLCBjcmVhdGVBcHAgfSBmcm9tICd2dWUnO1xyXG4vLyBAdHMtaWdub3JlXHJcbmltcG9ydCBwYWNrYWdlSlNPTiBmcm9tICcuLi8uLi8uLi9wYWNrYWdlLmpzb24nO1xyXG5jb25zdCBwYW5lbERhdGFNYXAgPSBuZXcgV2Vha01hcDxhbnksIEFwcD4oKTtcclxuXHJcbmxldCBjb25maWc6IGFueTtcclxuLyoqXHJcbiAqIEB6aCDlpoLmnpzluIzmnJvlhbzlrrkgMy4zIOS5i+WJjeeahOeJiOacrOWPr+S7peS9v+eUqOS4i+aWueeahOS7o+eggVxyXG4gKiBAZW4gWW91IGNhbiBhZGQgdGhlIGNvZGUgYmVsb3cgaWYgeW91IHdhbnQgY29tcGF0aWJpbGl0eSB3aXRoIHZlcnNpb25zIHByaW9yIHRvIDMuM1xyXG4gKi9cclxuLy8gRWRpdG9yLlBhbmVsLmRlZmluZSA9IEVkaXRvci5QYW5lbC5kZWZpbmUgfHwgZnVuY3Rpb24ob3B0aW9uczogYW55KSB7IHJldHVybiBvcHRpb25zIH1cclxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3IuUGFuZWwuZGVmaW5lKHtcclxuICAgIGxpc3RlbmVyczoge1xyXG4gICAgICAgIHNob3coKSB7IGNvbnNvbGUubG9nKCdzaG93Jyk7IH0sXHJcbiAgICAgICAgaGlkZSgpIHsgY29uc29sZS5sb2coJ2hpZGUnKTsgfSxcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZTogcmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3RhdGljL3RlbXBsYXRlL2kxOG5zZXR0aW5nL2luZGV4Lmh0bWwnKSwgJ3V0Zi04JyksXHJcbiAgICBzdHlsZTogcmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3RhdGljL3N0eWxlL2kxOG5zZXR0aW5nL2luZGV4LmNzcycpLCAndXRmLTgnKSxcclxuICAgICQ6IHtcclxuICAgICAgICBhcHA6ICcjYXBwJyxcclxuICAgICAgICAvLyB0ZXh0OiAnI3RleHQnLFxyXG4gICAgfSxcclxuICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBoZWxsbygpIHtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIHJlYWR5KCkge1xyXG4gICAgICAgIGlmICh0aGlzLiQuYXBwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFwcCA9IGNyZWF0ZUFwcCh7fSk7XHJcbiAgICAgICAgICAgIGFwcC5jb25maWcuY29tcGlsZXJPcHRpb25zLmlzQ3VzdG9tRWxlbWVudCA9ICh0YWcpID0+IHRhZy5zdGFydHNXaXRoKCd1aS0nKTtcclxuICAgICAgICAgICAgYXBwLmNvbXBvbmVudCgnaTE4blNldHRpbmcnLCB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3RhdGljL3RlbXBsYXRlL3Z1ZS9pMThuU2V0dGluZy5odG1sJyksICd1dGYtOCcpLFxyXG4gICAgICAgICAgICAgICAgZGF0YSgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFuZzogJ3poJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdDogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3dBZGRJbnB1dDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAgd2F0Y2g6IHtcclxuICAgICAgICAgICAgICAgICAgICBhc3luYyBsYW5nKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnaXRlbSBjaGFuZ2UgY3VycmVudCBsYW5ndWFnZTonLCB0aGlzLmxhbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuUHJvZmlsZS5zZXRQcm9qZWN0KHBhY2thZ2VKU09OLm5hbWUsIFwiQ3VycmVudCBMYW5ndWFnZVwiLCB0aGlzLmxhbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5zZW5kKCdzY2VuZScsICdleGVjdXRlLXNjZW5lLXNjcmlwdCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHBhY2thZ2VKU09OLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdzZXRDdXJyZW50TGFuZ3VhZ2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhZGQoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd0FkZElucHV0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlZnMuYWRkSW5wdXQuZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdhZGQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdChsYW5ndWFnZTogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGFuZyA9IGxhbmd1YWdlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnc2VsZWN0JywgbGFuZ3VhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMgZGVsKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBFZGl0b3IuRGlhbG9nLmluZm8oYOehruWumuWIoOmZpCAke25hbWV9IOivreiogOaWh+S7tu+8n2AsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1dHRvbnM6IFsn56Gu6K6kJywgJ+WPlua2iCddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbmNlbDogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQucmVzcG9uc2UgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZWwnLCBuYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ2RlbGV0ZS1hc3NldCcsIGBkYjovLyR7dGhpcy5wYXRofS8ke25hbWV9Lmpzb25gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBhc3luYyByZWZyZXNoKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXRoID09PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnID0gYXdhaXQgRWRpdG9yLlByb2ZpbGUuZ2V0UHJvamVjdChwYWNrYWdlSlNPTi5uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGF0aCA9IGNvbmZpZ1snTGFuZ3VhZ2UgRGlyZWN0b3J5J10ucmVwbGFjZShcInByb2plY3Q6Ly9cIiwgXCJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlyID0gam9pbihFZGl0b3IuUHJvamVjdC5wYXRoLCBgJHt0aGlzLnBhdGh9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXhpc3RzU3luYyhkaXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYOi3r+W+hOS4jeWtmOWcqDogJHtkaXJ9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sYW5nID0gY29uZmlnW1wiQ3VycmVudCBMYW5ndWFnZVwiXSB8fCAnemgnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lcyA9IHJlYWRkaXJTeW5jKGRpcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lcy5mb3JFYWNoKChuYW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsYW5ndWFnZSA9IG5hbWUucmVwbGFjZSgvXFwuW15cXC5dKyQvLCAnJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIS9cXC4vLnRlc3QobGFuZ3VhZ2UpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5saXN0LnB1c2gobGFuZ3VhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3JlZnJlc2gnKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGFzeW5jIGdlbmVyYXRlTGFuZ3VhZ2VGaWxlKGV2ZW50OiBFdmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0B0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGFuZ3VhZ2UgPSBldmVudC50YXJnZXQudmFsdWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIS9bYS16QS1aXS8udGVzdChsYW5ndWFnZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihg6K+t6KiA5ZCN56ew5Y+q5YWB6K645L2/55SoIGEteiBBLVosICR7bGFuZ3VhZ2V9IOS4jeWQiOazlWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dBZGRJbnB1dCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnY3JlYXRlLWFzc2V0JywgYGRiOi8vJHt0aGlzLnBhdGh9LyR7bGFuZ3VhZ2V9Lmpzb25gLCBge31gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdnZW5lcmF0ZUxhbmd1YWdlRmlsZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlTGFuZygpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5sYW5nID0gdGhpcy5sYW5nID09PSAnemgnID8gJ2VuJyA6ICd6aCc7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBhc3luYyBtb3VudGVkKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbaTE4biBzZXR0aW5nIHBhbmVsXSBtb3VudGVkIHRvIHJlZnJlc2gnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBhcHAubW91bnQodGhpcy4kLmFwcCk7XHJcbiAgICAgICAgICAgIHBhbmVsRGF0YU1hcC5zZXQodGhpcywgYXBwKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgYmVmb3JlQ2xvc2UoKSB7IH0sXHJcbiAgICBjbG9zZSgpIHtcclxuICAgICAgICBjb25zdCBhcHAgPSBwYW5lbERhdGFNYXAuZ2V0KHRoaXMpO1xyXG4gICAgICAgIGlmIChhcHApIHtcclxuICAgICAgICAgICAgYXBwLnVubW91bnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG59KTtcclxuIl19