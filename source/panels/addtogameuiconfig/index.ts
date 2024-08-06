/**
 * @file index.ts
 * @author zr
 * @date 2024-06-14
 * @description 添加界面配置到 GameUIConfig.ts 的操作面板
 */

import { AssetInfo } from "@cocos/creator-types/editor/packages/asset-db/@types/public";
import { readFileSync } from "fs";
import { join } from "path";
import { App, createApp } from "vue";
import { genSelectionItems, getLayerType, getUIAnimationType, UIItemProps } from "../../generateGameUIConfig";
const panelDataMap = new WeakMap<any, App>();

const template = `
<div>
    <div id="app">
        <add-to-game-ui-config></add-to-game-ui-config>
    </div>
</div>
`;
const style = readFileSync(join(__dirname, '../../../static/style/add-to-game-ui-config.css'), 'utf-8');
const panelTemplate = readFileSync(join(__dirname, '../../../static/template/vue/add-to-game-ui-config.html'), 'utf-8');

module.exports = Editor.Panel.define({
    listeners: {
        show() { console.log('add-to-game-ui-config panel show'); },
        hide() { console.log('add-to-game-ui-config panel hide'); },
    },
    template: template,
    style: style,
    $: {
        app: '#app',
    },
    methods: {
        hello() {
        },
    },
    ready() {
        if (this.$.app) {
            const app = createApp({});
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.component('add-to-game-ui-config', {
                template: panelTemplate,
                data() {
                    return {
                        layerTypes: [],
                        animationTypes: [],
                        selectedLayer: 0,
                        selectedUIOpenAnim: 0,
                        selectedUICloseAnim: 0,
                        bundle: undefined,
                        // diffPreview: 'diff preview',
                        uiComment: undefined,
                        selectedItems: [],
                    };
                },
                watch: {
                    selectedLayer() {
                        // console.warn(`selectedLayer ====>>> ${this.selectedLayer}`);
                        // this.updateItems();
                    }
                },
                methods: {
                    /**
                     * 游戏层级枚举获取
                     */
                    setLayerTypes() {
                        const recordLayerType: Map<number, string> | undefined = getLayerType();
                        if (!recordLayerType) {
                            console.error('LayerType in LayerManager is null, Please check it!');
                            return;
                        }
                        let keys = Array.from(recordLayerType.keys()).sort((a, b) => a - b);
                        keys.forEach((key) => {
                            // console.error(`LayerType:
                            //     ${key} ==> ${recordLayerType.get(Number(key))}`);
                            this.layerTypes.push({
                                value: key,
                                label: recordLayerType.get(Number(key)),
                            });
                        });
                        this.updateItems();
                    },
                    /**
                     * 界面动画枚举获取
                     */
                    setUIAnimationTypes() {
                        const recordViewAnimationType: Map<number, string> | undefined = getUIAnimationType();
                        if (!recordViewAnimationType) {
                            console.error('UIAnimationType in LayerManager is null, Please check it!');
                            return;
                        }
                        let keys = Array.from(recordViewAnimationType.keys()).sort((a, b) => a - b);
                        keys.forEach((key) => {
                            // console.error(`UIAnimationType:
                            //     ${key} ==> ${recordViewAnimationType.get(Number(key))}`);
                            this.animationTypes.push({
                                value: key,
                                label: recordViewAnimationType.get(Number(key)),
                            });
                        });
                    },
                    /**
                     * 设置当前选中的Layer
                     */
                    onSelectItemChange(optionVaule: number) {
                        this.selectedLayer = optionVaule;
                    },
                    /**
                     * 设置界面开启动画
                     */
                    onSelectUIOpenAnimChange(optionVaule: number) {
                        this.selectedUIOpenAnim = optionVaule;
                    },
                    /**
                     * 设置界面关闭动画
                     */
                    onSelectUICloseAnimChange(optionVaule: number) {
                        this.selectedUICloseAnim = optionVaule;
                    },
                    /**
                     * 更新
                     */
                    async updateItems() {
                        let selectUuids = Editor.Selection.getSelected('asset');
                        this.selectedItems = [];
                        let promises = selectUuids.map(async (uuid: string) => {
                            /**
                             * displayName: '',
                             * extends: [ 'cc.Asset' ],
                             * importer: 'prefab',
                             * isDirectory: false,
                             * instantiation: undefined,
                             * imported: true,
                             * invalid: false,
                             * name: 'alert.prefab',
                             * file: 'D:\\_Workspace\\PetRestoreH5\\Client\\PR_Dev\\trunk\\trunk\\PetRestore\\assets\\bundle\\common\\prefab\\alert.prefab',
                             * redirect: undefined,
                             * readonly: false,
                             * type: 'cc.Prefab',
                             * url: 'db://assets/bundle/common/prefab/alert.prefab',
                             * uuid: '51127053-183b-41dc-b9d5-de54f6774526'
                             */
                            let assetInfo: AssetInfo | null = await Editor.Message.request('asset-db', 'query-asset-info', uuid);
                            if (assetInfo?.type !== 'cc.Prefab') {
                                return;
                            }
                            let name = assetInfo.name.replace('.prefab', '');
                            // console.error(`uiComment ====>>> ${this.uiComment}`);
                            const item: UIItemProps = {
                                uiComment: this.uiComment,
                                prefabName: name,
                                layer: this.selectedLayer,
                                bundle: this.bundle,
                                openAnim: this.selectedUIOpenAnim,
                                closeAnim: this.selectedUICloseAnim,
                                prefab: assetInfo.url.replace('db://assets/bundle/', '')
                                    .replace('db://assets/gmTools/', '')
                                    .replace('.prefab', ''),
                            }
                            this.selectedItems.push(item);
                        });
                        await Promise.all(promises);
                        // this.diffPreview = JSON.stringify(this.selectedItems, null, 4);
                    },
                    /**
                     * 生成
                     */
                    async generate() {
                        await this.updateItems();
                        genSelectionItems(this.selectedItems);
                    }
                },
                async mounted() {
                    console.log('add-to-game-ui-config panel mounted');
                    this.setLayerTypes();
                    this.setUIAnimationTypes();
                },
            });
            app.mount(this.$.app);
            panelDataMap.set(this, app);
        }
    },
    beforeClose() {
    },
    close() {
        const app = panelDataMap.get(this);
        if (app) {
            app.unmount();
        }
    }
});