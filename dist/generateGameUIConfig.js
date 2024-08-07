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
            node.members.forEach(member => {
                // console.log(`- ${member.name.getText()}`);
                recordLayerType.set(member.initializer ? Number(member.initializer.getText()) : 0, member.name.getText());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVHYW1lVUlDb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2UvZ2VuZXJhdGVHYW1lVUlDb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7O0dBS0c7QUFDSCw0Q0FBb0I7QUFDcEIsd0RBQWdDO0FBQ2hDLGdEQUF3QjtBQUN4Qiw0REFBNEI7QUFtQjVCOztHQUVHO0FBQ0gsU0FBZ0IsaUJBQWlCLENBQUMsYUFBNEI7SUFDMUQsSUFBSSxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksbURBQW1ELENBQUM7SUFDdkYsSUFBSSxDQUFDLFlBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUN6QixPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixHQUFHLE1BQU0sQ0FBQyxDQUFDO1FBQ25ELE9BQU87SUFDWCxDQUFDO0lBRUQsSUFBSSxJQUE2QyxDQUFDO0lBQ2xELElBQUksWUFBZ0QsQ0FBQztJQUNyRCxJQUFJLFVBQXFDLENBQUM7SUFDMUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzdELElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN4QyxPQUFPLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDdEMsT0FBTztJQUNYLENBQUM7SUFFRCxNQUFNLFdBQVcsR0FBRyxZQUFZLEVBQUUsQ0FBQztJQUNuQyxNQUFNLHFCQUFxQixHQUFHLGtCQUFrQixFQUFFLENBQUM7SUFDbkQseUJBQXlCO0lBQ3pCLElBQUksS0FBSyxHQUE4QixJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2pELFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3BDLElBQUksU0FBUyxH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QUFFLGNBQWM7aUJBQzNCO2FBQ0osQ0FBQyxDQUFDO1FBRVAsZ0JBQWdCO1FBQ2hCLDJCQUEyQjtRQUMzQixtQ0FBbUM7UUFDbkMsNEVBQTRFO1FBQzVFLDZEQUE2RDtRQUM3RCw0QkFBNEI7SUFDaEMsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLGdCQUFnQixDQUFDLENBQVM7SUFDL0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzFCLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGZpbGUgZ2VuZXJhdGVHYW1lVUlDb25maWcudHNcclxuICogQGF1dGhvciB6clxyXG4gKiBAZGF0ZSAyMDI0LTA2LTEzXHJcbiAqIEBkZXNjcmlwdGlvbiDlr7zlh7pHYW1lVUlDb25maWcudHPohJrmnKxcclxuICovXHJcbmltcG9ydCBmcyBmcm9tICdmcyc7XHJcbmltcG9ydCBNdXN0YWNoZSBmcm9tICdtdXN0YWNoZSc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgdHMgZnJvbSAndHlwZXNjcmlwdCc7XHJcblxyXG50eXBlIEFuYWx5c2lzSXRlbSA9IHtcclxuICAgIGNvbW1lbnQ6IHN0cmluZyB8IHVuZGVmaW5lZCxcclxuICAgIG5hbWU6IHN0cmluZyxcclxuICAgIHZhbHVlPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCB1bmRlZmluZWQgfSxcclxufVxyXG5cclxuLy8g5q+P5p2h6YCJ5Lit6aG56ZyA6KaB6K6+572u55qE5bGe5oCnXHJcbmV4cG9ydCB0eXBlIFVJSXRlbVByb3BzID0ge1xyXG4gICAgdWlDb21tZW50OiBzdHJpbmcgfCB1bmRlZmluZWQsXHJcbiAgICBwcmVmYWJOYW1lOiBzdHJpbmcsXHJcbiAgICBsYXllcjogbnVtYmVyLFxyXG4gICAgYnVuZGxlOiBzdHJpbmcgfCB1bmRlZmluZWQsXHJcbiAgICBvcGVuQW5pbTogbnVtYmVyLFxyXG4gICAgY2xvc2VBbmltOiBudW1iZXIsXHJcbiAgICBwcmVmYWI6IHN0cmluZyxcclxufVxyXG5cclxuLyoqXHJcbiAqIOa3u+WKoOWIsCBHYW1lVUlDb25maWdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZW5TZWxlY3Rpb25JdGVtcyhzZWxlY3RlZEl0ZW1zOiBVSUl0ZW1Qcm9wc1tdKSB7XHJcbiAgICBsZXQgdHNQYXRoID0gYCR7RWRpdG9yLlByb2plY3QucGF0aH0vYXNzZXRzL3NjcmlwdC9nYW1lL2NvbW1vbi9jb25maWcvR2FtZVVJQ29uZmlnLnRzYDtcclxuICAgIGlmICghZnMuZXhpc3RzU3luYyh0c1BhdGgpKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignR2FtZVVJQ29uZmlnLnRz5LiN5a2Y5Zyo77yBUGF0aDonICsgdHNQYXRoKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IFVJSUQ6IHRzLk5vZGVBcnJheTx0cy5FbnVtTWVtYmVyPiB8IHVuZGVmaW5lZDtcclxuICAgIGxldCBVSUNvbmZpZ0RhdGE6IHRzLlZhcmlhYmxlRGVjbGFyYXRpb24gfCB1bmRlZmluZWQ7XHJcbiAgICBsZXQgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSB8IHVuZGVmaW5lZDtcclxuICAgIFtzb3VyY2VGaWxlLCBVSUlELCBVSUNvbmZpZ0RhdGFdID0gcGFyc2VHYW1lVUlDb25maWcodHNQYXRoKTtcclxuICAgIGlmICghc291cmNlRmlsZSB8fCAhVUlJRCB8fCAhVUlDb25maWdEYXRhKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignR2FtZVVJQ29uZmlnLnRz6Kej5p6Q5aSx6LSl77yBJyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlY29yZExheWVyID0gZ2V0TGF5ZXJUeXBlKCk7XHJcbiAgICBjb25zdCByZWNvcmRVSUFuaW1hdGlvblR5cGUgPSBnZXRVSUFuaW1hdGlvblR5cGUoKTtcclxuICAgIC8vIOino+aekOWHulVJSUTlkoxVSUNvbmZpZ0RhdGHmlbDmja5cclxuICAgIGxldCB1aWlkczogTWFwPHN0cmluZywgQW5hbHlzaXNJdGVtPiA9IG5ldyBNYXAoKTtcclxuICAgIHBhcnNlVWlpZHModWlpZHMsIFVJSUQsIHNvdXJjZUZpbGUpO1xyXG4gICAgbGV0IHVpQ29uZmlnczogTWFwPHN0cmluZywgQW5hbHlzaXNJdGVtPiA9IG5ldyBNYXAoKTtcclxuICAgIHBhcnNlVUlDb25maWdEYXRhKHVpQ29uZmlncywgVUlDb25maWdEYXRhLCBzb3VyY2VGaWxlKTtcclxuICAgIC8vIOe7k+WQiOmAieS4remhueWQjuWkhOeQhueUn+aIkOaWsOeahFVJQ29uZmlnRGF0YeWSjFVJSURcclxuICAgIHBvc3Rwcm9jZXNzaW5nQnlTZWxlY3Rpb25JdGVtcyhzZWxlY3RlZEl0ZW1zLCB1aWlkcywgdWlDb25maWdzLCByZWNvcmRMYXllciwgcmVjb3JkVUlBbmltYXRpb25UeXBlKTtcclxuXHJcbiAgICBjb25zdCBtdXN0YWNoZURhdGEgPSBmb3JtYXRNdXN0YWNoZURhdGEodWlpZHMsIHVpQ29uZmlncyk7XHJcbiAgICBjb25zdCB0ZW1wbGF0ZVBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vbXVzdGFjaGUvR2FtZVVJQ29uZmlnLm11c3RhY2hlJyk7XHJcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IGZzLnJlYWRGaWxlU3luYyh0ZW1wbGF0ZVBhdGgsICd1dGY4Jyk7XHJcbiAgICBjb25zdCBvdXRwdXQgPSBNdXN0YWNoZS5yZW5kZXIodGVtcGxhdGUsIG11c3RhY2hlRGF0YSk7XHJcbiAgICAvLyBjb25zb2xlLndhcm4oc3RyKTtcclxuICAgIGxldCBwcm9qZWN0UGF0aCA9IEVkaXRvci5Qcm9qZWN0LnBhdGg7XHJcbiAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihwcm9qZWN0UGF0aCwgJ2Fzc2V0cy9zY3JpcHQvZ2FtZS9jb21tb24vY29uZmlnL0dhbWVVSUNvbmZpZy50cycpLCBvdXRwdXQsICd1dGY4Jyk7XHJcbiAgICBjb25zb2xlLmxvZygnR2VuZXJhdGUgR2FtZVVJQ29uZmlnLnRzIHN1Y2Nlc3MhJyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDnlJ/miJAgTXVzdGFjaGUg5pWw5o2uXHJcbiAqL1xyXG5mdW5jdGlvbiBmb3JtYXRNdXN0YWNoZURhdGEodXVpZHM6IE1hcDxzdHJpbmcsIEFuYWx5c2lzSXRlbT4sIHVpQ29uZmlnczogTWFwPHN0cmluZywgQW5hbHlzaXNJdGVtPikge1xyXG4gICAgbGV0IG11c3RhY2hlRGF0YToge1xyXG4gICAgICAgIHVpaWRzOiB7IGNvbW1lbnQ/OiBzdHJpbmc7IG5hbWU6IHN0cmluZzsgfVtdLFxyXG4gICAgICAgIHVpY29uZmlnczogeyBjb21tZW50Pzogc3RyaW5nOyBuYW1lOiBzdHJpbmc7IGxheWVyOiBzdHJpbmcgfCB1bmRlZmluZWQ7IHByZWZhYj86IHN0cmluZyB8IHVuZGVmaW5lZCB9W10sXHJcbiAgICB9ID0ge1xyXG4gICAgICAgIHVpaWRzOiBbXSxcclxuICAgICAgICB1aWNvbmZpZ3M6IFtdLFxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHV1aWRLZXlzID0gQXJyYXkuZnJvbSh1dWlkcy5rZXlzKCkpLnNvcnQoKTtcclxuICAgIHV1aWRLZXlzLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgICBjb25zdCBpdGVtID0gdXVpZHMuZ2V0KGtleSk7XHJcbiAgICAgICAgaWYgKGl0ZW0pIHtcclxuICAgICAgICAgICAgbXVzdGFjaGVEYXRhLnVpaWRzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgY29tbWVudDogaXRlbS5jb21tZW50Py5sZW5ndGggPT09IDAgPyB1bmRlZmluZWQgOiBpdGVtLmNvbW1lbnQsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLm5hbWVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGB1aWlkICR7aXRlbS5uYW1lfTogJHtpdGVtLmNvbW1lbnR9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgdWlDb25maWdLZXlzID0gQXJyYXkuZnJvbSh1aUNvbmZpZ3Mua2V5cygpKS5zb3J0KCk7XHJcbiAgICB1aUNvbmZpZ0tleXMuZm9yRWFjaChrZXkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGl0ZW0gPSB1aUNvbmZpZ3MuZ2V0KGtleSk7XHJcbiAgICAgICAgaWYgKGl0ZW0pIHtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYHVpQ29uZmlnICAke2l0ZW0ubmFtZX06ICR7aXRlbS5jb21tZW50fWApO1xyXG4gICAgICAgICAgICBsZXQgdWljb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICBjb21tZW50OiBpdGVtLmNvbW1lbnQ/Lmxlbmd0aCA9PT0gMCA/IHVuZGVmaW5lZCA6IGl0ZW0uY29tbWVudCxcclxuICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0ubmFtZSxcclxuICAgICAgICAgICAgICAgIGxheWVyOiBpdGVtLnZhbHVlPy5sYXllcixcclxuICAgICAgICAgICAgICAgIHByZWZhYjogaXRlbS52YWx1ZT8ucHJlZmFiLFxyXG4gICAgICAgICAgICAgICAgYnVuZGxlOiBpdGVtLnZhbHVlPy5idW5kbGUsXHJcbiAgICAgICAgICAgICAgICBzaG93QW5pbTogaXRlbS52YWx1ZT8uc2hvd0FuaW0sXHJcbiAgICAgICAgICAgICAgICBoaWRlQW5pbTogaXRlbS52YWx1ZT8uaGlkZUFuaW0sXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIG11c3RhY2hlRGF0YS51aWNvbmZpZ3MucHVzaCh1aWNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIG11c3RhY2hlRGF0YTtcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiDojrflj5YgVUlDb25maWdEYXRhIOeahOWxnuaApyBcclxuICovXHJcbmZ1bmN0aW9uIHBhcnNlVUlDb25maWdEYXRhKHVpQ29uZmlnczogTWFwPHN0cmluZywgQW5hbHlzaXNJdGVtPiwgVUlDb25maWdEYXRhOiB0cy5WYXJpYWJsZURlY2xhcmF0aW9uIHwgdW5kZWZpbmVkLCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKSB7XHJcbiAgICBpZiAoIVVJQ29uZmlnRGF0YSB8fCAhVUlDb25maWdEYXRhLmluaXRpYWxpemVyXHJcbiAgICAgICAgfHwgIXRzLmlzT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24oVUlDb25maWdEYXRhLmluaXRpYWxpemVyKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGNvbnN0IHByb3BlcnR5IG9mIFVJQ29uZmlnRGF0YS5pbml0aWFsaXplci5wcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgaWYgKHRzLmlzUHJvcGVydHlBc3NpZ25tZW50KHByb3BlcnR5KSkge1xyXG4gICAgICAgICAgICBjb25zdCBrZXkgPSBwcm9wZXJ0eS5uYW1lLmdldFRleHQoKTtcclxuICAgICAgICAgICAgLy8gY29uc3QgdmFsdWUgPSBwcm9wZXJ0eS5pbml0aWFsaXplci5nZXRUZXh0KCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbW1lbnQgPSBnZXRUc0NvbW1lbnQoc291cmNlRmlsZSwgcHJvcGVydHkucG9zKTtcclxuICAgICAgICAgICAgbGV0IGNvbmZpZ0l0ZW06IEFuYWx5c2lzSXRlbSA9IHtcclxuICAgICAgICAgICAgICAgIGNvbW1lbnQ6IGNvbW1lbnQsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBrZXksXHJcbiAgICAgICAgICAgICAgICB2YWx1ZToge31cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdWlDb25maWdzLnNldChrZXksIGNvbmZpZ0l0ZW0pO1xyXG4gICAgICAgICAgICBpZiAodHMuaXNPYmplY3RMaXRlcmFsRXhwcmVzc2lvbihwcm9wZXJ0eS5pbml0aWFsaXplcikpIHtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3ViUHJvcGVydHkgb2YgcHJvcGVydHkuaW5pdGlhbGl6ZXIucHJvcGVydGllcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cy5pc1Byb3BlcnR5QXNzaWdubWVudChzdWJQcm9wZXJ0eSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3ViS2V5ID0gc3ViUHJvcGVydHkubmFtZS5nZXRUZXh0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YlZhbHVlID0gc3ViUHJvcGVydHkuaW5pdGlhbGl6ZXIuZ2V0VGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgcGFyc2VVSUNvbmZpZ0RhdGFcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIG5hbWU6ICR7a2V5fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIGNvbW1lbnQ6ICR7Y29tbWVudH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBzdWJLZXk6ICR7c3ViS2V5fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIHN1YlZhbHVlOiAke3N1YlZhbHVlfWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlnSXRlbS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnSXRlbS52YWx1ZVtzdWJLZXldID0gc3ViVmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIOiOt+WPliBVSUlEIOeahOWxnuaAp1xyXG4gKi9cclxuZnVuY3Rpb24gcGFyc2VVaWlkcyh1aWlkczogTWFwPHN0cmluZywgQW5hbHlzaXNJdGVtPixcclxuICAgIFVJSUQ6IHRzLk5vZGVBcnJheTx0cy5FbnVtTWVtYmVyPiB8IHVuZGVmaW5lZCxcclxuICAgIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpIHtcclxuICAgIGlmIChVSUlEKSB7XHJcbiAgICAgICAgVUlJRC5mb3JFYWNoKG1lbWJlciA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IG1lbWJlci5uYW1lLmdldFRleHQoKTtcclxuICAgICAgICAgICAgY29uc3QgdWlpZEl0ZW06IEFuYWx5c2lzSXRlbSA9IHtcclxuICAgICAgICAgICAgICAgIGNvbW1lbnQ6IGdldFRzQ29tbWVudChzb3VyY2VGaWxlLCBtZW1iZXIucG9zKSxcclxuICAgICAgICAgICAgICAgIG5hbWU6IGtleVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHVpaWRzLnNldChrZXksIHVpaWRJdGVtKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOiOt+W+l3Rz5paH5Lu25Lit55qE5rOo6YeKXHJcbiAqIEBwYXJhbSBzb3VyY2VGaWxlIOebruagh+aWh+S7tlxyXG4gKiBAcGFyYW0gcG9zIOWPguaVsOS9jee9rlxyXG4gKiBAcmV0dXJucyBcclxuICovXHJcbmZ1bmN0aW9uIGdldFRzQ29tbWVudChzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBwb3M6IG51bWJlcikge1xyXG4gICAgY29uc3QgY29tbWVudCA9IHRzLmdldExlYWRpbmdDb21tZW50UmFuZ2VzKHNvdXJjZUZpbGUudGV4dCwgcG9zKTtcclxuICAgIGNvbnN0IGNvbW1lbnRUZXh0ID0gY29tbWVudCA/IHNvdXJjZUZpbGUudGV4dC5zdWJzdHJpbmcoY29tbWVudFswXS5wb3MsIGNvbW1lbnRbMF0uZW5kKSA6ICcnO1xyXG4gICAgcmV0dXJuIGNvbW1lbnRUZXh0LnJlcGxhY2UoL15cXC9cXCpcXCp8XFwqXFwvJC9nLCAnJykudHJpbSgpO1xyXG59XHJcblxyXG4vKipcclxuICog6Kej5p6QdHPmlofku7bojrflj5YgTGF5ZXJUeXBlIOaemuS4vlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldExheWVyVHlwZSgpOiBNYXA8bnVtYmVyLCBzdHJpbmc+IHwgdW5kZWZpbmVkIHtcclxuICAgIGxldCB0c1BhdGggPSBgJHtFZGl0b3IuUHJvamVjdC5wYXRofS9leHRlbnNpb25zL29vcHMtcGx1Z2luLWZyYW1ld29yay9hc3NldHMvY29yZS9ndWkvbGF5ZXIvTGF5ZXJNYW5hZ2VyLnRzYDtcclxuICAgIGlmICghZnMuZXhpc3RzU3luYyh0c1BhdGgpKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignTGF5ZXJNYW5hZ2VyLnRz5LiN5a2Y5Zyo77yBUGF0aDonICsgdHNQYXRoKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHJlY29yZExheWVyVHlwZTogTWFwPG51bWJlciwgc3RyaW5nPiA9IG5ldyBNYXAoKTtcclxuICAgIC8vIOivu+WPllR5cGVTY3JpcHTmlofku7blhoXlrrlcclxuICAgIGNvbnN0IHNvdXJjZUNvZGUgPSBmcy5yZWFkRmlsZVN5bmModHNQYXRoLCAndXRmOCcpO1xyXG4gICAgLy8g6Kej5p6QIFR5cGVTY3JpcHQg5paH5Lu25Lul6I635Y+W5p6a5Li+5ZKM5rOo6YeKXHJcbiAgICBjb25zdCBzb3VyY2VGaWxlID0gdHMuY3JlYXRlU291cmNlRmlsZShcclxuICAgICAgICAnTGF5ZXJNYW5hZ2VyLnRzJywgLy8g5paH5Lu25ZCNXHJcbiAgICAgICAgc291cmNlQ29kZSwgLy8gVHlwZVNjcmlwdCDku6PnoIFcclxuICAgICAgICB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LCAvLyDor63oqIDniYjmnKxcclxuICAgICAgICB0cnVlIC8vIOiuvue9rueItuiKgueCuVxyXG4gICAgKTtcclxuICAgIC8vIOmBjeWOhuaJgOacieiKgueCuVxyXG4gICAgZnVuY3Rpb24gdmlzaXQobm9kZTogdHMuTm9kZSkge1xyXG4gICAgICAgIGlmICh0cy5pc0VudW1EZWNsYXJhdGlvbihub2RlKSAmJiBub2RlLm5hbWUudGV4dCA9PT0gJ0xheWVyVHlwZScpIHtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ0ZvdW5kIExheWVyVHlwZSBlbnVtOicpO1xyXG4gICAgICAgICAgICBub2RlLm1lbWJlcnMuZm9yRWFjaChtZW1iZXIgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYC0gJHttZW1iZXIubmFtZS5nZXRUZXh0KCl9YCk7XHJcbiAgICAgICAgICAgICAgICByZWNvcmRMYXllclR5cGUuc2V0KFxyXG4gICAgICAgICAgICAgICAgICAgIG1lbWJlci5pbml0aWFsaXplciA/IE51bWJlcihtZW1iZXIuaW5pdGlhbGl6ZXIuZ2V0VGV4dCgpKSA6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyLm5hbWUuZ2V0VGV4dCgpXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cy5mb3JFYWNoQ2hpbGQobm9kZSwgdmlzaXQpOyAvLyDpgJLlvZLorr/pl67lrZDoioLngrlcclxuICAgIH1cclxuICAgIHZpc2l0KHNvdXJjZUZpbGUpO1xyXG5cclxuICAgIHJldHVybiByZWNvcmRMYXllclR5cGU7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDop6PmnpB0c+aWh+S7tuiOt+WPliBVSUFuaW1hdGlvblR5cGUg5p6a5Li+XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VUlBbmltYXRpb25UeXBlKCk6IE1hcDxudW1iZXIsIHN0cmluZz4gfCB1bmRlZmluZWQge1xyXG4gICAgbGV0IHRzUGF0aCA9IGAke0VkaXRvci5Qcm9qZWN0LnBhdGh9L2V4dGVuc2lvbnMvb29wcy1wbHVnaW4tZnJhbWV3b3JrL2Fzc2V0cy9jb3JlL2d1aS9sYXllci9MYXllck1hbmFnZXIudHNgO1xyXG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKHRzUGF0aCkpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdMYXllck1hbmFnZXIudHPkuI3lrZjlnKjvvIFQYXRoOicgKyB0c1BhdGgpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcmVjb3JkVUlBbmltYXRpb25UeXBlOiBNYXA8bnVtYmVyLCBzdHJpbmc+ID0gbmV3IE1hcCgpO1xyXG4gICAgLy8g6K+75Y+WVHlwZVNjcmlwdOaWh+S7tuWGheWuuVxyXG4gICAgY29uc3Qgc291cmNlQ29kZSA9IGZzLnJlYWRGaWxlU3luYyh0c1BhdGgsICd1dGY4Jyk7XHJcbiAgICAvLyDop6PmnpAgVHlwZVNjcmlwdCDmlofku7bku6Xojrflj5bmnprkuL7lkozms6jph4pcclxuICAgIGNvbnN0IHNvdXJjZUZpbGUgPSB0cy5jcmVhdGVTb3VyY2VGaWxlKFxyXG4gICAgICAgICdMYXllck1hbmFnZXIudHMnLCAvLyDmlofku7blkI1cclxuICAgICAgICBzb3VyY2VDb2RlLCAvLyBUeXBlU2NyaXB0IOS7o+eggVxyXG4gICAgICAgIHRzLlNjcmlwdFRhcmdldC5MYXRlc3QsIC8vIOivreiogOeJiOacrFxyXG4gICAgICAgIHRydWUgLy8g6K6+572u54i26IqC54K5XHJcbiAgICApO1xyXG4gICAgLy8g6YGN5Y6G5omA5pyJ6IqC54K5XHJcbiAgICBmdW5jdGlvbiB2aXNpdChub2RlOiB0cy5Ob2RlKSB7XHJcbiAgICAgICAgaWYgKHRzLmlzRW51bURlY2xhcmF0aW9uKG5vZGUpICYmIG5vZGUubmFtZS50ZXh0ID09PSAnVUlBbmltYXRpb25UeXBlJykge1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnRm91bmQgTGF5ZXJUeXBlIGVudW06Jyk7XHJcbiAgICAgICAgICAgIG5vZGUubWVtYmVycy5mb3JFYWNoKG1lbWJlciA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgLSAke21lbWJlci5uYW1lLmdldFRleHQoKX1gKTtcclxuICAgICAgICAgICAgICAgIHJlY29yZFVJQW5pbWF0aW9uVHlwZS5zZXQoXHJcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyLmluaXRpYWxpemVyID8gTnVtYmVyKG1lbWJlci5pbml0aWFsaXplci5nZXRUZXh0KCkpIDogMCxcclxuICAgICAgICAgICAgICAgICAgICBtZW1iZXIubmFtZS5nZXRUZXh0KClcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRzLmZvckVhY2hDaGlsZChub2RlLCB2aXNpdCk7IC8vIOmAkuW9kuiuv+mXruWtkOiKgueCuVxyXG4gICAgfVxyXG4gICAgdmlzaXQoc291cmNlRmlsZSk7XHJcblxyXG4gICAgcmV0dXJuIHJlY29yZFVJQW5pbWF0aW9uVHlwZTtcclxufVxyXG5cclxuZnVuY3Rpb24gcGFyc2VHYW1lVUlDb25maWcodHNQYXRoOiBzdHJpbmcpOiBbXHJcbiAgICB0cy5Tb3VyY2VGaWxlIHwgdW5kZWZpbmVkLFxyXG4gICAgdHMuTm9kZUFycmF5PHRzLkVudW1NZW1iZXI+IHwgdW5kZWZpbmVkLFxyXG4gICAgdHMuVmFyaWFibGVEZWNsYXJhdGlvbiB8IHVuZGVmaW5lZFxyXG5dIHtcclxuICAgIHtcclxuICAgICAgICAvLyDor7vlj5ZUeXBlU2NyaXB05paH5Lu25YaF5a65XHJcbiAgICAgICAgY29uc3Qgc291cmNlQ29kZSA9IGZzLnJlYWRGaWxlU3luYyh0c1BhdGgsICd1dGY4Jyk7XHJcbiAgICAgICAgLy8g6Kej5p6QIFR5cGVTY3JpcHQg5paH5Lu25Lul6I635Y+W5p6a5Li+5ZKM5rOo6YeKXHJcbiAgICAgICAgY29uc3Qgc291cmNlRmlsZSA9IHRzLmNyZWF0ZVNvdXJjZUZpbGUoXHJcbiAgICAgICAgICAgICdHYW1lVUlDb25maWcudHMnLCAvLyDmlofku7blkI1cclxuICAgICAgICAgICAgc291cmNlQ29kZSwgLy8gVHlwZVNjcmlwdCDku6PnoIFcclxuICAgICAgICAgICAgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCwgLy8g6K+t6KiA54mI5pysXHJcbiAgICAgICAgICAgIHRydWUgLy8g6K6+572u54i26IqC54K5XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgbGV0IFVJSUQ6IHRzLk5vZGVBcnJheTx0cy5FbnVtTWVtYmVyPiB8IHVuZGVmaW5lZDtcclxuICAgICAgICBsZXQgVUlDb25maWdEYXRhOiB0cy5WYXJpYWJsZURlY2xhcmF0aW9uIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIC8vIOmBjeWOhuaJgOacieiKgueCuVxyXG4gICAgICAgIGZ1bmN0aW9uIHZpc2l0KG5vZGU6IHRzLk5vZGUpIHtcclxuICAgICAgICAgICAgaWYgKHRzLmlzRW51bURlY2xhcmF0aW9uKG5vZGUpICYmIG5vZGUubmFtZS50ZXh0ID09PSAnVUlJRCcpIHtcclxuICAgICAgICAgICAgICAgIFVJSUQgPSBub2RlLm1lbWJlcnM7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodHMuaXNWYXJpYWJsZVN0YXRlbWVudChub2RlKSkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBkZWNsYXJhdGlvbiBvZiBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHMuaXNWYXJpYWJsZURlY2xhcmF0aW9uKGRlY2xhcmF0aW9uKSAmJiBkZWNsYXJhdGlvbi5uYW1lLmdldFRleHQoKSA9PT0gJ1VJQ29uZmlnRGF0YScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgVUlDb25maWdEYXRhID0gZGVjbGFyYXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdHMuZm9yRWFjaENoaWxkKG5vZGUsIHZpc2l0KTsgLy8g6YCS5b2S6K6/6Zeu5a2Q6IqC54K5XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZpc2l0KHNvdXJjZUZpbGUpO1xyXG5cclxuICAgICAgICByZXR1cm4gW3NvdXJjZUZpbGUsIFVJSUQsIFVJQ29uZmlnRGF0YV07XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmoLnmja7pgInkuK3pobnkuLrmlofku7bnlJ/miJDnu5PmnoTlkI7lpITnkIZcclxuICovXHJcbmZ1bmN0aW9uIHBvc3Rwcm9jZXNzaW5nQnlTZWxlY3Rpb25JdGVtcyhcclxuICAgIHNlbGVjdGVkSXRlbXM6IFVJSXRlbVByb3BzW10sXHJcbiAgICB1aWlkczogTWFwPHN0cmluZywgQW5hbHlzaXNJdGVtPixcclxuICAgIHVpQ29uZmlnczogTWFwPHN0cmluZywgQW5hbHlzaXNJdGVtPixcclxuICAgIHJlY29yZExheWVyOiBNYXA8bnVtYmVyLCBzdHJpbmc+IHwgdW5kZWZpbmVkLFxyXG4gICAgcmVjb3JkVUlBbmltYXRpb25UeXBlOiBNYXA8bnVtYmVyLCBzdHJpbmc+IHwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgc2VsZWN0ZWRJdGVtcy5mb3JFYWNoKChzZWxlY3Rpb24sIGluZGV4KSA9PiB7XHJcbiAgICAgICAgbGV0IHVpaWRLZXkgPSBjYXBpdGFsaXplTGV0dGVyKHNlbGVjdGlvbi5wcmVmYWJOYW1lKTtcclxuICAgICAgICBsZXQgdWlDb25maWdLZXkgPSBgW1VJSUQuJHt1aWlkS2V5fV1gO1xyXG5cclxuICAgICAgICBsZXQgdWlpZEl0ZW0gPSB1aWlkcy5nZXQodWlpZEtleSk7XHJcbiAgICAgICAgLy8gbGV0IHVpaWRDb21tZW50QmVmb3IgPSB1aWlkSXRlbT8uY29tbWVudDtcclxuICAgICAgICBsZXQgdWlpZENvbW1lbnRBZnRlciA9IHNlbGVjdGlvbi51aUNvbW1lbnQ7XHJcblxyXG4gICAgICAgIGxldCBwYXJzZUxheWVyQWZ0ZXIsIHBhcnNlT3BlbkFuaW1BZnRlciwgcGFyc2VDbG9zZUFuaW1BZnRlcjtcclxuICAgICAgICByZWNvcmRMYXllcj8uZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoa2V5IC0gc2VsZWN0aW9uLmxheWVyID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJzZUxheWVyQWZ0ZXIgPSB2YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJlY29yZFVJQW5pbWF0aW9uVHlwZT8uZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoa2V5IC0gc2VsZWN0aW9uLm9wZW5BbmltID09PSAwXHJcbiAgICAgICAgICAgICAgICAmJiBrZXkgIT09IDAgICAgLy8g5o6S6ZmkIFVJQW5pbWF0aW9uVHlwZS5Ob25lXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgcGFyc2VPcGVuQW5pbUFmdGVyID0gdmFsdWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoa2V5IC0gc2VsZWN0aW9uLmNsb3NlQW5pbSA9PT0gMFxyXG4gICAgICAgICAgICAgICAgJiYga2V5ICE9PSAwICAgIC8vIOaOkumZpCBVSUFuaW1hdGlvblR5cGUuTm9uZVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIHBhcnNlQ2xvc2VBbmltQWZ0ZXIgPSB2YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB1aWlkSXRlbVxyXG4gICAgICAgICAgICA/ICh1aWlkQ29tbWVudEFmdGVyICYmICh1aWlkSXRlbS5jb21tZW50ID0gdWlpZENvbW1lbnRBZnRlcikpXHJcbiAgICAgICAgICAgIDogdWlpZHMuc2V0KHVpaWRLZXksIHsgY29tbWVudDogdWlpZENvbW1lbnRBZnRlciwgbmFtZTogdWlpZEtleSB9KTtcclxuXHJcbiAgICAgICAgbGV0IHByZWZhYiA9IGAnJHtzZWxlY3Rpb24ucHJlZmFifSdgO1xyXG4gICAgICAgIGxldCB1aUNvbmZpZ0l0ZW0gPSB1aUNvbmZpZ3MuZ2V0KHVpQ29uZmlnS2V5KTtcclxuICAgICAgICAvLyBsZXQgbGF5ZXJCZWZvcmUgPSB1aUNvbmZpZ0l0ZW0/LnZhbHVlPy5sYXllcjtcclxuICAgICAgICBsZXQgbGF5ZXJBZnRlciA9IHBhcnNlTGF5ZXJBZnRlciAmJiBgTGF5ZXJUeXBlLiR7cGFyc2VMYXllckFmdGVyfWA7XHJcbiAgICAgICAgbGV0IG9wZW5BbmltQWZ0ZXIgPSBwYXJzZU9wZW5BbmltQWZ0ZXIgJiYgYFVJQW5pbWF0aW9uVHlwZS4ke3BhcnNlT3BlbkFuaW1BZnRlcn1gO1xyXG4gICAgICAgIGxldCBjbG9zZUFuaW1BZnRlciA9IHBhcnNlQ2xvc2VBbmltQWZ0ZXIgJiYgYFVJQW5pbWF0aW9uVHlwZS4ke3BhcnNlQ2xvc2VBbmltQWZ0ZXJ9YDtcclxuXHJcbiAgICAgICAgbGV0IGJ1bmRsZUJlZm9yID0gdWlDb25maWdJdGVtPy52YWx1ZT8uYnVuZGxlO1xyXG4gICAgICAgIGxldCBwYXJzZUJ1bmRsZU5hbWUgPSBzZWxlY3Rpb24uYnVuZGxlICYmIGAnJHtzZWxlY3Rpb24uYnVuZGxlfSdgO1xyXG4gICAgICAgIC8vIGJ1bmRsZUJlZm9yICYmIChidW5kbGVCZWZvciA9IGAnJHtidW5kbGVCZWZvcn0nYCk7XHJcblxyXG4gICAgICAgIHVpQ29uZmlnSXRlbVxyXG4gICAgICAgICAgICA/IHVpQ29uZmlnSXRlbS52YWx1ZSEgPSB7XHJcbiAgICAgICAgICAgICAgICBsYXllcjogbGF5ZXJBZnRlcixcclxuICAgICAgICAgICAgICAgIHByZWZhYjogcHJlZmFiLFxyXG4gICAgICAgICAgICAgICAgYnVuZGxlOiAhIXBhcnNlQnVuZGxlTmFtZSA/IHBhcnNlQnVuZGxlTmFtZSA6IGJ1bmRsZUJlZm9yLFxyXG4gICAgICAgICAgICAgICAgc2hvd0FuaW06IG9wZW5BbmltQWZ0ZXIsXHJcbiAgICAgICAgICAgICAgICBoaWRlQW5pbTogY2xvc2VBbmltQWZ0ZXIsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgOiB1aUNvbmZpZ3Muc2V0KHVpQ29uZmlnS2V5LCB7XHJcbiAgICAgICAgICAgICAgICBjb21tZW50OiAnJyxcclxuICAgICAgICAgICAgICAgIG5hbWU6IHVpQ29uZmlnS2V5LFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgICAgICBsYXllcjogbGF5ZXJBZnRlcixcclxuICAgICAgICAgICAgICAgICAgICBwcmVmYWI6IHByZWZhYixcclxuICAgICAgICAgICAgICAgICAgICBidW5kbGU6IHBhcnNlQnVuZGxlTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBzaG93QW5pbTogb3BlbkFuaW1BZnRlcixcclxuICAgICAgICAgICAgICAgICAgICBoaWRlQW5pbTogY2xvc2VBbmltQWZ0ZXIsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coYFxyXG4gICAgICAgIC8vICAgICB1aWlkS2V5OiAke3VpaWRLZXl9LFxyXG4gICAgICAgIC8vICAgICB1aUNvbmZpZ0tleTogJHt1aUNvbmZpZ0tleX0sXHJcbiAgICAgICAgLy8gICAgIGNvbW1lbnRCZWY6ICR7dWlpZENvbW1lbnRCZWZvcn0gPT09PiBjb21tZW50QWZ0OiAke3VpaWRDb21tZW50QWZ0ZXJ9LFxyXG4gICAgICAgIC8vICAgICBsYXllckJlZjogJHtsYXllckJlZm9yZX0gPT09PiBsYXllckFmdDogJHtsYXllckFmdGVyfSxcclxuICAgICAgICAvLyAgICAgcHJlZmFiOiAke3ByZWZhYn0sYCk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOmmluWtl+avjeWkp+WGmei9rOaNolxyXG4gKi9cclxuZnVuY3Rpb24gY2FwaXRhbGl6ZUxldHRlcihzOiBzdHJpbmcpIHtcclxuICAgIHMgPSBzLnJlcGxhY2UoJ1ZpZXcnLCAnJyk7XHJcbiAgICByZXR1cm4gcy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHMuc2xpY2UoMSk7XHJcbn0iXX0=