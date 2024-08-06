/**
 * @file generateGameUIConfig.ts
 * @author zr
 * @date 2024-06-13
 * @description 导出GameUIConfig.ts脚本
 */
import fs from 'fs';
import Mustache from 'mustache';
import path from 'path';
import ts from 'typescript';

type AnalysisItem = {
    comment: string | undefined,
    name: string,
    value?: { [key: string]: string | undefined },
}

// 每条选中项需要设置的属性
export type UIItemProps = {
    uiComment: string | undefined,
    prefabName: string,
    layer: number,
    bundle: string | undefined,
    openAnim: number,
    closeAnim: number,
    prefab: string,
}

/**
 * 添加到 GameUIConfig
 */
export function genSelectionItems(selectedItems: UIItemProps[]) {
    let tsPath = `${Editor.Project.path}/assets/script/game/common/config/GameUIConfig.ts`;
    if (!fs.existsSync(tsPath)) {
        console.error('GameUIConfig.ts不存在！Path:' + tsPath);
        return;
    }

    let UIID: ts.NodeArray<ts.EnumMember> | undefined;
    let UIConfigData: ts.VariableDeclaration | undefined;
    let sourceFile: ts.SourceFile | undefined;
    [sourceFile, UIID, UIConfigData] = parseGameUIConfig(tsPath);
    if (!sourceFile || !UIID || !UIConfigData) {
        console.error('GameUIConfig.ts解析失败！');
        return;
    }

    const recordLayer = getLayerType();
    const recordUIAnimationType = getUIAnimationType();
    // 解析出UIID和UIConfigData数据
    let uiids: Map<string, AnalysisItem> = new Map();
    parseUiids(uiids, UIID, sourceFile);
    let uiConfigs: Map<string, AnalysisItem> = new Map();
    parseUIConfigData(uiConfigs, UIConfigData, sourceFile);
    // 结合选中项后处理生成新的UIConfigData和UIID
    postprocessingBySelectionItems(selectedItems, uiids, uiConfigs, recordLayer, recordUIAnimationType);

    const mustacheData = formatMustacheData(uiids, uiConfigs);
    const templatePath = path.join(__dirname, '../mustache/GameUIConfig.mustache');
    const template = fs.readFileSync(templatePath, 'utf8');
    const output = Mustache.render(template, mustacheData);
    // console.warn(str);
    let projectPath = Editor.Project.path;
    fs.writeFileSync(path.join(projectPath, 'assets/script/game/common/config/GameUIConfig.ts'), output, 'utf8');
    console.log('Generate GameUIConfig.ts success!');
}

/**
 * 生成 Mustache 数据
 */
function formatMustacheData(uuids: Map<string, AnalysisItem>, uiConfigs: Map<string, AnalysisItem>) {
    let mustacheData: {
        uiids: { comment?: string; name: string; }[],
        uiconfigs: { comment?: string; name: string; layer: string | undefined; prefab?: string | undefined }[],
    } = {
        uiids: [],
        uiconfigs: [],
    }

    const uuidKeys = Array.from(uuids.keys()).sort();
    uuidKeys.forEach(key => {
        const item = uuids.get(key);
        if (item) {
            mustacheData.uiids.push({
                comment: item.comment?.length === 0 ? undefined : item.comment,
                name: item.name
            });
            // console.log(`uiid ${item.name}: ${item.comment}`);
        }
    });

    const uiConfigKeys = Array.from(uiConfigs.keys()).sort();
    uiConfigKeys.forEach(key => {
        const item = uiConfigs.get(key);
        if (item) {
            // console.log(`uiConfig  ${item.name}: ${item.comment}`);
            let uiconfig = {
                comment: item.comment?.length === 0 ? undefined : item.comment,
                name: item.name,
                layer: item.value?.layer,
                prefab: item.value?.prefab,
                bundle: item.value?.bundle,
                showAnim: item.value?.showAnim,
                hideAnim: item.value?.hideAnim,
            };
            mustacheData.uiconfigs.push(uiconfig);
        }
    });

    return mustacheData;
}


