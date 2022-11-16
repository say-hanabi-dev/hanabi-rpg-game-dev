/*
 * - Developer Info -
 * at rpg_objects.js
 *      Method "Game_Actor.prototype.paramMax" is overwritten in 
 *      this plugin.
 *      Method "Game_BattlerBase.prototype.paramMax" is overwritten in 
 *      this plugin.
 */
var HGParMax = window.HGParMax || {} ;

HGParMax._GameActor_paramMax = Game_Actor.prototype.paramMax;
Game_Actor.prototype.paramMax = function(paramId) {
    if (paramId === 0) {
        return 9999 + $gameVariables.value(113) + $gameVariables.value(114) + $gameVariables.value(115);    // MHP
    }
    return HGParMax._GameActor_paramMax.call(this, paramId);
};

HGParMax._GameBattlerBase_paramMax = Game_BattlerBase.prototype.paramMax;
Game_BattlerBase.prototype.paramMax = function(paramId) {
    if (paramId >= 2) {
        return 999 + $gameVariables.value(112);
    }else{
        return HGParMax._GameBattlerBase_paramMax.call(this, paramId);
    }
};
