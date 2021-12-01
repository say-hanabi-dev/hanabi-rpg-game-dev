//=============================================================================
// HGSkEffExt.js
//=============================================================================

/*:
 * @plugindesc Skill Effect Extension by c2h6o for Hanabi Gakuen
 * @author c2h6o
 *
 * @help Extended effects for skills.
 * 
 * This plugin works with HGPlgCore.
 * 
 * - Developer Info -
 * at rpg_objects.js
 *      Method "Game_Action.prototype.executeDamage" is overwritten in 
 *      this plugin, 
*/
var HGSkEffExt = window.HGSkEffExt || {} ;

HGSkEffExt.reflDmgIds = [
    {id: 8, ratio: 0.5}
];
HGSkEffExt._GameAction_exeDmg = Game_Action.prototype.executeDamage;
Game_Action.prototype.executeDamage = function(target, value){
    HGSkEffExt._GameAction_exeDmg.call(this, target, value);
    if((this._item) && (this._item.isSkill()) && (HGPlgCore.getIdObj(HGSkEffExt.reflDmgIds, this._item.itemId()))){
        HGSkEffExt.reflDmg(this.subject(), Math.round(value*(HGPlgCore.getIdObj(HGSkEffExt.reflDmgIds, this._item.itemId())).ratio));
    }
};
HGSkEffExt.reflDmg = function(target, value){
    target.gainHp(-value);
    if (value > 0) {
        target.onDamage(value);
    }
};

HGSkEffExt.poiStId = 44;