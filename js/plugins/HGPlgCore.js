//=============================================================================
// HGPlgCore.js
//=============================================================================

/*:
 * @plugindesc Core of plugins by c2h6o for Hanabi Gakuen
 * @author c2h6o
 * @param localTesting
 *
 * @help Support common functions for other plugins and the system
 */

var parameters = PluginManager.parameters('HGPlgCore');
var unknownData = String(parameters['localTesting'] || 0);

var HGPlgCore = window.HGPlgCore || {} ;

HGPlgCore.locallyTesting = function(){return (unknownData == "1");};//*****for local testing
HGPlgCore.localTestURLParse = function(url){
    if(this.locallyTesting()){
        return 'https://www.sayhuahuo.com' + url;
    }else{
        return url;
    }
};//*****for local testing: called in rpg_manager.js
HGPlgCore.localTestMethods = function(){
    if(this.locallyTesting()){
        DataManager.loadDataFile = function(name, src) {
            var xhr = new XMLHttpRequest();
            var url = 'data/' + src;
            xhr.open('GET', url);
            xhr.overrideMimeType('application/json');
            xhr.onload = function() {
                if (xhr.status < 400) {
                    window[name] = JSON.parse(xhr.responseText);
                    DataManager.onLoad(window[name]);
                }
            };
            xhr.onerror = this._mapLoader || function() {
                DataManager._errorUrl = DataManager._errorUrl || url;
            };
            window[name] = null;
            xhr.send();
        };
        ImageManager.loadBitmap = function(folder, filename, hue, smooth) {
            if (filename) {
                var path = folder + encodeURIComponent(filename) + '.png';
                var bitmap = this.loadNormalBitmap(path, hue || 0);
                bitmap.smooth = smooth;
                return bitmap;
            } else {
                return this.loadEmptyBitmap();
            }
        };
        BattleManager.gainExp = function() {
            var exp = this._rewards.exp;
            $gameParty.allMembers().forEach(function(actor) {
                actor.gainExp(exp);
            });
        };
        BattleManager.gainGold = function() {
            $gameParty.gainGold(this._rewards.gold);
        };
        BattleManager.gainDropItems = function() {
            var items = this._rewards.items;
            items.forEach(function(item) {
                $gameParty.gainItem(item, 1);
            });
        };
   }
};
HGPlgCore.localTestMethods();

HGPlgCore.toNameChoices = function(arr, ccMes = "取消"){
    return arr.map(function(item){return item.name;}).concat(ccMes);
};
HGPlgCore.alertObj = function(obj){
    alert(JSON.stringify(obj));
};
HGPlgCore.lvAbsDnMapId = [10, 11, 19, 12, 16, 17, 20, 18, 21, 9];
HGPlgCore.curLvDone = function(){
    let mpid = $gameMap.mapId();
    if(this.lvAbsDnMapId.includes(mpid)){
        return true;
    }
    let done = $gameVariables.value(20);
    for(let i=1; i<$dataMapInfos.length; i++){
        if(($dataMapInfos[i]) && ($dataMapInfos[i].id == mpid)){
            return (!isNaN($dataMapInfos[i].name.charAt(0))) && (done >= parseInt($dataMapInfos[i].name.charAt(0)));
        }
    }
    return false;
};
HGPlgCore.isWpTpEqp = function(wtId, actorId = 1){
    return $gameActors.actor(actorId).isWtypeEquipped(wtId);
};
HGPlgCore.isAmTpEqp = function(atId, actorId = 1){
    return $gameActors.actor(actorId).armors().some(function(armor) {
        return armor.atypeId === atId;
    });
};
HGPlgCore.isWpEqp = function(wpId, actorId = 1){
    return $gameActors.actor(actorId).weapons().some(function(weapon) {
        return weapon.id === wpId;
    });
};
HGPlgCore.isThisWpEqp = function(wpId, thisArg){
    return (typeof thisArg.weapons === 'function') && (thisArg.weapons().some(function(weapon) {
        return weapon.id === wpId;
    }));
};
HGPlgCore.getThisWpEqpId = function(wpId, thisArg){
    if(!this.isThisWpEqp(wpId, thisArg)){
        return -1;
    }else{
        for(let i=0; i<thisArg.equips().length; i++){
            if(DataManager.isWeapon(thisArg.equips()[i]) && (thisArg.equips()[i]).id === wpId){
                return i;
            }
        }
    }
};
HGPlgCore.isAmEqp = function(amId, actorId = 1){
    return $gameActors.actor(actorId).armors().some(function(armor) {
        return armor.id === amId;
    });
};
HGPlgCore.isThisAmEqp = function(amId, thisArg){
    return (typeof thisArg.armors === 'function') && (thisArg.armors().some(function(armor) {
        return armor.id === amId;
    }));
};
HGPlgCore.getIdObj = function(arr, oid){
    for(let i=0; i<arr.length; i++){
        if(arr[i].id == oid){
            return arr[i];
        }
    }
    return null;
};
HGPlgCore.rand = function(perc, testing = false){
    return (Math.random() < (1/perc)) || testing;
};