"use strict";
/**
 * @file index.ts
 * @author zr
 * @date 2024-06-14
 * @description 添加界面配置到 GameUIConfig.ts 的操作面板
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const vue_1 = require("vue");
const generateGameUIConfig_1 = require("../../generateGameUIConfig");
const panelDataMap = new WeakMap();
const template = `
<div>
    <div id="app">
        <add-to-game-ui-config></add-to-game-ui-config>
    </div>
</div>
`;
const style = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/style/add-to-game-ui-config.css'), 'utf-8');
const panelTemplate = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/vue/add-to-game-ui-config.html'), 'utf-8');
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
            const app = (0, vue_1.createApp)({});
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
                        const recordLayerType = (0, generateGameUIConfig_1.getLayerType)();
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
                        const recordViewAnimationType = (0, generateGameUIConfig_1.getUIAnimationType)();
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
                    onSelectItemChange(optionVaule) {
                        this.selectedLayer = optionVaule;
                    },
                    /**
                     * 设置界面开启动画
                     */
                    onSelectUIOpenAnimChange(optionVaule) {
                        this.selectedUIOpenAnim = optionVaule;
                    },
                    /**
                     * 设置界面关闭动画
                     */
                    onSelectUICloseAnimChange(optionVaule) {
                        this.selectedUICloseAnim = optionVaule;
                    },
                    /**
                     * 更新
                     */
                    async updateItems() {
                        let selectUuids = Editor.Selection.getSelected('asset');
                        this.selectedItems = [];
                        let promises = selectUuids.map(async (uuid) => {
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
                            let assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', uuid);
                            if ((assetInfo === null || assetInfo === void 0 ? void 0 : assetInfo.type) !== 'cc.Prefab') {
                                return;
                            }
                            let name = assetInfo.name.replace('.prefab', '');
                            // console.error(`uiComment ====>>> ${this.uiComment}`);
                            const item = {
                                uiComment: this.uiComment,
                                prefabName: name,
                                layer: this.selectedLayer,
                                bundle: this.bundle,
                                openAnim: this.selectedUIOpenAnim,
                                closeAnim: this.selectedUICloseAnim,
                                prefab: assetInfo.url.replace('db://assets/bundle/', '')
                                    .replace('db://assets/gmTools/', '')
                                    .replace('.prefab', ''),
                            };
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
                        (0, generateGameUIConfig_1.genSelectionItems)(this.selectedItems);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvcGFuZWxzL2FkZHRvZ2FtZXVpY29uZmlnL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7R0FLRzs7QUFHSCwyQkFBa0M7QUFDbEMsK0JBQTRCO0FBQzVCLDZCQUFxQztBQUNyQyxxRUFBOEc7QUFDOUcsTUFBTSxZQUFZLEdBQUcsSUFBSSxPQUFPLEVBQVksQ0FBQztBQUU3QyxNQUFNLFFBQVEsR0FBRzs7Ozs7O0NBTWhCLENBQUM7QUFDRixNQUFNLEtBQUssR0FBRyxJQUFBLGlCQUFZLEVBQUMsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLGlEQUFpRCxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDeEcsTUFBTSxhQUFhLEdBQUcsSUFBQSxpQkFBWSxFQUFDLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSx5REFBeUQsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBRXhILE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDakMsU0FBUyxFQUFFO1FBQ1AsSUFBSSxLQUFLLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0QsSUFBSSxLQUFLLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDOUQ7SUFDRCxRQUFRLEVBQUUsUUFBUTtJQUNsQixLQUFLLEVBQUUsS0FBSztJQUNaLENBQUMsRUFBRTtRQUNDLEdBQUcsRUFBRSxNQUFNO0tBQ2Q7SUFDRCxPQUFPLEVBQUU7UUFDTCxLQUFLO1FBQ0wsQ0FBQztLQUNKO0lBQ0QsS0FBSztRQUNELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNiLE1BQU0sR0FBRyxHQUFHLElBQUEsZUFBUyxFQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLEdBQUcsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLGVBQWUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1RSxHQUFHLENBQUMsU0FBUyxDQUFDLHVCQUF1QixFQUFFO2dCQUNuQyxRQUFRLEVBQUUsYUFBYTtnQkFDdkIsSUFBSTtvQkFDQSxPQUFPO3dCQUNILFVBQVUsRUFBRSxFQUFFO3dCQUNkLGNBQWMsRUFBRSxFQUFFO3dCQUNsQixhQUFhLEVBQUUsQ0FBQzt3QkFDaEIsa0JBQWtCLEVBQUUsQ0FBQzt3QkFDckIsbUJBQW1CLEVBQUUsQ0FBQzt3QkFDdEIsTUFBTSxFQUFFLFNBQVM7d0JBQ2pCLCtCQUErQjt3QkFDL0IsU0FBUyxFQUFFLFNBQVM7d0JBQ3BCLGFBQWEsRUFBRSxFQUFFO3FCQUNwQixDQUFDO2dCQUNOLENBQUM7Z0JBQ0QsS0FBSyxFQUFFO29CQUNILGFBQWE7d0JBQ1QsK0RBQStEO3dCQUMvRCxzQkFBc0I7b0JBQzFCLENBQUM7aUJBQ0o7Z0JBQ0QsT0FBTyxFQUFFO29CQUNMOzt1QkFFRztvQkFDSCxhQUFhO3dCQUNULE1BQU0sZUFBZSxHQUFvQyxJQUFBLG1DQUFZLEdBQUUsQ0FBQzt3QkFDeEUsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDOzRCQUNuQixPQUFPLENBQUMsS0FBSyxDQUFDLHFEQUFxRCxDQUFDLENBQUM7NEJBQ3JFLE9BQU87d0JBQ1gsQ0FBQzt3QkFDRCxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDcEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFOzRCQUNqQiw0QkFBNEI7NEJBQzVCLHdEQUF3RDs0QkFDeEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7Z0NBQ2pCLEtBQUssRUFBRSxHQUFHO2dDQUNWLEtBQUssRUFBRSxlQUFlLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs2QkFDMUMsQ0FBQyxDQUFDO3dCQUNQLENBQUMsQ0FBQyxDQUFDO3dCQUNILElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDdkIsQ0FBQztvQkFDRDs7dUJBRUc7b0JBQ0gsbUJBQW1CO3dCQUNmLE1BQU0sdUJBQXVCLEdBQW9DLElBQUEseUNBQWtCLEdBQUUsQ0FBQzt3QkFDdEYsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7NEJBQzNCLE9BQU8sQ0FBQyxLQUFLLENBQUMsMkRBQTJELENBQUMsQ0FBQzs0QkFDM0UsT0FBTzt3QkFDWCxDQUFDO3dCQUNELElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQzVFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTs0QkFDakIsa0NBQWtDOzRCQUNsQyxnRUFBZ0U7NEJBQ2hFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDO2dDQUNyQixLQUFLLEVBQUUsR0FBRztnQ0FDVixLQUFLLEVBQUUsdUJBQXVCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs2QkFDbEQsQ0FBQyxDQUFDO3dCQUNQLENBQUMsQ0FBQyxDQUFDO29CQUNQLENBQUM7b0JBQ0Q7O3VCQUVHO29CQUNILGtCQUFrQixDQUFDLFdBQW1CO3dCQUNsQyxJQUFJLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQztvQkFDckMsQ0FBQztvQkFDRDs7dUJBRUc7b0JBQ0gsd0JBQXdCLENBQUMsV0FBbUI7d0JBQ3hDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxXQUFXLENBQUM7b0JBQzFDLENBQUM7b0JBQ0Q7O3VCQUVHO29CQUNILHlCQUF5QixDQUFDLFdBQW1CO3dCQUN6QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsV0FBVyxDQUFDO29CQUMzQyxDQUFDO29CQUNEOzt1QkFFRztvQkFDSCxLQUFLLENBQUMsV0FBVzt3QkFDYixJQUFJLFdBQVcsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDeEQsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7d0JBQ3hCLElBQUksUUFBUSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQVksRUFBRSxFQUFFOzRCQUNsRDs7Ozs7Ozs7Ozs7Ozs7OytCQWVHOzRCQUNILElBQUksU0FBUyxHQUFxQixNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQzs0QkFDckcsSUFBSSxDQUFBLFNBQVMsYUFBVCxTQUFTLHVCQUFULFNBQVMsQ0FBRSxJQUFJLE1BQUssV0FBVyxFQUFFLENBQUM7Z0NBQ2xDLE9BQU87NEJBQ1gsQ0FBQzs0QkFDRCxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7NEJBQ2pELHdEQUF3RDs0QkFDeEQsTUFBTSxJQUFJLEdBQWdCO2dDQUN0QixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7Z0NBQ3pCLFVBQVUsRUFBRSxJQUFJO2dDQUNoQixLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWE7Z0NBQ3pCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtnQ0FDbkIsUUFBUSxFQUFFLElBQUksQ0FBQyxrQkFBa0I7Z0NBQ2pDLFNBQVMsRUFBRSxJQUFJLENBQUMsbUJBQW1CO2dDQUNuQyxNQUFNLEVBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsRUFBRSxDQUFDO3FDQUNuRCxPQUFPLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxDQUFDO3FDQUNuQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQzs2QkFDOUIsQ0FBQTs0QkFDRCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDbEMsQ0FBQyxDQUFDLENBQUM7d0JBQ0gsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUM1QixrRUFBa0U7b0JBQ3RFLENBQUM7b0JBQ0Q7O3VCQUVHO29CQUNILEtBQUssQ0FBQyxRQUFRO3dCQUNWLE1BQU0sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUN6QixJQUFBLHdDQUFpQixFQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDMUMsQ0FBQztpQkFDSjtnQkFDRCxLQUFLLENBQUMsT0FBTztvQkFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7b0JBQ25ELElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFDckIsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBQy9CLENBQUM7YUFDSixDQUFDLENBQUM7WUFDSCxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEIsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDaEMsQ0FBQztJQUNMLENBQUM7SUFDRCxXQUFXO0lBQ1gsQ0FBQztJQUNELEtBQUs7UUFDRCxNQUFNLEdBQUcsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25DLElBQUksR0FBRyxFQUFFLENBQUM7WUFDTixHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbEIsQ0FBQztJQUNMLENBQUM7Q0FDSixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGZpbGUgaW5kZXgudHNcclxuICogQGF1dGhvciB6clxyXG4gKiBAZGF0ZSAyMDI0LTA2LTE0XHJcbiAqIEBkZXNjcmlwdGlvbiDmt7vliqDnlYzpnaLphY3nva7liLAgR2FtZVVJQ29uZmlnLnRzIOeahOaTjeS9nOmdouadv1xyXG4gKi9cclxuXHJcbmltcG9ydCB7IEFzc2V0SW5mbyB9IGZyb20gXCJAY29jb3MvY3JlYXRvci10eXBlcy9lZGl0b3IvcGFja2FnZXMvYXNzZXQtZGIvQHR5cGVzL3B1YmxpY1wiO1xyXG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tIFwiZnNcIjtcclxuaW1wb3J0IHsgam9pbiB9IGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IEFwcCwgY3JlYXRlQXBwIH0gZnJvbSBcInZ1ZVwiO1xyXG5pbXBvcnQgeyBnZW5TZWxlY3Rpb25JdGVtcywgZ2V0TGF5ZXJUeXBlLCBnZXRVSUFuaW1hdGlvblR5cGUsIFVJSXRlbVByb3BzIH0gZnJvbSBcIi4uLy4uL2dlbmVyYXRlR2FtZVVJQ29uZmlnXCI7XHJcbmNvbnN0IHBhbmVsRGF0YU1hcCA9IG5ldyBXZWFrTWFwPGFueSwgQXBwPigpO1xyXG5cclxuY29uc3QgdGVtcGxhdGUgPSBgXHJcbjxkaXY+XHJcbiAgICA8ZGl2IGlkPVwiYXBwXCI+XHJcbiAgICAgICAgPGFkZC10by1nYW1lLXVpLWNvbmZpZz48L2FkZC10by1nYW1lLXVpLWNvbmZpZz5cclxuICAgIDwvZGl2PlxyXG48L2Rpdj5cclxuYDtcclxuY29uc3Qgc3R5bGUgPSByZWFkRmlsZVN5bmMoam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi9zdGF0aWMvc3R5bGUvYWRkLXRvLWdhbWUtdWktY29uZmlnLmNzcycpLCAndXRmLTgnKTtcclxuY29uc3QgcGFuZWxUZW1wbGF0ZSA9IHJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uL3N0YXRpYy90ZW1wbGF0ZS92dWUvYWRkLXRvLWdhbWUtdWktY29uZmlnLmh0bWwnKSwgJ3V0Zi04Jyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvci5QYW5lbC5kZWZpbmUoe1xyXG4gICAgbGlzdGVuZXJzOiB7XHJcbiAgICAgICAgc2hvdygpIHsgY29uc29sZS5sb2coJ2FkZC10by1nYW1lLXVpLWNvbmZpZyBwYW5lbCBzaG93Jyk7IH0sXHJcbiAgICAgICAgaGlkZSgpIHsgY29uc29sZS5sb2coJ2FkZC10by1nYW1lLXVpLWNvbmZpZyBwYW5lbCBoaWRlJyk7IH0sXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlLFxyXG4gICAgc3R5bGU6IHN0eWxlLFxyXG4gICAgJDoge1xyXG4gICAgICAgIGFwcDogJyNhcHAnLFxyXG4gICAgfSxcclxuICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBoZWxsbygpIHtcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIHJlYWR5KCkge1xyXG4gICAgICAgIGlmICh0aGlzLiQuYXBwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFwcCA9IGNyZWF0ZUFwcCh7fSk7XHJcbiAgICAgICAgICAgIGFwcC5jb25maWcuY29tcGlsZXJPcHRpb25zLmlzQ3VzdG9tRWxlbWVudCA9ICh0YWcpID0+IHRhZy5zdGFydHNXaXRoKCd1aS0nKTtcclxuICAgICAgICAgICAgYXBwLmNvbXBvbmVudCgnYWRkLXRvLWdhbWUtdWktY29uZmlnJywge1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IHBhbmVsVGVtcGxhdGUsXHJcbiAgICAgICAgICAgICAgICBkYXRhKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyVHlwZXM6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb25UeXBlczogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkTGF5ZXI6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkVUlPcGVuQW5pbTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRVSUNsb3NlQW5pbTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnVuZGxlOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRpZmZQcmV2aWV3OiAnZGlmZiBwcmV2aWV3JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdWlDb21tZW50OiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkSXRlbXM6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgd2F0Y2g6IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZExheWVyKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLndhcm4oYHNlbGVjdGVkTGF5ZXIgPT09PT4+PiAke3RoaXMuc2VsZWN0ZWRMYXllcn1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy51cGRhdGVJdGVtcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgICAgICog5ri45oiP5bGC57qn5p6a5Li+6I635Y+WXHJcbiAgICAgICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0TGF5ZXJUeXBlcygpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVjb3JkTGF5ZXJUeXBlOiBNYXA8bnVtYmVyLCBzdHJpbmc+IHwgdW5kZWZpbmVkID0gZ2V0TGF5ZXJUeXBlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVjb3JkTGF5ZXJUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdMYXllclR5cGUgaW4gTGF5ZXJNYW5hZ2VyIGlzIG51bGwsIFBsZWFzZSBjaGVjayBpdCEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQga2V5cyA9IEFycmF5LmZyb20ocmVjb3JkTGF5ZXJUeXBlLmtleXMoKSkuc29ydCgoYSwgYikgPT4gYSAtIGIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXlzLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5lcnJvcihgTGF5ZXJUeXBlOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICR7a2V5fSA9PT4gJHtyZWNvcmRMYXllclR5cGUuZ2V0KE51bWJlcihrZXkpKX1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGF5ZXJUeXBlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToga2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiByZWNvcmRMYXllclR5cGUuZ2V0KE51bWJlcihrZXkpKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVJdGVtcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgICAgICog55WM6Z2i5Yqo55S75p6a5Li+6I635Y+WXHJcbiAgICAgICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VUlBbmltYXRpb25UeXBlcygpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVjb3JkVmlld0FuaW1hdGlvblR5cGU6IE1hcDxudW1iZXIsIHN0cmluZz4gfCB1bmRlZmluZWQgPSBnZXRVSUFuaW1hdGlvblR5cGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZWNvcmRWaWV3QW5pbWF0aW9uVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignVUlBbmltYXRpb25UeXBlIGluIExheWVyTWFuYWdlciBpcyBudWxsLCBQbGVhc2UgY2hlY2sgaXQhJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGtleXMgPSBBcnJheS5mcm9tKHJlY29yZFZpZXdBbmltYXRpb25UeXBlLmtleXMoKSkuc29ydCgoYSwgYikgPT4gYSAtIGIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXlzLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5lcnJvcihgVUlBbmltYXRpb25UeXBlOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICR7a2V5fSA9PT4gJHtyZWNvcmRWaWV3QW5pbWF0aW9uVHlwZS5nZXQoTnVtYmVyKGtleSkpfWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hbmltYXRpb25UeXBlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToga2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiByZWNvcmRWaWV3QW5pbWF0aW9uVHlwZS5nZXQoTnVtYmVyKGtleSkpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgICAgICog6K6+572u5b2T5YmN6YCJ5Lit55qETGF5ZXJcclxuICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgICAgICBvblNlbGVjdEl0ZW1DaGFuZ2Uob3B0aW9uVmF1bGU6IG51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkTGF5ZXIgPSBvcHRpb25WYXVsZTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICAgICAqIOiuvue9rueVjOmdouW8gOWQr+WKqOeUu1xyXG4gICAgICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0VUlPcGVuQW5pbUNoYW5nZShvcHRpb25WYXVsZTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRVSU9wZW5BbmltID0gb3B0aW9uVmF1bGU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAgICAgKiDorr7nva7nlYzpnaLlhbPpl63liqjnlLtcclxuICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgICAgICBvblNlbGVjdFVJQ2xvc2VBbmltQ2hhbmdlKG9wdGlvblZhdWxlOiBudW1iZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFVJQ2xvc2VBbmltID0gb3B0aW9uVmF1bGU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAgICAgKiDmm7TmlrBcclxuICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgICAgICBhc3luYyB1cGRhdGVJdGVtcygpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdFV1aWRzID0gRWRpdG9yLlNlbGVjdGlvbi5nZXRTZWxlY3RlZCgnYXNzZXQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwcm9taXNlcyA9IHNlbGVjdFV1aWRzLm1hcChhc3luYyAodXVpZDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGRpc3BsYXlOYW1lOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGV4dGVuZHM6IFsgJ2NjLkFzc2V0JyBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogaW1wb3J0ZXI6ICdwcmVmYWInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogaXNEaXJlY3Rvcnk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogaW5zdGFudGlhdGlvbjogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogaW1wb3J0ZWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBpbnZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIG5hbWU6ICdhbGVydC5wcmVmYWInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICogZmlsZTogJ0Q6XFxcXF9Xb3Jrc3BhY2VcXFxcUGV0UmVzdG9yZUg1XFxcXENsaWVudFxcXFxQUl9EZXZcXFxcdHJ1bmtcXFxcdHJ1bmtcXFxcUGV0UmVzdG9yZVxcXFxhc3NldHNcXFxcYnVuZGxlXFxcXGNvbW1vblxcXFxwcmVmYWJcXFxcYWxlcnQucHJlZmFiJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIHJlZGlyZWN0OiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiByZWFkb25seTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiB0eXBlOiAnY2MuUHJlZmFiJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIHVybDogJ2RiOi8vYXNzZXRzL2J1bmRsZS9jb21tb24vcHJlZmFiL2FsZXJ0LnByZWZhYicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiB1dWlkOiAnNTExMjcwNTMtMTgzYi00MWRjLWI5ZDUtZGU1NGY2Nzc0NTI2J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYXNzZXRJbmZvOiBBc3NldEluZm8gfCBudWxsID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXQtaW5mbycsIHV1aWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFzc2V0SW5mbz8udHlwZSAhPT0gJ2NjLlByZWZhYicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IGFzc2V0SW5mby5uYW1lLnJlcGxhY2UoJy5wcmVmYWInLCAnJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmVycm9yKGB1aUNvbW1lbnQgPT09PT4+PiAke3RoaXMudWlDb21tZW50fWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbTogVUlJdGVtUHJvcHMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdWlDb21tZW50OiB0aGlzLnVpQ29tbWVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJOYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyOiB0aGlzLnNlbGVjdGVkTGF5ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVuZGxlOiB0aGlzLmJ1bmRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuQW5pbTogdGhpcy5zZWxlY3RlZFVJT3BlbkFuaW0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VBbmltOiB0aGlzLnNlbGVjdGVkVUlDbG9zZUFuaW0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiOiBhc3NldEluZm8udXJsLnJlcGxhY2UoJ2RiOi8vYXNzZXRzL2J1bmRsZS8nLCAnJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoJ2RiOi8vYXNzZXRzL2dtVG9vbHMvJywgJycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKCcucHJlZmFiJywgJycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zLnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuZGlmZlByZXZpZXcgPSBKU09OLnN0cmluZ2lmeSh0aGlzLnNlbGVjdGVkSXRlbXMsIG51bGwsIDQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgICAgICog55Sf5oiQXHJcbiAgICAgICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMgZ2VuZXJhdGUoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMudXBkYXRlSXRlbXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VuU2VsZWN0aW9uSXRlbXModGhpcy5zZWxlY3RlZEl0ZW1zKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgYXN5bmMgbW91bnRlZCgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYWRkLXRvLWdhbWUtdWktY29uZmlnIHBhbmVsIG1vdW50ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldExheWVyVHlwZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFVJQW5pbWF0aW9uVHlwZXMoKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBhcHAubW91bnQodGhpcy4kLmFwcCk7XHJcbiAgICAgICAgICAgIHBhbmVsRGF0YU1hcC5zZXQodGhpcywgYXBwKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgYmVmb3JlQ2xvc2UoKSB7XHJcbiAgICB9LFxyXG4gICAgY2xvc2UoKSB7XHJcbiAgICAgICAgY29uc3QgYXBwID0gcGFuZWxEYXRhTWFwLmdldCh0aGlzKTtcclxuICAgICAgICBpZiAoYXBwKSB7XHJcbiAgICAgICAgICAgIGFwcC51bm1vdW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTsiXX0=