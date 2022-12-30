//=============================================================================
// HGSkEffExt.js
//=============================================================================

/*:
 * @plugindesc Skill Effect Extension by c2h6o for Hanabi Gakuen
 * @author c2h6o
 *
 * @help Extended effects for skills.
 *  - reflects half of the damage deals back to user
 *  - absolute critical/not/state dependent critical damage
 *  - customized repeats
 *  - turn based damage by states
 *  - post state effect: next state, in state effect: add state
 *  - state dependent damage formula parse
 *  - state dependent absolute hit
 *  - state restricted usage of skills
 *  - state dependent on damage add state
 *  - state dependent damage sharing
 *  - state dependent possible damage void
 *  - no co-state rules
 *  - state dependent customized buff (param)
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
 *      Method "Game_Action.prototype.evalDamageFormula" is overwritten in 
 *      this plugin.
 *      Method "Game_Action.prototype.apply" is overwritten in 
 *      this plugin.
 *      Method "Game_Battler.prototype.isStateAddable" is overwritten in 
 *      this plugin.
 *      Method "Game_BattlerBase.prototype.paramPlus" is overwritten in 
 *      this plugin.
 * at rpg_scenes.js
 *      Method "Scene_Battle.prototype.onEnemyOk" is overwritten in 
 *      this plugin.
 *      Method "Scene_Battle.prototype.onSkillOk" is overwritten in 
 *      this plugin.
*/
var HGSkEffExt = window.HGSkEffExt || {} ;

HGSkEffExt.reflDmgIds = [//reflects half of the damage deals back to user
    {id: 8, ratio: 0.5}
];
HGSkEffExt.stDepOnDmgStIds = [//state dependent on damage add state
    {onDmgStId: 202, gid: 206}
];
HGSkEffExt.dmgShareInfo = [//state dependent damage sharing
    {stId: 204, shPerc: 100},
    {stId: 205, shPerc: 50}
];
HGSkEffExt.dmgVoidInfo = [//state dependent possible damage void
    {stId: 204, vdPerc: 22}
];
HGSkEffExt._GameAction_executeDamage = Game_Action.prototype.executeDamage;
Game_Action.prototype.executeDamage = function(target, value){
    if(!this.isRecover()){
        value = HGSkEffExt.dmgVoid(target, value);
        value = HGSkEffExt.dmgShare(this, target, value, HGSkEffExt.executeDamage_t_GameAction_postShare);
    }
    HGSkEffExt.executeDamage_t_GameAction_postShare.apply(this, [this, target, value]);
};
HGSkEffExt.executeDamage_t_GameAction_postShare = function(thisArg, target, value){//_postShare for excluding share in recurring case
    HGSkEffExt._GameAction_executeDamage.call(thisArg, target, value);
    if(!this.isRecover()){
        if((this._item) && (this._item.isSkill()) && (HGPlgCore.getIdObj(HGSkEffExt.reflDmgIds, this._item.itemId()))){
            HGSkEffExt.reflDmg(this.subject(), Math.round(value*(HGPlgCore.getIdObj(HGSkEffExt.reflDmgIds, this._item.itemId())).ratio));
        }
        for(let i=0; i<HGSkEffExt.stDepOnDmgStIds.length; i++){
            if(target.isStateAffected(HGSkEffExt.stDepOnDmgStIds[i].onDmgStId)){
                this.subject().addState(HGSkEffExt.stDepOnDmgStIds[i].gid);
            }
        }
    }
};
HGSkEffExt.reflDmg = function(target, value){
    this.dmg(target, value);
};
HGSkEffExt.dmg = function(target, value){
    value = HGSkEffExt.dmgVoid(target, value);
    value = HGSkEffExt.dmgShare(null, target, value, HGSkEffExt.dmg_postShare);
    HGSkEffExt.dmg_postShare.apply(this, [this, target, value]);
};
HGSkEffExt.dmg_postShare = function(thisArg, target, value){//_postShare for excluding share in recurring case
    target.gainHp(-value);
    if (value > 0) {
        target.onDamage(value);
    }
};
//dmgFunc(thisArg, target, value), thisArg is only for dmgFunc in this method. Returns value left to dmg.
HGSkEffExt.dmgShare = function(thisArg, target, value, dmgFunc){
    let valLeft = value;
    if(target.isActor()){
        for(let i=0; i<$gameParty.members().length; i++){
            for(let j=0; j<this.dmgShareInfo.length; j++){
                if($gameParty.members()[i].isStateAffected(this.dmgShareInfo[j].stId) && (i != (target.actorId() - 1))){
                    if(valLeft > 0){
                        dmgFunc.apply(thisArg, [thisArg, $gameParty.members()[i], Math.round(value * (this.dmgShareInfo[j].shPerc / 100))]);
                        valLeft -= (Math.round(value * (this.dmgShareInfo[j].shPerc / 100)));
                    }else{
                        break;
                    }
                }
            }
            if(valLeft <= 0){
                break;
            }
        }
    }
    return Math.round((valLeft <= 0)? 0 : valLeft);
};
HGSkEffExt.dmgVoid = function(target, value){//return resulting value
    for(let i=0; i<HGSkEffExt.dmgVoidInfo.length; i++){//damage void prior to sharing
        if(target.isStateAffected(HGSkEffExt.dmgVoidInfo[i].stId)){
            value *= ((Math.random() * 100 < HGSkEffExt.dmgVoidInfo[i].vdPerc)?0:1);
        }
    }
    return value;
};

