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
 */

var HGEqpGft = window.HGEqpGft || {} ;

HGEqpGft.bsfcSlot = 0;
HGEqpGft.bsfcWpIds = $dataWeapons.filter((weapon)=>((weapon.description.includes("天赋"))&&(weapon.description.includes("底力")))).map((weapon)=>(weapon.id));
HGEqpGft._GameBattler_gainHp = Game_Battler.prototype.gainHp;
Game_Battler.prototype.gainHp = function(value){
    if(value < 0){
        if(HGEqpGft.bsfcWpIds.some((id)=>(HGPlgCore.isThisWpEqp(id, this)))){
            let valLeft = value + HGEqpGft.bsfcSlot;
            while(valLeft >= Math.ceil(this.mhp * 0.05)){
                valLeft -= (Math.ceil(this.mhp * 0.05));
                this.addParam(2, 1);
                this.addParam(3, 1);
            }
            HGEqpGft.bsfcSlot = valLeft;
        }
    }
    HGEqpGft._GameBattler_gainHp.call(this, value);
};


HGEqpGft.init = function(){//do after loaded data
    this.bsfcWpIds = $dataWeapons.filter((weapon)=>((weapon.description.includes("天赋"))&&(weapon.description.includes("底力")))).map((weapon)=>(weapon.id));
};