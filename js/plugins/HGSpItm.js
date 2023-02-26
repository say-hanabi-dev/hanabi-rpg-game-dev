//=============================================================================
// HGSpItm.js
//=============================================================================

/*:
 * @plugindesc Equipment Rarity Enhancement Card by c2h6o for Hanabi Gakuen
 * @author c2h6o, Lars
 *
 * @help Allows the player to increase the rarity of a equipment by 1.
 * 
 * This plugin works with HGPlgCore.
 */

var HGSpItm = window.HGSpItm || {} ;

HGSpItm.WeaponAdv = function(){
    var list1 = $gameParty.weapons();
    var list2 = [];
    for(var i = 0;i<list1.length;i++){
        if(list1[i].name.includes("量产") || list1[i].name.includes("稀有") || list1[i].name.includes("超稀有"))
            list2.push(list1[i]);
    }
    list1 = $gameParty.armors();
    for(var i = 0;i<list1.length;i++){
        if(list1[i].name.includes("量产") || list1[i].name.includes("稀有") || list1[i].name.includes("超稀有"))
            if(list1[i].etypeId === 2)
                list2.push(list1[i]);
    }
    var choice = list2.map(function(item){return item.name;}).concat("取消");
    $gameMessage.add("要进阶哪一件装备呢？");
    $gameMessage.setChoices(choice,0,choice.length);
    $gameMessage.setChoiceCallback(function(x){
        
        if(x < list2.length){
            var item = list2[x];
            $gameParty.gainItem(item,-1);
            if(item.etypeId === 1){
                if(item.name.includes("超稀有")){
                    var i = 1;
                    for(i = 1; i < 4; i++){
                        if($dataWeapons[item.id + i].name.includes("极品"))break;
                    }
                    $gameParty.gainItem($dataWeapons[item.id + Math.floor(Math.random() * 3) + i],1);
                    
                }else if(list2[x].name.includes("稀有")){
                    $gameParty.gainItem($dataWeapons[item.id + Math.floor(Math.random() * 3) + 1],1);
                    
                }else if(list2[x].name.includes("量产")){
                    $gameParty.gainItem($dataWeapons[item.id + 1],1);
                }
            }else{
                if(item.name.includes("超稀有")){
                    var i = 1;
                    for(i = 1; i < 4; i++){
                        if($dataArmors[item.id + i].name.includes("极品"))break;
                    }
                    $gameParty.gainItem($dataArmors[item.id + Math.floor(Math.random() * 3) + i],1);
                    
                }else if(list2[x].name.includes("稀有")){
                    $gameParty.gainItem($dataArmors[item.id + Math.floor(Math.random() * 3) + 1],1);
                    
                }else if(list2[x].name.includes("量产")){
                    $gameParty.gainItem($dataArmors[item.id + 1],1);
                }
            }
            
        }else $gameParty.gainItem($dataItems[23],1);//返还道具消耗
    });
};

HGSpItm.ArmorAdv = function(){
    var list1 = $gameParty.armors();
    var list2 = [];
    for(var i = 0;i<list1.length;i++){
        if(list1[i].name.includes("量产") || list1[i].name.includes("稀有") || list1[i].name.includes("超稀有"))
            if(list1[i].etypeId != 2)
                list2.push(list1[i]);
    }
    var choice = list2.map(function(item){return item.name;}).concat("取消");
    $gameMessage.add("要进阶哪一件装备呢？");
    $gameMessage.setChoices(choice,0,choice.length);
    $gameMessage.setChoiceCallback(function(x){
        
        if(x < list2.length){
            var item = list2[x];
            $gameParty.gainItem(item,-1);

            if(item.name.includes("超稀有")){
                var i = 1;
                for(i = 1; i < 4; i++){
                    if($dataArmors[item.id + i].name.includes("极品"))break;
                }
                var Rnd = 0;
                if($dataArmors[item.id].etypeId === 2)Rnd = Math.floor(Math.random() * 3);
                else Rnd = Math.floor(Math.random() * 2);
                $gameParty.gainItem($dataArmors[item.id + Rnd + i],1);
                
            }else if(list2[x].name.includes("稀有")){
                var Rnd = 0;
                if($dataArmors[item.id].etypeId === 2)Rnd = Math.floor(Math.random() * 3);
                else Rnd = Math.floor(Math.random() * 2);
                $gameParty.gainItem($dataArmors[item.id + Rnd + 1],1);
                
            }else if(list2[x].name.includes("量产")){
                $gameParty.gainItem($dataArmors[item.id + 1],1);
            }
        }else $gameParty.gainItem($dataItems[23],1);//返还道具消耗
    });
    
};


