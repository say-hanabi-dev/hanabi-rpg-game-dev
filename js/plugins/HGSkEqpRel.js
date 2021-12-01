//=============================================================================
// HGSkEqpRel.js
//=============================================================================

/*:
 * @plugindesc Relationships of Skills & Equipments by c2h6o for Hanabi Gakuen
 * @author c2h6o
 *
 * @help Effects to skills by which equipped:
 *  - 70% damage of magic skills when magic weapon not equipped
 *  - 20% additional damage of critical hits when sword equipped 
 *  - shields skills: require shield/Large shield; large shield skills: require Large shield
 *  - add taunt state when guard with shield/Large shield equipped
 * 
 * This plugin works with HGPlgCore.
 * 
 * - Developer Info -
 * Warning: 
 * at rpg_objects.js
 *      Method "Game_Action.prototype.evalDamageFormula" is overwritten in 
 *      this plugin,
 *      Method "Game_Action.prototype.applyCritical" is overwritten in 
 *      this plugin,
 *      Method "Game_Actor.prototype.isSkillWtypeOk" is overwritten in 
 *      this plugin.
 * at rpg_scenes.js
 *      Method "Scene_Battle.prototype.commandGuard" is overwritten in 
 *      this plugin.
 */

var HGSkEqpRel = window.HGSkEqpRel || {} ;
HGSkEqpRel.magWpTId = 4;
HGSkEqpRel.rule = [
    {spec: (skill)=>((skill.stypeId == 5)||(skill.stypeId == 6)), cond:()=>(!HGPlgCore.isWpTpEqp(HGSkEqpRel.magWpTId)), opr:(dmg)=>(dmg*0.7)}
];
HGSkEqpRel._GameAction_evalDamageFormula = Game_Action.prototype.evalDamageFormula;
Game_Action.prototype.evalDamageFormula = function(target){
    let res = HGSkEqpRel._GameAction_evalDamageFormula.call(this, target);
    try{
        for(let i =0; i<HGSkEqpRel.rule.length; i++){
            if(HGSkEqpRel.rule[i].spec(this.item()) && HGSkEqpRel.rule[i].cond()){
                res = HGSkEqpRel.rule[i].opr(res);
            }
        }
    }catch(e){
    }
    return res;
};

HGSkEqpRel.swordTId = 1;
HGSkEqpRel._GameAction_applyCritical = Game_Action.prototype.applyCritical;
Game_Action.prototype.applyCritical = function(damage) {
    return HGSkEqpRel._GameAction_applyCritical.call(this, damage) * ((HGPlgCore.isWpTpEqp(HGSkEqpRel.swordTId)?(1.2):1));
};

HGSkEqpRel.shdSkTId = 3;
HGSkEqpRel.shdTId = 5;
HGSkEqpRel.bshdTId = 6;
HGSkEqpRel.megBshdTId = 2;
HGSkEqpRel._GameActor_isSkillWtypeOk = Game_Actor.prototype.isSkillWtypeOk;
Game_Actor.prototype.isSkillWtypeOk = function(skill){
    return HGSkEqpRel._GameActor_isSkillWtypeOk.call(this, skill) && HGSkEqpRel.shdSkOk(skill);
};
HGSkEqpRel.shdSkOk = function(skill){
    if(skill.stypeId == HGSkEqpRel.shdSkTId){
        if(HGPlgCore.isAmTpEqp(HGSkEqpRel.bshdTId)||HGPlgCore.isAmTpEqp(HGSkEqpRel.megBshdTId)){
            return true;
        }else{
            return (skill.id >= 13 && skill.id <= 15) && (HGPlgCore.isAmTpEqp(HGSkEqpRel.shdTId));
        }
    }
    return true;
};

HGSkEqpRel.tauntId = 13;
HGSkEqpRel._SceneBattle_commandGuard = Scene_Battle.prototype.commandGuard;
Scene_Battle.prototype.commandGuard = function(){
    if(HGPlgCore.isAmTpEqp(HGSkEqpRel.bshdTId)||HGPlgCore.isAmTpEqp(HGSkEqpRel.megBshdTId)||(HGPlgCore.isAmTpEqp(HGSkEqpRel.shdTId))){
        HGSkEqpRel.taunt();
    }
    HGSkEqpRel._SceneBattle_commandGuard.call(this);
};
HGSkEqpRel.taunt = function(){
    if (BattleManager.actor().isStateAddable(HGSkEqpRel.tauntId)) {
        if (!BattleManager.actor().isStateAffected(HGSkEqpRel.tauntId)) {
            BattleManager.actor().addNewState(HGSkEqpRel.tauntId);
            BattleManager.actor().refresh();
        }
        BattleManager.actor().resetStateCounts(HGSkEqpRel.tauntId);
        BattleManager.actor()._result.pushAddedState(HGSkEqpRel.tauntId);
    }
};