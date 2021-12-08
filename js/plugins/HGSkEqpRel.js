//=============================================================================
// HGSkEqpRel.js
//=============================================================================

/*:
 * @plugindesc Relationships of Skills & Equipments by c2h6o for Hanabi Gakuen
 * @author c2h6o
 *
 * @help Effects to skills by which equipped:
 *  - 70% damage of magic skills when magic weapon not equipped & no equipment is enchanted
 *  - 20% additional damage of critical hits when sword equipped 
 *  - shields skills: require shield/Large shield; large shield skills: require Large shield
 *  - sword skills: require swords; gun skills: require guns
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
HGSkEqpRel.magWpTId = 4;//70% damage of magic skills when magic weapon not equipped & no equipment is enchanted
HGSkEqpRel.rule = [
    {spec: (skill)=>((skill.stypeId == 5)||(skill.stypeId == 6)), cond:()=>(!(this.magOn())), opr:(dmg)=>(dmg*0.7)}
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
HGSkEqpRel.enchantedWpId = [8, 16, 24, 66, 74, 82];
HGSkEqpRel.enchantedAmId = [27, 35, 43, 52, 60, 68];
HGSkEqpRel.magOn = function(){
    if(HGPlgCore.isWpTpEqp(HGSkEqpRel.magWpTId)){
        return true;
    }
    let curWp = $gameActors.actor(1).weapons().filter((item) => {return item && (item._itemId!=0);});
    for(let i=0; i<HGSkEqpRel.enchantedWpId.length; i++){
        for(let j=0; j<curWp.length; j++){
            if(HGSkEqpRel.enchantedWpId[i] == curWp[j].id){
                return true;
            }
        }
    }
    let curAm = $gameActors.actor(1).armors().filter((item) => {return item && (item._itemId!=0);});
    for(let i=0; i<HGSkEqpRel.enchantedAmId.length; i++){
        for(let j=0; j<curAm.length; j++){
            if(HGSkEqpRel.enchantedAmId[i] == curAm[j].id){
                return true;
            }
        }
    }
    return false;
};

HGSkEqpRel.swordTId = 1;//20% additional damage of critical hits when sword equipped 
HGSkEqpRel._GameAction_applyCritical = Game_Action.prototype.applyCritical;
Game_Action.prototype.applyCritical = function(damage) {
    return HGSkEqpRel._GameAction_applyCritical.call(this, damage) * ((HGPlgCore.isWpTpEqp(HGSkEqpRel.swordTId)?(1.2):1));
};

HGSkEqpRel.shdSkTId = 3;//shields skills: require shield/Large shield; large shield skills: require Large shield
HGSkEqpRel.shdTId = 5;
HGSkEqpRel.bshdTId = 6;
HGSkEqpRel.megBshdTId = 2;
HGSkEqpRel.swordSkTId = 2;//sword skills: require swords
HGSkEqpRel.gunTId = 5;//gun skills: require guns
HGSkEqpRel.gunSkTId = 4;
HGSkEqpRel._GameActor_isSkillWtypeOk = Game_Actor.prototype.isSkillWtypeOk;
Game_Actor.prototype.isSkillWtypeOk = function(skill){
    return HGSkEqpRel._GameActor_isSkillWtypeOk.call(this, skill) && HGSkEqpRel.eqpSkOk(skill);
};
HGSkEqpRel.eqpSkOk = function(skill){
    return this.shdSkOk(skill) && this.swSkOk(skill) && this.gnSkOk(skill);
};
HGSkEqpRel.swSkOk = function(skill){
    if(skill.stypeId == this.swordSkTId){
        return HGPlgCore.isWpTpEqp(this.swordTId);
    }
    return true;
};
HGSkEqpRel.gnSkOk = function(skill){
    if(skill.stypeId == this.gunSkTId){
        return HGPlgCore.isWpTpEqp(this.gunTId);
    }
    return true;
};
HGSkEqpRel.shdSkOk = function(skill){
    if(skill.stypeId == this.shdSkTId){
        if(HGPlgCore.isAmTpEqp(this.bshdTId)||HGPlgCore.isAmTpEqp(this.megBshdTId)){
            return true;
        }else{
            return (skill.id >= 13 && skill.id <= 15) && (HGPlgCore.isAmTpEqp(this.shdTId));
        }
    }
    return true;
};

HGSkEqpRel.tauntId = 13;//add taunt state when guard with shield/Large shield equipped
HGSkEqpRel._SceneBattle_commandGuard = Scene_Battle.prototype.commandGuard;
Scene_Battle.prototype.commandGuard = function(){
    if(HGPlgCore.isAmTpEqp(HGSkEqpRel.bshdTId)||HGPlgCore.isAmTpEqp(HGSkEqpRel.megBshdTId)||(HGPlgCore.isAmTpEqp(HGSkEqpRel.shdTId))){
        HGSkEqpRel.taunt();
    }
    HGSkEqpRel._SceneBattle_commandGuard.call(this);
};
HGSkEqpRel.taunt = function(){
    if (BattleManager.actor().isStateAddable(this.tauntId)) {
        if (!BattleManager.actor().isStateAffected(this.tauntId)) {
            BattleManager.actor().addNewState(this.tauntId);
            BattleManager.actor().refresh();
        }
        BattleManager.actor().resetStateCounts(this.tauntId);
        BattleManager.actor()._result.pushAddedState(this.tauntId);
    }
};