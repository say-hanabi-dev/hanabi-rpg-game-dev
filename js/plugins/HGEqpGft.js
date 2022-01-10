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

HGEqpGft.getGftWpIdLst = function(gft){
    return $dataWeapons.filter((weapon)=>((weapon)&&(weapon.description.includes("天赋"))&&(weapon.description.includes(gft)))).map((weapon)=>(weapon.id));
};

HGEqpGft.bsfcSlot = 0;
HGEqpGft.bsfcWpIds = 0;
HGEqpGft._GameBattler_gainHp = Game_Battler.prototype.gainHp;
Game_Battler.prototype.gainHp = function(value){
    if((value < 0) && (this.isActor())){
        HGEqpGft.bsfcWpIds = HGEqpGft.getGftWpIdLst("底力");
        let bfWpEqpId = -1;
        for(let i=0; i<HGEqpGft.bsfcWpIds.length; i++){
            bfWpEqpId = HGPlgCore.getThisWpEqpId(HGEqpGft.bsfcWpIds[i], this);
            if(bfWpEqpId >= 0){
                break;
            }
        }
        if(bfWpEqpId >= 0){
            let valLeft = (0-value) + HGEqpGft.bsfcSlot;
            while(valLeft >= Math.ceil(this.mhp * 0.05)){
                valLeft -= (Math.ceil(this.mhp * 0.05));
                this.equips()[bfWpEqpId].params[2] += 1;
                this.equips()[bfWpEqpId].params[3] += 1;
            }
            HGEqpGft.bsfcSlot = valLeft;
        }
    }
    HGEqpGft._GameBattler_gainHp.call(this, value);
};