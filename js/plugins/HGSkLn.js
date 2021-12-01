//=============================================================================
// HGSkLn.js
//=============================================================================

/*:
 * @plugindesc Skill learning by c2h6o for Hanabi Gakuen
 * @author c2h6o
 *
 * @help Allows the player to learn skills using skill points at shop.
 * 
 * This plugin works with HGPlgCore.
 */

var HGSkLn = window.HGSkLn || {} ;
HGSkLn._Game_Interpreter_pluginCommand =
        Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    HGSkLn._Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'HGSkLn') {
        switch (args[0]) {
        case 'psk':
            HGSkLn.purchaseSkill(parseInt(args[1]));
            break;
        }
    }
};
HGSkLn.spId = 10;
HGSkLn.price = [
    {id: 4, sp:0},
    {id: 5, sp:0},
    {id: 6, sp:1},
    {id: 7, sp:2},
    {id: 8, sp:2},
    {id: 9, pre:[5,6,7], alltr:true, sp:3},
    {id: 10, pre:8, sp:4},
    {id: 11, pre:9, sp:4},
    {id: 13, sp:0},
    {id: 14, sp:0},
    {id: 15, sp:2},
    {id: 17, sp:1},
    {id: 18, pre:17, sp:3},
    {id: 19, sp:4},
    {id: 20, pre:19, sp:4},
    {id: 21, sp:5},
    {id: 22, sp:5},
    {id: 24, sp:0},
    {id: 25, pre:24, sp:1},
    {id: 26, sp:1},
    {id: 27, sp:1},
    {id: 28, pre:27, sp:3},
    {id: 29, sp:1},
    {id: 30, pre: 29, sp:3},
    {id: 31, sp:1},
    {id: 32, pre:32, sp:3},
    {id: 33, pre:24, sp:3},
    {id: 34, sp:3},
    {id: 35, pre:25, sp:3},
    {id: 36, pre:25, sp:4},
    {id: 37, pre:[28, 30, 32], alltr: false, sp:5},
    {id: 38, pre:[28, 30, 32], alltr: false, sp:4},
    {id: 41, sp:0},
    {id: 42, pre:41, sp:1},
    {id: 43, sp:1},
    {id: 44, sp:2},
    {id: 45, pre:44, sp:2},
    {id: 46, sp:1},
    {id: 47, pre:46, sp:3},
    {id: 48, pre:47, sp:3},
    {id: 49, sp:1},
    {id: 50, pre:49, sp:3},
    {id: 51, pre:50, sp:3},
    {id: 52, sp:1},
    {id: 53, pre:52, sp:3},
    {id: 54, pre:52, sp:1},
    {id: 55, pre:52, sp:3},
    {id: 56, pre:56, sp:5},
    {id: 57, pre:43, sp:5},
    {id: 58, pre:57, sp:5},
    {id: 59, pre:44, sp:6},
    {id: 61, sp:0},
    {id: 62, sp:0},
    {id: 63, pre:61, sp:1},
    {id: 64, pre:63, sp:1},
    {id: 65, pre:64, sp:1},
    {id: 66, pre:65, sp:1},
    {id: 67, sp:1},
    {id: 68, pre:67, sp:2},
    {id: 69, pre:68, sp:2},
    {id: 70, pre:69, sp:3},
    {id: 71, sp:1},
    {id: 72, pre:71, sp:2},
    {id: 73, pre:72, sp:2},
    {id: 74, pre:73, sp:3},
    {id: 75, sp:0},
    {id: 76, pre:75, sp:2},
    {id: 77, sp:0},
    {id: 78, pre:77, sp:2},
    {id: 79, pre:78, sp:3},
    {id: 80, pre:79, sp:4},
    {id: 81, pre:80, sp:5},
    {id: 82, pre:81, sp:5},
    {id: 84, sp:0},
    {id: 85, sp:1},
    {id: 86, sp:1},
    {id: 87, sp:1},
    {id: 88, pre:84, sp:2},
    {id: 89, pre:88, sp:3},
    {id: 90, pre:89, sp:4},
    {id: 91, pre:88, sp:2},
    {id: 92, pre:91, sp:3},
    {id: 93, pre:92, sp:2},
    {id: 94, pre:93, sp:3},
    {id: 101, sp: 0},
    {id: 102, sp: 10},
    {id: 103, sp: 10},
    {id: 104, sp: 10},
    {id: 105, sp: 20}
];
HGSkLn.sklnInfo = {
    defaultInd: 0
};
HGSkLn.getSkInfo = function(skId){
    for(let i=0; i<this.price.length; i++){
        if(this.price[i].id==skId){
            return this.price[i];
        }
    }
    return null;
};
HGSkLn.getSkills = function(skTpId){
    return $dataSkills.filter((skill)=>{
        return skill && (skill.id > 3) && (skill.id < 106) && (skill.name.trim() != "") && (skill.stypeId == skTpId);
    });
};
HGSkLn.skills = [];
HGSkLn.purchaseSkill = function(skTpId){
    this.skills = this.getSkills(skTpId).filter((skill)=>{return this.canBuy(skill.id);});
    $gameMessage.setChoices(this.skills.map((item)=>{return this.getSkInfo(item.id).sp+"SP "+item.name;}).concat("取消"), this.sklnInfo.defaultInd, this.skills.length);
    $gameMessage.setChoiceCallback((x)=>{//everything after the choice is made
        if(x < this.skills.length){
            $gameActors.actor(1).learnSkill(this.skills[x].id);
            $gameParty.loseItem($dataItems[this.spId], this.getSkInfo(this.skills[x].id).sp, false);
        }
    });
    $gameMessage.add((this.skills.length == 0)?"这个领域目前没有可以学习的技能。":"要学习哪个技能?");
};

HGSkLn.canBuy = function(skId){
    return (this.getSkInfo(skId)) && (this.getSkInfo(skId).sp <= $gameParty.numItems(this.spId)) && this.canLearn(skId);
};
HGSkLn.canLearn = function(skId){
    if(this.hasSkill(skId)){
        return false;
    }
    let info = this.getSkInfo(skId);
    if('pre' in info){
        if(Array.isArray(info.pre)){
            if(info.alltr){
                return info.pre.map(this.hasSkill).reduce((pre, cur)=>(pre && cur));
            }else{
                return info.pre.map(this.hasSkill).reduce((pre, cur)=>(pre || cur));
            }
        }else{
            return this.hasSkill(skId);
        }
    }else{
        return true;
    }
};
HGSkLn.hasSkill = function(skId){
    return $gameActors.actor(1).isLearnedSkill(skId);
};