HGSkEffExt.stInfo = [
    {name: "burn_500$", stId: [21, 24]},
    {name: "burn_50$", stId: [65]},
    {name: "burn_1perc$", stId: [28]},
    {name: "frost_d10atk2$", stId: [23, 66]},
    {name: "frost_d10atk3$", stId: [25]}
];
HGSkEffExt.getStId = function(stName){
    let res = [];
    for(let i=0; i<this.stInfo.length; i++){
        if(this.stInfo[i].name.includes(stName)){
            res = res.concat(this.stInfo[i].stId);
        }
    }
    return res;
};
HGSkEffExt.acritSkId = [34, 91, 152, 186, 222, 256, 292, 326, 384, 385, 386, 387];//absolute critical damage
HGSkEffExt.ancritSkId = [8];//absolute not critical damage
HGSkEffExt.stDepCritSkId = [
    {skId: 54, stId: HGSkEffExt.getStId("frost")},
    {skId: 172, stId: HGSkEffExt.getStId("frost")},
    {skId: 242, stId: HGSkEffExt.getStId("frost")},
    {skId: 312, stId: HGSkEffExt.getStId("frost")},
    {skId: 354, stId: HGSkEffExt.getStId("frost")},

];//state dependent critical damage
HGSkEffExt._GameAction_makeDamageValue = Game_Action.prototype.makeDamageValue;
Game_Action.prototype.makeDamageValue = function(target, critical) {
    return HGSkEffExt._GameAction_makeDamageValue.call(this, target, 
        (critical || HGSkEffExt.critical(this, target)));
};
HGSkEffExt.critical = function(action, target){
    return (DataManager.isSkill(action.item())) 
    && (((HGSkEffExt.acritSkId.includes(action.item().id)) && (!(HGSkEffExt.ancritSkId.includes(action.item().id))))
     || this.stDepCritical(action.item().id, target)) ;
};
HGSkEffExt.stDepCritical = function(skId, target){
    for(let i=0; i<HGSkEffExt.stDepCritSkId.length; i++){
        if(skId == HGSkEffExt.stDepCritSkId[i].skId){
            return HGSkEffExt.stDepCritSkId[i].stId.some((st)=>(target.isStateAffected(st)));
        }
    }
    return false;
};

