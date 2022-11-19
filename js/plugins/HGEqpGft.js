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
            value = Math.floor(((-value)>this.mhp*0.25)?(-this.mhp*0.25):value);
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
HGEqpGft.bhbdEff = {loss: 0.05, gainDmg: 0.15};
HGEqpGft._BattleManager_startAction = BattleManager.startAction;
BattleManager.startAction = function(){
    HGEqpGft._BattleManager_startAction.call(this);
    HGEqpGft.bhBdWpIds = HGEqpGft.getGftWpIdLst("浴血");
    if(HGEqpGft.bhBdWpIds.some((wpId)=>(HGPlgCore.isThisWpEqp(wpId, this._subject)))){
        if(HGPlgCore.rand(HGEqpGft.percBhBd)){
            this._subject.gainHp(-Math.ceil((HGEqpGft.bhbdEff.loss)*(this._subject.mhp)));
            this._subject.addState(HGEqpGft.bhBdStId);
        }
    }
};
HGEqpGft._GameAction_executeDamage = Game_Action.prototype.executeDamage;
Game_Action.prototype.executeDamage = function(target, value){
    if((!this.isRecover())){
        if(this.subject().isStateAffected(HGEqpGft.bhBdStId)){
            let bhbdVal = Math.ceil(value * (HGEqpGft.bhbdEff.gainDmg));
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

