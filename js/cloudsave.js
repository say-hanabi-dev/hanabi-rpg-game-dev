//===========//
// 云存档功能 //
//==========//

// 获取hanabigame-api.html返回的数据
var uid = null;

var xhr = new XMLHttpRequest();
xhr.open('GET', '/hanabigame-api.html', false);
xhr.onload = function () {
    console.log("请求用户数据...")
    if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        console.log(data);
        uid = data.data.uid;
        console.log("uid:" + uid);
    } else {
        console.log('获取用户数据失败...');
    }
}
xhr.send();

// 获取用户存档并存入localStorage
if (uid) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/game_save/' + uid + '.sav'+'?'+Math.random(), false);
    xhr.setRequestHeader('If-Modified-Since', '0');
    xhr.onload = function () {
        console.log("正在同步云存档...")
        if (xhr.status === 200) {
            var data = {};
            try {
                data = JSON.parse(xhr.responseText);
            } catch (e) {
                console.log("云端存档为异常，不覆盖本地存档...");
            }
            console.log("云端存档:");
            console.log(data);
            // 遍历data并存入localStorage
            for (var key in data) {
                localStorage.setItem(key, data[key]);
            }
        } else {
            console.log('获取用户存档失败...');
        }
    }
    xhr.send();
} else {
    console.log("未获取到uid，不同步云存档...");
}
