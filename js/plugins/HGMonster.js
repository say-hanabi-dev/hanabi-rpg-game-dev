/*:
 * @plugindesc 怪物特性
 * @author Lars
 */

var HGMonster = window.HGMonster || {} ;





HGMonster._GameBattler_gainHp = Game_Battler.prototype.gainHp;
Game_Battler.prototype.gainHp = function(value){
    
    if($gameMap.mapId() === 32){
        if(this.name() != "赌场老千"){
            if($gameSwitches.value(52)){//老千
                if($gameSwitches.value(51)){//猜奇数
                    value = value - (-value % 2) - 2;
                    $gameSwitches.setValue(53,1);
                }else{//猜偶数
                    value = value - (-value % 2) - 1;
                    $gameSwitches.setValue(53,1);
                }
            }else{//正常
                $gameSwitches.setValue(53,(-value % 2 === 1) === !$gameSwitches.value(51));
                
            }
        }
    }
    
    if(this.name() === "地狱三头犬"){
        if(!$gameSwitches.value(42) || !$gameSwitches.value(43) || !$gameSwitches.value(44)){   //破坏三座神像，否则无敌
            value = 0;
            $gameSwitches.setValue(20,1);
        }
    }
    HGMonster._GameBattler_gainHp.call(this, value);
}








