//=============================================================================
// HGDlyMxPp.js
//=============================================================================

/*:
 * @plugindesc Daily Maximum Prop Limit by c2h6o for Hanabi Gakuen
 * @author c2h6o
 *
 * @help Item id ${propID} is limited to have ${limit} times daily,
 *      each one drop of the item in setting will be replaced with ${unit} drops
 *      without exceeding the daily maximum.
 * 
 * - Developer Info -
 * Warning: 
 * at rpg_objects.js
 *      Method "Game_Troop.prototype.makeDropItems" is overwritten in 
 *      this plugin.
 * at rpg_managers.js
 *      Method "DataManager.makeSaveContents" 
 *    & method "DataManager.extractSaveContents" are overwritten in 
 *      this plugin.
 */

var HGDlyMxPp = window.HGDlyMxPp || {} ;

HGDlyMxPp.lastDate = 0;
HGDlyMxPp.lplst = [
    {propID: 7, limit: 9, unit: 3, date: 0, cnt: 0},
    {propID: 8, limit: 25, unit: 1, date: 0, cnt: 0},
    {propID: 22, limit: 2, unit: 1, date: 0, cnt: 0}
];//values here for init. for new saves, loading saves will overwrite this data

HGDlyMxPp.proCnt = function(lpid){//return quantity of items counted | -1
    if((this.getDate(lpid)) == 0){
        this.initData(lpid);
    }
    if(this.lpSameDay(lpid)){
        if(this.getCount(lpid) < this.lplst[lpid].limit){
            let addAmount = (this.getCount(lpid) + this.getUnit(lpid) <= this.lplst[lpid].limit)?(this.getUnit(lpid)):
                (this.lplst[lpid].limit - this.getCount(lpid));
            this.addToCnt(lpid, addAmount);
            return addAmount;
        }else{
            return -1;
        }
    }else{
        let nowT = new Date();
        let addAmount = Math.max(this.getUnit(lpid), this.lplst[lpid].limit);
        this.saveData(lpid, nowT.getFullYear(), nowT.getMonth(), nowT.getDate(), addAmount);
        return addAmount;
    }
};

//information format: yyyymmddc
HGDlyMxPp.getYear = function(timeDat){
    return Math.floor((timeDat)/10000);
};
HGDlyMxPp.getMonth = function(timeDat){
    return Math.floor(((timeDat)%10000)/100);
};
HGDlyMxPp.getDate = function(timeDat){
    return Math.floor((timeDat)%100);
};
HGDlyMxPp.getCount = function(lpid){
    return this.lplst[lpid].cnt;
};
HGDlyMxPp.saveData = function(lpid, year, month, date, c = getCount()){
    this.lplst[lpid].date = this.toTimeDat(year, month, date);
    this.lplst[lpid].cnt = c;
};
HGDlyMxPp.toTimeDat = function(year, month, date){
    return year*10000 + month* 100 + date;
};
HGDlyMxPp.addToCnt = function(lpid, x){
    this.lplst[lpid].cnt += x; 
};
HGDlyMxPp.lpSameDay = function(lpid){
    let nowT = new Date();
    return ( (nowT.getFullYear() == this.getYear(this.lplst[lpid].date))
        && (nowT.getMonth() == this.getMonth(this.lplst[lpid].date))
        && (nowT.getDate() == this.getDate(this.lplst[lpid].date)) );
};
HGDlyMxPp.isProp = function(item){//return index of limited prop in lplst | -1
    if((!(item)) || (!('id' in item))){
        return -1;
    }
    for(let i=0; i<this.lplst.length; i++){
        if(this.lplst[i].propID == item.id){
            return i;
        }
    }
    return -1;
};
HGDlyMxPp.getUnit = function(lpid){
    return this.lplst[lpid].unit;
}
/* //for limitations on drop items only
HGDlyMxPp._GameTroop_makeDropItems = Game_Troop.prototype.makeDropItems;
Game_Troop.prototype.makeDropItems = function() {
    let res = HGDlyMxPp._GameTroop_makeDropItems.call(this);
    console.log(res);
    let i = 0;
    let offset = 0;
    let curItem = 0;
    let curLProp = 0;
    while(i < res.length && res.length > 0 ){
        offset = 0;
        curItem = res[i];
        curLProp = HGDlyMxPp.isProp(curItem);
        if(curLProp >= 0){
            let cnt = HGDlyMxPp.proCnt(curLProp);
            if(cnt < 0){
                res.splice(i, 1);
                offset++;
            }else{
                for(let i=0; i<cnt - 1; i++){
                    res.splice(i, 0, curItem);
                    offset--;
                }
            }
        }
        i+= (1-offset);
    };
    return res;
};
 */
HGDlyMxPp._GameParty_GainItem = Game_Party.prototype.gainItem;
Game_Party.prototype.gainItem = function(item, amount, includeEquip){
    let lpid = HGDlyMxPp.isProp(item);
    if(lpid >= 0){
        let cntAmount = amount;
        amount = 0;
        while(cntAmount > 0){
            let cnt = HGDlyMxPp.proCnt(lpid);
            if(cnt < 0){//limit reached: cannot gain
                break;
            }else{
                cntAmount -= cnt;
                amount += cnt;
            }
        }
    }
    HGDlyMxPp._GameParty_GainItem.call(this, item, amount, includeEquip);
};

HGDlyMxPp.initData = function(lpid){
    let nowT = new Date();
    this.saveData(lpid, nowT.getFullYear(), nowT.getMonth(), nowT.getDate(), 0);
};

HGDlyMxPp._DataManager_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    let res = HGDlyMxPp._DataManager_makeSaveContents.call(this);
    res.dataHGDlyMxPp = HGDlyMxPp.makeGameSaveContents();
    return res;
};
HGDlyMxPp.makeGameSaveContents = function(){
    return {date: HGDlyMxPp.lastDate, data: HGDlyMxPp.lplst};
};

HGDlyMxPp._DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    HGDlyMxPp._DataManager_extractSaveContents.call(this, contents);
    HGDlyMxPp.extractGameSaveContents(contents.dataHGDlyMxPp);
};
HGDlyMxPp.extractGameSaveContents = function(contProp){
    if('date' in contProp){
        HGDlyMxPp.lastDate = contProp.date;
        HGDlyMxPp.lplst = contProp.data;
    }else{
        HGDlyMxPp.lplst = contProp;
    }
    HGDlyMxPp.onLoad();
};

HGDlyMxPp.onLoad = function(){
    if(!this.sameDay()){
        HGDlyMxPp.dlyProc();
    }
};
HGDlyMxPp.sameDay = function(){
    if(this.lastDate == 0){
        let nowT = new Date();
        this.lastDate = this.toTimeDat(nowT.getFullYear(), nowT.getMonth(), nowT.getDate());
        return false;
    }
    let nowT = new Date();
    return ( (nowT.getFullYear() == this.getYear(this.lastDate))
        && (nowT.getMonth() == this.getMonth(this.lastDate))
        && (nowT.getDate() == this.getDate(this.lastDate)) );
};

HGDlyMxPp.dlySwitchId = 121;
HGDlyMxPp.dlyProc = function(){
    $gameSwitches.setValue(this.dlySwitchId, false);
};