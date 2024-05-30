import { join } from 'path';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { createApp, App } from 'vue';
// @ts-ignore
import packageJSON from '../../../package.json';
const panelDataMap = new WeakMap<any, App>();
/**
 * 插件配置
 */
let config: any;
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
    template: readFileSync(join(__dirname, '../../../static/template/i18nsetting/index.html'), 'utf-8'),
    style: readFileSync(join(__dirname, '../../../static/style/i18nsetting/index.css'), 'utf-8'),
    $: {
        app: '#app',
    },
    methods: {
        hello() {
        }
    },
    ready() {
        if (this.$.app) {
            const app = createApp({});
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.component('i18nSetting', {
                template: readFileSync(join(__dirname, '../../../static/template/vue/i18nSetting.html'), 'utf-8'),
                data() {
                    return {
                        path: '',
                        lang: 'zh',
                        list: [],
                        showAddInput: false,
                    };
                }, watch: {
                    async lang() {
                        await Editor.Profile.setProject(packageJSON.name, 'Current Language', this.lang);
                        Editor.Message.send('scene', 'execute-scene-script', {
                            name: packageJSON.name,
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
                    select(language: string) {
                        this.lang = language;
                    },
                    async del(name: string) {
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
                            config = await Editor.Profile.getProject(packageJSON.name);
                            this.path = config['Language Directory'].replace('project://', '');
                        }
                        
                        const dir = join(Editor.Project.path, `${this.path}`);
                        if (!existsSync(dir)) {
                            console.warn(`路径不存在: ${dir}`);
                            return;
                        }
                        this.lang = config['Current Language'] || 'zh';
                        const names = readdirSync(dir);
                        this.list = [];
                        names.forEach((name) => {
                            const language = name.replace(/\.[^\.]+$/, '');
                            if (!/\./.test(language)) {
                                this.list.push(language);
                            }
                        });
                    },
                    async generateLanguageFile(event: Event) {
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
