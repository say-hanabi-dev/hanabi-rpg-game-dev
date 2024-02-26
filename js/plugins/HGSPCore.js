/*:
* @plugindesc 技能点与技能相关
* @author Lars
*/
var HGSPCore = window.HGSPCore || {};

HGSPCore.point = [0];   //同上，=技能点数，然后清除技能点

HGSPCore.GainSP = function(id,count){
    var actor = $gameActors.actor(id);
    var name = actor._name;
    if(!actor._point) actor._point = 0;
    actor._point += count;

    $gameMessage.newPage();
    $gameMessage.add(name + "获得了" + count + "个技能点！");
}
HGSPCore.GainPP = function(count){
    $gameMessage.add("获得了" + count + "个属性点！");
    $gameParty.gainItem($dataItems[9],count);  //9号道具：属性点
}
Game_Actor.prototype.point = function() {
    return this._point?this._point:0;
};

HGSPCore.GameActor_displayLevelUp = Game_Actor.prototype.displayLevelUp;
Game_Actor.prototype.displayLevelUp = function(newSkills) {
    HGSPCore.GameActor_displayLevelUp.call(this,newSkills);
    var id = this._actorId;
    var actor = $gameActors.actor(id);
    if(!actor._levelup) actor._levelup = 1;
    var count = this._level - actor._levelup;
    actor._levelup = this._level;

    HGSPCore.GainSP(id,count);
    if(id === 1) HGSPCore.GainPP(2 * count);
}

HGSPCore.IsLearned = function(actorid,skillid){
    var actor = $gameActors.actor(actorid);
    var name = $dataSkills[skillid].name;
    if(actor.isLearnedSkill(skillid)){
        $gameMessage.newPage();
        $gameMessage.add("您已学会「" + name + "」哦（＾▽＾）");
        return true;
    }
    return false;
}

HGSPCore.LearnSkill = function(actorid,skillid,count){
    var actor = $gameActors.actor(actorid);
    var name = $dataSkills[skillid].name;
    var sp = actor._point;
    
    if(count <= sp){
        actor.learnSkill(skillid);
        $gameMessage.add("习得技能「" + name + "」");
        $gameSwitches.setValue(40,0);
        actor._point -= count;
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
        $gameSwitches.setValue(40,0);
    })
}

HGSPCore.skill = {"id":0,"cd":0,"need":0,"formula":""};
HGSPCore.ShowSkills = function(){
    var id = HGSPCore.skill.id;
    var name = $dataSkills[id].name;
    var cd = HGSPCore.skill.cd;
    var need = HGSPCore.skill.need;
    var des = $dataSkills[id].description;
    var formula = HGSPCore.Getformula(id);
    
    $gameMessage.newPage();
    $gameMessage.add("\\n<" + name + ">CD:" + cd + "   需要技能点：" + need);
    if(formula != "")$gameMessage.add(formula);
    $gameMessage.add(des);
}

HGSPCore.ShowSkillsEX = function(skillname){
    var id = HGSPCore.skill.id;
    var name = $dataSkills[id].name;
    var cd = HGSPCore.skill.cd;
    var need = HGSPCore.skill.need;
    var des = $dataSkills[id].description;
    var formula = HGSPCore.Getformula(id);
    
    $gameMessage.newPage();
    $gameMessage.add("\\n<" + name + ">CD:" + cd + "   需要技能点：" + need + "   需要任意伙伴学会" + skillname);
    if(formula != "")$gameMessage.add(formula);
    $gameMessage.add(des);
}

HGSPCore.Getformula = function(id){
    if(id === 197) id = 205;    //任务了解
    var result = "";
    var skill = $dataSkills[id];
    var formula = skill.damage.formula;

    if(skill.damage.type === 1) result += "造成";
    else if(skill.damage.type === 3) result += "恢复";
    else if(skill.damage.type === 5) result += "吸取";
    else return "";             //246是蓝量相关

    //攻击等倍率
    var key = /((\d+) ?\* ?)?a\..{3}( ?\* ?(\d+\.?(\d+)?))?(?!\))/ig;
    var list = formula.match(key);
    if(list){
        for(var i = 0 ; i < list.length; i++){
            var a = list[i].match(/((\d+\.?(\d+)?) ?\* ?)?a\.(.{3})( ?\* ?(\d+\.?(\d+)?))?/i);
            var param = a[4] || "";
            var mul = a[2] || a[6] || "1";
            if(param != ""){
                var plus = "";
                if(i > 0) plus = "\\C[0]+";
                var number = Math.floor(parseFloat(mul) * 100)
                if(param === "atk" && !result.includes("攻击力"))
                    result += plus + "\\C[10]" + number + "\%攻击力";
                if(param === "mat" && !result.includes("魔法攻击力"))
                    result += plus + "\\C[4]" + number + "\%魔法攻击力";
                if(param === "def" && !result.includes("防御力"))
                    result += plus + "\\C[8]" + number + "\%防御力";
            }
        }
    }

    //固定伤害
    key = /(\d+ ?\+)|(\+ ?\d+)/ig;
    var list2 = formula.match(key);
    if(list2){
        if(list){
            for(var i = 0; i < list2.length; i++){
                for(var j = 0; j < list.length; j++){
                    if(list2[i] === list[j]){
                        list2[i] = "";
                        list[j] = "";
                    }
                }
                if(list2[i] != ""){
                    if(result.length > 2)result += "\\C[0]+" + list2[i].match(/\d+/i);
                    else result += "\\C[0]" + list2[i].match(/\d+/i);
                    break;
                }
            }
        }
    }
    //只有固定伤害
    if(result.length === 2){
        var list3 = formula.match(/\d+/i);
        if(list3)
            result += list3[0];
    }

    if(skill.damage.type === 1){
        if(formula.match(/b.def/i))
            result += "\\C[2]物理伤害\\C[0]";
        else if(formula.match(/b.mdf/i))
            result += "\\C[1]魔法伤害\\C[0]";
        else result += "\\C[0]真实伤害";
    }
    if(skill.damage.type === 3 || skill.damage.type === 5) result += "\\C[3]生命值\\C[0]";

    return result;
}


HGSPCore.lightline2 = function(list1,list2){

    if($gameVariables.value(70) === 0) $gameVariables.setValue(70,1);
    for(var i = 0; i < $gameParty.members().length; i++){
        var actor = $gameParty.members()[i];
        
        for(var j = 0; j < list1.length; j++){
            
            if(list1[j].count){
                var need = list1[j].count;
                for(var k = 0; k < list1[j].need.length; k++){
                    if(actor.isLearnedSkill(list1[j].need[k])){
                        need--;
                        if(need === 0){
                            $gameSwitches.setValue(21 + j, 1);
                            break;
                        }
                    }
                }
            }else{
                if(actor.isLearnedSkill(list1[j])){
                    $gameSwitches.setValue(21 + j, 1);
                }
            }
        }
    }
    for (var i = 0; i < list2.length; i++){
        var actor = $gameActors.actor(1);
        if(actor.isLearnedSkill(list2[i])){
            $gameSwitches.setValue(21 + list1.length + i, 1);
        }
    }
}






