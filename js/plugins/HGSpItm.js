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
HGSpItm.equipLst = [];
HGSpItm.equipAdv = function(){
    this.equipLst = $gameActors.actor(1).equips().filter((item) => {return item && (item._itemId!=0);}).concat($gameParty.equipItems());
    $gameMessage.setChoices(HGPlgCore.toNameChoices(this.equipLst, this.ccMes), this.equipAdvInfo.defaultInd, this.equipLst.length);
    $gameMessage.setChoiceCallback((x)=>{//everything after the choice is made
        let offset =  $gameActors.actor(1).equips().filter((item) => {return item && (item._itemId!=0);}).length;
        if(x < offset){
            if(($gameActors.actor(1).equips()[x]) == null){
                alert(x+" "+offset+" |iiiii| "+JSON.stringify($gameActors.actor(1).equips())+" |iiiii| "+JSON.stringify(HGSpItm.equipLst));
            }
            let resId = this.equipRUp($gameActors.actor(1).equips()[x].name, $gameActors.actor(1).equips()[x].id);
            if(resId < 0){
                $gameParty.gainItem($dataItems[this.equipAdvID], 1, true);//return the card not used                
                return;
            }
            let newItm = ((x == 0)?($dataWeapons):($dataArmors))[resId];
            $gameParty.gainItem(newItm, 1, true);
            $gameParty.loseItem($gameActors.actor(1).equips()[x], 1, true);
            $gameActors.actor(1).changeEquip(x, newItm);
        }else if(x < $gameParty.equipItems().length){
            let resId = this.equipRUp($gameParty.equipItems()[x - offset].name, $gameParty.equipItems()[x - offset].id);
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
HGSpItm.equipRUp = function(name, id){
    if(name.includes("超稀有")){
        return id+3;
    }else if(name.includes("量产") || name.includes("稀有")){
        return id+1;
    }else{
        return -1;
    }
};