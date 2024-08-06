"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUIAnimationType = exports.getLayerType = exports.genSelectionItems = void 0;
/**
 * @file generateGameUIConfig.ts
 * @author zr
 * @date 2024-06-13
 * @description 导出GameUIConfig.ts脚本
 */
const fs_1 = __importDefault(require("fs"));
const mustache_1 = __importDefault(require("mustache"));
const path_1 = __importDefault(require("path"));
const typescript_1 = __importDefault(require("typescript"));
/**
 * 添加到 GameUIConfig
 */
function genSelectionItems(selectedItems) {
    let tsPath = `${Editor.Project.path}/assets/script/game/common/config/GameUIConfig.ts`;
    if (!fs_1.default.existsSync(tsPath)) {
        console.error('GameUIConfig.ts不存在！Path:' + tsPath);
        return;
    }
    let UIID;
    let UIConfigData;
    let sourceFile;
    [sourceFile, UIID, UIConfigData] = parseGameUIConfig(tsPath);
    if (!sourceFile || !UIID || !UIConfigData) {
        console.error('GameUIConfig.ts解析失败！');
        return;
    }
    const recordLayer = getLayerType();
    const recordUIAnimationType = getUIAnimationType();
    // 解析出UIID和UIConfigData数据
    let uiids = new Map();
    parseUiids(uiids, UIID, sourceFile);
    let uiConfigs = new Map();
    parseUIConfigData(uiConfigs, UIConfigData, sourceFile);
    // 结合选中项后处理生成新的UIConfigData和UIID
    postprocessingBySelectionItems(selectedItems, uiids, uiConfigs, recordLayer, recordUIAnimationType);
    const mustacheData = formatMustacheData(uiids, uiConfigs);
    const templatePath = path_1.default.join(__dirname, '../mustache/GameUIConfig.mustache');
    const template = fs_1.default.readFileSync(templatePath, 'utf8');
    const output = mustache_1.default.render(template, mustacheData);
    // console.warn(str);
    let projectPath = Editor.Project.path;
    fs_1.default.writeFileSync(path_1.default.join(projectPath, 'assets/script/game/common/config/GameUIConfig.ts'), output, 'utf8');
    console.log('Generate GameUIConfig.ts success!');
}
exports.genSelectionItems = genSelectionItems;
/**
 * 生成 Mustache 数据
 */
function formatMustacheData(uuids, uiConfigs) {
    let mustacheData = {
        uiids: [],
        uiconfigs: [],
    };
    const uuidKeys = Array.from(uuids.keys()).sort();
    uuidKeys.forEach(key => {
        var _a;
        const item = uuids.get(key);
        if (item) {
            mustacheData.uiids.push({
                comment: ((_a = item.comment) === null || _a === void 0 ? void 0 : _a.length) === 0 ? undefined : item.comment,
                name: item.name
            });
            // console.log(`uiid ${item.name}: ${item.comment}`);
        }
    });
    const uiConfigKeys = Array.from(uiConfigs.keys()).sort();
    uiConfigKeys.forEach(key => {
        var _a, _b, _c, _d, _e, _f;
        const item = uiConfigs.get(key);
        if (item) {
            // console.log(`uiConfig  ${item.name}: ${item.comment}`);
            let uiconfig = {
                comment: ((_a = item.comment) === null || _a === void 0 ? void 0 : _a.length) === 0 ? undefined : item.comment,
                name: item.name,
                layer: (_b = item.value) === null || _b === void 0 ? void 0 : _b.layer,
                prefab: (_c = item.value) === null || _c === void 0 ? void 0 : _c.prefab,
                bundle: (_d = item.value) === null || _d === void 0 ? void 0 : _d.bundle,
                showAnim: (_e = item.value) === null || _e === void 0 ? void 0 : _e.showAnim,
                hideAnim: (_f = item.value) === null || _f === void 0 ? void 0 : _f.hideAnim,
            };
            mustacheData.uiconfigs.push(uiconfig);
        }
    });
    return mustacheData;
}
/**
 * 获取 UIConfigData 的属性
 */
function parseUIConfigData(uiConfigs, UIConfigData, sourceFile) {
    if (!UIConfigData || !UIConfigData.initializer
        || !typescript_1.default.isObjectLiteralExpression(UIConfigData.initializer)) {
        return;
    }
    for (const property of UIConfigData.initializer.properties) {
        if (typescript_1.default.isPropertyAssignment(property)) {
            const key = property.name.getText();
            // const value = property.initializer.getText();
            const comment = getTsComment(sourceFile, property.pos);
            let configItem = {
                comment: comment,
                name: key,
                value: {}
            };
            uiConfigs.set(key, configItem);
            if (typescript_1.default.isObjectLiteralExpression(property.initializer)) {
                for (const subProperty of property.initializer.properties) {
                    if (typescript_1.default.isPropertyAssignment(subProperty)) {
                        const subKey = subProperty.name.getText();
                        const subValue = subProperty.initializer.getText();
                        // console.log(`parseUIConfigData
                        //     name: ${key},
                        //     comment: ${comment},
                        //     subKey: ${subKey},
                        //     subValue: ${subValue}`);
                        if (configItem.value) {
                            configItem.value[subKey] = subValue;
                        }
                    }
                }
            }
        }
    }
}
/**
 * 获取 UIID 的属性
 */
function parseUiids(uiids, UIID, sourceFile) {
    if (UIID) {
        UIID.forEach(member => {
            const key = member.name.getText();
            const uiidItem = {
                comment: getTsComment(sourceFile, member.pos),
                name: key
            };
            uiids.set(key, uiidItem);
        });
    }
}
/**
 * 获得ts文件中的注释
 * @param sourceFile 目标文件
 * @param pos 参数位置
 * @returns
 */
function getTsComment(sourceFile, pos) {
    const comment = typescript_1.default.getLeadingCommentRanges(sourceFile.text, pos);
    const commentText = comment ? sourceFile.text.substring(comment[0].pos, comment[0].end) : '';
    return commentText.replace(/^\/\*\*|\*\/$/g, '').trim();
}
/**
 * 解析ts文件获取 LayerType 枚举
 */
