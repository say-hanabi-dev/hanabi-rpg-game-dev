/*:
 * @plugindesc 怪物与伙伴特性
 * @author Lars
 */

var HGMonNPCCore = window.HGMonNPCCore || {};

HGMonNPCCore.CreateActor = function (id, classid) {
    if (!$dataActors[id]) {
        var list1 = ["Actor1_4", "Actor3_8", "Actor2_4"]; //打架图
        var list2 = [3, 7, 3];                            //行走图的序号
        var list3 = ["Actor1", "Actor3", "Actor2"];       //行走图
        var list4 = [3, 7, 3];                            //脸的序号
        var list5 = ["Actors1", "Actor3", "Actor2"];      //脸
        var list6 = ["混子", "魔法学徒", "辅助法师"];       //名字

        $dataActors[id] = {
            "id": id,
            "battlerName": list1[classid - 2],
            "characterIndex": list2[classid - 2],
            "characterName": list3[classid - 2],
            "classId": classid,
            "equips": [0, 0, 0, 0, 0],
            "faceIndex": list4[classid - 2],
            "faceName": list5[classid - 2],
            "traits": [],
            "initialLevel": 1,
            "maxLevel": 80,
            "name": list6[classid - 2],
            "nickname": "",
            "note": "",
            "profile": "",
            "next": {}
        };
        $gameActors.actor(id - 1)._next = $dataActors[id];
        DataManager.processSCDNotetags2($dataActors);
        DataManager.processSCDNotetags3($dataActors);
    }
}

HGMonNPCCore.AddActor = function (id) {
    $gameParty.addActor(id);
    var actor = $gameActors.actor(id);
    if (!actor._levelup) actor._levelup = 1;
    if (!actor._point) actor._point = 0;
}
HGMonNPCCore.RemoveActor = function (id) {
    $gameParty.removeActor(id);
}

HGMonNPCCore.jicunActor = function () {
    var party = $gameParty.members();
    party = party.filter(function (member) { return member.actorId() != 1 });

    var choice = party.map(function (member) { return member.name() }).concat("取消");
    $gameMessage.add("要寄存哪一位伙伴呢？");
    $gameMessage.setChoices(choice, 0, choice.length);
    $gameMessage.setChoiceCallback(function (x) {
        if (x >= choice.length - 1) return;
        HGMonNPCCore.RemoveActor(party[x]._actorId);
    });
}
HGMonNPCCore.zhaohuiActor = function () {
    var actors = $gameActors._data.filter(function (member) {
        if (member)
            if (member._classId)
                return !$gameParty.members().contains(member) && member._classId >= 2 && member._classId <= 4;
    });
    var choice = actors.map(function (member) { return member.name() }).concat("取消");
    $gameMessage.add("要召回哪一位伙伴呢？");
    $gameMessage.add("需要1w金币才能抵消他们被你寄存时的寂寞哦~");
    $gameMessage.add("（或者他们抛弃你时的不要脸）");
    $gameMessage.setChoices(choice, 0, choice.length);
    $gameMessage.setChoiceCallback(function (x) {
        if (x >= choice.length - 1) return;
        HGMonNPCCore.AddActor(actors[x]._actorId);
    });
}

HGMonNPCCore.Game_Actor_setup = Game_Actor.prototype.setup;
Game_Actor.prototype.setup = function (actorId) {
    HGMonNPCCore.Game_Actor_setup.call(this, actorId);
    this._next = $dataActors[actorId].next;
}

Game_Actor.prototype.next = function () {
    return this._next;
}

