//=============================================================================
// HGSkEffExt.js
//=============================================================================

/*:
 * @plugindesc Skill Effect Extension by c2h6o for Hanabi Gakuen
 * @author c2h6o
 *
 * @help Extended effects for skills.
 *  - reflects half of the damage deals back to user
 *  - absolute critical damage
 *  - customized repeats
 *  - turn based damage by states
 *  - post state effect: next state
 *  - state dependent defense absence
 * 
 * This plugin works with HGPlgCore.
 * 
 * - Developer Info -
 * at rpg_objects.js
 *      Method "Game_Action.prototype.executeDamage" is overwritten in 
 *      this plugin, 
 *      Method "Game_Action.prototype.makeDamageValue" is overwritten in 
 *      this plugin, 
 *      Method "Game_Action.prototype.numRepeats" is overwritten in 
 *      this plugin.
 *      Method "Game_Battler.prototype.updateStateTurns" is overwritten in 
 *      this plugin.
 *      Method "Game_Battler.prototype.removeStatesAuto" is overwritten in 
 *      this plugin.
*/
var HGSkEffExt = window.HGSkEffExt || {} ;

HGSkEffExt.reflDmgIds = [//reflects half of the damage deals back to user
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
    this.dmg(target, value);
};
HGSkEffExt.dmg = function(target, value){
    target.gainHp(-value);
    if (value > 0) {
        target.onDamage(value);
    }
};

HGSkEffExt.acritSkId = [34, 54, 91];//absolute critical damage
HGSkEffExt._GameAction_makeDamageValue = Game_Action.prototype.makeDamageValue;
Game_Action.prototype.makeDamageValue = function(target, critical) {
    return HGSkEffExt._GameAction_makeDamageValue.call(this, target, 
        (critical || ((DataManager.isSkill(this.item())) && (HGSkEffExt.acritSkId.includes(this.item().id)))));
};

HGSkEffExt.custRepSkId = [//customized repeats
    {id: 36, repeat: 12},
    {id: 89, repeat: 10},
    {id: 90, repeat: 12}
];
HGSkEffExt._GameAction_numRepeats = Game_Action.prototype.numRepeats;
Game_Action.prototype.numRepeats = function(){
    for(let i = 0; i < HGSkEffExt.custRepSkId.length; i++){
        if((DataManager.isSkill(this.item())) && ((this.item().id) == (HGSkEffExt.custRepSkId[i].id))){
            return HGSkEffExt.custRepSkId.repeat;
        }
    }
    return HGSkEffExt._GameAction_numRepeats.call(this);
};

HGSkEffExt.tnDmgStId = [//turn based damage by states
    {id: 21, dmg: 500, perc: false},
    {id: 24, dmg: 500, perc: false},
    {id: 28, dmg: 1, perc: true}
];
HGSkEffExt._GameBattlerBase_updateStateTurns = Game_BattlerBase.prototype.updateStateTurns;
Game_Battler.prototype.updateStateTurns = function(){
    this._states.forEach(function(stateId) {
        if (this._stateTurns[stateId] > 0) {
            for(let i = 0; i < HGSkEffExt.tnDmgStId.length; i++){
                let st = HGSkEffExt.tnDmgStId[i];
                if(st.id == stateId){
                    HGSkEffExt.dmg(this, ((st.perc)?(Math.round((this._hp)/100)):(st.dmg)));
                }
            }
        }
    }, this);
    HGSkEffExt._GameBattlerBase_updateStateTurns.call(this);
};

HGSkEffExt.aftEffStId = [//post state effect: next state
    {id: 26, nid: 14},
    {id: 27, nid: 14}
];
HGSkEffExt._GameBattler_removeStatesAuto = Game_Battler.prototype.removeStatesAuto;
Game_Battler.prototype.removeStatesAuto = function(timing){
    for(let j=0; j< this.states().length; j++){
        let st = this.states()[j];
        if (this.isStateExpired(st.id) && st.autoRemovalTiming === timing) {
            for(let i = 0; i < HGSkEffExt.aftEffStId.length; i++){
                if((String(HGSkEffExt.aftEffStId[i].id)) == (String(st.id))){
                    this.addState(HGSkEffExt.aftEffStId[i].nid);
                }
            }
        }
    }
    HGSkEffExt._GameBattler_removeStatesAuto.call(this, timing);
};

// HGSkEffExt.condDfAbstId = [//state dependent defense absence
//     {skId: 56, stId: 23, addFormula: "+ b.mdf * 2"}
// ];
// HGSkEffExt._GameAction_evalDamageFormula = Game_Action.prototype.evalDamageFormula;
// Game_Action.prototype.evalDamageFormula = function(target){
//     try{
//         let res =  HGSkEffExt._GameAction_evalDamageFormula.call(this, target);
//         for(let i = 0; i<HGSkEffExt.condDfAbstId.length; i++){
//             if((DataManager.isSkill(this.item())) && (this.item().id == HGSkEffExt.condDfAbstId[i].skId) 
//             && (target.isStateAffected(HGSkEffExt.condDfAbstId[i].stId))){
//                 var item = this.item();
//                 var a = this.subject();
//                 var b = target;
//                 var v = $gameVariables._data;
//                 var sign = ([3, 4].contains(item.damage.type) ? -1 : 1);
//                 return Math.max(eval(item.damage.formula+(HGSkEffExt.condDfAbstId[i].addFormula)), 0) * sign;
//             }
//         }
//     }catch(e){
//         return 0;
//     }
// };

HGSkEffExt.poiStId = 44;