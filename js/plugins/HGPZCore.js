/*:
* @plugindesc 解密本核心
* @author Lars
*/
var HGPZCore = window.HGPZCore || {};


//加点道具栏原有内容
HGPZCore.Origin = [6, 9, 10]    //伙伴列表，属性点，查看技能点
//调查笔记和解密线索（道具）
HGPZCore.ClueList = [           //全部连着就直接begin和end标记头尾，不连着就加个数组else，没有就写空对象，不要写null
    { begin: 111, end: 113 },   //调查笔记说明，暂停解密，答题
    { begin: 114, end: 121 }    //解密本1
]
//解密本的变量
HGPZCore.VariableList = [       //同上
    null,                       //单纯占位，这样不用从0开始
    {}                          //解密本1
]
//解密本的地图
HGPZCore.MapList = [
    null,
    { else: [33, 53] }
]

//正在游玩的解密本
HGPZCore.Gaming = 0
//无法中途退出的解密本
HGPZCore.Unstop = [0, 1]





//进入解密本，直接写在书架里
HGPZCore.Start = function (number) {    //解密本序号
    HGPZCore.Gaming = number    //正在游玩的解密本

    //itypeId=2时显示在关键道具中，=3时隐藏
    HGPZCore.Origin.forEach(function (item) {
        $dataItems[item].itypeId = 3;
    })

    //“关键道具”显示在道具栏的名字
    $dataSystem.terms.commands[14] = "调查笔记";

    if (HGPZCore.ClueList[0].begin) {
        for (i = HGPZCore.ClueList[0].begin; i <= HGPZCore.ClueList[0].end; i++) {
            $dataItems[i].itypeId = 2;
        }
    }


    if (HGPZCore.ClueList[number].begin) {
        for (i = HGPZCore.ClueList[number].begin; i <= HGPZCore.ClueList[number].end; i++) {
            $dataItems[i].itypeId = 2;
        }
    }
    if (HGPZCore.ClueList[number].else) {
        HGPZCore.ClueList[number].else.forEach(function (item) {
            $dataItems[item].itypeId = 2;
        })
    }
}

//暂停解密，公共事件102
HGPZCore.Pause = function () {
    $dataSystem.terms.commands[14] = "技能/属性加点";

    HGPZCore.Origin.forEach(function(item){
        $dataItems[item].itypeId = 2;
    })

    if (HGPZCore.ClueList[0].begin) {
        for (i = HGPZCore.ClueList[0].begin; i <= HGPZCore.ClueList[0].end; i++) {
            $dataItems[i].itypeId = 3;
        }
    }
    if (HGPZCore.ClueList[HGPZCore.Gaming].begin) {
        for (i = HGPZCore.ClueList[HGPZCore.Gaming].begin; i <= HGPZCore.ClueList[HGPZCore.Gaming].end; i++) {
            $dataItems[i].itypeId = 3;
        }
    }
    if (HGPZCore.ClueList[HGPZCore.Gaming].else) {
        HGPZCore.ClueList[HGPZCore.Gaming].else.forEach(function (item) {
            $dataItems[item].itypeId = 3;
        })
    }


}
//通过并重置解密本，公共事件103
HGPZCore.End = function () {
    HGPZCore.Pause()    //前半与暂停是相同的
    //道具重置
    if (HGPZCore.ClueList[HGPZCore.Gaming].begin) {
        for (i = HGPZCore.ClueList[HGPZCore.Gaming].begin; i <= HGPZCore.ClueList[HGPZCore.Gaming].end; i++) {
            $gameParty.gainItem($dataItems[i], -999);
        }
    }
    if (HGPZCore.ClueList[HGPZCore.Gaming].else) {
        HGPZCore.ClueList[HGPZCore.Gaming].else.forEach(function (item) {
            $gameParty.gainItem($dataItems[item], -999);
        })
    }
    //变量重置
    if (HGPZCore.VariableList[HGPZCore.Gaming].begin) {
        for (i = HGPZCore.VariableList[HGPZCore.Gaming].begin; i <= HGPZCore.VariableList[HGPZCore.Gaming].end; i++) {
            $gameVariables.setValue(i, 0);
        }
    }
    if (HGPZCore.VariableList[HGPZCore.Gaming].else) {
        HGPZCore.VariableList[HGPZCore.Gaming].else.forEach(function (item) {
            $gameVariables.setValue(item, 0);
        })
    }

}

//解密本线索调查
HGPZCore.Scene_Item_useItem = Scene_Item.prototype.useItem
Scene_Item.prototype.useItem = function () {
    HGPZCore.Scene_Item_useItem.call(this)
    HGPZCore.UsedItem = this.item().id      //记录所使用的道具
};


//载入地图时判定是否在解密本中
//$data开头的内容被修改后，重进游戏会重置
HGPZCore.DataManager_loadMapData = DataManager.loadMapData
DataManager.loadMapData = function (mapId) {
    HGPZCore.DataManager_loadMapData.call(this, mapId)

    for (var i = 1; i < HGPZCore.MapList.length; i++) {
        if (HGPZCore.MapList[i].begin) {
            for (j = HGPZCore.MapList[i].begin; j <= HGPZCore.MapList[i].end; j++) {
                if (mapId == j) {
                    HGPZCore.Start(i)
                    i = HGPZCore.MapList.length     //退出i循环
                    break
                }
            }
        }

        if (HGPZCore.MapList[i].else) {
            HGPZCore.MapList[i].else.forEach(function (item) {
                if (mapId == item) {
                    HGPZCore.Start(i)
                    i = HGPZCore.MapList.length     //退出i循环
                    return
                }
            })
        }
    }


}


