//=============================================================================
// HGEqpGft.js
//=============================================================================

/*:
 * @plugindesc Gifts of Equipments by c2h6o for Hanabi Gakuen
 * @author c2h6o
 *
 * @help Gifts of weapons: BaseForce
 * 
 * This plugin works with HGPlgCore.
 * 
 * - Developer Info -
 * Warning: 
 * at rpg_objects.js
 *      Method "Game_Battler.prototype.gainHp" is overwritten in 
 *      this plugin
 *      Method "Game_Action.prototype.applyCritical" is overwritten in 
 *      this plugin
 */

var HGEqpGft = window.HGEqpGft || {} ;

HGEqpGft.getGftWpIdLst = function(gft){
    return $dataWeapons.filter((weapon)=>((weapon)&&(weapon.description.includes("天赋"))&&(weapon.description.includes(gft)))).map((weapon)=>(weapon.id));
};
HGEqpGft.getGftAmIdLst = function(gft){
    return $dataArmors.filter((armor)=>((armor)&&(armor.description.includes("天赋"))&&(armor.description.includes(gft)))).map((armor)=>(armor.id));
};

HGEqpGft.bsfcSlot = 0;
HGEqpGft.bsfcWpIds = 0;
HGEqpGft.shltWpIds = 0;
HGEqpGft.percShlt = 5;
HGEqpGft.szapro = 15;
HGEqpGft.bzmaxdamage = 0.25;
HGEqpGft.shltEff = {redDmg: 0.20};
HGEqpGft._GameBattler_gainHp = Game_Battler.prototype.gainHp;
Game_Battler.prototype.gainHp = function(value){
    if((value < 0) && (this.isActor())){
        HGEqpGft.shltWpIds = HGEqpGft.getGftAmIdLst("庇护");
        if(HGEqpGft.shltWpIds.some((amId)=>(HGPlgCore.isThisAmEqp(amId, this)))){
            if(HGPlgCore.rand(HGEqpGft.percShlt)){
                value *= Math.ceil(1 - HGEqpGft.shltEff.redDmg);
            }
        }
    }
    if (this.isActor()){
        if (this.hasArmor($dataArmors[70]) && (value < 0)){//盾牌霸主：每次受伤不超过生命值上限的25%
            value = Math.floor(((-value) > this.mhp*HGEqpGft.bzmaxdamage) ? (-this.mhp * HGEqpGft.bzmaxdamage) : value);
        }
        var equips = this.equips();
        for(var i = 0; i < equips.length; i++){
            if((HGEqpGft.EqpGft(equips[i]) === "神之爱") && (value < 0)){
                value = (Math.random() * 100 <= HGEqpGft.szapro) ? 0 : value;
            }
        }
    }
    HGEqpGft._GameBattler_gainHp.call(this, value);
};
Game_Actor.prototype.paramPlus = function(paramId) {
    var value = Game_Battler.prototype.paramPlus.call(this, paramId);
    var equips = this.equips();
    if(paramId == 2 || paramId == 3){
        let bfWpEqpId = -1;
        HGEqpGft.bsfcWpIds = HGEqpGft.getGftWpIdLst("底力");
        for(let i=0; i<HGEqpGft.bsfcWpIds.length; i++){
            bfWpEqpId = HGPlgCore.getThisWpEqpId(HGEqpGft.bsfcWpIds[i], this);
            if(bfWpEqpId >= 0){
                value += Math.ceil((this.mhp - this.hp)/(this.mhp * 0.05));
                break;
            }
        }
    }
    for (var i = 0; i < equips.length; i++) {
        var item = equips[i];
        if (item) {
            value += item.params[paramId];
        }
    }
    return value;
};

HGEqpGft.bhBdWpIds = 0;
HGEqpGft.bhBdStId = 225;
HGEqpGft.percBhBd = 5;//percentage: prob. of getting bhbd
HGEqpGft.bhbdEff = {gainAtk: 0.50,gainDmg: 0.15};
HGEqpGft._BattleManager_startAction = BattleManager.startAction;
BattleManager.startAction = function(){
    HGEqpGft._BattleManager_startAction.call(this);
    HGEqpGft.bhBdWpIds = HGEqpGft.getGftWpIdLst("浴血");
    if(HGEqpGft.bhBdWpIds.some((wpId)=>(HGPlgCore.isThisWpEqp(wpId, this._subject)))){
        if(HGPlgCore.rand(HGEqpGft.percBhBd)){
            
            this._subject.addState(HGEqpGft.bhBdStId);
        }
    }
    
};
HGEqpGft._GameAction_executeDamage = Game_Action.prototype.executeDamage;
Game_Action.prototype.executeDamage = function(target, value){
    if((!this.isRecover())){
        if(this.subject().isStateAffected(HGEqpGft.bhBdStId)){
            let bhbdVal = Math.ceil(value * (HGEqpGft.bhbdEff.gainAtk));
            this.subject().gainHp(bhbdVal);
            value -= bhbdVal;
        }
        if(target.isStateAffected(HGEqpGft.bhBdStId)){
            let bhbdVal = Math.ceil(value * (HGEqpGft.bhbdEff.gainDmg));
            target.gainHp(bhbdVal);
            value -= bhbdVal;
        }
    }
    HGEqpGft._GameAction_executeDamage.call(this, target, value);
};


