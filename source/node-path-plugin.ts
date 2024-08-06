
import { AssetInfo } from "@cocos/creator-types/editor/packages/asset-db/@types/public";
import { INode } from "@cocos/creator-types/editor/packages/scene/@types/public";
import path from "path";

const fs = require('fs')

export async function onAssetChange(uuid: string, assetInfo: AssetInfo) {
    // TODO 判断prefab变化，检测当前prefab下对应的节点路径是否有修改，如果有，则找出修改，并删除相应的节点路径数据。（同时需要有引用到当前节点路径的数据）
    // console.log("uuid", uuid);
    // console.log("assetInfo", assetInfo);

    if (assetInfo.name === "NodePaths.json") {
        await Editor.Message.send('scene', 'execute-scene-script', {
            name: 'oops-copilot',
            method: 'nodePathPluginResetData',
            args: [],
        });
    } else if (assetInfo.importer === "prefab") {
        let jsonPath = await NodePathPlugin.getNodePathJsonPath();
        if (!jsonPath) {
            return;
        }
        let ret = await NodePathPlugin.getNodePathsObj();
        if (!ret) { return; }
        let {nodePathsObj, idToNodePathObjs, prefabNodePathToIdObjsArr} = ret;
        let name = assetInfo.name.replace(".prefab", "");
        if (!prefabNodePathToIdObjsArr[name]) {
            return;
        }
        let nodeUuids = await Editor.Message.request('scene', 'query-nodes-by-asset-uuid', uuid);
        // console.log("nodeUuids", nodeUuids);
        if (nodeUuids.length <= 0) {
            return;
        }
        let queryRet = await Editor.Message.request('scene', 'query-node-tree', nodeUuids[0]);
        let nodeTree = queryRet as unknown as INode;
        // console.log("nodeTree", nodeTree);
        if (!nodeTree) {
            return;
        }

        let dirtyIds: Array<{[key: string]: string}> = [];
        prefabNodePathToIdObjsArr[name].forEach((value: any) => {
            let nodePath = value.nodePath;
            if (!NodePathPlugin.findNode(nodeTree, nodePath)) {
                dirtyIds.push(value);
            }
        });

        if (dirtyIds.length > 0) {
            let logArr: string[] = [];
            dirtyIds.forEach(value => {
                delete idToNodePathObjs[value.id];
                logArr.push(`id: ${value.id} nodePath: ${value.nodePath}`);
            });
            let json = JSON.stringify(idToNodePathObjs);
            fs.writeFileSync(jsonPath, json);

            Editor.Dialog.warn(`${logArr.join('\n')}\n节点不存在，请排查相关配置！`);

            // console.log('idToNodePathObjs', idToNodePathObjs);
            
            await Editor.Message.send('scene', 'execute-scene-script', {
                name: 'oops-copilot',
                method: 'nodePathPluginResetData',
                args: [],
            });
        }
    }
}

export async function onNodeMenu(value: any) {
    let path = await NodePathPlugin.getNodePath(value.uuid);
    let ret: any = await Editor.Message.request('scene', 'execute-scene-script', {
        name: 'oops-copilot',
        method: 'queryNodePathsObj',
        args: [],
    });
    // console.log('ret', ret);
    if (!ret) { return; }
    let {nodePathsObj, idToNodePathObjs, prefabNodePathToIdObjsArr} = ret;
    let generateNodePathEnabled = true;
    let nodePathId = '';
    if (nodePathsObj && nodePathsObj[path]) {
        generateNodePathEnabled = false;
        nodePathId = ': ' + nodePathsObj[path];
    }
    return [
        {
            label: `GenerateNodePath${nodePathId}`,
            visible: Editor.EditMode.getMode() == "prefab", // 非prefab预览模式不可见
            enabled: generateNodePathEnabled, // 已生成的路径不可以再次点击
            click: async () => {
                NodePathPlugin.generateNodePath(path);
            }
        },
    ];
}

export module NodePathPlugin {
    let nodePathMaxId: number = 0;
    let nodePathToIdObjs: {[key: string]: string}|null = null;
    let idToNodePathObjs: {[key: string]: string}|null = null;
    let prefabNodePathToIdObjsArr:  {[key: string]: Array<{[key: string]: string}>}|null = null;
    let nodePathJsonPath: string = null!;

