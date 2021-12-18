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
 *  - post state effect: next state, in state effect: add state
 *  - state dependent damage formula parse
 *  - state dependent absolute hit
 *  - state restricted usage of skills
 *  - state dependent on damage add state
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
*/
var HGSkEffExt = window.HGSkEffExt || {} ;

HGSkEffExt.reflDmgIds = [//reflects half of the damage deals back to user
    {id: 8, ratio: 0.5}
];
HGSkEffExt.stDepOnDmgStIds = [//state dependent on damage add state
    {onDmgStId: 202, gid: 29}
];
HGSkEffExt.dmgShareInfo = [//damage target shift
    {stId: 204, shPerc: 100},
    {stId: 205, shPerc: 50}
];
HGSkEffExt._GameAction_executeDamage = Game_Action.prototype.executeDamage;
Game_Action.prototype.executeDamage = function(target, value){
    value = HGSkEffExt.dmgShare(target, value, HGSkEffExt.executeDamage_t_GameAction_postShare);
    HGSkEffExt.executeDamage_t_GameAction_postShare.apply(this, [target, value]);
};
HGSkEffExt.executeDamage_t_GameAction_postShare = function(target, value){//_postShare for excluding share in recurring case
    HGSkEffExt._GameAction_executeDamage.call(this, target, value);
    if((this._item) && (this._item.isSkill()) && (HGPlgCore.getIdObj(HGSkEffExt.reflDmgIds, this._item.itemId()))){
        HGSkEffExt.reflDmg(this.subject(), Math.round(value*(HGPlgCore.getIdObj(HGSkEffExt.reflDmgIds, this._item.itemId())).ratio));
    }
    for(let i=0; i<HGSkEffExt.stDepOnDmgStIds.length; i++){
        if(target.isStateAffected(HGSkEffExt.stDepOnDmgStIds[i].onDmgStId)){
            target.addState(HGSkEffExt.stDepOnDmgStIds[i].gid);
        }
    }
};
HGSkEffExt.reflDmg = function(target, value){
    this.dmg(target, value);
};
HGSkEffExt.dmg = function(target, value){
    value = HGSkEffExt.dmgShare(target, value, HGSkEffExt.dmg_postShare);
    HGSkEffExt.dmg_postShare.apply(this, [target, value]);
};
HGSkEffExt.dmg_postShare = function(target, value){//_postShare for excluding share in recurring case
    target.gainHp(-value);
    if (value > 0) {
        target.onDamage(value);
    }
};
HGSkEffExt.dmgShare = function(target, value, dmgFunc){//dmgFunc(target, value), return value left to dmg
    let valLeft = value;
    if(target.isActor()){
        for(let i=0; i<$gameParty.members().length; i++){
            for(let j=0; j<this.dmgShareInfo.length; j++){
                if($gameParty.members()[i].isStateAffected(this.dmgShareInfo[j].stId)){
                    if(valLeft > 0){
                        dmgFunc($gameParty.members()[i], Math.round(value * (this.dmgShareInfo[j].shPerc / 100)));
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

HGSkEffExt.acritSkId = [34, 54, 91];//absolute critical damage
HGSkEffExt._GameAction_makeDamageValue = Game_Action.prototype.makeDamageValue;
Game_Action.prototype.makeDamageValue = function(target, critical) {
    return HGSkEffExt._GameAction_makeDamageValue.call(this, target, 
        (critical || ((DataManager.isSkill(this.item())) && (HGSkEffExt.acritSkId.includes(this.item().id)))));
};

HGSkEffExt.custRepSkId = [//customized repeats
    {id: 36, repeat: 12},
    {id: 89, repeat: 10},
    {id: 90, repeat: 12},
    {id: 51, repeat: 6, add: 3, cond: (skill)=>(($gameTroop.members().length == 1) && ($gameTroop.members()[0].isStateAffected(22)))}
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
    {skId: 56, stId: [23], addFormulaHead: "", addFormulaEnd: "+ b.mdf * 2"},
    {skId: 48, stId: [21, 24, 28], addFormulaHead: "(", addFormulaEnd: ") * 1.5"},
    {skId: 32, stId: [23], addFormulaHead: "(", addFormulaEnd: ") * 1.5"},
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
    {skId: 54, stId: [23]}
];
HGSkEffExt.stDepAddSt = [//state dependent add state
    {skId: 50, stId: [22], gid: 14},
    {skId: 53, stId: [23], gid: 14},
    {skId: 20, perc: 20, gid: 14}
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

HGSkEffExt.stResSkIds = [//state restricted usage of skills
    {skId: 53, stId: [23], invalidMes: "只能对处于寒霜状态的敌方使用。"}
];
HGSkEffExt._SceneBattle_onEnemyOk = Scene_Battle.prototype.onEnemyOk;
Scene_Battle.prototype.onEnemyOk = function(){
    if((DataManager.isSkill(BattleManager.inputtingAction().item()))){
        let notMetInd = (HGSkEffExt.stResNotMet(BattleManager.inputtingAction().item(), this._enemyWindow.enemyIndex()));
        if(notMetInd > -1){
                $gameMessage.setChoices(["取消使用"], 0, 0);
                $gameMessage.setChoiceCallback((x)=>{//everything after the choice is made
                    SceneManager._scene._actorCommandWindow.open();//closed due to showing text
                    Scene_Battle.prototype.onEnemyCancel.call(this);
                });
                $gameMessage.add(HGSkEffExt.stResSkIds[notMetInd].invalidMes);
                return;
        }
    }
    HGSkEffExt._SceneBattle_onEnemyOk.call(this);
};
HGSkEffExt.stResNotMet = function(skill, enemyInd){//returns index of not met condition
    for(let i=0; i<this.stResSkIds.length; i++){
        if(skill.id == this.stResSkIds[i].skId){
            if (!(this.stResSkIds[i].stId).reduce((pre, curStId)=>{
                return pre && (HGSkEffExt.enemyHasState(curStId, enemyInd));
            }, true)){
                return i;
            }
        }
    }
    return -1;
};
HGSkEffExt.enemyHasState = function(stId, enemyId){//in battle
    return $gameTroop.members()[enemyId].isStateAffected(stId);
};

HGSkEffExt.poiStId = 44;