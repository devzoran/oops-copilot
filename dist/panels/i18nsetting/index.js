"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const vue_1 = require("vue");
// @ts-ignore
const package_json_1 = __importDefault(require("../../../package.json"));
const panelDataMap = new WeakMap();
/**
 * 插件配置
 */
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
    },
    methods: {
        hello() {
        }
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
                }, watch: {
                    async lang() {
                        await Editor.Profile.setProject(package_json_1.default.name, 'Current Language', this.lang);
                        Editor.Message.send('scene', 'execute-scene-script', {
                            name: package_json_1.default.name,
                            method: 'refreshLanguage',
                            args: []
                        });
                    },
                }, methods: {
                    add() {
                        this.showAddInput = true;
                        requestAnimationFrame(() => {
                            this.$refs.addInput.focus();
                        });
                    },
                    select(language) {
                        this.lang = language;
                    },
                    async del(name) {
                        const result = await Editor.Dialog.info(`确定删除 ${name} 语言文件？`, {
                            buttons: ['确认', '取消'],
                            default: 0,
                            cancel: 1,
                        });
                        if (result.response === 0) {
                            await Editor.Message.request('asset-db', 'delete-asset', `db://${this.path}/${name}.json`);
                            this.refresh();
                        }
                    },
                    async refresh() {
                        if (this.path === '') {
                            config = await Editor.Profile.getProject(package_json_1.default.name);
                            this.path = config['Language Directory'].replace('project://', '');
                        }
                        const dir = (0, path_1.join)(Editor.Project.path, `${this.path}`);
                        if (!(0, fs_1.existsSync)(dir)) {
                            console.warn(`路径不存在: ${dir}`);
                            return;
                        }
                        this.lang = config['Current Language'] || 'zh';
                        const names = (0, fs_1.readdirSync)(dir);
                        this.list = [];
                        names.forEach((name) => {
                            const language = name.replace(/\.[^\.]+$/, '');
                            if (!/\./.test(language)) {
                                this.list.push(language);
                            }
                        });
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
                    }
                }, mounted() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvcGFuZWxzL2kxOG5zZXR0aW5nL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsK0JBQTRCO0FBQzVCLDJCQUEyRDtBQUMzRCw2QkFBcUM7QUFDckMsYUFBYTtBQUNiLHlFQUFnRDtBQUNoRCxNQUFNLFlBQVksR0FBRyxJQUFJLE9BQU8sRUFBWSxDQUFDO0FBQzdDOztHQUVHO0FBQ0gsSUFBSSxNQUFXLENBQUM7QUFDaEI7OztHQUdHO0FBQ0gseUZBQXlGO0FBQ3pGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDakMsU0FBUyxFQUFFO1FBQ1AsSUFBSSxLQUFLLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9CLElBQUksS0FBSyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNsQztJQUNELFFBQVEsRUFBRSxJQUFBLGlCQUFZLEVBQUMsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLGlEQUFpRCxDQUFDLEVBQUUsT0FBTyxDQUFDO0lBQ25HLEtBQUssRUFBRSxJQUFBLGlCQUFZLEVBQUMsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLDZDQUE2QyxDQUFDLEVBQUUsT0FBTyxDQUFDO0lBQzVGLENBQUMsRUFBRTtRQUNDLEdBQUcsRUFBRSxNQUFNO0tBQ2Q7SUFDRCxPQUFPLEVBQUU7UUFDTCxLQUFLO1FBQ0wsQ0FBQztLQUNKO0lBQ0QsS0FBSztRQUNELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNiLE1BQU0sR0FBRyxHQUFHLElBQUEsZUFBUyxFQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLEdBQUcsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLGVBQWUsR0FBRyxDQUFDLEdBQUcs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Q0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7SUFDTCxDQUFDO0lBQ0QsV0FBVyxLQUFLLENBQUM7SUFDakIsS0FBSztRQUNELE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNOLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNsQixDQUFDO0lBQ0wsQ0FBQztDQUNKLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgcmVhZGRpclN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyBjcmVhdGVBcHAsIEFwcCB9IGZyb20gJ3Z1ZSc7XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgcGFja2FnZUpTT04gZnJvbSAnLi4vLi4vLi4vcGFja2FnZS5qc29uJztcbmNvbnN0IHBhbmVsRGF0YU1hcCA9IG5ldyBXZWFrTWFwPGFueSwgQXBwPigpO1xuLyoqXG4gKiDmj5Lku7bphY3nva5cbiAqL1xubGV0IGNvbmZpZzogYW55O1xuLyoqXG4gKiBAemgg5aaC5p6c5biM5pyb5YW85a65IDMuMyDkuYvliY3nmoTniYjmnKzlj6/ku6Xkvb/nlKjkuIvmlrnnmoTku6PnoIFcbiAqIEBlbiBZb3UgY2FuIGFkZCB0aGUgY29kZSBiZWxvdyBpZiB5b3Ugd2FudCBjb21wYXRpYmlsaXR5IHdpdGggdmVyc2lvbnMgcHJpb3IgdG8gMy4zXG4gKi9cbi8vIEVkaXRvci5QYW5lbC5kZWZpbmUgPSBFZGl0b3IuUGFuZWwuZGVmaW5lIHx8IGZ1bmN0aW9uKG9wdGlvbnM6IGFueSkgeyByZXR1cm4gb3B0aW9ucyB9XG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvci5QYW5lbC5kZWZpbmUoe1xuICAgIGxpc3RlbmVyczoge1xuICAgICAgICBzaG93KCkgeyBjb25zb2xlLmxvZygnc2hvdycpOyB9LFxuICAgICAgICBoaWRlKCkgeyBjb25zb2xlLmxvZygnaGlkZScpOyB9LFxuICAgIH0sXG4gICAgdGVtcGxhdGU6IHJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uL3N0YXRpYy90ZW1wbGF0ZS9pMThuc2V0dGluZy9pbmRleC5odG1sJyksICd1dGYtOCcpLFxuICAgIHN0eWxlOiByZWFkRmlsZVN5bmMoam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi9zdGF0aWMvc3R5bGUvaTE4bnNldHRpbmcvaW5kZXguY3NzJyksICd1dGYtOCcpLFxuICAgICQ6IHtcbiAgICAgICAgYXBwOiAnI2FwcCcsXG4gICAgfSxcbiAgICBtZXRob2RzOiB7XG4gICAgICAgIGhlbGxvKCkge1xuICAgICAgICB9XG4gICAgfSxcbiAgICByZWFkeSgpIHtcbiAgICAgICAgaWYgKHRoaXMuJC5hcHApIHtcbiAgICAgICAgICAgIGNvbnN0IGFwcCA9IGNyZWF0ZUFwcCh7fSk7XG4gICAgICAgICAgICBhcHAuY29uZmlnLmNvbXBpbGVyT3B0aW9ucy5pc0N1c3RvbUVsZW1lbnQgPSAodGFnKSA9PiB0YWcuc3RhcnRzV2l0aCgndWktJyk7XG4gICAgICAgICAgICBhcHAuY29tcG9uZW50KCdpMThuU2V0dGluZycsIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3RhdGljL3RlbXBsYXRlL3Z1ZS9pMThuU2V0dGluZy5odG1sJyksICd1dGYtOCcpLFxuICAgICAgICAgICAgICAgIGRhdGEoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhbmc6ICd6aCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0OiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3dBZGRJbnB1dDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSwgd2F0Y2g6IHtcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMgbGFuZygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5Qcm9maWxlLnNldFByb2plY3QocGFja2FnZUpTT04ubmFtZSwgJ0N1cnJlbnQgTGFuZ3VhZ2UnLCB0aGlzLmxhbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2Uuc2VuZCgnc2NlbmUnLCAnZXhlY3V0ZS1zY2VuZS1zY3JpcHQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcGFja2FnZUpTT04ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdyZWZyZXNoTGFuZ3VhZ2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LCBtZXRob2RzOiB7XG4gICAgICAgICAgICAgICAgICAgIGFkZCgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd0FkZElucHV0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVmcy5hZGRJbnB1dC5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdChsYW5ndWFnZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxhbmcgPSBsYW5ndWFnZTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMgZGVsKG5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgRWRpdG9yLkRpYWxvZy5pbmZvKGDnoa7lrprliKDpmaQgJHtuYW1lfSDor63oqIDmlofku7bvvJ9gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9uczogWyfnoa7orqQnLCAn5Y+W5raIJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWw6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQucmVzcG9uc2UgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdkZWxldGUtYXNzZXQnLCBgZGI6Ly8ke3RoaXMucGF0aH0vJHtuYW1lfS5qc29uYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGFzeW5jIHJlZnJlc2goKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXRoID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZyA9IGF3YWl0IEVkaXRvci5Qcm9maWxlLmdldFByb2plY3QocGFja2FnZUpTT04ubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXRoID0gY29uZmlnWydMYW5ndWFnZSBEaXJlY3RvcnknXS5yZXBsYWNlKCdwcm9qZWN0Oi8vJywgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXIgPSBqb2luKEVkaXRvci5Qcm9qZWN0LnBhdGgsIGAke3RoaXMucGF0aH1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXhpc3RzU3luYyhkaXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGDot6/lvoTkuI3lrZjlnKg6ICR7ZGlyfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGFuZyA9IGNvbmZpZ1snQ3VycmVudCBMYW5ndWFnZSddIHx8ICd6aCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lcyA9IHJlYWRkaXJTeW5jKGRpcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsYW5ndWFnZSA9IG5hbWUucmVwbGFjZSgvXFwuW15cXC5dKyQvLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEvXFwuLy50ZXN0KGxhbmd1YWdlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3QucHVzaChsYW5ndWFnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGFzeW5jIGdlbmVyYXRlTGFuZ3VhZ2VGaWxlKGV2ZW50OiBFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsYW5ndWFnZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEvW2EtekEtWl0vLnRlc3QobGFuZ3VhZ2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGDor63oqIDlkI3np7Dlj6rlhYHorrjkvb/nlKggYS16IEEtWiwgJHtsYW5ndWFnZX0g5LiN5ZCI5rOVYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dBZGRJbnB1dCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdjcmVhdGUtYXNzZXQnLCBgZGI6Ly8ke3RoaXMucGF0aH0vJHtsYW5ndWFnZX0uanNvbmAsIGB7fWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCBtb3VudGVkKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhcHAubW91bnQodGhpcy4kLmFwcCk7XG4gICAgICAgICAgICBwYW5lbERhdGFNYXAuc2V0KHRoaXMsIGFwcCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGJlZm9yZUNsb3NlKCkgeyB9LFxuICAgIGNsb3NlKCkge1xuICAgICAgICBjb25zdCBhcHAgPSBwYW5lbERhdGFNYXAuZ2V0KHRoaXMpO1xuICAgICAgICBpZiAoYXBwKSB7XG4gICAgICAgICAgICBhcHAudW5tb3VudCgpO1xuICAgICAgICB9XG4gICAgfSxcbn0pO1xuIl19