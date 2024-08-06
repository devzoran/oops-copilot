/**
 * @file assets-menu.ts
 * @author zr
 * @date 2024-06-14
 * @description 编辑器Assets面板右键菜单扩展
 */

import { AssetInfo } from "@cocos/creator-types/editor/packages/asset-db/@types/public";
import packageJSON from '../package.json';

/**
 * 创建资源 菜单显示时触发的事件，有两个触发时机:
 * 点击资源管理器面板左上角的 + 按钮
 * 资源菜单中的 新建 菜单项被选中时
 */
export function onCreateMenu(assetInfo: AssetInfo) {
    return [
        //   {
        //     label: 'i18n:extend-assets-demo.menu.createAsset',
        //     click() {
        //       if (!assetInfo) {
        //         console.log('get create command from header menu');
        //       } else {
        //         console.log('get create command, the detail of diretory asset is:');
        //         console.log(assetInfo);
        //       }
        //     },
        //   },
    ];
};

/**
 * 右击普通资源节点或目录时触发的事件
 */
export function onAssetMenu(assetInfo: AssetInfo) {
    return [
        {
            label: 'i18n:* Game Tools Menu',
            submenu: [
                {
                    label: 'i18n:Export GameUIConfig.ts',
                    enabled: assetInfo.type === 'cc.Prefab',
                    async click() {
                        const success = await Editor.Panel.open(`${packageJSON.name}.add-to-game-ui-config`);
                        // console.log(`
                        //     name: ${assetInfo.name},
                        //     type: ${assetInfo.type},
                        // `)
                        if (!success) {
                            console.error('open panel failed');
                        }
                    },
                },
                //   {
                //     label: 'i18n:extend-assets-demo.menu.assetCommand2',
                //     enabled: !assetInfo.isDirectory,
                //     click() {
                //       console.log('yes, you clicked');
                //       console.log(assetInfo);
                //     },
                //   },
            ],
        },
    ];
};

/**
 * 右击资源数据库根节点 assets 时触发的事件
 */
export function onDBMenu(assetInfo: AssetInfo) {
    // console.log("右击资源数据库根节点 assets 时触发的事件");
}

/**
 * 右击资源管理面板空白区域时触发的事件
 */
export function onPanelMenu(assetInfo: AssetInfo) {
    // console.log("右击资源管理面板空白区域时触发的事件");
}
