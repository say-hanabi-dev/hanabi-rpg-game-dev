//=============================================================================
// HGGdCnf.js
//=============================================================================

/*:
 * @plugindesc Guard Skill Confirmation by c2h6o for Hanabi Gakuen
 * @author c2h6o
 *
 * @help The appearance of the confirmation message follows the user's choice 
 * of the guard skill.
 * 
 * - Developer Info -
 * Warning: 
 * at rpg_scenes.js
 *      Method "Scene_Battle.prototype.commandGuard" is overwritten in 
 *      this plugin.
 */

var HGGdCnf = window.HGGdCnf || {} ;
HGGdCnf.guardConfirmInfo = { 
    message: "确定防御吗?",
    choices: [
        "防御", "返回"
    ],
    defaultInd: 0,
    cancelInd: 1
};
HGGdCnf._std_commandGuard = Scene_Battle.prototype.commandGuard;
HGGdCnf.guardConfirm = function(scBatPtr){
    $gameMessage.setChoices(this.guardConfirmInfo.choices, this.guardConfirmInfo.defaultInd, this.guardConfirmInfo.cancelInd);
    $gameMessage.setChoiceCallback((x)=>{//everything after the choice is made
        if(x == 0){
            this._std_commandGuard.call(scBatPtr);
            SceneManager._scene._actorCommandWindow.deactivate();//essential to continue updating
        }else{
            SceneManager._scene._actorCommandWindow.open();//closed due to showing text
        }
    });
    $gameMessage.add(this.guardConfirmInfo.message);
};
Scene_Battle.prototype.commandGuard = function() {
    HGGdCnf.guardConfirm(this);
};