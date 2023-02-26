/*:
* @plugindesc 获得与使用技能点
* @author Lars
*/
var HGSPCore = window.HGSPCore || {};

HGSPCore.level = [1];   //记得在更新的时候把这个=主角等级
HGSPCore.point = [0];   //同上，=技能点数，然后清除技能点

HGSPCore.GainSP = function(id,count){
    var actor = $gameActors.actor(id);
    var name = actor._name;
    
    if(!HGSPCore.point[id - 1]) HGSPCore.point[id - 1] = 0;
    HGSPCore.point[id - 1] += count;

    $gameMessage.newPage();
    $gameMessage.add(name + "获得了" + count + "个技能点！");

}
HGSPCore.GainPP = function(count){
    $gameMessage.add("获得了" + count + "个属性点！");
    $gameParty.gainItem($dataItems[9],count);  //9号道具：属性点
}

HGSPCore.GameActor_displayLevelUp = Game_Actor.prototype.displayLevelUp;
Game_Actor.prototype.displayLevelUp = function(newSkills) {
    HGSPCore.GameActor_displayLevelUp.call(this,newSkills);
    id = this._actorId;
    if(!HGSPCore.level[id - 1]) HGSPCore.level[id - 1] = 1;
    var count = this._level - HGSPCore.level[id - 1];
    HGSPCore.level[id - 1] = this._level;

    HGSPCore.GainSP(id,count);
    if(id === 1) HGSPCore.GainPP(2 * count);
}

HGSPCore.IsLearned = function(actorid,skillid){
    var actor = $gameActors.actor(actorid);
    var name = $dataSkills[skillid].name;
    if(actor.isLearnedSkill(skillid)){
        $gameMessage.add("您已学会「" + name + "」哦（＾▽＾）");
        return true;
    }
    return false;
}

HGSPCore.LearnSkill = function(actorid,skillid,count){
    var actor = $gameActors.actor(actorid);
    var name = $dataSkills[skillid].name;
    var sp = HGSPCore.point[actorid - 1];
    
    if(count <= sp){
        actor.learnSkill(skillid);
        $gameMessage.add("习得技能「" + name + "」");
        $gameSwitches.setValue(40,0);
        HGSPCore.point[actorid - 1] -= count;
    }else{
        $gameMessage.add("你的技能点不足哦(￣y▽,￣)╭ ");
    }
}

HGSPCore.ChangeTarget = function(){
    var member = $gameParty.members();
    var choice = [];
    var list = [];
    for(var i = 0; i < member.length; i++)
        if(member[i]._actorId != 1){
            choice.push(member[i]._name);
            list.push(member[i]._actorId);
        }
    choice.push("取消");
    
    $gameMessage.add("当前正在由 " + $gameActors.actor($gameVariables.value(70))._name + " 学习技能");
    $gameMessage.add("要改由哪个角色学习技能呢？");
    $gameMessage.setChoices(choice, choice.length, 0)
    $gameMessage.setChoiceCallback(function(x){
        if(x < choice.length - 1) $gameVariables.setValue(70,list[x]);
    })
}
