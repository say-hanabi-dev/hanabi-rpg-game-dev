//=============================================================================
// HGSkipLdLst.js
//=============================================================================

/*:
 * @plugindesc Skip loading list, load the first save
 * @author c2h6o
 *
 * @help 
 * 
 * - Developer Info -
 * Warning: 
 * at rpg_scenes.js
 *      Method "Scene_Title.prototype.commandContinue" is overwritten in 
 *      this plugin
 *      Method "Scene_Title.prototype.terminate" is overwritten in 
 *      this plugin
 */

var HGSkipLdLst = window.HGSkipLdLst || {} ;
HGSkipLdLst.defLdSaveId = 1;
Scene_Title.prototype.commandContinue = function(){
    this._commandWindow.close();
    HGSkipLdLst.loadSave(this, HGSkipLdLst.defLdSaveId);
};
Scene_Title.prototype.terminate = function(){
    Scene_Base.prototype.terminate.call(this);
    HGSkipLdLst.onTerminate();
};

HGSkipLdLst._loadSuccess = false;
HGSkipLdLst.loadSave = function(thisArg, savefileId){
    if (DataManager.loadGame(savefileId)) {
        // SoundManager.playLoad();
        thisArg.fadeOutAll();
        if ($gameSystem.versionId() !== $dataSystem.versionId) {
            $gamePlayer.reserveTransfer($gameMap.mapId(), $gamePlayer.x, $gamePlayer.y);
            $gamePlayer.requestMapReload();
        }
        SceneManager.goto(Scene_Map);
        this._loadSuccess = true;
    } else {
        SoundManager.playBuzzer();
        thisArg._commandWindow.open();
    }
};
HGSkipLdLst.onTerminate = function(){
    if (this._loadSuccess) {
        $gameSystem.onAfterLoad();
    }
};
Scene_Menu.prototype.commandSave = function() {
    $gameSystem.onBeforeSave();
    if (DataManager.saveGame(HGSkipLdLst.defLdSaveId)) {
        SoundManager.playSave();
        this.popScene();
    } else {
        SoundManager.playBuzzer();
    }
};