HGMonNPCCore.RunMember = [];
HGMonNPCCore.MapId = {
    duchang: 32,
    jitan: 40,
    chengbao: 51
}
HGMonNPCCore.BossStage = 1;
HGMonNPCCore._GameBattler_gainHp = Game_Battler.prototype.gainHp;
Game_Battler.prototype.gainHp = function (value) {

    if ($gameMap.mapId() === HGMonNPCCore.MapId.duchang) {
        if (this.name() != "赌场老千") {
            if ($gameSwitches.value(52)) {//老千
                if ($gameSwitches.value(51)) {//猜奇数
                    value = value - (-value % 2) - 2;
                    $gameSwitches.setValue(53, 1);
                } else {//猜偶数
                    value = value - (-value % 2) - 1;
                    $gameSwitches.setValue(53, 1);
                }
            } else {//正常
                $gameSwitches.setValue(53, (-value % 2 === 1) === !$gameSwitches.value(51));

            }
        }
    } else if ($gameMap.mapId() === HGMonNPCCore.MapId.jitan) {
        if (this.name() === "地狱三头犬") {
            if (!$gameSwitches.value(42) || !$gameSwitches.value(43) || !$gameSwitches.value(44)) {   //破坏三座神像，否则无敌
                value = 0;
                $gameSwitches.setValue(20, 1);
            }
        }
    } else if ($gameMap.mapId() === HGMonNPCCore.MapId.chengbao) {
        if (HGMonNPCCore.BossStage === 1) {
            if (this === $gameTroop.members()[0] && this.hp + value <= 0.75 * this.mhp) {
                value = 0.75 * this.mhp - this.hp;
                HGMonNPCCore.BossStage++;
                this.hide();
                for (var i = 4; i < 8; i++) {
                    $gameTroop.members()[i].appear();
                }
                $gameMessage.add("朋友们！");
                $gameMessage.add("享受这场盛宴吧！");
            }
        } else if (HGMonNPCCore.BossStage === 2) {     //杂兵
            var count = 4;
            for (var i = 4; i < 8; i++) {
                if ($gameTroop.members()[i].isDead()) {
                    count--;
                }
            }
            if (this.isEnemy() && this.hp + value <= 0) {
                if (count === 1) {
                    $gameTroop.members()[0].appear();
                    $gameTroop.members()[0].setHp(0.75 * $dataEnemies[33].params[0]);
                    alert($dataEnemies[33].params[0])
                    HGMonNPCCore.BossStage++;
                    for (var i = 4; i < 8; i++) {
                        $gameTroop.members()[i].transform(37);
                    }
                    $gameMessage.add("2");
                }
            }
        } else if (HGMonNPCCore.BossStage === 3) {
            alert(this.hp)
            if (this === $gameTroop.members()[0] && this.hp + value <= 0.25 * this.mhp) {
                alert(2)
                value = 0.25 * this.mhp - this.hp;
                HGMonNPCCore.BossStage++;
                this.hide();
                for (var i = 4; i < 8; i++) {
                    $gameTroop.members()[i].recoverAll();
                }
                $gameMessage.add("是时候了");
                $gameMessage.add("这场狂欢才正到高潮呢！");
            }

        } else if (HGMonNPCCore.BossStage === 4 || HGMonNPCCore.BossStage === 6) {         //刀，烛台
            var count = 4;
            for (var i = 4; i < 8; i++) {
                if ($gameTroop.members()[i].isDead()) {
                    count--;
                }
            }
            for (var i = 0; i < 4; i++) {
                $gameTroop.members()[i].transform(34 + HGMonNPCCore.BossStage);
            }
            if (this.hp + value <= 0) {
                if (count === 1) {
                    for (var i = 0; i < 4; i++) {
                        $gameTroop.members()[i].appear();
                        $gameTroop.members()[i].recoverAll();
                    }
                    HGMonNPCCore.BossStage++;
                }
            }
        } else if (HGMonNPCCore.BossStage === 5) {         //叉
            var count = 4;
            for (var i = 0; i < 4; i++) {
                if ($gameTroop.members()[i].isDead()) {
                    count--;
                }
            }
            for (var i = 4; i < 8; i++) {
                $gameTroop.members()[i].transform(34 + HGMonNPCCore.BossStage);
            }
            if (this.hp + value <= 0) {
                if (count === 1) {
                    this.transform(34 + HGMonNPCCore.BossStage);
                    for (var i = 4; i < 8; i++) {
                        $gameTroop.members()[i].appear();
                        $gameTroop.members()[i].recoverAll();
                    }
                    HGMonNPCCore.BossStage++;
                }
            }
        } else if (HGMonNPCCore.BossStage === 7) {         //奶
            var count = 4;
            for (var i = 0; i < 4; i++) {
                if ($gameTroop.members()[i].isDead()) {
                    count--;
                }
            }

            $gameTroop.members()[4].transform(33);

            if ($gameTroop.members()[0].isDead()) {
                $gameTroop.members()[0].transform(33);
            }
            if (this.hp + value <= 0) {
                if (count === 1) {
                    $gameTroop.members()[4].recoverAll();
                    $gameTroop.members()[4].setHp(0.25 * $dataEnemies[33].params[0]);
                    HGMonNPCCore.BossStage++;
                    $gameMessage.add("天下没有不散的宴席——");
                    $gameMessage.add("该散场了！");
                }
            }
        }


    }

    HGMonNPCCore._GameBattler_gainHp.call(this, value);




    if (this.isActor()) {
        if (this._classId === 4) {
            var per = 0.2;
            if (this._level >= 30) per = 0.25;
            if (this._level >= 50) per = 0.3;
            if (this.hp < this.mhp * per) {
                $gameMessage.add("有个家伙害怕了，她跑啦！！！");
                this.hide();
                HGMonNPCCore.RunMember.push(this._actorId);
            }
        }
    }
}


HGMonNPCCore.DataManager_loadDataFile = DataManager.loadDataFile;
DataManager.loadDataFile = function (name, src) {
    HGMonNPCCore.DataManager_loadDataFile.call(this, name, src);
    if (name = '$dataMap') {
        for (var i = 0; i < HGMonNPCCore.RunMember.length; i++)
            $gameParty.removeActor(HGMonNPCCore.RunMember[i]);
        HGMonNPCCore.RunMember = [];
    }
}
HGMonNPCCore.Drops = function () {
    var r = Math.floor(Math.random() * 100)
    if (r < 10) {
        $gameParty.gainItem($dataItems[23], 1);
        $gameMessage.add('获得战利品：' + $dataItems[23].name);
    } else if (r < 20) {
        $gameParty.gainItem($dataItems[24], 1);
        $gameMessage.add('获得战利品：' + $dataItems[24].name);
    } else if (r < 30) {
        $gameParty.gainItem($dataItems[25], 1);
        $gameMessage.add('获得战利品：' + $dataItems[25].name);
    }

}