function getLayerType() {
    let tsPath = `${Editor.Project.path}/extensions/oops-plugin-framework/assets/core/gui/layer/LayerManager.ts`;
    if (!fs_1.default.existsSync(tsPath)) {
        console.error('LayerManager.ts不存在！Path:' + tsPath);
        return;
    }
    let recordLayerType = new Map();
    // 读取TypeScript文件内容
    const sourceCode = fs_1.default.readFileSync(tsPath, 'utf8');
    // 解析 TypeScript 文件以获取枚举和注释
    const sourceFile = typescript_1.default.createSourceFile('LayerManager.ts', // 文件名
    sourceCode, // TypeScript 代码
    typescript_1.default.ScriptTarget.Latest, // 语言版本
    true // 设置父节点
    );
    // 遍历所有节点
    function visit(node) {
        if (typescript_1.default.isEnumDeclaration(node) && node.name.text === 'LayerType') {
            // console.log('Found LayerType enum:');
            let i = 0;
            node.members.forEach(member => {
                // console.log(`->>> ${member.initializer}`);
                recordLayerType.set(i++, member.name.getText());
            });
            return;
        }
        typescript_1.default.forEachChild(node, visit); // 递归访问子节点
    }
    visit(sourceFile);
    return recordLayerType;
}
exports.getLayerType = getLayerType;
/**
 * 解析ts文件获取 UIAnimationType 枚举
 */
function getUIAnimationType() {
    let tsPath = `${Editor.Project.path}/extensions/oops-plugin-framework/assets/core/gui/layer/LayerManager.ts`;
    if (!fs_1.default.existsSync(tsPath)) {
        console.error('LayerManager.ts不存在！Path:' + tsPath);
        return;
    }
    let recordUIAnimationType = new Map();
    // 读取TypeScript文件内容
    const sourceCode = fs_1.default.readFileSync(tsPath, 'utf8');
    // 解析 TypeScript 文件以获取枚举和注释
    const sourceFile = typescript_1.default.createSourceFile('LayerManager.ts', // 文件名
    sourceCode, // TypeScript 代码
    typescript_1.default.ScriptTarget.Latest, // 语言版本
    true // 设置父节点
    );
    // 遍历所有节点
    function visit(node) {
        if (typescript_1.default.isEnumDeclaration(node) && node.name.text === 'UIAnimationType') {
            // console.log('Found LayerType enum:');
            node.members.forEach(member => {
                // console.log(`- ${member.name.getText()}`);
                recordUIAnimationType.set(member.initializer ? Number(member.initializer.getText()) : 0, member.name.getText());
            });
            return;
        }
        typescript_1.default.forEachChild(node, visit); // 递归访问子节点
    }
    visit(sourceFile);
    return recordUIAnimationType;
}
exports.getUIAnimationType = getUIAnimationType;
function parseGameUIConfig(tsPath) {
    {
        // 读取TypeScript文件内容
        const sourceCode = fs_1.default.readFileSync(tsPath, 'utf8');
        // 解析 TypeScript 文件以获取枚举和注释
        const sourceFile = typescript_1.default.createSourceFile('GameUIConfig.ts', // 文件名
        sourceCode, // TypeScript 代码
        typescript_1.default.ScriptTarget.Latest, // 语言版本
        true // 设置父节点
        );
        let UIID;
        let UIConfigData;
        // 遍历所有节点
        function visit(node) {
            if (typescript_1.default.isEnumDeclaration(node) && node.name.text === 'UIID') {
                UIID = node.members;
                return;
            }
            else if (typescript_1.default.isVariableStatement(node)) {
                for (const declaration of node.declarationList.declarations) {
                    if (typescript_1.default.isVariableDeclaration(declaration) && declaration.name.getText() === 'UIConfigData') {
                        UIConfigData = declaration;
                        return;
                    }
                }
            }
            typescript_1.default.forEachChild(node, visit); // 递归访问子节点
        }
        visit(sourceFile);
        return [sourceFile, UIID, UIConfigData];
    }
}
/**
 * 根据选中项为文件生成结构后处理
 */
function postprocessingBySelectionItems(selectedItems, uiids, uiConfigs, recordLayer, recordUIAnimationType) {
    selectedItems.forEach((selection, index) => {
        var _a;
        let uiidKey = capitalizeLetter(selection.prefabName);
        let uiConfigKey = `[UIID.${uiidKey}]`;
        let uiidItem = uiids.get(uiidKey);
        // let uiidCommentBefor = uiidItem?.comment;
        let uiidCommentAfter = selection.uiComment;
        let parseLayerAfter, parseOpenAnimAfter, parseCloseAnimAfter;
        recordLayer === null || recordLayer === void 0 ? void 0 : recordLayer.forEach((value, key) => {
            if (key - selection.layer === 0) {
                parseLayerAfter = value;
            }
        });
        recordUIAnimationType === null || recordUIAnimationType === void 0 ? void 0 : recordUIAnimationType.forEach((value, key) => {
            if (key - selection.openAnim === 0
                && key !== 0 // 排除 UIAnimationType.None
            ) {
                parseOpenAnimAfter = value;
            }
            else if (key - selection.closeAnim === 0
                && key !== 0 // 排除 UIAnimationType.None
            ) {
                parseCloseAnimAfter = value;
            }
        });
        uiidItem
            ? (uiidCommentAfter && (uiidItem.comment = uiidCommentAfter))
            : uiids.set(uiidKey, { comment: uiidCommentAfter, name: uiidKey });
        let prefab = `'${selection.prefab}'`;
        let uiConfigItem = uiConfigs.get(uiConfigKey);
        // let layerBefore = uiConfigItem?.value?.layer;
        let layerAfter = parseLayerAfter && `LayerType.${parseLayerAfter}`;
        let openAnimAfter = parseOpenAnimAfter && `UIAnimationType.${parseOpenAnimAfter}`;
        let closeAnimAfter = parseCloseAnimAfter && `UIAnimationType.${parseCloseAnimAfter}`;
        let bundleBefor = (_a = uiConfigItem === null || uiConfigItem === void 0 ? void 0 : uiConfigItem.value) === null || _a === void 0 ? void 0 : _a.bundle;
        let parseBundleName = selection.bundle && `'${selection.bundle}'`;
        // bundleBefor && (bundleBefor = `'${bundleBefor}'`);
        uiConfigItem
            ? uiConfigItem.value = {
                layer: layerAfter,
                prefab: prefab,
                bundle: !!parseBundleName ? parseBundleName : bundleBefor,
                showAnim: openAnimAfter,
                hideAnim: closeAnimAfter,
            }
            : uiConfigs.set(uiConfigKey, {
                comment: '',
                name: uiConfigKey,
                value: {
                    layer: layerAfter,
                    prefab: prefab,
                    bundle: parseBundleName,
                    showAnim: openAnimAfter,
                    hideAnim: closeAnimAfter,
                },
            });
        // console.log(`
        //     uiidKey: ${uiidKey},
        //     uiConfigKey: ${uiConfigKey},
        //     commentBef: ${uiidCommentBefor} ===> commentAft: ${uiidCommentAfter},
        //     layerBef: ${layerBefore} ===> layerAft: ${layerAfter},
        //     prefab: ${prefab},`);
    });
}
/**
 * 首字母大写转换
 */