HGSkEffExt.custRepSkId = [//customized repeats
    {id: 36, repeat: 12},
    {id: 154, repeat: 12},
    {id: 224, repeat: 12},
    {id: 294, repeat: 12},

    {id: 89, repeat: 10},
    {id: 184, repeat: 10},
    {id: 254, repeat: 10},
    {id: 324, repeat: 10},

    {id: 90, repeat: 12},
    {id: 185, repeat: 12},
    {id: 255, repeat: 12},
    {id: 325, repeat: 12},

    {id: 51, repeat: 6, add: 3, cond: (skill)=>(($gameTroop.members().filter((member)=>(member.isAlive())).length == 1) && ($gameTroop.members()[0].isStateAffected(22)))},
    {id: 169, repeat: 6, add: 3, cond: (skill)=>(($gameTroop.members().filter((member)=>(member.isAlive())).length == 1) && ($gameTroop.members()[0].isStateAffected(22)))},
    {id: 239, repeat: 6, add: 3, cond: (skill)=>(($gameTroop.members().filter((member)=>(member.isAlive())).length == 1) && ($gameTroop.members()[0].isStateAffected(22)))},
    {id: 309, repeat: 6, add: 3, cond: (skill)=>(($gameTroop.members().filter((member)=>(member.isAlive())).length == 1) && ($gameTroop.members()[0].isStateAffected(22)))},
    {id: 351, repeat: 6, add: 3, cond: (skill)=>(($gameTroop.members().filter((member)=>(member.isAlive())).length == 1) && ($gameTroop.members()[0].isStateAffected(22)))}
];
HGSkEffExt._GameAction_numRepeats = Game_Action.prototype.numRepeats;
Game_Action.prototype.numRepeats = function(){
    for(let i = 0; i < HGSkEffExt.custRepSkId.length; i++){
        if((DataManager.isSkill(this.item())) && ((this.item().id) == (HGSkEffExt.custRepSkId[i].id))){
            return HGSkEffExt.custRepSkId[i].repeat 
                + ((('add' in HGSkEffExt.custRepSkId[i]) && 
                    ((!('cond' in HGSkEffExt.custRepSkId[i])) || (HGSkEffExt.custRepSkId[i].cond(this.item))))?(HGSkEffExt.custRepSkId[i].add):0);
        }
    }
    return HGSkEffExt._GameAction_numRepeats.call(this);
};

HGSkEffExt.tnDmgStId = [//turn based damage by states
    {id: HGSkEffExt.getStId("burn_500$"), dmg: 500, perc: false},
    {id: HGSkEffExt.getStId("burn_50$"), dmg: 50, perc: false},
    {id: HGSkEffExt.getStId("burn_1perc$"), dmg: 1, perc: true}
];
HGSkEffExt._GameBattlerBase_updateStateTurns = Game_BattlerBase.prototype.updateStateTurns;
Game_Battler.prototype.updateStateTurns = function(){
    this._states.forEach(function(stateId) {
        if (this._stateTurns[stateId] > 0) {
            for(let i = 0; i < HGSkEffExt.tnDmgStId.length; i++){
                let st = HGSkEffExt.tnDmgStId[i];
                if(st.id.some((id)=>(id == stateId))){
                    HGSkEffExt.dmg(this, st.dmg*((st.perc)?(Math.round((this._hp)/100)):(1)));
                }
            }
        }
    }, this);
    HGSkEffExt._GameBattlerBase_updateStateTurns.call(this);
};

