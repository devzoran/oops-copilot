"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodePathPlugin = exports.onNodeMenu = exports.onAssetChange = void 0;
const path_1 = __importDefault(require("path"));
const fs = require('fs');
async function onAssetChange(uuid, assetInfo) {
    // TODO 判断prefab变化，检测当前prefab下对应的节点路径是否有修改，如果有，则找出修改，并删除相应的节点路径数据。（同时需要有引用到当前节点路径的数据）
    // console.log("uuid", uuid);
    // console.log("assetInfo", assetInfo);
    if (assetInfo.name === "NodePaths.json") {
        await Editor.Message.send('scene', 'execute-scene-script', {
            name: 'oops-copilot',
            method: 'nodePathPluginResetData',
            args: [],
        });
    }
    else if (assetInfo.importer === "prefab") {
        let jsonPath = await NodePathPlugin.getNodePathJsonPath();
        if (!jsonPath) {
            return;
        }
        let ret = await NodePathPlugin.getNodePathsObj();
        if (!ret) {
            return;
        }
        let { nodePathsObj, idToNodePathObjs, prefabNodePathToIdObjsArr } = ret;
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
        let nodeTree = queryRet;
        // console.log("nodeTree", nodeTree);
        if (!nodeTree) {
            return;
        }
        let dirtyIds = [];
        prefabNodePathToIdObjsArr[name].forEach((value) => {
            let nodePath = value.nodePath;
            if (!NodePathPlugin.findNode(nodeTree, nodePath)) {
                dirtyIds.push(value);
            }
        });
        if (dirtyIds.length > 0) {
            let logArr = [];
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
exports.onAssetChange = onAssetChange;
async function onNodeMenu(value) {
    let path = await NodePathPlugin.getNodePath(value.uuid);
    let ret = await Editor.Message.request('scene', 'execute-scene-script', {
        name: 'oops-copilot',
        method: 'queryNodePathsObj',
        args: [],
    });
    // console.log('ret', ret);
    if (!ret) {
        return;
    }
    let { nodePathsObj, idToNodePathObjs, prefabNodePathToIdObjsArr } = ret;
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
exports.onNodeMenu = onNodeMenu;
var NodePathPlugin;
(function (NodePathPlugin) {
    let nodePathMaxId = 0;
    let nodePathToIdObjs = null;
    let idToNodePathObjs = null;
    let prefabNodePathToIdObjsArr = null;
    let nodePathJsonPath = null;
    function resetData() {
        nodePathToIdObjs = null;
        idToNodePathObjs = null;
        prefabNodePathToIdObjsArr = null;
    }
    NodePathPlugin.resetData = resetData;
    function findNode(nodeTree, nodePath) {
        let nodePathArr = nodePath.split('/');
        let nodeName = nodePathArr.shift();
        let name = nodeTree.name;
        if (name == nodeName) {
            if (nodePathArr.length <= 0) {
                return true;
            }
            else {
                for (let index = 0; index < nodeTree.children.length; index++) {
                    let ret = findNode(nodeTree.children[index], nodePathArr.join('/'));
                    if (ret) {
                        return true;
                    }
                }
                return false;
            }
        }
        else {
            return false;
        }
    }
    NodePathPlugin.findNode = findNode;
    async function getNodePathJsonPath() {
        if (!nodePathJsonPath) {
            // const config = await Editor.Profile.getProject(packageJSON.name);
            const config = await Editor.Profile.getProject('oops-plugin-excel-to-json');
            if (config && config.PathJsonClient) {
                nodePathJsonPath = path_1.default.join(__dirname, config.PathJsonClient.replace("project://", "../../../") + "/NodePaths.json");
            }
        }
        return nodePathJsonPath;
    }
    NodePathPlugin.getNodePathJsonPath = getNodePathJsonPath;
    async function getNodePathsObj() {
        // console.log('idToNodePathObjs', idToNodePathObjs);
        if (!nodePathToIdObjs || !idToNodePathObjs || !prefabNodePathToIdObjsArr) {
            let jsonPath = await getNodePathJsonPath();
            if (!jsonPath) {
                return;
            }
            let json = '';
            if (fs.existsSync(jsonPath)) {
                json = fs.readFileSync(jsonPath, 'utf8');
            }
            nodePathMaxId = 10000;
            nodePathToIdObjs = {};
            idToNodePathObjs = {};
            prefabNodePathToIdObjsArr = {};
            const obj = JSON.parse(json);
            for (const [id, nodePath] of Object.entries(obj)) {
                nodePathToIdObjs[nodePath] = id;
                idToNodePathObjs[id] = nodePath;
                nodePathMaxId = Math.max(nodePathMaxId, parseInt(id));
                let prefabName = nodePath.split('/')[0];
                if (!prefabNodePathToIdObjsArr[prefabName]) {
                    prefabNodePathToIdObjsArr[prefabName] = new Array();
                }
                prefabNodePathToIdObjsArr[prefabName].push({ nodePath: nodePath, id: id });
            }
        }
        return { nodePathsObj: nodePathToIdObjs, idToNodePathObjs: idToNodePathObjs, prefabNodePathToIdObjsArr: prefabNodePathToIdObjsArr };
    }
    NodePathPlugin.getNodePathsObj = getNodePathsObj;
    async function generateNodePath(nodePath) {
        let jsonPath = await getNodePathJsonPath();
        if (!jsonPath) {
            // Editor.Dialog.warn('项目设置>node-path-plugin>NodePathJson 未配置')
            Editor.Dialog.warn(`${nodePath}节点路径生成失败！`);
            return;
        }
        let ret = await getNodePathsObj();
        if (!ret) {
            return;
        }
        let { nodePathsObj, idToNodePathObjs, prefabNodePathToIdObjsArr } = ret;
        if (nodePathsObj[nodePath]) {
            return;
        }
        nodePathMaxId++;
        let idStr = `${nodePathMaxId}`;
        nodePathsObj[nodePath] = idStr;
        idToNodePathObjs[idStr] = nodePath;
        let prefabName = nodePath.split('/')[0];
        if (!prefabNodePathToIdObjsArr[prefabName]) {
            prefabNodePathToIdObjsArr[prefabName] = new Array();
        }
        prefabNodePathToIdObjsArr[prefabName].push({ nodePath: nodePath, id: idStr });
        let json = JSON.stringify(idToNodePathObjs);
        fs.writeFileSync(jsonPath, json);
        Editor.Dialog.info(`${nodePath}节点路径生成成功！id：${idStr}`);
    }
    NodePathPlugin.generateNodePath = generateNodePath;
    async function getNodePath(uuid) {
        let nodeTree = await Editor.Message.request('scene', 'query-node-tree', uuid);
        // @ts-ignore
        let path = nodeTree.path;
        path = path.replace('should_hide_in_hierarchy/', '');
        return path;
    }
    NodePathPlugin.getNodePath = getNodePath;
})(NodePathPlugin || (exports.NodePathPlugin = NodePathPlugin = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS1wYXRoLXBsdWdpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9ub2RlLXBhdGgtcGx1Z2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUdBLGdEQUF3QjtBQUV4QixNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7QUFFakIsS0FBSyxVQUFVLGFBQWEsQ0FBQyxJQUFZLEVBQUUsU0FBb0I7SUFDbEUscUZBQXFGO0lBQ3JGLDZCQUE2QjtJQUM3Qix1Q0FBdUM7SUFFdkMsSUFBSSxTQUFTLENBQUMsSUFBSSxLQUFLLGdCQUFnQixFQUFFLENBQUM7UUFDdEMsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUU7WUFDdkQsSUFBSSxFQUFFLGNBQWM7WUFDcEIsTUFBTSxFQUFFLHlCQUF5QjtZQUNqQyxJQUFJLEVBQUUsRUFBRTtTQUNYLENBQUMsQ0FBQztJQUNQLENBQUM7U0FBTSxJQUFJLFNBQVMsQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDekMsSUFBSSxRQUFRLEdBQUcsTUFBTSxjQUFjLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMxRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDWixPQUFPO1FBQ1gsQ0FBQztRQUNELElBQUksR0FBRyxHQUFHLE1BQU0sY0FBYyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ2pELElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUFDLE9BQU87UUFBQyxDQUFDO1FBQ3JCLElBQUksRUFBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUseUJBQXlCLEVBQUMsR0FBRyxHQUFHLENBQUM7UUFDdEUsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMs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UUFFbkMsSUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMseUJBQXlCLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUN6Qyx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ3hELENBQUM7UUFDRCx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBQyxRQUFRLEVBQUUsUUFBa0IsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztRQUV0RixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDNUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDakMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLGVBQWUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBMUJxQiwrQkFBZ0IsbUJBMEJyQyxDQUFBO0lBRU0sS0FBSyxVQUFVLFdBQVcsQ0FBQyxJQUFZO1FBQzFDLElBQUksUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzlFLGFBQWE7UUFDYixJQUFJLElBQUksR0FBVyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ2pDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLDJCQUEyQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3JELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFOcUIsMEJBQVcsY0FNaEMsQ0FBQTtBQUNMLENBQUMsRUEvR2EsY0FBYyw4QkFBZCxjQUFjLFFBK0czQiIsInNvdXJjZXNDb250ZW50IjpbIlxyXG5pbXBvcnQgeyBBc3NldEluZm8gfSBmcm9tIFwiQGNvY29zL2NyZWF0b3ItdHlwZXMvZWRpdG9yL3BhY2thZ2VzL2Fzc2V0LWRiL0B0eXBlcy9wdWJsaWNcIjtcclxuaW1wb3J0IHsgSU5vZGUgfSBmcm9tIFwiQGNvY29zL2NyZWF0b3ItdHlwZXMvZWRpdG9yL3BhY2thZ2VzL3NjZW5lL0B0eXBlcy9wdWJsaWNcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuXHJcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uQXNzZXRDaGFuZ2UodXVpZDogc3RyaW5nLCBhc3NldEluZm86IEFzc2V0SW5mbykge1xyXG4gICAgLy8gVE9ETyDliKTmlq1wcmVmYWLlj5jljJbvvIzmo4DmtYvlvZPliY1wcmVmYWLkuIvlr7nlupTnmoToioLngrnot6/lvoTmmK/lkKbmnInkv67mlLnvvIzlpoLmnpzmnInvvIzliJnmib7lh7rkv67mlLnvvIzlubbliKDpmaTnm7jlupTnmoToioLngrnot6/lvoTmlbDmja7jgILvvIjlkIzml7bpnIDopoHmnInlvJXnlKjliLDlvZPliY3oioLngrnot6/lvoTnmoTmlbDmja7vvIlcclxuICAgIC8vIGNvbnNvbGUubG9nKFwidXVpZFwiLCB1dWlkKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiYXNzZXRJbmZvXCIsIGFzc2V0SW5mbyk7XHJcblxyXG4gICAgaWYgKGFzc2V0SW5mby5uYW1lID09PSBcIk5vZGVQYXRocy5qc29uXCIpIHtcclxuICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5zZW5kKCdzY2VuZScsICdleGVjdXRlLXNjZW5lLXNjcmlwdCcsIHtcclxuICAgICAgICAgICAgbmFtZTogJ29vcHMtY29waWxvdCcsXHJcbiAgICAgICAgICAgIG1ldGhvZDogJ25vZGVQYXRoUGx1Z2luUmVzZXREYXRhJyxcclxuICAgICAgICAgICAgYXJnczogW10sXHJcbiAgICAgICAgfSk7XHJcbiAgICB9IGVsc2UgaWYgKGFzc2V0SW5mby5pbXBvcnRlciA9PT0gXCJwcmVmYWJcIikge1xyXG4gICAgICAgIGxldCBqc29uUGF0aCA9IGF3YWl0IE5vZGVQYXRoUGx1Z2luLmdldE5vZGVQYXRoSnNvblBhdGgoKTtcclxuICAgICAgICBpZiAoIWpzb25QYXRoKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHJldCA9IGF3YWl0IE5vZGVQYXRoUGx1Z2luLmdldE5vZGVQYXRoc09iaigpO1xyXG4gICAgICAgIGlmICghcmV0KSB7IHJldHVybjsgfVxyXG4gICAgICAgIGxldCB7bm9kZVBhdGhzT2JqLCBpZFRvTm9kZVBhdGhPYmpzLCBwcmVmYWJOb2RlUGF0aFRvSWRPYmpzQXJyfSA9IHJldDtcclxuICAgICAgICBsZXQgbmFtZSA9IGFzc2V0SW5mby5uYW1lLnJlcGxhY2UoXCIucHJlZmFiXCIsIFwiXCIpO1xyXG4gICAgICAgIGlmICghcHJlZmFiTm9kZVBhdGhUb0lkT2Jqc0FycltuYW1lXSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBub2RlVXVpZHMgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdxdWVyeS1ub2Rlcy1ieS1hc3NldC11dWlkJywgdXVpZCk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJub2RlVXVpZHNcIiwgbm9kZVV1aWRzKTtcclxuICAgICAgICBpZiAobm9kZVV1aWRzLmxlbmd0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHF1ZXJ5UmV0ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktbm9kZS10cmVlJywgbm9kZVV1aWRzWzBdKTtcclxuICAgICAgICBsZXQgbm9kZVRyZWUgPSBxdWVyeVJldCBhcyB1bmtub3duIGFzIElOb2RlO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwibm9kZVRyZWVcIiwgbm9kZVRyZWUpO1xyXG4gICAgICAgIGlmICghbm9kZVRyZWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGRpcnR5SWRzOiBBcnJheTx7W2tleTogc3RyaW5nXTogc3RyaW5nfT4gPSBbXTtcclxuICAgICAgICBwcmVmYWJOb2RlUGF0aFRvSWRPYmpzQXJyW25hbWVdLmZvckVhY2goKHZhbHVlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgbGV0IG5vZGVQYXRoID0gdmFsdWUubm9kZVBhdGg7XHJcbiAgICAgICAgICAgIGlmICghTm9kZVBhdGhQbHVnaW4uZmluZE5vZGUobm9kZVRyZWUsIG5vZGVQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgZGlydHlJZHMucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKGRpcnR5SWRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IGxvZ0Fycjogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICAgICAgZGlydHlJZHMuZm9yRWFjaCh2YWx1ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgaWRUb05vZGVQYXRoT2Jqc1t2YWx1ZS5pZF07XHJcbiAgICAgICAgICAgICAgICBsb2dBcnIucHVzaChgaWQ6ICR7dmFsdWUuaWR9IG5vZGVQYXRoOiAke3ZhbHVlLm5vZGVQYXRofWApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbGV0IGpzb24gPSBKU09OLnN0cmluZ2lmeShpZFRvTm9kZVBhdGhPYmpzKTtcclxuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhqc29uUGF0aCwganNvbik7XHJcblxyXG4gICAgICAgICAgICBFZGl0b3IuRGlhbG9nLndhcm4oYCR7bG9nQXJyLmpvaW4oJ1xcbicpfVxcbuiKgueCueS4jeWtmOWcqO+8jOivt+aOkuafpeebuOWFs+mFjee9ru+8gWApO1xyXG5cclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2lkVG9Ob2RlUGF0aE9ianMnLCBpZFRvTm9kZVBhdGhPYmpzKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnNlbmQoJ3NjZW5lJywgJ2V4ZWN1dGUtc2NlbmUtc2NyaXB0Jywge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ29vcHMtY29waWxvdCcsXHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdub2RlUGF0aFBsdWdpblJlc2V0RGF0YScsXHJcbiAgICAgICAgICAgICAgICBhcmdzOiBbXSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb25Ob2RlTWVudSh2YWx1ZTogYW55KSB7XHJcbiAgICBsZXQgcGF0aCA9IGF3YWl0IE5vZGVQYXRoUGx1Z2luLmdldE5vZGVQYXRoKHZhbHVlLnV1aWQpO1xyXG4gICAgbGV0IHJldDogYW55ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnZXhlY3V0ZS1zY2VuZS1zY3JpcHQnLCB7XHJcbiAgICAgICAgbmFtZTogJ29vcHMtY29waWxvdCcsXHJcbiAgICAgICAgbWV0aG9kOiAncXVlcnlOb2RlUGF0aHNPYmonLFxyXG4gICAgICAgIGFyZ3M6IFtdLFxyXG4gICAgfSk7XHJcbiAgICAvLyBjb25zb2xlLmxvZygncmV0JywgcmV0KTtcclxuICAgIGlmICghcmV0KSB7IHJldHVybjsgfVxyXG4gICAgbGV0IHtub2RlUGF0aHNPYmosIGlkVG9Ob2RlUGF0aE9ianMsIHByZWZhYk5vZGVQYXRoVG9JZE9ianNBcnJ9ID0gcmV0O1xyXG4gICAgbGV0IGdlbmVyYXRlTm9kZVBhdGhFbmFibGVkID0gdHJ1ZTtcclxuICAgIGxldCBub2RlUGF0aElkID0gJyc7XHJcbiAgICBpZiAobm9kZVBhdGhzT2JqICYmIG5vZGVQYXRoc09ialtwYXRoXSkge1xyXG4gICAgICAgIGdlbmVyYXRlTm9kZVBhdGhFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgbm9kZVBhdGhJZCA9ICc6ICcgKyBub2RlUGF0aHNPYmpbcGF0aF07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6IGBHZW5lcmF0ZU5vZGVQYXRoJHtub2RlUGF0aElkfWAsXHJcbiAgICAgICAgICAgIHZpc2libGU6IEVkaXRvci5FZGl0TW9kZS5nZXRNb2RlKCkgPT0gXCJwcmVmYWJcIiwgLy8g6Z2ecHJlZmFi6aKE6KeI5qih5byP5LiN5Y+v6KeBXHJcbiAgICAgICAgICAgIGVuYWJsZWQ6IGdlbmVyYXRlTm9kZVBhdGhFbmFibGVkLCAvLyDlt7LnlJ/miJDnmoTot6/lvoTkuI3lj6/ku6Xlho3mrKHngrnlh7tcclxuICAgICAgICAgICAgY2xpY2s6IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIE5vZGVQYXRoUGx1Z2luLmdlbmVyYXRlTm9kZVBhdGgocGF0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgXTtcclxufVxyXG5cclxuZXhwb3J0IG1vZHVsZSBOb2RlUGF0aFBsdWdpbiB7XHJcbiAgICBsZXQgbm9kZVBhdGhNYXhJZDogbnVtYmVyID0gMDtcclxuICAgIGxldCBub2RlUGF0aFRvSWRPYmpzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfXxudWxsID0gbnVsbDtcclxuICAgIGxldCBpZFRvTm9kZVBhdGhPYmpzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfXxudWxsID0gbnVsbDtcclxuICAgIGxldCBwcmVmYWJOb2RlUGF0aFRvSWRPYmpzQXJyOiAge1trZXk6IHN0cmluZ106IEFycmF5PHtba2V5OiBzdHJpbmddOiBzdHJpbmd9Pn18bnVsbCA9IG51bGw7XHJcbiAgICBsZXQgbm9kZVBhdGhKc29uUGF0aDogc3RyaW5nID0gbnVsbCE7XHJcblxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHJlc2V0RGF0YSgpIHtcclxuICAgICAgICBub2RlUGF0aFRvSWRPYmpzID0gbnVsbDtcclxuICAgICAgICBpZFRvTm9kZVBhdGhPYmpzID0gbnVsbDtcclxuICAgICAgICBwcmVmYWJOb2RlUGF0aFRvSWRPYmpzQXJyID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZmluZE5vZGUobm9kZVRyZWU6IElOb2RlLCBub2RlUGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IG5vZGVQYXRoQXJyID0gbm9kZVBhdGguc3BsaXQoJy8nKTtcclxuICAgICAgICBsZXQgbm9kZU5hbWUgPSBub2RlUGF0aEFyci5zaGlmdCgpO1xyXG4gICAgICAgIGxldCBuYW1lID0gbm9kZVRyZWUubmFtZSBhcyB1bmtub3duIGFzIHN0cmluZztcclxuICAgICAgICBpZiAobmFtZSA9PSBub2RlTmFtZSkge1xyXG4gICAgICAgICAgICBpZiAobm9kZVBhdGhBcnIubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG5vZGVUcmVlLmNoaWxkcmVuLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCByZXQgPSBmaW5kTm9kZShub2RlVHJlZS5jaGlsZHJlbltpbmRleF0sIG5vZGVQYXRoQXJyLmpvaW4oJy8nKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJldCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Tm9kZVBhdGhKc29uUGF0aCgpIHtcclxuICAgICAgICBpZiAoIW5vZGVQYXRoSnNvblBhdGgpIHtcclxuICAgICAgICAgICAgLy8gY29uc3QgY29uZmlnID0gYXdhaXQgRWRpdG9yLlByb2ZpbGUuZ2V0UHJvamVjdChwYWNrYWdlSlNPTi5uYW1lKTtcclxuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gYXdhaXQgRWRpdG9yLlByb2ZpbGUuZ2V0UHJvamVjdCgnb29wcy1wbHVnaW4tZXhjZWwtdG8tanNvbicpO1xyXG4gICAgICAgICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5QYXRoSnNvbkNsaWVudCkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVBhdGhKc29uUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsIGNvbmZpZy5QYXRoSnNvbkNsaWVudC5yZXBsYWNlKFwicHJvamVjdDovL1wiLCBcIi4uLy4uLy4uL1wiKSArIFwiL05vZGVQYXRocy5qc29uXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBub2RlUGF0aEpzb25QYXRoO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Tm9kZVBhdGhzT2JqKCkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdpZFRvTm9kZVBhdGhPYmpzJywgaWRUb05vZGVQYXRoT2Jqcyk7XHJcbiAgICAgICAgaWYgKCFub2RlUGF0aFRvSWRPYmpzIHx8ICFpZFRvTm9kZVBhdGhPYmpzIHx8ICFwcmVmYWJOb2RlUGF0aFRvSWRPYmpzQXJyKSB7XHJcbiAgICAgICAgICAgIGxldCBqc29uUGF0aCA9IGF3YWl0IGdldE5vZGVQYXRoSnNvblBhdGgoKTtcclxuICAgICAgICAgICAgaWYgKCFqc29uUGF0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBqc29uID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGpzb25QYXRoKSkge1xyXG4gICAgICAgICAgICAgICAganNvbj0gZnMucmVhZEZpbGVTeW5jKGpzb25QYXRoLCAndXRmOCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5vZGVQYXRoTWF4SWQgPSAxMDAwMDtcclxuICAgICAgICAgICAgbm9kZVBhdGhUb0lkT2JqcyA9IHt9O1xyXG4gICAgICAgICAgICBpZFRvTm9kZVBhdGhPYmpzID0ge307XHJcbiAgICAgICAgICAgIHByZWZhYk5vZGVQYXRoVG9JZE9ianNBcnIgPSB7fTtcclxuICAgICAgICAgICAgY29uc3Qgb2JqID0gSlNPTi5wYXJzZShqc29uKTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBbaWQsIG5vZGVQYXRoXSBvZiBPYmplY3QuZW50cmllcyhvYmopKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlUGF0aFRvSWRPYmpzW25vZGVQYXRoIGFzIHN0cmluZ10gPSBpZDtcclxuICAgICAgICAgICAgICAgIGlkVG9Ob2RlUGF0aE9ianNbaWRdID0gbm9kZVBhdGggYXMgc3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgbm9kZVBhdGhNYXhJZCA9IE1hdGgubWF4KG5vZGVQYXRoTWF4SWQsIHBhcnNlSW50KGlkKSk7XHJcbiAgICBcclxuICAgICAgICAgICAgICAgIGxldCBwcmVmYWJOYW1lID0gKG5vZGVQYXRoIGFzIHN0cmluZykuc3BsaXQoJy8nKVswXTtcclxuICAgICAgICAgICAgICAgIGlmICghcHJlZmFiTm9kZVBhdGhUb0lkT2Jqc0FycltwcmVmYWJOYW1lXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHByZWZhYk5vZGVQYXRoVG9JZE9ianNBcnJbcHJlZmFiTmFtZV0gPSBuZXcgQXJyYXkoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHByZWZhYk5vZGVQYXRoVG9JZE9ianNBcnJbcHJlZmFiTmFtZV0ucHVzaCh7bm9kZVBhdGg6IG5vZGVQYXRoIGFzIHN0cmluZywgaWQ6IGlkfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtub2RlUGF0aHNPYmo6IG5vZGVQYXRoVG9JZE9ianMsIGlkVG9Ob2RlUGF0aE9ianM6IGlkVG9Ob2RlUGF0aE9ianMsIHByZWZhYk5vZGVQYXRoVG9JZE9ianNBcnI6IHByZWZhYk5vZGVQYXRoVG9JZE9ianNBcnJ9O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVOb2RlUGF0aChub2RlUGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IGpzb25QYXRoID0gYXdhaXQgZ2V0Tm9kZVBhdGhKc29uUGF0aCgpO1xyXG4gICAgICAgIGlmICghanNvblBhdGgpIHtcclxuICAgICAgICAgICAgLy8gRWRpdG9yLkRpYWxvZy53YXJuKCfpobnnm67orr7nva4+bm9kZS1wYXRoLXBsdWdpbj5Ob2RlUGF0aEpzb24g5pyq6YWN572uJylcclxuICAgICAgICAgICAgRWRpdG9yLkRpYWxvZy53YXJuKGAke25vZGVQYXRofeiKgueCuei3r+W+hOeUn+aIkOWksei0pe+8gWApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgbGV0IHJldCA9IGF3YWl0IGdldE5vZGVQYXRoc09iaigpO1xyXG4gICAgICAgIGlmICghcmV0KSB7IHJldHVybjsgfVxyXG4gICAgICAgIGxldCB7bm9kZVBhdGhzT2JqLCBpZFRvTm9kZVBhdGhPYmpzLCBwcmVmYWJOb2RlUGF0aFRvSWRPYmpzQXJyfSA9IHJldDtcclxuICAgICAgICBpZiAobm9kZVBhdGhzT2JqW25vZGVQYXRoXSkgeyByZXR1cm47IH1cclxuICAgICAgICBub2RlUGF0aE1heElkKys7XHJcbiAgICAgICAgbGV0IGlkU3RyID0gYCR7bm9kZVBhdGhNYXhJZH1gO1xyXG4gICAgICAgIG5vZGVQYXRoc09ialtub2RlUGF0aF0gPSBpZFN0cjtcclxuICAgICAgICBpZFRvTm9kZVBhdGhPYmpzW2lkU3RyXSA9IG5vZGVQYXRoO1xyXG4gICAgXHJcbiAgICAgICAgbGV0IHByZWZhYk5hbWUgPSBub2RlUGF0aC5zcGxpdCgnLycpWzBdO1xyXG4gICAgICAgIGlmICghcHJlZmFiTm9kZVBhdGhUb0lkT2Jqc0FycltwcmVmYWJOYW1lXSkge1xyXG4gICAgICAgICAgICBwcmVmYWJOb2RlUGF0aFRvSWRPYmpzQXJyW3ByZWZhYk5hbWVdID0gbmV3IEFycmF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByZWZhYk5vZGVQYXRoVG9JZE9ianNBcnJbcHJlZmFiTmFtZV0ucHVzaCh7bm9kZVBhdGg6IG5vZGVQYXRoIGFzIHN0cmluZywgaWQ6IGlkU3RyfSk7XHJcbiAgICBcclxuICAgICAgICBsZXQganNvbiA9IEpTT04uc3RyaW5naWZ5KGlkVG9Ob2RlUGF0aE9ianMpO1xyXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoanNvblBhdGgsIGpzb24pO1xyXG4gICAgICAgIEVkaXRvci5EaWFsb2cuaW5mbyhgJHtub2RlUGF0aH3oioLngrnot6/lvoTnlJ/miJDmiJDlip/vvIFpZO+8miR7aWRTdHJ9YCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXROb2RlUGF0aCh1dWlkOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgbm9kZVRyZWUgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdxdWVyeS1ub2RlLXRyZWUnLCB1dWlkKTtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgbGV0IHBhdGg6IHN0cmluZyA9IG5vZGVUcmVlLnBhdGg7XHJcbiAgICAgICAgcGF0aCA9IHBhdGgucmVwbGFjZSgnc2hvdWxkX2hpZGVfaW5faGllcmFyY2h5LycsICcnKTtcclxuICAgICAgICByZXR1cm4gcGF0aDtcclxuICAgIH1cclxufSJdfQ==