function capitalizeLetter(s) {
    s = s.replace('View', '');
    return s.charAt(0).toUpperCase() + s.slice(1);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVHYW1lVUlDb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2UvZ2VuZXJhdGVHYW1lVUlDb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7O0dBS0c7QUFDSCw0Q0FBb0I7QUFDcEIsd0RBQWdDO0FBQ2hDLGdEQUF3QjtBQUN4Qiw0REFBNEI7QUFtQjVCOztHQUVHO0FBQ0gsU0FBZ0IsaUJBQWlCLENBQUMsYUFBNEI7SUFDMUQsSUFBSSxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksbURBQW1ELENBQUM7SUFDdkYsSUFBSSxDQUFDLFlBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUN6QixPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixHQUFHLE1BQU0sQ0FBQyxDQUFDO1FBQ25ELE9BQU87SUFDWCxDQUFDO0lBRUQsSUFBSSxJQUE2QyxDQUFDO0lBQ2xELElBQUksWUFBZ0QsQ0FBQztJQUNyRCxJQUFJLFVBQXFDLENBQUM7SUFDMUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzdELElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN4QyxPQUFPLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDdEMsT0FBTztJQUNYLENBQUM7SUFFRCxNQUFNLFdBQVcsR0FBRyxZQUFZLEVBQUUsQ0FBQztJQUNuQyxNQUFNLHFCQUFxQixHQUFHLGtCQUFrQixFQUFFLENBQUM7SUFDbkQseUJBQXlCO0lBQ3pCLElBQUksS0FBSyxHQUE4QixJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2pELFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3BDLElBQUksU0FBUyxH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UUFDM0IsbUNBQW1DO1FBQ25DLDRFQUE0RTtRQUM1RSw2REFBNkQ7UUFDN0QsNEJBQTRCO0lBQ2hDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxnQkFBZ0IsQ0FBQyxDQUFTO0lBQy9CLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMxQixPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBmaWxlIGdlbmVyYXRlR2FtZVVJQ29uZmlnLnRzXHJcbiAqIEBhdXRob3IgenJcclxuICogQGRhdGUgMjAyNC0wNi0xM1xyXG4gKiBAZGVzY3JpcHRpb24g5a+85Ye6R2FtZVVJQ29uZmlnLnRz6ISa5pysXHJcbiAqL1xyXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgTXVzdGFjaGUgZnJvbSAnbXVzdGFjaGUnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xyXG5cclxudHlwZSBBbmFseXNpc0l0ZW0gPSB7XHJcbiAgICBjb21tZW50OiBzdHJpbmcgfCB1bmRlZmluZWQsXHJcbiAgICBuYW1lOiBzdHJpbmcsXHJcbiAgICB2YWx1ZT86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgdW5kZWZpbmVkIH0sXHJcbn1cclxuXHJcbi8vIOavj+adoemAieS4remhuemcgOimgeiuvue9rueahOWxnuaAp1xyXG5leHBvcnQgdHlwZSBVSUl0ZW1Qcm9wcyA9IHtcclxuICAgIHVpQ29tbWVudDogc3RyaW5nIHwgdW5kZWZpbmVkLFxyXG4gICAgcHJlZmFiTmFtZTogc3RyaW5nLFxyXG4gICAgbGF5ZXI6IG51bWJlcixcclxuICAgIGJ1bmRsZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxyXG4gICAgb3BlbkFuaW06IG51bWJlcixcclxuICAgIGNsb3NlQW5pbTogbnVtYmVyLFxyXG4gICAgcHJlZmFiOiBzdHJpbmcsXHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmt7vliqDliLAgR2FtZVVJQ29uZmlnXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2VuU2VsZWN0aW9uSXRlbXMoc2VsZWN0ZWRJdGVtczogVUlJdGVtUHJvcHNbXSkge1xyXG4gICAgbGV0IHRzUGF0aCA9IGAke0VkaXRvci5Qcm9qZWN0LnBhdGh9L2Fzc2V0cy9zY3JpcHQvZ2FtZS9jb21tb24vY29uZmlnL0dhbWVVSUNvbmZpZy50c2A7XHJcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmModHNQYXRoKSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0dhbWVVSUNvbmZpZy50c+S4jeWtmOWcqO+8gVBhdGg6JyArIHRzUGF0aCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBVSUlEOiB0cy5Ob2RlQXJyYXk8dHMuRW51bU1lbWJlcj4gfCB1bmRlZmluZWQ7XHJcbiAgICBsZXQgVUlDb25maWdEYXRhOiB0cy5WYXJpYWJsZURlY2xhcmF0aW9uIHwgdW5kZWZpbmVkO1xyXG4gICAgbGV0IHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUgfCB1bmRlZmluZWQ7XHJcbiAgICBbc291cmNlRmlsZSwgVUlJRCwgVUlDb25maWdEYXRhXSA9IHBhcnNlR2FtZVVJQ29uZmlnKHRzUGF0aCk7XHJcbiAgICBpZiAoIXNvdXJjZUZpbGUgfHwgIVVJSUQgfHwgIVVJQ29uZmlnRGF0YSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0dhbWVVSUNvbmZpZy50c+ino+aekOWksei0pe+8gScpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZWNvcmRMYXllciA9IGdldExheWVyVHlwZSgpO1xyXG4gICAgY29uc3QgcmVjb3JkVUlBbmltYXRpb25UeXBlID0gZ2V0VUlBbmltYXRpb25UeXBlKCk7XHJcbiAgICAvLyDop6PmnpDlh7pVSUlE5ZKMVUlDb25maWdEYXRh5pWw5o2uXHJcbiAgICBsZXQgdWlpZHM6IE1hcDxzdHJpbmcsIEFuYWx5c2lzSXRlbT4gPSBuZXcgTWFwKCk7XHJcbiAgICBwYXJzZVVpaWRzKHVpaWRzLCBVSUlELCBzb3VyY2VGaWxlKTtcclxuICAgIGxldCB1aUNvbmZpZ3M6IE1hcDxzdHJpbmcsIEFuYWx5c2lzSXRlbT4gPSBuZXcgTWFwKCk7XHJcbiAgICBwYXJzZVVJQ29uZmlnRGF0YSh1aUNvbmZpZ3MsIFVJQ29uZmlnRGF0YSwgc291cmNlRmlsZSk7XHJcbiAgICAvLyDnu5PlkIjpgInkuK3pobnlkI7lpITnkIbnlJ/miJDmlrDnmoRVSUNvbmZpZ0RhdGHlkoxVSUlEXHJcbiAgICBwb3N0cHJvY2Vzc2luZ0J5U2VsZWN0aW9uSXRlbXMoc2VsZWN0ZWRJdGVtcywgdWlpZHMsIHVpQ29uZmlncywgcmVjb3JkTGF5ZXIsIHJlY29yZFVJQW5pbWF0aW9uVHlwZSk7XHJcblxyXG4gICAgY29uc3QgbXVzdGFjaGVEYXRhID0gZm9ybWF0TXVzdGFjaGVEYXRhKHVpaWRzLCB1aUNvbmZpZ3MpO1xyXG4gICAgY29uc3QgdGVtcGxhdGVQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL211c3RhY2hlL0dhbWVVSUNvbmZpZy5tdXN0YWNoZScpO1xyXG4gICAgY29uc3QgdGVtcGxhdGUgPSBmcy5yZWFkRmlsZVN5bmModGVtcGxhdGVQYXRoLCAndXRmOCcpO1xyXG4gICAgY29uc3Qgb3V0cHV0ID0gTXVzdGFjaGUucmVuZGVyKHRlbXBsYXRlLCBtdXN0YWNoZURhdGEpO1xyXG4gICAgLy8gY29uc29sZS53YXJuKHN0cik7XHJcbiAgICBsZXQgcHJvamVjdFBhdGggPSBFZGl0b3IuUHJvamVjdC5wYXRoO1xyXG4gICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4ocHJvamVjdFBhdGgsICdhc3NldHMvc2NyaXB0L2dhbWUvY29tbW9uL2NvbmZpZy9HYW1lVUlDb25maWcudHMnKSwgb3V0cHV0LCAndXRmOCcpO1xyXG4gICAgY29uc29sZS5sb2coJ0dlbmVyYXRlIEdhbWVVSUNvbmZpZy50cyBzdWNjZXNzIScpO1xyXG59XHJcblxyXG4vKipcclxuICog55Sf5oiQIE11c3RhY2hlIOaVsOaNrlxyXG4gKi9cclxuZnVuY3Rpb24gZm9ybWF0TXVzdGFjaGVEYXRhKHV1aWRzOiBNYXA8c3RyaW5nLCBBbmFseXNpc0l0ZW0+LCB1aUNvbmZpZ3M6IE1hcDxzdHJpbmcsIEFuYWx5c2lzSXRlbT4pIHtcclxuICAgIGxldCBtdXN0YWNoZURhdGE6IHtcclxuICAgICAgICB1aWlkczogeyBjb21tZW50Pzogc3RyaW5nOyBuYW1lOiBzdHJpbmc7IH1bXSxcclxuICAgICAgICB1aWNvbmZpZ3M6IHsgY29tbWVudD86IHN0cmluZzsgbmFtZTogc3RyaW5nOyBsYXllcjogc3RyaW5nIHwgdW5kZWZpbmVkOyBwcmVmYWI/OiBzdHJpbmcgfCB1bmRlZmluZWQgfVtdLFxyXG4gICAgfSA9IHtcclxuICAgICAgICB1aWlkczogW10sXHJcbiAgICAgICAgdWljb25maWdzOiBbXSxcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB1dWlkS2V5cyA9IEFycmF5LmZyb20odXVpZHMua2V5cygpKS5zb3J0KCk7XHJcbiAgICB1dWlkS2V5cy5mb3JFYWNoKGtleSA9PiB7XHJcbiAgICAgICAgY29uc3QgaXRlbSA9IHV1aWRzLmdldChrZXkpO1xyXG4gICAgICAgIGlmIChpdGVtKSB7XHJcbiAgICAgICAgICAgIG11c3RhY2hlRGF0YS51aWlkcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGNvbW1lbnQ6IGl0ZW0uY29tbWVudD8ubGVuZ3RoID09PSAwID8gdW5kZWZpbmVkIDogaXRlbS5jb21tZW50LFxyXG4gICAgICAgICAgICAgICAgbmFtZTogaXRlbS5uYW1lXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgdWlpZCAke2l0ZW0ubmFtZX06ICR7aXRlbS5jb21tZW50fWApO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHVpQ29uZmlnS2V5cyA9IEFycmF5LmZyb20odWlDb25maWdzLmtleXMoKSkuc29ydCgpO1xyXG4gICAgdWlDb25maWdLZXlzLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgICBjb25zdCBpdGVtID0gdWlDb25maWdzLmdldChrZXkpO1xyXG4gICAgICAgIGlmIChpdGVtKSB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGB1aUNvbmZpZyAgJHtpdGVtLm5hbWV9OiAke2l0ZW0uY29tbWVudH1gKTtcclxuICAgICAgICAgICAgbGV0IHVpY29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgY29tbWVudDogaXRlbS5jb21tZW50Py5sZW5ndGggPT09IDAgPyB1bmRlZmluZWQgOiBpdGVtLmNvbW1lbnQsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBsYXllcjogaXRlbS52YWx1ZT8ubGF5ZXIsXHJcbiAgICAgICAgICAgICAgICBwcmVmYWI6IGl0ZW0udmFsdWU/LnByZWZhYixcclxuICAgICAgICAgICAgICAgIGJ1bmRsZTogaXRlbS52YWx1ZT8uYnVuZGxlLFxyXG4gICAgICAgICAgICAgICAgc2hvd0FuaW06IGl0ZW0udmFsdWU/LnNob3dBbmltLFxyXG4gICAgICAgICAgICAgICAgaGlkZUFuaW06IGl0ZW0udmFsdWU/LmhpZGVBbmltLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBtdXN0YWNoZURhdGEudWljb25maWdzLnB1c2godWljb25maWcpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBtdXN0YWNoZURhdGE7XHJcbn1cclxuXHJcblxyXG4vKipcclxuICog6I635Y+WIFVJQ29uZmlnRGF0YSDnmoTlsZ7mgKcgXHJcbiAqL1xyXG5mdW5jdGlvbiBwYXJzZVVJQ29uZmlnRGF0YSh1aUNvbmZpZ3M6IE1hcDxzdHJpbmcsIEFuYWx5c2lzSXRlbT4sIFVJQ29uZmlnRGF0YTogdHMuVmFyaWFibGVEZWNsYXJhdGlvbiB8IHVuZGVmaW5lZCwgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSkge1xyXG4gICAgaWYgKCFVSUNvbmZpZ0RhdGEgfHwgIVVJQ29uZmlnRGF0YS5pbml0aWFsaXplclxyXG4gICAgICAgIHx8ICF0cy5pc09iamVjdExpdGVyYWxFeHByZXNzaW9uKFVJQ29uZmlnRGF0YS5pbml0aWFsaXplcikpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChjb25zdCBwcm9wZXJ0eSBvZiBVSUNvbmZpZ0RhdGEuaW5pdGlhbGl6ZXIucHJvcGVydGllcykge1xyXG4gICAgICAgIGlmICh0cy5pc1Byb3BlcnR5QXNzaWdubWVudChwcm9wZXJ0eSkpIHtcclxuICAgICAgICAgICAgY29uc3Qga2V5ID0gcHJvcGVydHkubmFtZS5nZXRUZXh0KCk7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHZhbHVlID0gcHJvcGVydHkuaW5pdGlhbGl6ZXIuZ2V0VGV4dCgpO1xyXG4gICAgICAgICAgICBjb25zdCBjb21tZW50ID0gZ2V0VHNDb21tZW50KHNvdXJjZUZpbGUsIHByb3BlcnR5LnBvcyk7XHJcbiAgICAgICAgICAgIGxldCBjb25maWdJdGVtOiBBbmFseXNpc0l0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICBjb21tZW50OiBjb21tZW50LFxyXG4gICAgICAgICAgICAgICAgbmFtZToga2V5LFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHt9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHVpQ29uZmlncy5zZXQoa2V5LCBjb25maWdJdGVtKTtcclxuICAgICAgICAgICAgaWYgKHRzLmlzT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24ocHJvcGVydHkuaW5pdGlhbGl6ZXIpKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN1YlByb3BlcnR5IG9mIHByb3BlcnR5LmluaXRpYWxpemVyLnByb3BlcnRpZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHMuaXNQcm9wZXJ0eUFzc2lnbm1lbnQoc3ViUHJvcGVydHkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YktleSA9IHN1YlByb3BlcnR5Lm5hbWUuZ2V0VGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJWYWx1ZSA9IHN1YlByb3BlcnR5LmluaXRpYWxpemVyLmdldFRleHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYHBhcnNlVUlDb25maWdEYXRhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBuYW1lOiAke2tleX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBjb21tZW50OiAke2NvbW1lbnR9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgc3ViS2V5OiAke3N1YktleX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBzdWJWYWx1ZTogJHtzdWJWYWx1ZX1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ0l0ZW0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ0l0ZW0udmFsdWVbc3ViS2V5XSA9IHN1YlZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiDojrflj5YgVUlJRCDnmoTlsZ7mgKdcclxuICovXHJcbmZ1bmN0aW9uIHBhcnNlVWlpZHModWlpZHM6IE1hcDxzdHJpbmcsIEFuYWx5c2lzSXRlbT4sXHJcbiAgICBVSUlEOiB0cy5Ob2RlQXJyYXk8dHMuRW51bU1lbWJlcj4gfCB1bmRlZmluZWQsXHJcbiAgICBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKSB7XHJcbiAgICBpZiAoVUlJRCkge1xyXG4gICAgICAgIFVJSUQuZm9yRWFjaChtZW1iZXIgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBrZXkgPSBtZW1iZXIubmFtZS5nZXRUZXh0KCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHVpaWRJdGVtOiBBbmFseXNpc0l0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICBjb21tZW50OiBnZXRUc0NvbW1lbnQoc291cmNlRmlsZSwgbWVtYmVyLnBvcyksXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBrZXlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB1aWlkcy5zZXQoa2V5LCB1aWlkSXRlbSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDojrflvpd0c+aWh+S7tuS4reeahOazqOmHilxyXG4gKiBAcGFyYW0gc291cmNlRmlsZSDnm67moIfmlofku7ZcclxuICogQHBhcmFtIHBvcyDlj4LmlbDkvY3nva5cclxuICogQHJldHVybnMgXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRUc0NvbW1lbnQoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgcG9zOiBudW1iZXIpIHtcclxuICAgIGNvbnN0IGNvbW1lbnQgPSB0cy5nZXRMZWFkaW5nQ29tbWVudFJhbmdlcyhzb3VyY2VGaWxlLnRleHQsIHBvcyk7XHJcbiAgICBjb25zdCBjb21tZW50VGV4dCA9IGNvbW1lbnQgPyBzb3VyY2VGaWxlLnRleHQuc3Vic3RyaW5nKGNvbW1lbnRbMF0ucG9zLCBjb21tZW50WzBdLmVuZCkgOiAnJztcclxuICAgIHJldHVybiBjb21tZW50VGV4dC5yZXBsYWNlKC9eXFwvXFwqXFwqfFxcKlxcLyQvZywgJycpLnRyaW0oKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOino+aekHRz5paH5Lu26I635Y+WIExheWVyVHlwZSDmnprkuL5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRMYXllclR5cGUoKTogTWFwPG51bWJlciwgc3RyaW5nPiB8IHVuZGVmaW5lZCB7XHJcbiAgICBsZXQgdHNQYXRoID0gYCR7RWRpdG9yLlByb2plY3QucGF0aH0vZXh0ZW5zaW9ucy9vb3BzLXBsdWdpbi1mcmFtZXdvcmsvYXNzZXRzL2NvcmUvZ3VpL2xheWVyL0xheWVyTWFuYWdlci50c2A7XHJcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmModHNQYXRoKSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0xheWVyTWFuYWdlci50c+S4jeWtmOWcqO+8gVBhdGg6JyArIHRzUGF0aCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCByZWNvcmRMYXllclR5cGU6IE1hcDxudW1iZXIsIHN0cmluZz4gPSBuZXcgTWFwKCk7XHJcbiAgICAvLyDor7vlj5ZUeXBlU2NyaXB05paH5Lu25YaF5a65XHJcbiAgICBjb25zdCBzb3VyY2VDb2RlID0gZnMucmVhZEZpbGVTeW5jKHRzUGF0aCwgJ3V0ZjgnKTtcclxuICAgIC8vIOino+aekCBUeXBlU2NyaXB0IOaWh+S7tuS7peiOt+WPluaemuS4vuWSjOazqOmHilxyXG4gICAgY29uc3Qgc291cmNlRmlsZSA9IHRzLmNyZWF0ZVNvdXJjZUZpbGUoXHJcbiAgICAgICAgJ0xheWVyTWFuYWdlci50cycsIC8vIOaWh+S7tuWQjVxyXG4gICAgICAgIHNvdXJjZUNvZGUsIC8vIFR5cGVTY3JpcHQg5Luj56CBXHJcbiAgICAgICAgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCwgLy8g6K+t6KiA54mI5pysXHJcbiAgICAgICAgdHJ1ZSAvLyDorr7nva7niLboioLngrlcclxuICAgICk7XHJcbiAgICAvLyDpgY3ljobmiYDmnInoioLngrlcclxuICAgIGZ1bmN0aW9uIHZpc2l0KG5vZGU6IHRzLk5vZGUpIHtcclxuICAgICAgICBpZiAodHMuaXNFbnVtRGVjbGFyYXRpb24obm9kZSkgJiYgbm9kZS5uYW1lLnRleHQgPT09ICdMYXllclR5cGUnKSB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdGb3VuZCBMYXllclR5cGUgZW51bTonKTtcclxuICAgICAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgICAgICBub2RlLm1lbWJlcnMuZm9yRWFjaChtZW1iZXIgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYC0+Pj4gJHttZW1iZXIuaW5pdGlhbGl6ZXJ9YCk7XHJcbiAgICAgICAgICAgICAgICByZWNvcmRMYXllclR5cGUuc2V0KFxyXG4gICAgICAgICAgICAgICAgICAgIGkrKyxcclxuICAgICAgICAgICAgICAgICAgICBtZW1iZXIubmFtZS5nZXRUZXh0KClcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRzLmZvckVhY2hDaGlsZChub2RlLCB2aXNpdCk7IC8vIOmAkuW9kuiuv+mXruWtkOiKgueCuVxyXG4gICAgfVxyXG4gICAgdmlzaXQoc291cmNlRmlsZSk7XHJcblxyXG4gICAgcmV0dXJuIHJlY29yZExheWVyVHlwZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOino+aekHRz5paH5Lu26I635Y+WIFVJQW5pbWF0aW9uVHlwZSDmnprkuL5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRVSUFuaW1hdGlvblR5cGUoKTogTWFwPG51bWJlciwgc3RyaW5nPiB8IHVuZGVmaW5lZCB7XHJcbiAgICBsZXQgdHNQYXRoID0gYCR7RWRpdG9yLlByb2plY3QucGF0aH0vZXh0ZW5zaW9ucy9vb3BzLXBsdWdpbi1mcmFtZXdvcmsvYXNzZXRzL2NvcmUvZ3VpL2xheWVyL0xheWVyTWFuYWdlci50c2A7XHJcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmModHNQYXRoKSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0xheWVyTWFuYWdlci50c+S4jeWtmOWcqO+8gVBhdGg6JyArIHRzUGF0aCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCByZWNvcmRVSUFuaW1hdGlvblR5cGU6IE1hcDxudW1iZXIsIHN0cmluZz4gPSBuZXcgTWFwKCk7XHJcbiAgICAvLyDor7vlj5ZUeXBlU2NyaXB05paH5Lu25YaF5a65XHJcbiAgICBjb25zdCBzb3VyY2VDb2RlID0gZnMucmVhZEZpbGVTeW5jKHRzUGF0aCwgJ3V0ZjgnKTtcclxuICAgIC8vIOino+aekCBUeXBlU2NyaXB0IOaWh+S7tuS7peiOt+WPluaemuS4vuWSjOazqOmHilxyXG4gICAgY29uc3Qgc291cmNlRmlsZSA9IHRzLmNyZWF0ZVNvdXJjZUZpbGUoXHJcbiAgICAgICAgJ0xheWVyTWFuYWdlci50cycsIC8vIOaWh+S7tuWQjVxyXG4gICAgICAgIHNvdXJjZUNvZGUsIC8vIFR5cGVTY3JpcHQg5Luj56CBXHJcbiAgICAgICAgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCwgLy8g6K+t6KiA54mI5pysXHJcbiAgICAgICAgdHJ1ZSAvLyDorr7nva7niLboioLngrlcclxuICAgICk7XHJcbiAgICAvLyDpgY3ljobmiYDmnInoioLngrlcclxuICAgIGZ1bmN0aW9uIHZpc2l0KG5vZGU6IHRzLk5vZGUpIHtcclxuICAgICAgICBpZiAodHMuaXNFbnVtRGVjbGFyYXRpb24obm9kZSkgJiYgbm9kZS5uYW1lLnRleHQgPT09ICdVSUFuaW1hdGlvblR5cGUnKSB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdGb3VuZCBMYXllclR5cGUgZW51bTonKTtcclxuICAgICAgICAgICAgbm9kZS5tZW1iZXJzLmZvckVhY2gobWVtYmVyID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGAtICR7bWVtYmVyLm5hbWUuZ2V0VGV4dCgpfWApO1xyXG4gICAgICAgICAgICAgICAgcmVjb3JkVUlBbmltYXRpb25UeXBlLnNldChcclxuICAgICAgICAgICAgICAgICAgICBtZW1iZXIuaW5pdGlhbGl6ZXIgPyBOdW1iZXIobWVtYmVyLmluaXRpYWxpemVyLmdldFRleHQoKSkgOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIG1lbWJlci5uYW1lLmdldFRleHQoKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdHMuZm9yRWFjaENoaWxkKG5vZGUsIHZpc2l0KTsgLy8g6YCS5b2S6K6/6Zeu5a2Q6IqC54K5XHJcbiAgICB9XHJcbiAgICB2aXNpdChzb3VyY2VGaWxlKTtcclxuXHJcbiAgICByZXR1cm4gcmVjb3JkVUlBbmltYXRpb25UeXBlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwYXJzZUdhbWVVSUNvbmZpZyh0c1BhdGg6IHN0cmluZyk6IFtcclxuICAgIHRzLlNvdXJjZUZpbGUgfCB1bmRlZmluZWQsXHJcbiAgICB0cy5Ob2RlQXJyYXk8dHMuRW51bU1lbWJlcj4gfCB1bmRlZmluZWQsXHJcbiAgICB0cy5WYXJpYWJsZURlY2xhcmF0aW9uIHwgdW5kZWZpbmVkXHJcbl0ge1xyXG4gICAge1xyXG4gICAgICAgIC8vIOivu+WPllR5cGVTY3JpcHTmlofku7blhoXlrrlcclxuICAgICAgICBjb25zdCBzb3VyY2VDb2RlID0gZnMucmVhZEZpbGVTeW5jKHRzUGF0aCwgJ3V0ZjgnKTtcclxuICAgICAgICAvLyDop6PmnpAgVHlwZVNjcmlwdCDmlofku7bku6Xojrflj5bmnprkuL7lkozms6jph4pcclxuICAgICAgICBjb25zdCBzb3VyY2VGaWxlID0gdHMuY3JlYXRlU291cmNlRmlsZShcclxuICAgICAgICAgICAgJ0dhbWVVSUNvbmZpZy50cycsIC8vIOaWh+S7tuWQjVxyXG4gICAgICAgICAgICBzb3VyY2VDb2RlLCAvLyBUeXBlU2NyaXB0IOS7o+eggVxyXG4gICAgICAgICAgICB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LCAvLyDor63oqIDniYjmnKxcclxuICAgICAgICAgICAgdHJ1ZSAvLyDorr7nva7niLboioLngrlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBsZXQgVUlJRDogdHMuTm9kZUFycmF5PHRzLkVudW1NZW1iZXI+IHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIGxldCBVSUNvbmZpZ0RhdGE6IHRzLlZhcmlhYmxlRGVjbGFyYXRpb24gfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgLy8g6YGN5Y6G5omA5pyJ6IqC54K5XHJcbiAgICAgICAgZnVuY3Rpb24gdmlzaXQobm9kZTogdHMuTm9kZSkge1xyXG4gICAgICAgICAgICBpZiAodHMuaXNFbnVtRGVjbGFyYXRpb24obm9kZSkgJiYgbm9kZS5uYW1lLnRleHQgPT09ICdVSUlEJykge1xyXG4gICAgICAgICAgICAgICAgVUlJRCA9IG5vZGUubWVtYmVycztcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0cy5pc1ZhcmlhYmxlU3RhdGVtZW50KG5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGRlY2xhcmF0aW9uIG9mIG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cy5pc1ZhcmlhYmxlRGVjbGFyYXRpb24oZGVjbGFyYXRpb24pICYmIGRlY2xhcmF0aW9uLm5hbWUuZ2V0VGV4dCgpID09PSAnVUlDb25maWdEYXRhJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBVSUNvbmZpZ0RhdGEgPSBkZWNsYXJhdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0cy5mb3JFYWNoQ2hpbGQobm9kZSwgdmlzaXQpOyAvLyDpgJLlvZLorr/pl67lrZDoioLngrlcclxuICAgICAgICB9XHJcbiAgICAgICAgdmlzaXQoc291cmNlRmlsZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBbc291cmNlRmlsZSwgVUlJRCwgVUlDb25maWdEYXRhXTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOagueaNrumAieS4remhueS4uuaWh+S7tueUn+aIkOe7k+aehOWQjuWkhOeQhlxyXG4gKi9cclxuZnVuY3Rpb24gcG9zdHByb2Nlc3NpbmdCeVNlbGVjdGlvbkl0ZW1zKFxyXG4gICAgc2VsZWN0ZWRJdGVtczogVUlJdGVtUHJvcHNbXSxcclxuICAgIHVpaWRzOiBNYXA8c3RyaW5nLCBBbmFseXNpc0l0ZW0+LFxyXG4gICAgdWlDb25maWdzOiBNYXA8c3RyaW5nLCBBbmFseXNpc0l0ZW0+LFxyXG4gICAgcmVjb3JkTGF5ZXI6IE1hcDxudW1iZXIsIHN0cmluZz4gfCB1bmRlZmluZWQsXHJcbiAgICByZWNvcmRVSUFuaW1hdGlvblR5cGU6IE1hcDxudW1iZXIsIHN0cmluZz4gfCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBzZWxlY3RlZEl0ZW1zLmZvckVhY2goKHNlbGVjdGlvbiwgaW5kZXgpID0+IHtcclxuICAgICAgICBsZXQgdWlpZEtleSA9IGNhcGl0YWxpemVMZXR0ZXIoc2VsZWN0aW9uLnByZWZhYk5hbWUpO1xyXG4gICAgICAgIGxldCB1aUNvbmZpZ0tleSA9IGBbVUlJRC4ke3VpaWRLZXl9XWA7XHJcblxyXG4gICAgICAgIGxldCB1aWlkSXRlbSA9IHVpaWRzLmdldCh1aWlkS2V5KTtcclxuICAgICAgICAvLyBsZXQgdWlpZENvbW1lbnRCZWZvciA9IHVpaWRJdGVtPy5jb21tZW50O1xyXG4gICAgICAgIGxldCB1aWlkQ29tbWVudEFmdGVyID0gc2VsZWN0aW9uLnVpQ29tbWVudDtcclxuXHJcbiAgICAgICAgbGV0IHBhcnNlTGF5ZXJBZnRlciwgcGFyc2VPcGVuQW5pbUFmdGVyLCBwYXJzZUNsb3NlQW5pbUFmdGVyO1xyXG4gICAgICAgIHJlY29yZExheWVyPy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChrZXkgLSBzZWxlY3Rpb24ubGF5ZXIgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHBhcnNlTGF5ZXJBZnRlciA9IHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmVjb3JkVUlBbmltYXRpb25UeXBlPy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChrZXkgLSBzZWxlY3Rpb24ub3BlbkFuaW0gPT09IDBcclxuICAgICAgICAgICAgICAgICYmIGtleSAhPT0gMCAgICAvLyDmjpLpmaQgVUlBbmltYXRpb25UeXBlLk5vbmVcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJzZU9wZW5BbmltQWZ0ZXIgPSB2YWx1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChrZXkgLSBzZWxlY3Rpb24uY2xvc2VBbmltID09PSAwXHJcbiAgICAgICAgICAgICAgICAmJiBrZXkgIT09IDAgICAgLy8g5o6S6ZmkIFVJQW5pbWF0aW9uVHlwZS5Ob25lXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgcGFyc2VDbG9zZUFuaW1BZnRlciA9IHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHVpaWRJdGVtXHJcbiAgICAgICAgICAgID8gKHVpaWRDb21tZW50QWZ0ZXIgJiYgKHVpaWRJdGVtLmNvbW1lbnQgPSB1aWlkQ29tbWVudEFmdGVyKSlcclxuICAgICAgICAgICAgOiB1aWlkcy5zZXQodWlpZEtleSwgeyBjb21tZW50OiB1aWlkQ29tbWVudEFmdGVyLCBuYW1lOiB1aWlkS2V5IH0pO1xyXG5cclxuICAgICAgICBsZXQgcHJlZmFiID0gYCcke3NlbGVjdGlvbi5wcmVmYWJ9J2A7XHJcbiAgICAgICAgbGV0IHVpQ29uZmlnSXRlbSA9IHVpQ29uZmlncy5nZXQodWlDb25maWdLZXkpO1xyXG4gICAgICAgIC8vIGxldCBsYXllckJlZm9yZSA9IHVpQ29uZmlnSXRlbT8udmFsdWU/LmxheWVyO1xyXG4gICAgICAgIGxldCBsYXllckFmdGVyID0gcGFyc2VMYXllckFmdGVyICYmIGBMYXllclR5cGUuJHtwYXJzZUxheWVyQWZ0ZXJ9YDtcclxuICAgICAgICBsZXQgb3BlbkFuaW1BZnRlciA9IHBhcnNlT3BlbkFuaW1BZnRlciAmJiBgVUlBbmltYXRpb25UeXBlLiR7cGFyc2VPcGVuQW5pbUFmdGVyfWA7XHJcbiAgICAgICAgbGV0IGNsb3NlQW5pbUFmdGVyID0gcGFyc2VDbG9zZUFuaW1BZnRlciAmJiBgVUlBbmltYXRpb25UeXBlLiR7cGFyc2VDbG9zZUFuaW1BZnRlcn1gO1xyXG5cclxuICAgICAgICBsZXQgYnVuZGxlQmVmb3IgPSB1aUNvbmZpZ0l0ZW0/LnZhbHVlPy5idW5kbGU7XHJcbiAgICAgICAgbGV0IHBhcnNlQnVuZGxlTmFtZSA9IHNlbGVjdGlvbi5idW5kbGUgJiYgYCcke3NlbGVjdGlvbi5idW5kbGV9J2A7XHJcbiAgICAgICAgLy8gYnVuZGxlQmVmb3IgJiYgKGJ1bmRsZUJlZm9yID0gYCcke2J1bmRsZUJlZm9yfSdgKTtcclxuXHJcbiAgICAgICAgdWlDb25maWdJdGVtXHJcbiAgICAgICAgICAgID8gdWlDb25maWdJdGVtLnZhbHVlISA9IHtcclxuICAgICAgICAgICAgICAgIGxheWVyOiBsYXllckFmdGVyLFxyXG4gICAgICAgICAgICAgICAgcHJlZmFiOiBwcmVmYWIsXHJcbiAgICAgICAgICAgICAgICBidW5kbGU6ICEhcGFyc2VCdW5kbGVOYW1lID8gcGFyc2VCdW5kbGVOYW1lIDogYnVuZGxlQmVmb3IsXHJcbiAgICAgICAgICAgICAgICBzaG93QW5pbTogb3BlbkFuaW1BZnRlcixcclxuICAgICAgICAgICAgICAgIGhpZGVBbmltOiBjbG9zZUFuaW1BZnRlcixcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICA6IHVpQ29uZmlncy5zZXQodWlDb25maWdLZXksIHtcclxuICAgICAgICAgICAgICAgIGNvbW1lbnQ6ICcnLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogdWlDb25maWdLZXksXHJcbiAgICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGxheWVyOiBsYXllckFmdGVyLFxyXG4gICAgICAgICAgICAgICAgICAgIHByZWZhYjogcHJlZmFiLFxyXG4gICAgICAgICAgICAgICAgICAgIGJ1bmRsZTogcGFyc2VCdW5kbGVOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHNob3dBbmltOiBvcGVuQW5pbUFmdGVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGhpZGVBbmltOiBjbG9zZUFuaW1BZnRlcixcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhgXHJcbiAgICAgICAgLy8gICAgIHVpaWRLZXk6ICR7dWlpZEtleX0sXHJcbiAgICAgICAgLy8gICAgIHVpQ29uZmlnS2V5OiAke3VpQ29uZmlnS2V5fSxcclxuICAgICAgICAvLyAgICAgY29tbWVudEJlZjogJHt1aWlkQ29tbWVudEJlZm9yfSA9PT0+IGNvbW1lbnRBZnQ6ICR7dWlpZENvbW1lbnRBZnRlcn0sXHJcbiAgICAgICAgLy8gICAgIGxheWVyQmVmOiAke2xheWVyQmVmb3JlfSA9PT0+IGxheWVyQWZ0OiAke2xheWVyQWZ0ZXJ9LFxyXG4gICAgICAgIC8vICAgICBwcmVmYWI6ICR7cHJlZmFifSxgKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vKipcclxuICog6aaW5a2X5q+N5aSn5YaZ6L2s5o2iXHJcbiAqL1xyXG5mdW5jdGlvbiBjYXBpdGFsaXplTGV0dGVyKHM6IHN0cmluZykge1xyXG4gICAgcyA9IHMucmVwbGFjZSgnVmlldycsICcnKTtcclxuICAgIHJldHVybiBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zbGljZSgxKTtcclxufSJdfQ==