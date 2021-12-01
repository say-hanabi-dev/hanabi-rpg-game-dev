//=============================================================================
// HGPlgCore.js
//=============================================================================

/*:
 * @plugindesc Core of plugins by c2h6o for Hanabi Gakuen
 * @author c2h6o
 *
 * @help Support common functions for other plugins and the system
 */

var HGPlgCore = window.HGPlgCore || {} ;
HGPlgCore.toNameChoices = function(arr, ccMes = "取消"){
    return arr.map((item)=>{return item.name;}).concat(ccMes);
};
HGPlgCore.alertObj = function(obj){
    alert(JSON.stringify(obj));
};
HGPlgCore.curLvDone = function(){
    let mpid = $gameMap.mapId();
    let done = $gameVariables.value(20);
    for(let i=1; i<$dataMapInfos.length; i++){
        if(($dataMapInfos[i]) && ($dataMapInfos[i].id == mpid)){
            return done >= parseInt($dataMapInfos[i].name.charAt(0));
        }
    }
    return false;
};
HGPlgCore.isWpTpEqp = function(wtId){
    return $gameActors.actor(1).isWtypeEquipped(wtId);
};
HGPlgCore.isAmTpEqp = function(atId){
    return $gameActors.actor(1).armors().some(function(armor) {
        return armor.atypeId === atId;
    });
};
HGPlgCore.getIdObj = function(arr, oid){
    for(let i=0; i<arr.length; i++){
        if(arr[i].id == oid){
            return arr[i];
        }
    }
    return null;
};