HGSpItm.WeaponChange = function(){
    var list1 = $gameParty.weapons();
    var list2 = [];
    for(var i = 0;i<list1.length;i++){
        if(list1[i].name.includes("极品") || list1[i].name.includes("超稀有"))
            list2.push(list1[i]);
    }
    list1 = $gameParty.armors();
    for(var i = 0;i<list1.length;i++){
        if(list1[i].name.includes("极品") || list1[i].name.includes("超稀有"))
            if(list1[i].etypeId === 2)
                list2.push(list1[i]);
    }
    var choice = list2.map(function(item){return item.name;}).concat("取消");
    $gameMessage.add("要重新抽取哪一件装备的天赋呢？");
    $gameMessage.setChoices(choice,0,choice.length);
    $gameMessage.setChoiceCallback(function(x){
        
        if(x < list2.length){
            var item = list2[x];

            if(item.name.includes("超稀有")){
                $gameParty.gainItem($dataWeapons[item.id],-1);
                var EquipLst = [item.id];
                var i = 1;
                for(i = 1; i < 3; i++){
                    if($dataWeapons[item.id + i].name.includes("超稀有"))EquipLst.push(item.id + i);
                    if($dataWeapons[item.id - i].name.includes("超稀有"))EquipLst.push(item.id - i);
                }
                $gameParty.gainItem($dataWeapons[EquipLst[Math.floor(Math.random() * EquipLst.length)]],1);

            }else if(list2[x].name.includes("极品")){
                $gameParty.gainItem($dataWeapons[item.id],-1);
                var EquipLst = [item.id];
                var i = 1;
                for(i = 1; i < 3; i++){
                    if($dataWeapons[item.id + i].name.includes("极品"))EquipLst.push(item.id + i);
                    if($dataWeapons[item.id - i].name.includes("极品"))EquipLst.push(item.id - i);
                }
                $gameParty.gainItem($dataWeapons[EquipLst[Math.floor(Math.random() * EquipLst.length)]],1);

            }
        }else $gameParty.gainItem($dataItems[25],1);//返还道具消耗
    });
};

HGSpItm.ArmorChange = function(){
    var list1 = $gameParty.armors();
    var list2 = [];
    for(var i = 0;i<list1.length;i++){
        if(list1[i].name.includes("极品") || list1[i].name.includes("超稀有"))
            if(list1[i].etypeId != 2)
                list2.push(list1[i]);
    }
    var choice = list2.map(function(item){return item.name;}).concat("取消");
    $gameMessage.add("要重新抽取哪一件装备的天赋呢？");
    $gameMessage.setChoices(choice,0,choice.length);
    $gameMessage.setChoiceCallback(function(x){
        
        if(x < list2.length){
            var item = list2[x];

            if(item.name.includes("超稀有")){
                $gameParty.gainItem($dataArmors[item.id],-1);
                var EquipLst = [item.id];
                var i = 1;
                for(i = 1; i < 3; i++){
                    if($dataArmors[item.id + i].name.includes("超稀有"))EquipLst.push(item.id + i);
                    if($dataArmors[item.id - i].name.includes("超稀有"))EquipLst.push(item.id - i);
                }
                $gameParty.gainItem($dataArmors[EquipLst[Math.floor(Math.random() * EquipLst.length)]],1);

            }else if(list2[x].name.includes("极品")){
                $gameParty.gainItem($dataArmors[item.id],-1);
                var EquipLst = [item.id];
                var i = 1;
                for(i = 1; i < 3; i++){
                    if($dataArmors[item.id + i].name.includes("极品"))EquipLst.push(item.id + i);
                    if($dataArmors[item.id - i].name.includes("极品"))EquipLst.push(item.id - i);
                }
                $gameParty.gainItem($dataArmors[EquipLst[Math.floor(Math.random() * EquipLst.length)]],1);

            }
        }else $gameParty.gainItem($dataItems[25],1);//返还道具消耗
    });
};

//转让要同时找到武器和盾牌（天赋一致）
HGSpItm.WeaponTrans1 = function(){
    var list1 = $gameParty.weapons();
    var list2 = [];
    for(var i = 0;i<list1.length;i++){
        if(list1[i].name.includes("极品") || list1[i].name.includes("超稀有"))
            list2.push(list1[i]);
    }
    list1 = $gameParty.armors();
    for(var i = 0;i<list1.length;i++){
        if(list1[i].name.includes("极品") || list1[i].name.includes("超稀有"))
            if(list1[i].etypeId === 2)
                list2.push(list1[i]);
    }
    var choice = list2.map(function(item){return item.name;}).concat("取消");
    $gameMessage.add("请选择材料装备");
    $gameMessage.setChoices(choice,0,choice.length);
    $gameMessage.setChoiceCallback(function(x){
        if(x < list2.length){
            $gameVariables.setValue(94,list2[x].id * 10 + list2[x].etypeId);
            $gameTemp.reserveCommonEvent(160);
        }else{
            $gameVariables.setValue(94,0);
            $gameParty.gainItem($dataItems[24],1);//返还道具消耗
        }
    });
}

