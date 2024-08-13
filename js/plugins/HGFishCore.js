//=============================================================================
// HGFishCore.js
//=============================================================================

/*:
 * @plugindesc 钓鱼与烹饪
 * @author Lars
 */

var HGFishCore = window.HGFishCore || {} ;


HGFishCore.Game_Player_executeMove = Game_Player.prototype.executeMove


Game_Player.prototype.executeMove = function(direction) {
    this.moveStraight(direction);
    //移动时取消钓鱼
    $gameVariables.setValue(161,-1);
};