HGSkEffExt.aftEffStId = [//post state effect: next state
    {id: 26, nid: 14},
    {id: 27, nid: 14},
    {id: 206, nid: 29}
];
HGSkEffExt.inEffStId = [//in state effect: add state
    {id: 30, gid: 14, perc: 10}
];
HGSkEffExt._GameBattler_removeStatesAuto = Game_Battler.prototype.removeStatesAuto;
Game_Battler.prototype.removeStatesAuto = function(timing){
    for(let j=0; j< this.states().length; j++){
        let st = this.states()[j];
        for(let i = 0; i < HGSkEffExt.inEffStId.length; i++){
            if(((String(HGSkEffExt.inEffStId[i].id)) == (String(st.id))) 
                && (Math.random()*100 < (HGSkEffExt.inEffStId[i].perc))){
                this.addState(HGSkEffExt.inEffStId[i].gid);
            }
        }        
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

HGSkEffExt.stDepDmgPrsInfo = [//state dependent damage formula parse
    {skId: 56, stId: HGSkEffExt.getStId("frost"), addFormulaHead: "", addFormulaEnd: "+ b.mdf * 2"},
    {skId: 174, stId: HGSkEffExt.getStId("frost"), addFormulaHead: "", addFormulaEnd: "+ b.mdf * 2"},
    {skId: 244, stId: HGSkEffExt.getStId("frost"), addFormulaHead: "", addFormulaEnd: "+ b.mdf * 2"},
    {skId: 314, stId: HGSkEffExt.getStId("frost"), addFormulaHead: "", addFormulaEnd: "+ b.mdf * 2"},
    {skId: 356, stId: HGSkEffExt.getStId("frost"), addFormulaHead: "", addFormulaEnd: "+ b.mdf * 2"},
    {skId: 48, stId: HGSkEffExt.getStId("burn"), addFormulaHead: "(", addFormulaEnd: ") * 1.5"},
    {skId: 166, stId: HGSkEffExt.getStId("burn"), addFormulaHead: "(", addFormulaEnd: ") * 1.5"},
    {skId: 236, stId: HGSkEffExt.getStId("burn"), addFormulaHead: "(", addFormulaEnd: ") * 1.5"},
    {skId: 306, stId: HGSkEffExt.getStId("burn"), addFormulaHead: "(", addFormulaEnd: ") * 1.5"},
    {skId: 348, stId: HGSkEffExt.getStId("burn"), addFormulaHead: "(", addFormulaEnd: ") * 1.5"},
    {skId: 32, stId: HGSkEffExt.getStId("frost"), addFormulaHead: "(", addFormulaEnd: ") * 1.5"},
    {skId: -1, stId: [29], addFormulaHead: "(", addFormulaEnd: ") * 1.15"}//<0: any skill
];
HGSkEffExt.stDepPropPtTransInfo = [//state dependent property point transfer
    {stId: 203, trans:[
        {from: "b.def", to: "( b.atk + b.def )"},
        {from: "b.mdf", to: "( b.mat + b.mdf )"}
    ]}
];
HGSkEffExt._GameAction_evalDamageFormula = Game_Action.prototype.evalDamageFormula;
Game_Action.prototype.evalDamageFormula = function(target){
    try{
        let res =  HGSkEffExt._GameAction_evalDamageFormula.call(this, target);
        for(let i = 0; i<HGSkEffExt.stDepDmgPrsInfo.length; i++){
            if((DataManager.isSkill(this.item())) && ((this.item().id == HGSkEffExt.stDepDmgPrsInfo[i].skId) || (HGSkEffExt.stDepDmgPrsInfo[i].skId < 0)) 
            && ((HGSkEffExt.stDepDmgPrsInfo[i].stId).some((id)=>(target.isStateAffected(id))))){
                var item = this.item();
                var a = this.subject();
                var b = target;
                var v = $gameVariables._data;
                var sign = ([3, 4].contains(item.damage.type) ? -1 : 1);
                return Math.max(eval(
                    HGSkEffExt.stDepPropPtTrans(target, (HGSkEffExt.stDepDmgPrsInfo[i].addFormulaHead)+item.damage.formula+(HGSkEffExt.stDepDmgPrsInfo[i].addFormulaEnd))
                    ), 0) * sign;
            }
        }
        return res;
    }catch(e){
        return 0;
    }
};
HGSkEffExt.stDepPropPtTrans = function(target, formula){
    let res = formula;
    for(let i=0; i<this.stDepPropPtTransInfo.length; i++){
        if(target.isStateAffected(this.stDepPropPtTransInfo[i].stId)){
            for(let j=0; j<this.stDepPropPtTransInfo[i].trans.length; j++){
                res = res.replace(this.stDepPropPtTransInfo[i].trans[j].from, this.stDepPropPtTransInfo[i].trans[j].to);
            }
        }
    }
    return res;
};

HGSkEffExt.stDepAbsHit = [//state dependent absolute hit
    {skId: 54, stId: HGSkEffExt.getStId("frost")},
    {skId: 172, stId: HGSkEffExt.getStId("frost")},
    {skId: 242, stId: HGSkEffExt.getStId("frost")},
    {skId: 312, stId: HGSkEffExt.getStId("frost")},
    {skId: 354, stId: HGSkEffExt.getStId("frost")}
];
HGSkEffExt.stDepAddSt = [//state dependent add state
    {skId: 50, stId: [22], gid: 14},
    {skId: 168, stId: [22], gid: 14},
    {skId: 238, stId: [22], gid: 14},
    {skId: 308, stId: [22], gid: 14},
    {skId: 350, stId: [22], gid: 14},
    {skId: 53, stId: HGSkEffExt.getStId("frost"), gid: 14},
    {skId: 171, stId: HGSkEffExt.getStId("frost"), gid: 14},
    {skId: 241, stId: HGSkEffExt.getStId("frost"), gid: 14},
    {skId: 311, stId: HGSkEffExt.getStId("frost"), gid: 14},
    {skId: 353, stId: HGSkEffExt.getStId("frost"), gid: 14},
    {skId: 20, perc: 20, gid: 14},
    {skId: 138, perc: 20, gid: 14},
    {skId: 208, perc: 20, gid: 14},
    {skId: 278, perc: 20, gid: 14}
];
HGSkEffExt._GameAction_apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target){
    for(let i=0; i<HGSkEffExt.stDepAbsHit.length; i++){
        if((DataManager.isSkill(this.item())) && ((this.item().id == HGSkEffExt.stDepAbsHit[i].skId)||HGSkEffExt.stDepAbsHit[i].skId < 0) 
            && ((HGSkEffExt.stDepAbsHit[i].stId).some((id)=>(target.isStateAffected(id))))){
            target._result.isHit = function(){ return true; };
            break;      
        }
    }
    for(let i=0; i<HGSkEffExt.stDepAddSt.length; i++){
        if((DataManager.isSkill(this.item())) && ((this.item().id == HGSkEffExt.stDepAddSt[i].skId)||HGSkEffExt.stDepAddSt[i].skId < 0) 
        && ((!('stId' in (HGSkEffExt.stDepAddSt[i]))) || ((HGSkEffExt.stDepAddSt[i].stId).some((id)=>(target.isStateAffected(id)))))
        && ((!('perc' in (HGSkEffExt.stDepAddSt[i]))) || (Math.random() * 100 < HGSkEffExt.stDepAddSt[i].perc))){
            target.addState(HGSkEffExt.stDepAddSt[i].gid);
            break;      
        }
    }
    HGSkEffExt._GameAction_apply.call(this, target);
};

HGSkEffExt.enemyStResSkIds = [//state-of-enemy restricted usage of skills
    {skId: 53, stId: HGSkEffExt.getStId("frost"), invalidMes: "只能对处于寒霜状态的敌方使用。"}
];
HGSkEffExt._SceneBattle_onEnemyOk = Scene_Battle.prototype.onEnemyOk;
Scene_Battle.prototype.onEnemyOk = function(){
    if((DataManager.isSkill(BattleManager.inputtingAction().item()))){
        let notMetInd = (HGSkEffExt.enemyStResNotMet(BattleManager.inputtingAction().item(), this._enemyWindow.enemyIndex()));
        if(notMetInd > -1){
                $gameMessage.setChoices(["取消使用"], 0, 0);
                $gameMessage.setChoiceCallback((x)=>{//everything after the choice is made
                    SceneManager._scene._actorCommandWindow.open();//closed due to showing text
                    Scene_Battle.prototype.onEnemyCancel.call(this);
                });
                $gameMessage.add(HGSkEffExt.enemyStResSkIds[notMetInd].invalidMes);
                return;
        }
    }
    HGSkEffExt._SceneBattle_onEnemyOk.call(this);
};
HGSkEffExt.enemyStResNotMet = function(skill, enemyInd){//returns index of not met condition
    for(let i=0; i<this.enemyStResSkIds.length; i++){
        if(skill.id == this.enemyStResSkIds[i].skId){
            if (!(this.enemyStResSkIds[i].stId).some((stId)=>(HGSkEffExt.enemyHasState(stId, enemyInd)))){//no state present then stop
                return i;
            }
        }
    }
    return -1;
};
HGSkEffExt.enemyHasState = function(stId, enemyId){//in battle
    return $gameTroop.members()[enemyId].isStateAffected(stId);
};

HGSkEffExt.actorStResSkIds = [//state-of-actor restricted usage of skills
    {skId: [14, 15, 17, 18, 43], stId: [205], invalidMes: "圣盾不可与其他防御力提升技能叠加。"},
    {skId: [17], stId: [43, 44, 33, 36, 203, 46, 205], invalidMes: "圣盾不可与其他防御力提升技能叠加。"}
];
HGSkEffExt._SceneBattle_onSkillOk = Scene_Battle.prototype.onSkillOk;
Scene_Battle.prototype.onSkillOk = function(){
    BattleManager.inputtingAction().setSkill(this._skillWindow.item().id);
    if((DataManager.isSkill(BattleManager.inputtingAction().item()))){
        let notMetInd = (HGSkEffExt.actorStResNotMet(BattleManager.inputtingAction().item()));
        if(notMetInd > -1){
                $gameMessage.setChoices(["取消使用"], 0, 0);
                $gameMessage.setChoiceCallback((x)=>{//everything after the choice is made
                    SceneManager._scene._actorCommandWindow.open();//closed due to showing text
                    Scene_Battle.prototype.onSkillCancel.call(this);
                });
                $gameMessage.add(HGSkEffExt.actorStResSkIds[notMetInd].invalidMes);
                return;
        }
    }
    HGSkEffExt._SceneBattle_onSkillOk.call(this);
};
HGSkEffExt.actorStResNotMet = function(skill){//returns index of not met condition
    for(let i=0; i<this.actorStResSkIds.length; i++){
        if(this.actorStResSkIds[i].skId.some((skId)=>(skill.id == skId))){
            if ((this.actorStResSkIds[i].stId).some((stId)=>(HGSkEffExt.actorHasState(stId)))){//some state present then stop
                return i;
            }
        }
    }
    return -1;
};
HGSkEffExt.actorHasState = function(stId){//in battle
    return BattleManager.actor().isStateAffected(stId);
};


HGSkEffExt.noCostateInfo = [//no co-state rules
    // {stIds: [205], ncStIds:[43, 44, 33, 36, 203, 46, 205]} 
];
HGSkEffExt._GameBattler_isStateAddable = Game_Battler.prototype.isStateAddable;
Game_Battler.prototype.isStateAddable = function(stateId){
    let res = HGSkEffExt._GameBattler_isStateAddable.call(this, stateId);
    for(let i=0; i<HGSkEffExt.noCostateInfo.length; i++){
        if(HGSkEffExt.noCostateInfo[i].stIds.some((stId)=>(this.isStateAffected(stId)), this)){
            return !(HGSkEffExt.noCostateInfo[i].ncStIds.some((stId)=>(stId == stateId), this));
        }
        if(HGSkEffExt.noCostateInfo[i].ncStIds.some((stId)=>(this.isStateAffected(stId)), this)){
            return !(HGSkEffExt.noCostateInfo[i].stIds.some((stId)=>(stId == stateId), this));
        }
    }
    return res;
};

HGSkEffExt.stDepCustParam = [
    {stId: 207, prmId: 2, formula: (mat)=>(10 + (mat)* 0.5)},
    {stId: 207, prmId: 4, formula: (mat)=>(10 + (mat)* 0.5)},
    {stId: 208, prmId: 2, formula: (mat)=>(30 + (mat)* 1)},
    {stId: 208, prmId: 4, formula: (mat)=>(30 + (mat)* 1)},
    {stId: 209, prmId: 2, formula: (mat)=>(50 + (mat)* 1.5)},
    {stId: 209, prmId: 4, formula: (mat)=>(50 + (mat)* 1.5)},
    {stId: 210, prmId: 2, formula: (mat)=>(50 + (mat)* 2)},
    {stId: 210, prmId: 4, formula: (mat)=>(50 + (mat)* 2)},
    {stId: 211, prmId: 3, formula: (mat)=>(10 + (mat)* 0.5)},
    {stId: 211, prmId: 5, formula: (mat)=>(10 + (mat)* 0.5)},
    {stId: 212, prmId: 3, formula: (mat)=>(30 + (mat)* 1)},
    {stId: 212, prmId: 5, formula: (mat)=>(30 + (mat)* 1)},
    {stId: 213, prmId: 3, formula: (mat)=>(50 + (mat)* 1.5)},
    {stId: 213, prmId: 5, formula: (mat)=>(50 + (mat)* 1.5)},
    {stId: 214, prmId: 3, formula: (mat)=>(50 + (mat)* 2)},
    {stId: 214, prmId: 5, formula: (mat)=>(50 + (mat)* 2)},

//宇宙
    {stId: 216, prmId: 2, formula: (mat)=>(13 + (mat)* 0.65)},
    {stId: 216, prmId: 4, formula: (mat)=>(13 + (mat)* 0.65)},
    {stId: 217, prmId: 2, formula: (mat)=>(39 + (mat)* 1.3)},
    {stId: 217, prmId: 4, formula: (mat)=>(39 + (mat)* 1.3)},
    {stId: 218, prmId: 2, formula: (mat)=>(65 + (mat)* 1.95)},
    {stId: 218, prmId: 4, formula: (mat)=>(65 + (mat)* 1.95)},
    {stId: 219, prmId: 2, formula: (mat)=>(65 + (mat)* 2.6)},
    {stId: 219, prmId: 4, formula: (mat)=>(65 + (mat)* 2.6)},
    {stId: 220, prmId: 3, formula: (mat)=>(13 + (mat)* 0.65)},
    {stId: 220, prmId: 5, formula: (mat)=>(13 + (mat)* 0.65)},
    {stId: 221, prmId: 3, formula: (mat)=>(39 + (mat)* 1.3)},
    {stId: 221, prmId: 5, formula: (mat)=>(39 + (mat)* 1.3)},
    {stId: 222, prmId: 3, formula: (mat)=>(65 + (mat)* 1.95)},
    {stId: 222, prmId: 5, formula: (mat)=>(65 + (mat)* 1.95)},
    {stId: 223, prmId: 3, formula: (mat)=>(65 + (mat)* 2.6)},
    {stId: 223, prmId: 5, formula: (mat)=>(65 + (mat)* 2.6)}
];
HGSkEffExt._GameBattlerBase_paramPlus = Game_BattlerBase.prototype.paramPlus;
Game_BattlerBase.prototype.paramPlus = function(paramId){
    let curMat = HGSkEffExt._GameBattlerBase_paramPlus.call(this, 4);
    return HGSkEffExt._GameBattlerBase_paramPlus.call(this, paramId) + HGSkEffExt.getParamPlus(this, paramId, curMat);
};
HGSkEffExt.getParamPlus = function(battler, paramId, mat){
    return (HGSkEffExt.stDepCustParam.filter((info)=>((info.prmId == paramId) && (battler.isStateAffected(info.stId)))).length == 0)?
    0:
    Math.round(HGSkEffExt.stDepCustParam.filter((info)=>((info.prmId == paramId) && (battler.isStateAffected(info.stId)))).reduce((r, info)=>{
        return r * info.formula(mat);
    }, 1));
};