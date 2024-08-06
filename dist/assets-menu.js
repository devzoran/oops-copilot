"use strict";
/**
 * @file assets-menu.ts
 * @author zr
 * @date 2024-06-14
 * @description 编辑器Assets面板右键菜单扩展
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPanelMenu = exports.onDBMenu = exports.onAssetMenu = exports.onCreateMenu = void 0;
const package_json_1 = __importDefault(require("../package.json"));
/**
 * 创建资源 菜单显示时触发的事件，有两个触发时机:
 * 点击资源管理器面板左上角的 + 按钮
 * 资源菜单中的 新建 菜单项被选中时
 */
function onCreateMenu(assetInfo) {
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
}
exports.onCreateMenu = onCreateMenu;
;
/**
 * 右击普通资源节点或目录时触发的事件
 */
function onAssetMenu(assetInfo) {
    return [
        {
            label: 'i18n:* Game Tools Menu',
            submenu: [
                {
                    label: 'i18n:Export GameUIConfig.ts',
                    enabled: assetInfo.type === 'cc.Prefab',
                    async click() {
                        const success = await Editor.Panel.open(`${package_json_1.default.name}.add-to-game-ui-config`);
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
}
exports.onAssetMenu = onAssetMenu;
;
/**
 * 右击资源数据库根节点 assets 时触发的事件
 */
function onDBMenu(assetInfo) {
    // console.log("右击资源数据库根节点 assets 时触发的事件");
}
exports.onDBMenu = onDBMenu;
/**
 * 右击资源管理面板空白区域时触发的事件
 */
function onPanelMenu(assetInfo) {
    // console.log("右击资源管理面板空白区域时触发的事件");
}
exports.onPanelMenu = onPanelMenu;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXRzLW1lbnUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2UvYXNzZXRzLW1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7OztHQUtHOzs7Ozs7QUFHSCxtRUFBMEM7QUFFMUM7Ozs7R0FJRztBQUNILFNBQWdCLFlBQVksQ0FBQyxTQUFvQjtJQUM3QyxPQUFPO0lBQ0gsTUFBTTtJQUNOLHlEQUF5RDtJQUN6RCxnQkFBZ0I7SUFDaEIsMEJBQTBCO0lBQzFCLDhEQUE4RDtJQUM5RCxpQkFBaUI7SUFDakIsK0VBQStFO0lBQy9FLGtDQUFrQztJQUNsQyxVQUFVO0lBQ1YsU0FBUztJQUNULE9BQU87S0FDVixDQUFDO0FBQ04sQ0FBQztBQWRELG9DQWNDO0FBQUEsQ0FBQztBQUVGOztHQUVHO0FBQ0gsU0FBZ0IsV0FBVyxDQUFDLFNBQW9CO0lBQzVDLE9BQU87UUFDSDtZQUNJLEtBQUssRUFBRSx3QkFBd0I7WUFDL0IsT0FBTyxFQUFFO2dCQUNMO29CQUNJLEtBQUssRUFBRSw2QkFBNkI7b0JBQ3BDLE9BQU8sRUFBRSxTQUFTLENBQUMsSUFBSSxLQUFLLFdBQVc7b0JBQ3ZDLEtBQUssQ0FBQyxLQUFLO3dCQUNQLE1BQU0sT0FBTyxHQUFHLE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxzQkFBVyxDQUFDLElBQUksd0JBQXdCLENBQUMsQ0FBQzt3QkFDckYsZ0JBQWdCO3dCQUNoQiwrQkFBK0I7d0JBQy9CLCtCQUErQjt3QkFDL0IsS0FBSzt3QkFDTCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7NEJBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO3dCQUN2QyxDQUFDO29CQUNMLENBQUM7aUJBQ0o7Z0JBQ0QsTUFBTTtnQkFDTiwyREFBMkQ7Z0JBQzNELHVDQUF1QztnQkFDdkMsZ0JBQWdCO2dCQUNoQix5Q0FBeUM7Z0JBQ3pDLGdDQUFnQztnQkFDaEMsU0FBUztnQkFDVCxPQUFPO2FBQ1Y7U0FDSjtLQUNKLENBQUM7QUFDTixDQUFDO0FBOUJELGtDQThCQztBQUFBLENBQUM7QUFFRjs7R0FFRztBQUNILFNBQWdCLFFBQVEsQ0FBQyxTQUFvQjtJQUN6QywyQ0FBMkM7QUFDL0MsQ0FBQztBQUZELDRCQUVDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixXQUFXLENBQUMsU0FBb0I7SUFDNUMscUNBQXFDO0FBQ3pDLENBQUM7QUFGRCxrQ0FFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAZmlsZSBhc3NldHMtbWVudS50c1xyXG4gKiBAYXV0aG9yIHpyXHJcbiAqIEBkYXRlIDIwMjQtMDYtMTRcclxuICogQGRlc2NyaXB0aW9uIOe8lui+keWZqEFzc2V0c+mdouadv+WPs+mUruiPnOWNleaJqeWxlVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IEFzc2V0SW5mbyB9IGZyb20gXCJAY29jb3MvY3JlYXRvci10eXBlcy9lZGl0b3IvcGFja2FnZXMvYXNzZXQtZGIvQHR5cGVzL3B1YmxpY1wiO1xyXG5pbXBvcnQgcGFja2FnZUpTT04gZnJvbSAnLi4vcGFja2FnZS5qc29uJztcclxuXHJcbi8qKlxyXG4gKiDliJvlu7rotYTmupAg6I+c5Y2V5pi+56S65pe26Kem5Y+R55qE5LqL5Lu277yM5pyJ5Lik5Liq6Kem5Y+R5pe25py6OlxyXG4gKiDngrnlh7votYTmupDnrqHnkIblmajpnaLmnb/lt6bkuIrop5LnmoQgKyDmjInpkq5cclxuICog6LWE5rqQ6I+c5Y2V5Lit55qEIOaWsOW7uiDoj5zljZXpobnooqvpgInkuK3ml7ZcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBvbkNyZWF0ZU1lbnUoYXNzZXRJbmZvOiBBc3NldEluZm8pIHtcclxuICAgIHJldHVybiBbXHJcbiAgICAgICAgLy8gICB7XHJcbiAgICAgICAgLy8gICAgIGxhYmVsOiAnaTE4bjpleHRlbmQtYXNzZXRzLWRlbW8ubWVudS5jcmVhdGVBc3NldCcsXHJcbiAgICAgICAgLy8gICAgIGNsaWNrKCkge1xyXG4gICAgICAgIC8vICAgICAgIGlmICghYXNzZXRJbmZvKSB7XHJcbiAgICAgICAgLy8gICAgICAgICBjb25zb2xlLmxvZygnZ2V0IGNyZWF0ZSBjb21tYW5kIGZyb20gaGVhZGVyIG1lbnUnKTtcclxuICAgICAgICAvLyAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vICAgICAgICAgY29uc29sZS5sb2coJ2dldCBjcmVhdGUgY29tbWFuZCwgdGhlIGRldGFpbCBvZiBkaXJldG9yeSBhc3NldCBpczonKTtcclxuICAgICAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKGFzc2V0SW5mbyk7XHJcbiAgICAgICAgLy8gICAgICAgfVxyXG4gICAgICAgIC8vICAgICB9LFxyXG4gICAgICAgIC8vICAgfSxcclxuICAgIF07XHJcbn07XHJcblxyXG4vKipcclxuICog5Y+z5Ye75pmu6YCa6LWE5rqQ6IqC54K55oiW55uu5b2V5pe26Kem5Y+R55qE5LqL5Lu2XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gb25Bc3NldE1lbnUoYXNzZXRJbmZvOiBBc3NldEluZm8pIHtcclxuICAgIHJldHVybiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46KiBHYW1lIFRvb2xzIE1lbnUnLFxyXG4gICAgICAgICAgICBzdWJtZW51OiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdpMThuOkV4cG9ydCBHYW1lVUlDb25maWcudHMnLFxyXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IGFzc2V0SW5mby50eXBlID09PSAnY2MuUHJlZmFiJyxcclxuICAgICAgICAgICAgICAgICAgICBhc3luYyBjbGljaygpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IEVkaXRvci5QYW5lbC5vcGVuKGAke3BhY2thZ2VKU09OLm5hbWV9LmFkZC10by1nYW1lLXVpLWNvbmZpZ2ApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBuYW1lOiAke2Fzc2V0SW5mby5uYW1lfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIHR5cGU6ICR7YXNzZXRJbmZvLnR5cGV9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ29wZW4gcGFuZWwgZmFpbGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIC8vICAge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGxhYmVsOiAnaTE4bjpleHRlbmQtYXNzZXRzLWRlbW8ubWVudS5hc3NldENvbW1hbmQyJyxcclxuICAgICAgICAgICAgICAgIC8vICAgICBlbmFibGVkOiAhYXNzZXRJbmZvLmlzRGlyZWN0b3J5LFxyXG4gICAgICAgICAgICAgICAgLy8gICAgIGNsaWNrKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgY29uc29sZS5sb2coJ3llcywgeW91IGNsaWNrZWQnKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgIGNvbnNvbGUubG9nKGFzc2V0SW5mbyk7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfSxcclxuICAgICAgICAgICAgICAgIC8vICAgfSxcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICB9LFxyXG4gICAgXTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiDlj7Plh7votYTmupDmlbDmja7lupPmoLnoioLngrkgYXNzZXRzIOaXtuinpuWPkeeahOS6i+S7tlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG9uREJNZW51KGFzc2V0SW5mbzogQXNzZXRJbmZvKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIuWPs+WHu+i1hOa6kOaVsOaNruW6k+agueiKgueCuSBhc3NldHMg5pe26Kem5Y+R55qE5LqL5Lu2XCIpO1xyXG59XHJcblxyXG4vKipcclxuICog5Y+z5Ye76LWE5rqQ566h55CG6Z2i5p2/56m655m95Yy65Z+f5pe26Kem5Y+R55qE5LqL5Lu2XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gb25QYW5lbE1lbnUoYXNzZXRJbmZvOiBBc3NldEluZm8pIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwi5Y+z5Ye76LWE5rqQ566h55CG6Z2i5p2/56m655m95Yy65Z+f5pe26Kem5Y+R55qE5LqL5Lu2XCIpO1xyXG59XHJcbiJdfQ==