HGEqpGft.GameAction_apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target) {
    var item = this.item();
    var formula = item.damage.formula;
    var variance = item.damage.variance;
    var subject = this.subject();
    if(subject.isActor() && DataManager.isSkill(item)){
        var type = [item.stypeId,0];
        if(type[0] === 2)type = [1,0];     //剑
        if(type[0] === 3)type = [0,0];     //盾
        if(type[0] === 4)type = [5,0];    //枪
        if(type[0] === 5)type = [2,4];    //法
        if(type[0] === 6)type = [2,4];    //奶

        var gift = "";
        var equip = subject.equips()[0];
        if(type[0] === 0){
            equip = subject.equips()[1];
            if(equip) gift ="1";
        }else{
            if(equip)
                for(var i = 0; i < type.length; i++){
                    if(equip.wtypeId === type[i]) gift = "1";
                }
        }
        if(equip && gift === "1") gift = HGEqpGft.EqpGft(equip);

        if(gift != ""){
            if(gift === "极意"){
                this.item().damage.formula += " + b.mhp * 0.05";
            };
            if(gift === "天眼"){
                this.item().damage.formula = this.item().damage.formula.replace("b.def","b.def * 0.8");
                this.item().damage.formula = this.item().damage.formula.replace("b.mdf","b.mdf * 0.8");
            };
            if(gift === "明镜止水"){
                this.item().damage.variance = 0;
            };
            if(gift === "宇宙"){
                this.item().damage.formula = "(" + this.item().damage.formula + ") * 1.3";
            };
        }
    }
    HGEqpGft.GameAction_apply.call(this,target);
    this.item().damage.formula = formula;
    this.item().damage.variance = variance;

    if(subject.isActor())
        HGEqpGft.L_shield(subject);
}

HGEqpGft.EqpGft = function(item){
    var gift = "";
    if(item){
        if(item.description.includes("极意")) gift = "极意";
        if(item.description.includes("天眼")) gift = "天眼";
        if(item.description.includes("明镜止水")) gift = "明镜止水";
        if(item.description.includes("宇宙")) gift = "宇宙";

        if(item.description.includes("神之爱")) gift = "神之爱";
    }
    return gift;
}

HGEqpGft._GameActor_performActionEnd = Game_Actor.prototype.performActionEnd;
Game_Actor.prototype.performActionEnd = function() {
    HGEqpGft._GameActor_performActionEnd.call(this);
    HGEqpGft.L_shield(this);
};


HGEqpGft.L_shield = function(subject){
    if(subject.equips()){
        var shield = subject.equips()[1];
        if(shield){
            if(shield.atypeId === 2 || shield.atypeId === 6){
                var value = Math.floor(((subject.param(0) <= 8000)? subject.param(0) : 8000) * 0.05
                 + ((subject.param(3) <= 800)? subject.param(3) : 800) * 0.5);
                subject.gainHp(value);
            }
            
        }
    }
}

HGEqpGft._GameAction_makeDamageValue = Game_Action.prototype.makeDamageValue;
Game_Action.prototype.makeDamageValue = function(target, critical) {
    return HGEqpGft._GameAction_makeDamageValue.call(this, target, 
        (critical || HGEqpGft.critical(this, target)));
};

HGEqpGft.critical = function(action, target){
    var subject = action.subject();
    var item = action.item();
    if(DataManager.isSkill(item) && subject.isActor()){
        var type = [item.stypeId,0];
        if(type[0] === 2)type = [1,0];     //剑
        if(type[0] === 3)type = [0,0];     //盾
        if(type[0] === 4)type = [5,0];    //枪
        if(type[0] === 5)type = [2,4];    //法
        if(type[0] === 6)type = ["奶不会心"];    //奶

        var gift = "";
        var equip = subject.equips()[0];
        if(type[0] === 0){
            equip = subject.equips()[1];
            if(equip) gift ="1";
        }else{
            if(equip){
                for(var i = 0; i < type.length; i++){
                    if(equip.wtypeId === type[i]) gift = "1";
                }
            }
        }
        if(equip && gift === "1") gift = HGEqpGft.EqpGft(equip);
        if(gift === "天眼"){
            if((target.param(3) <= 1 && item.damage.formula.includes("b.def")) || (target.param(5) <= 1 && item.damage.formula.includes("b.mdf"))){
               return true;
           }
        }
    }
    return false;
}


