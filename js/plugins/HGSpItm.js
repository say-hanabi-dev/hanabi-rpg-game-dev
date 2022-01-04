//=============================================================================
// HGSpItm.js
//=============================================================================

/*:
 * @plugindesc Equipment Rarity Enhancement Card by c2h6o for Hanabi Gakuen
 * @author c2h6o
 *
 * @help Allows the player to increase the rarity of a equipment by 1.
 * 
 * This plugin works with HGPlgCore.
 */

var HGSpItm = window.HGSpItm || {} ;
HGSpItm.ccMes = "取消";
HGSpItm.equipAdvID = 23;
HGSpItm.equipAdvInfo = { 
    message: "进阶哪一件装备?", defaultInd: 0 
};
HGSpItm.actEqpLst = [];
HGSpItm.nnActEqpLst = [];
HGSpItm.equipLst = [];
HGSpItm.equipAdv = function(){
    this.actEqpLst = $gameActors.actor(1).equips();
    this.nnActEqpLst = this.actEqpLst.filter((item) => {return item && (item._itemId!=0);});
    this.equipLst = this.nnActEqpLst.concat($gameParty.equipItems());
    $gameMessage.setChoices(HGPlgCore.toNameChoices(this.equipLst, this.ccMes), this.equipAdvInfo.defaultInd, this.equipLst.length);
    $gameMessage.setChoiceCallback((x)=>{//everything after the choice is made
        let offset =  this.nnActEqpLst.length;
        if(x < offset){
            for(let i=0; i<this.actEqpLst.length; i++){
                if(((this.actEqpLst)[i]) && ((this.actEqpLst)[i].id == this.nnActEqpLst[x].id)
                    && ((this.actEqpLst)[i].etypeId == this.nnActEqpLst[x].etypeId)){
                    x = i;
                }
            }
            let resId = this.equipRUp((this.actEqpLst)[x]);
            if(resId < 0){
                $gameParty.gainItem($dataItems[this.equipAdvID], 1, true);//return the card not used                
                return;
            }
            let newItm = ((x == 0)?($dataWeapons):($dataArmors))[resId];
            $gameParty.gainItem(newItm, 1, true);
            $gameParty.loseItem(this.actEqpLst[x], 1, true);
            $gameActors.actor(1).changeEquip(x, newItm);
        }else if(x < $gameParty.equipItems().length){
            let resId = this.equipRUp($gameParty.equipItems()[x - offset]);
            if(resId < 0){
                $gameParty.gainItem($dataItems[this.equipAdvID], 1, true);//return the card not used                
                return;
            }
            let newItm = (($gameParty.equipItems()[x - offset].etypeId == 0)?($dataWeapons):($dataArmors))[resId];
            $gameParty.gainItem(newItm, 1, true);
            $gameParty.loseItem($gameParty.equipItems()[x - offset], 1, true);
        }else{
            $gameParty.gainItem($dataItems[this.equipAdvID], 1, true);//return the card not used
        }
    });
    $gameMessage.add(this.equipAdvInfo.message);
};
HGSpItm.equipRUp = function(equip){//armor/weapon listing order: ascending rarity, corresponding gift
    if(equip.name.includes("超稀有")){
        return equip.id+((equip.etypeId > 1)?2:3);
    }else if(equip.name.includes("量产") || equip.name.includes("稀有")){
        return equip.id+1;
    }else{
        return -1;
    }
};