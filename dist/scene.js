'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = exports.unload = exports.load = void 0;
// @ts-ignore
const package_json_1 = __importDefault(require("../package.json"));
function load() { }
exports.load = load;
function unload() { }
exports.unload = unload;
exports.methods = {
    /**
     * 刷新语言缓存
     */
    async refreshLanguage() {
        const win = window;
        debugger;
        const config = await Editor.Profile.getProject(package_json_1.default.name);
        const currentLanguage = config['Current Language'] || 'zh';
        win.language;
        win.languageManager.setLanguage(currentLanguage);
        // @ts-ignore
        cce.Engine.repaintInEditMode();
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NlbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2Uvc2NlbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7QUFFYixhQUFhO0FBQ2IsbUVBQTBDO0FBRTFDLFNBQWdCLElBQUksS0FBSyxDQUFDO0FBQTFCLG9CQUEwQjtBQUUxQixTQUFnQixNQUFNLEtBQUssQ0FBQztBQUE1Qix3QkFBNEI7QUFFZixRQUFBLE9BQU8sR0FBRztJQUNuQjs7T0FFRztJQUNILEtBQUssQ0FBQyxlQUFlO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLE1BQWEsQ0FBQztRQUMxQixRQUFRLENBQUM7UUFFVCxNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLHNCQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakUsTUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQUksSUFBSSxDQUFDO1FBRTNELEdBQUcsQ0FBQyxRQUFRLENBQUE7UUFDWixHQUFHLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNqRCxhQUFhO1FBQ2IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ25DLENBQUM7Q0FDSixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgcGFja2FnZUpTT04gZnJvbSAnLi4vcGFja2FnZS5qc29uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWQoKSB7IH1cblxuZXhwb3J0IGZ1bmN0aW9uIHVubG9hZCgpIHsgfVxuXG5leHBvcnQgY29uc3QgbWV0aG9kcyA9IHtcbiAgICAvKipcbiAgICAgKiDliLfmlrDor63oqIDnvJPlrZhcbiAgICAgKi9cbiAgICBhc3luYyByZWZyZXNoTGFuZ3VhZ2UoKSB7XG4gICAgICAgIGNvbnN0IHdpbiA9IHdpbmRvdyBhcyBhbnk7XG4gICAgICAgIGRlYnVnZ2VyO1xuXG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IGF3YWl0IEVkaXRvci5Qcm9maWxlLmdldFByb2plY3QocGFja2FnZUpTT04ubmFtZSk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRMYW5ndWFnZSA9IGNvbmZpZ1snQ3VycmVudCBMYW5ndWFnZSddIHx8ICd6aCc7XG5cbiAgICAgICAgd2luLmxhbmd1YWdlXG4gICAgICAgIHdpbi5sYW5ndWFnZU1hbmFnZXIuc2V0TGFuZ3VhZ2UoY3VycmVudExhbmd1YWdlKTtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBjY2UuRW5naW5lLnJlcGFpbnRJbkVkaXRNb2RlKCk7XG4gICAgfSxcbn0iXX0=