HGSpItm.WeaponTrans2 = function(){
    var list1 = $gameParty.equipItems();
    var list2 = [];
    
    var item = $dataWeapons[1];
    if($gameVariables.value(94) % 10 === 1)item = $dataWeapons[Math.floor($gameVariables.value(94) / 10)];
    else item = $dataArmors[Math.floor($gameVariables.value(94) / 10)];
    var gift = "";
    if(item.description.includes("极意"))gift = "极意";
    if(item.description.includes("底力"))gift = "底力";
    if(item.description.includes("浴血"))gift = "浴血";
    if(item.description.includes("天眼"))gift = "天眼";
    if(item.description.includes("明镜止水"))gift = "明镜止水";
    if(item.description.includes("附魔"))gift = "附魔";
    if(item.description.includes("宇宙"))gift = "宇宙";

    for(var i = 0;i<list1.length;i++){
        if(list1[i].etypeId <= 2 && !list1[i].description.includes(gift)){
            if(list1[i].name.includes("超稀有") && item.name.includes("超稀有")) list2.push(list1[i]);
            if(list1[i].name.includes("极品") && item.name.includes("极品")) list2.push(list1[i]);
        }
        
    }
    var choice = list2.map(function(item){return item.name;}).concat("取消");
    $gameMessage.add("已选择" + item.name);
    $gameMessage.add("要将它的  \\C[18]" + gift);
    $gameMessage.add("\\C[0]让渡给哪件装备呢？");
    $gameMessage.setChoices(choice,0,choice.length);
    $gameMessage.setChoiceCallback(function(x){
        if(x < list2.length){
            $gameParty.gainItem(item, -1);  //提供天赋的材料
            if(list2[x].etypeId === 1){    //提供本体的材料
                $gameParty.gainItem($dataWeapons[list2[x].id], -1);
            }else{
                $gameParty.gainItem($dataArmors[list2[x].id], -1);
            }
            for(var i = -2; i <= 2; i++){
                if(i === 0)i++;
                if(list2[x].etypeId === 1){
                    if($dataWeapons[list2[x].id + i].description.includes(gift)){
                        $gameParty.gainItem($dataWeapons[list2[x].id + i], 1);
                        break;
                    }
                }else{
                    if($dataArmors[list2[x].id + i].description.includes(gift)){
                        $gameParty.gainItem($dataArmors[list2[x].id + i], 1);
                        break;
                    }
                }
            }
            
        }else{
            $gameVariables.setValue(94,0);
            $gameParty.gainItem($dataItems[24],1);
            //返回道具
        }
    });
}

HGSpItm.ArmorTrans1 = function(){
    var list1 = $gameParty.armors();
    var list2 = [];
    for(var i = 0;i<list1.length;i++){
        if(list1[i].name.includes("极品") || list1[i].name.includes("超稀有"))
            if(list1[i].etypeId != 2)
                list2.push(list1[i]);
    }
    
    var choice = list2.map(function(item){return item.name;}).concat("取消");
    $gameMessage.add("请选择材料装备");
    $gameMessage.setChoices(choice,0,choice.length);
    $gameMessage.setChoiceCallback(function(x){
        if(x < list2.length){
            $gameVariables.setValue(94,list2[x].id);
            $gameTemp.reserveCommonEvent(160);
        }else{
            $gameVariables.setValue(94,0);
            $gameParty.gainItem($dataItems[24],1);//返还道具消耗
        }
    });
}

HGSpItm.ArmorTrans2 = function(){
    var list1 = $gameParty.armors();
    var list2 = [];
    
    var item = $dataArmors[$gameVariables.value(94)];
    var gift = "";
    if(item.description.includes("庇护"))gift = "庇护";
    if(item.description.includes("死战"))gift = "死战";
    if(item.description.includes("神之爱"))gift = "神之爱";
    if(item.description.includes("限制解除"))gift = "限制解除";

    for(var i = 0;i<list1.length;i++){
        if(list1[i].etypeId != 2 && !list1[i].description.includes(gift)){
            if(list1[i].name.includes("超稀有") && item.name.includes("超稀有"))list2.push(list1[i]);
            if(list1[i].name.includes("极品") && item.name.includes("极品"))list2.push(list1[i]);
        }
    }
    var choice = list2.map(function(item){return item.name;}).concat("取消");
    $gameMessage.add("已选择" + item.name);
    $gameMessage.add("要将它的  \\C[18]" + gift);
    $gameMessage.add("\\C[0]让渡给哪件装备呢？");
    $gameMessage.setChoices(choice,0,choice.length);
    $gameMessage.setChoiceCallback(function(x){
        if(x < list2.length){
            $gameParty.gainItem(item, -1);  //提供天赋的材料
            $gameParty.gainItem($dataArmors[list2[x].id], -1);  //提供本体的材料

            for(var i = -1; i <= 1; i++){
                if(i === 0)i++;
                if($dataArmors[list2[x].id + i].description.includes(gift)){
                    $gameParty.gainItem($dataArmors[list2[x].id + i], 1);
                    break;
                }
            }
        }else{
            $gameVariables.setValue(94,0);
            $gameParty.gainItem($dataItems[24],1);
            //返回道具
        }
    });
}