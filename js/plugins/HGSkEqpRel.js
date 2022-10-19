//=============================================================================
// HGSkEqpRel.js
//=============================================================================

/*:
 * @plugindesc Relationships of Skills & Equipments by c2h6o for Hanabi Gakuen
 * @author c2h6o
 *
 * @help Effects to skills by which equipped:
 *  - 70% damage of magic/enchanted sword skills when magic weapon not equipped & no equipment is enchanted
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
HGSkEqpRel.magWpTId = 4;//70% damage of magic/enchanted sword skills when magic weapon not equipped & no equipment is enchanted
HGSkEqpRel.outMagSkId = [27, 28, 29, 30, 31, 32, 37, 38];
HGSkEqpRel.rule = [
    {
        spec: (skill)=>((skill.stypeId == 5)||(skill.stypeId == 6)||(HGSkEqpRel.outMagSkId.includes(skill.id))), 
        cond:()=>(!(this.magOn())), opr:(dmg)=>(dmg*0.7)
    }
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
    var value=HGSkEqpRel._GameAction_applyCritical.call(this, damage) * ((HGPlgCore.isWpTpEqp(HGSkEqpRel.swordTId)?(1.2):1));
    
    if(this.subject().isActor()){
        if(this.subject().hasWeapon($dataWeapons[84])){
            return value*1.5;
        }
    }
    return value;
};

HGSkEqpRel.shdSkTId = 3;//shields skills: require shield/Large shield; large shield skills: require Large shield
HGSkEqpRel.shdTId = 5;
HGSkEqpRel.bshdTId = 6;
HGSkEqpRel.megBshdTId = 2;
HGSkEqpRel.swordSkTId = 2;//sword skills: require swords
HGSkEqpRel.gunTId = 5;//gun skills: require guns
HGSkEqpRel.gunSkTId = 4;
HGSkEqpRel.mahousjSkIds = [102, 103, 104];//mahou shoujo skills: require mahou shoujo trans
HGSkEqpRel.mahousjTrIds = [50, 51, 52, 53, 54, 55, 56, 57];
HGSkEqpRel.dbTransSkIds = [105];//double transformation skills: require mahou shoujo trans and kamen rider trans
HGSkEqpRel.kamenrdTrIds = [13, 14, 15, 16, 17];
HGSkEqpRel._GameActor_isSkillWtypeOk = Game_Actor.prototype.isSkillWtypeOk;
Game_Actor.prototype.isSkillWtypeOk = function(skill){
    return HGSkEqpRel._GameActor_isSkillWtypeOk.call(this, skill) && HGSkEqpRel.eqpSkOk(skill);
};
HGSkEqpRel.eqpSkOk = function(skill){
    return this.shdSkOk(skill) && this.swSkOk(skill) && this.gnSkOk(skill) && this.mahousjSkOk(skill) && this.dbTransOk(skill);
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
HGSkEqpRel.mahousjSkOk = function(skill){
    if(this.mahousjSkIds.some((skId)=>((String(skill.id)) == (String(skId))))){
        return this.mahousjTrIds.some((trId)=>(HGPlgCore.isWpEqp(trId)));
    }
    return true;
};
HGSkEqpRel.dbTransOk = function(skill){
    if(this.dbTransSkIds.some((skId)=>((String(skill.id)) == (String(skId))))){
        return (this.mahousjTrIds.some((trId)=>(HGPlgCore.isWpEqp(trId)))) && (this.kamenrdTrIds.some((trId)=>(HGPlgCore.isAmEqp(trId))));
    }
    return true;
};

HGSkEqpRel.tauntId = 13;//add taunt state when guard with shield/Large shield equipped
HGSkEqpRel._GameAction_Guard = Game_Action.prototype.setGuard;
Game_Action.prototype.setGuard = function() {
    if((this.subject().isActor()) &&
        (HGPlgCore.isAmTpEqp(HGSkEqpRel.bshdTId, this.subject().actorId())
            ||HGPlgCore.isAmTpEqp(HGSkEqpRel.megBshdTId, this.subject().actorId())
            ||(HGPlgCore.isAmTpEqp(HGSkEqpRel.shdTId, this.subject().actorId())))){
        HGSkEqpRel.taunt(this);
    }
    HGSkEqpRel._GameAction_Guard.call(this);
};
HGSkEqpRel.taunt = function(thisArg){
    if (thisArg.subject().isStateAddable(this.tauntId)) {
        if (!thisArg.subject().isStateAffected(this.tauntId)) {
            thisArg.subject().addNewState(this.tauntId);
            thisArg.subject().refresh();
        }
        thisArg.subject().resetStateCounts(this.tauntId);
        thisArg.subject()._result.pushAddedState(this.tauntId);
    }
};