    export function resetData() {
        nodePathToIdObjs = null;
        idToNodePathObjs = null;
        prefabNodePathToIdObjsArr = null;
    }

    export function findNode(nodeTree: INode, nodePath: string) {
        let nodePathArr = nodePath.split('/');
        let nodeName = nodePathArr.shift();
        let name = nodeTree.name as unknown as string;
        if (name == nodeName) {
            if (nodePathArr.length <= 0) {
                return true;
            } else {
                for (let index = 0; index < nodeTree.children.length; index++) {
                    let ret = findNode(nodeTree.children[index], nodePathArr.join('/'));
                    if (ret) {
                        return true;
                    }
                }
                return false;
            }
        } else {
            return false;
        }
    }
    
    export async function getNodePathJsonPath() {
        if (!nodePathJsonPath) {
            // const config = await Editor.Profile.getProject(packageJSON.name);
            const config = await Editor.Profile.getProject('oops-plugin-excel-to-json');
            if (config && config.PathJsonClient) {
                nodePathJsonPath = path.join(__dirname, config.PathJsonClient.replace("project://", "../../../") + "/NodePaths.json");
            }
        }
        return nodePathJsonPath;
    }
    
    export async function getNodePathsObj() {
        // console.log('idToNodePathObjs', idToNodePathObjs);
        if (!nodePathToIdObjs || !idToNodePathObjs || !prefabNodePathToIdObjsArr) {
            let jsonPath = await getNodePathJsonPath();
            if (!jsonPath) {
                return;
            }
            let json = '';
            if (fs.existsSync(jsonPath)) {
                json= fs.readFileSync(jsonPath, 'utf8');
            }
            nodePathMaxId = 10000;
            nodePathToIdObjs = {};
            idToNodePathObjs = {};
            prefabNodePathToIdObjsArr = {};
            const obj = JSON.parse(json);
            for (const [id, nodePath] of Object.entries(obj)) {
                nodePathToIdObjs[nodePath as string] = id;
                idToNodePathObjs[id] = nodePath as string;
                nodePathMaxId = Math.max(nodePathMaxId, parseInt(id));
    
                let prefabName = (nodePath as string).split('/')[0];
                if (!prefabNodePathToIdObjsArr[prefabName]) {
                    prefabNodePathToIdObjsArr[prefabName] = new Array();
                }
                prefabNodePathToIdObjsArr[prefabName].push({nodePath: nodePath as string, id: id});
            }
        }
        return {nodePathsObj: nodePathToIdObjs, idToNodePathObjs: idToNodePathObjs, prefabNodePathToIdObjsArr: prefabNodePathToIdObjsArr};
    }
    
    export async function generateNodePath(nodePath: string) {
        let jsonPath = await getNodePathJsonPath();
        if (!jsonPath) {
            // Editor.Dialog.warn('项目设置>node-path-plugin>NodePathJson 未配置')
            Editor.Dialog.warn(`${nodePath}节点路径生成失败！`);
            return;
        }
    
        let ret = await getNodePathsObj();
        if (!ret) { return; }
        let {nodePathsObj, idToNodePathObjs, prefabNodePathToIdObjsArr} = ret;
        if (nodePathsObj[nodePath]) { return; }
        nodePathMaxId++;
        let idStr = `${nodePathMaxId}`;
        nodePathsObj[nodePath] = idStr;
        idToNodePathObjs[idStr] = nodePath;
    
        let prefabName = nodePath.split('/')[0];
        if (!prefabNodePathToIdObjsArr[prefabName]) {
            prefabNodePathToIdObjsArr[prefabName] = new Array();
        }
        prefabNodePathToIdObjsArr[prefabName].push({nodePath: nodePath as string, id: idStr});
    
        let json = JSON.stringify(idToNodePathObjs);
        fs.writeFileSync(jsonPath, json);
        Editor.Dialog.info(`${nodePath}节点路径生成成功！id：${idStr}`);
    }
    
    export async function getNodePath(uuid: string) {
        let nodeTree = await Editor.Message.request('scene', 'query-node-tree', uuid);
        // @ts-ignore
        let path: string = nodeTree.path;
        path = path.replace('should_hide_in_hierarchy/', '');
        return path;
    }
}