/**
 * 获取 UIConfigData 的属性 
 */
function parseUIConfigData(uiConfigs: Map<string, AnalysisItem>, UIConfigData: ts.VariableDeclaration | undefined, sourceFile: ts.SourceFile) {
    if (!UIConfigData || !UIConfigData.initializer
        || !ts.isObjectLiteralExpression(UIConfigData.initializer)) {
        return;
    }

    for (const property of UIConfigData.initializer.properties) {
        if (ts.isPropertyAssignment(property)) {
            const key = property.name.getText();
            // const value = property.initializer.getText();
            const comment = getTsComment(sourceFile, property.pos);
            let configItem: AnalysisItem = {
                comment: comment,
                name: key,
                value: {}
            };
            uiConfigs.set(key, configItem);
            if (ts.isObjectLiteralExpression(property.initializer)) {
                for (const subProperty of property.initializer.properties) {
                    if (ts.isPropertyAssignment(subProperty)) {
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
function parseUiids(uiids: Map<string, AnalysisItem>,
    UIID: ts.NodeArray<ts.EnumMember> | undefined,
    sourceFile: ts.SourceFile) {
    if (UIID) {
        UIID.forEach(member => {
            const key = member.name.getText();
            const uiidItem: AnalysisItem = {
                comment: getTsComment(sourceFile, member.pos),
                name: key
            }
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
function getTsComment(sourceFile: ts.SourceFile, pos: number) {
    const comment = ts.getLeadingCommentRanges(sourceFile.text, pos);
    const commentText = comment ? sourceFile.text.substring(comment[0].pos, comment[0].end) : '';
    return commentText.replace(/^\/\*\*|\*\/$/g, '').trim();
}

/**
 * 解析ts文件获取 LayerType 枚举
 */
export function getLayerType(): Map<number, string> | undefined {
    let tsPath = `${Editor.Project.path}/extensions/oops-plugin-framework/assets/core/gui/layer/LayerManager.ts`;
    if (!fs.existsSync(tsPath)) {
        console.error('LayerManager.ts不存在！Path:' + tsPath);
        return;
    }

    let recordLayerType: Map<number, string> = new Map();
    // 读取TypeScript文件内容
    const sourceCode = fs.readFileSync(tsPath, 'utf8');
    // 解析 TypeScript 文件以获取枚举和注释
    const sourceFile = ts.createSourceFile(
        'LayerManager.ts', // 文件名
        sourceCode, // TypeScript 代码
        ts.ScriptTarget.Latest, // 语言版本
        true // 设置父节点
    );
    // 遍历所有节点
    function visit(node: ts.Node) {
        if (ts.isEnumDeclaration(node) && node.name.text === 'LayerType') {
            // console.log('Found LayerType enum:');
            let i = 0;
            node.members.forEach(member => {
                // console.log(`->>> ${member.initializer}`);
                recordLayerType.set(
                    i++,
                    member.name.getText()
                );
            });
            return;
        }
        ts.forEachChild(node, visit); // 递归访问子节点
    }
    visit(sourceFile);

    return recordLayerType;
}

/**
 * 解析ts文件获取 UIAnimationType 枚举
 */
export function getUIAnimationType(): Map<number, string> | undefined {
    let tsPath = `${Editor.Project.path}/extensions/oops-plugin-framework/assets/core/gui/layer/LayerManager.ts`;
    if (!fs.existsSync(tsPath)) {
        console.error('LayerManager.ts不存在！Path:' + tsPath);
        return;
    }

    let recordUIAnimationType: Map<number, string> = new Map();
    // 读取TypeScript文件内容
    const sourceCode = fs.readFileSync(tsPath, 'utf8');
    // 解析 TypeScript 文件以获取枚举和注释
    const sourceFile = ts.createSourceFile(
        'LayerManager.ts', // 文件名
        sourceCode, // TypeScript 代码
        ts.ScriptTarget.Latest, // 语言版本
        true // 设置父节点
    );
    // 遍历所有节点
    function visit(node: ts.Node) {
        if (ts.isEnumDeclaration(node) && node.name.text === 'UIAnimationType') {
            // console.log('Found LayerType enum:');
            node.members.forEach(member => {
                // console.log(`- ${member.name.getText()}`);
                recordUIAnimationType.set(
                    member.initializer ? Number(member.initializer.getText()) : 0,
                    member.name.getText()
                );
            });
            return;
        }
        ts.forEachChild(node, visit); // 递归访问子节点
    }
    visit(sourceFile);

    return recordUIAnimationType;
}

function parseGameUIConfig(tsPath: string): [
    ts.SourceFile | undefined,
    ts.NodeArray<ts.EnumMember> | undefined,
    ts.VariableDeclaration | undefined
] {
    {
        // 读取TypeScript文件内容
        const sourceCode = fs.readFileSync(tsPath, 'utf8');
        // 解析 TypeScript 文件以获取枚举和注释
        const sourceFile = ts.createSourceFile(
            'GameUIConfig.ts', // 文件名
            sourceCode, // TypeScript 代码
            ts.ScriptTarget.Latest, // 语言版本
            true // 设置父节点
        );

        let UIID: ts.NodeArray<ts.EnumMember> | undefined;
        let UIConfigData: ts.VariableDeclaration | undefined;
        // 遍历所有节点
        function visit(node: ts.Node) {
            if (ts.isEnumDeclaration(node) && node.name.text === 'UIID') {
                UIID = node.members;
                return;
            }
            else if (ts.isVariableStatement(node)) {
                for (const declaration of node.declarationList.declarations) {
                    if (ts.isVariableDeclaration(declaration) && declaration.name.getText() === 'UIConfigData') {
                        UIConfigData = declaration;
                        return;
                    }
                }
            }
            ts.forEachChild(node, visit); // 递归访问子节点
        }
        visit(sourceFile);

        return [sourceFile, UIID, UIConfigData];
    }
}

/**
 * 根据选中项为文件生成结构后处理
 */
function postprocessingBySelectionItems(
    selectedItems: UIItemProps[],
    uiids: Map<string, AnalysisItem>,
    uiConfigs: Map<string, AnalysisItem>,
    recordLayer: Map<number, string> | undefined,
    recordUIAnimationType: Map<number, string> | undefined) {

    selectedItems.forEach((selection, index) => {
        let uiidKey = capitalizeLetter(selection.prefabName);
        let uiConfigKey = `[UIID.${uiidKey}]`;

        let uiidItem = uiids.get(uiidKey);
        // let uiidCommentBefor = uiidItem?.comment;
        let uiidCommentAfter = selection.uiComment;

        let parseLayerAfter, parseOpenAnimAfter, parseCloseAnimAfter;
        recordLayer?.forEach((value, key) => {
            if (key - selection.layer === 0) {
                parseLayerAfter = value;
            }
        });
        
        recordUIAnimationType?.forEach((value, key) => {
            if (key - selection.openAnim === 0
                && key !== 0    // 排除 UIAnimationType.None
            ) {
                parseOpenAnimAfter = value;
            } else if (key - selection.closeAnim === 0
                && key !== 0    // 排除 UIAnimationType.None
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

        let bundleBefor = uiConfigItem?.value?.bundle;
        let parseBundleName = selection.bundle && `'${selection.bundle}'`;
        // bundleBefor && (bundleBefor = `'${bundleBefor}'`);

        uiConfigItem
            ? uiConfigItem.value! = {
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
function capitalizeLetter(s: string) {
    s = s.replace('View', '');
    return s.charAt(0).toUpperCase() + s.slice(1);
}