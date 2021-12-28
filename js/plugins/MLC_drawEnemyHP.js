// MLC_drawEnemyHP.js
 
 
/*:
@plugindesc 战斗图中绘制敌方血条_v09.11.2016
@author 在野月光族
 
@help
注※ 本插件不支持由打击震动等效果所产生的偏移结算。
 
插件指令(非必需)。
格式：
 指令  参数
 HPX   x值  --  设定血条的坐标X ，默认为 -50。
 HPY   y值  --  设定血条的坐标y ，默认为相对位置。
 
*/
 
/*
==========================================================================
  ◆ 自定义参数
==========================================================================
*/
var MLC = {};
MLC.HPX = 0;
MLC.HPY = 0;
 
/*导入插件指令函数*/
MLC.GEPC = Game_Interpreter.prototype.pluginCommand;
 
/*导入更新精灵函数*/
MLC.EupdateXX = Sprite_Enemy.prototype.update;
 
/*
==========================================================================
  ◆ 调用插件指令 (重写)
==========================================================================
*/
Game_Interpreter.prototype.pluginCommand = function(command, args) {
        /*调入原函数*/
        MLC.GEPC.call(this);
 
        /*检查插件参数*/
        if( !command || !args ) return ;
 
        /*过滤插件指令*/
        switch(command.toUpperCase() ){
 
                /*指令1 - 名称*/
                case 'HPX':
                        /*提取X坐标*/
                        MLC.HPX = Number(args[0]);
                break;
 
                /*指令2 - 名称*/
                case 'HPY':
                        /*提取y坐标*/
                        MLC.HPY = Number(args[0]);
                break;        
        }
};
 
/*
==========================================================================
  ◆ 更新血条精灵 (新建)
==========================================================================
*/
Sprite_Enemy.prototype.updateHpRect = function(){ 
 
        /*如果敌对单位存在*/
        if (this._enemy){
 
                /*如果血条精灵已创建，则移除精灵*/
                if(this.SptEnemyHp){this.removeChild(this.SptEnemyHp) };
 
                /*计算当前血条的可视长度(默认值：最大100像素)*/
                var EYHP = Math.ceil(this._enemy.hp / this._enemy.mhp * 100) ;  
 
                /*更新血条纵轴的相对位置*/
                this.updateStateSprite();
 
                /*创建精灵*/
                this.SptEnemyHp = new Sprite();
 
                /*设定血条横坐标X*/
                this.SptEnemyHp.x = MLC.HPX || - 50 ; 
 
                /*计算血条纵坐标Y(默认偏移值：18)*/
                this.SptEnemyHp.y = MLC.HPY || this._stateIconSprite.y + 18;  
 
                /*设定血条尺寸并绘制(默认高度：2像素)*/
                this.SptEnemyHp.bitmap = new Bitmap(EYHP, 8); 
 
                /*设置血条颜色并填充(默认值：红色)*/
                this.SptEnemyHp.bitmap.fillAll('yellow');
 
                /*显示血条*/
                this.addChild(this.SptEnemyHp)
        };        
};
 
/*
==========================================================================
  ◆ 更新 (重写)
==========================================================================
*/
 
Sprite_Enemy.prototype.update = function(){
        /*调入原函数*/
        MLC.EupdateXX.call(this);
 
        /*更新血条精灵*/
        this.updateHpRect();
};