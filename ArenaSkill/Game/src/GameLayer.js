//
// Handles the Game Logic
//

STATE_PLAYING = 0;
STATE_GAMEOVER = 1;

var g_sharedGameLayer;

var GameLayer = cc.Layer.extend({
    _leader:null,

    _time:null,
    _backTileMap:null,
    _levelManager:null,
    _tmpScore:0,
    lbScore:null,
    screenRect:null,
    explosionAnimation:[],
    _beginPos:cc.p(0, 0),
    _state:STATE_PLAYING,
    _isTouch:false,
    init:function () {
        var bRet = false;
        if (this._super()) {
            // reset global values
            G.CONTAINER.ENEMIES = [];
            G.CONTAINER.ENEMY_BULLETS = [];
            G.CONTAINER.PLAYER_BULLETS = [];
            G.TURNING_PTS = [];
            G.SNAKE = [];
            G.SNAKE.LEADER = null;
            G.SCORE = 0;
            G.LIFE = 4;
            this._state = STATE_PLAYING;

            winSize = cc.Director.getInstance().getWinSize();
            //this._levelManager = new LevelManager(this);
            this.initBackground();
            this.screenRect = cc.rect(0, 0, winSize.width, winSize.height + 10);
            // leader
            this._leader = new Leader();
            G.SNAKE[0] = this._leader;
            this.addChild(this._leader, this._leader.zOrder, G.UNIT_TAG.PLAYER);

            // follower
            var follower = new Follower();
            this.addChild(follower, follower.zOrder, G.UNIT_TAG.FOLLOWER);

            // add more Followers
            for(var i=0;i<2;i++) {
                // follower
                follower = new Follower();
                this.addChild(follower, follower.zOrder, G.UNIT_TAG.FOLLOWER);
            }

            // camera follows the leader
            var followAction = cc.Follow.create(this._leader);
            this.runAction(followAction);

            if( 'keyboard' in sys.capabilities )
                this.setKeyboardEnabled(true);

            if( 'touches' in sys.capabilities )
                this.setTouchEnabled(true);

            // schedule
            this.scheduleUpdate();

            if (G.SOUND) {
                cc.AudioEngine.getInstance().playBackgroundMusic(s_bgMusic, true);
            }

            bRet = true;

            g_sharedGameLayer = this;
        }
        return bRet;
    },
    scoreCounter:function () {
        if( this._state == STATE_PLAYING ) {
            this._time++;

            var minute = 0 | (this._time / 60);
            var second = this._time % 60;
            minute = minute > 9 ? minute : "0" + minute;
            second = second > 9 ? second : "0" + second;
            var curTime = minute + ":" + second;
            this._levelManager.loadLevelResource(this._time);
        }
    },
    onTouchesBegan:function(touches, event){
        this._isTouch = true;
    },
    onTouchesMoved:function (touches, event) {
        if(this._isTouch){
            cc.log(touches.length);
            //cc.log(touches[0].getDelta().x);
            //cc.log(touches[0].getDelta().y);

            //this.processEvent(touches[0]);
        }
    },
    onTouchesEnded:function(touches, event){
        this._isTouch = false;
    },
    onMouseDragged:function( event ) {
        if(this._isTouch){
            this.processEvent( event );
        }
    },

    processEvent:function( event ) {
        if( this._state == STATE_PLAYING ) {
            var delta = event.getDelta();
            var curPos = this._leader.getPosition();
            curPos= cc.pAdd( curPos, delta );
            curPos = cc.pClamp(curPos, cc.POINT_ZERO, cc.p(winSize.width, winSize.height) );
            this._leader.setPosition( curPos );
        }
    },

    onKeyDown:function (e) {
        G.KEYS[e] = true;
    },

    onKeyUp:function (e) {
        G.KEYS[e] = false;
    },

    update:function (dt) {
        if( this._state == STATE_PLAYING ) {
            /// NEED TO PREVENT FOLLOWER FROM OVERTAKING ITS LEADER

            this.checkIsCollide();

            // update snake
            var snakeMember;
            for(var i in G.SNAKE) {
                snakeMember = G.SNAKE[i];
                if(snakeMember && typeof snakeMember.update == 'function') {
                    snakeMember.update();
                }
            }

            // update all entities
            //this.removeInactiveUnit(dt);
            //this.checkIsReborn();
            //this.updateUI();
        }

        //if( cc.config.deviceType == 'browser' )
         //   cc.$("#cou").innerHTML = "Ship:" + 1 + ", Enemy: " + G.CONTAINER.ENEMIES.length + ", Bullet:" + G.CONTAINER.ENEMY_BULLETS.length + "," + G.CONTAINER.PLAYER_BULLETS.length + " all:" + this.getChildren().length;
    },
    checkIsCollide:function () {
        var selChild, bulletChild;
        //check collide
        var i =0;
        for (i = 0; i < G.CONTAINER.ENEMIES.length; i++) {
            selChild = G.CONTAINER.ENEMIES[i];
            for (var j = 0; j < G.CONTAINER.PLAYER_BULLETS.length; j++) {
                bulletChild = G.CONTAINER.PLAYER_BULLETS[j];
                if (this.collide(selChild, bulletChild)) {
                    bulletChild.hurt();
                    selChild.hurt();
                }
                if (!cc.rectIntersectsRect(this.screenRect, bulletChild.getBoundingBox() )) {
                    bulletChild.destroy();
                }
            }
            if (this.collide(selChild, this._ship)) {
                if (this._ship.active) {
                    selChild.hurt();
                    this._ship.hurt();
                }
            }
            if (!cc.rectIntersectsRect(this.screenRect, selChild.getBoundingBox() )) {
                selChild.destroy();
            }
        }

        for (i = 0; i < G.CONTAINER.ENEMY_BULLETS.length; i++) {
            selChild = G.CONTAINER.ENEMY_BULLETS[i];
            if (this.collide(selChild, this._ship)) {
                if (this._ship.active) {
                    selChild.hurt();
                    this._ship.hurt();
                }
            }
            if (!cc.rectIntersectsRect(this.screenRect, selChild.getBoundingBox() )) {
                selChild.destroy();
            }
        }
    },
    removeInactiveUnit:function (dt) {
        var selChild, layerChildren = this.getChildren();
        for (var i in layerChildren) {
            selChild = layerChildren[i];
            if (selChild) {
                if( typeof selChild.update == 'function' ) {
                    selChild.update(dt);
                    var tag = selChild.getTag();
                    if ((tag == G.UNIT_TAG.PLAYER) || (tag == G.UNIT_TAG.PLAYER_BULLET) ||
                        (tag == G.UNIT_TAG.ENEMY) || (tag == G.UNIT_TAG.ENMEY_BULLET)) {
                        if (selChild && !selChild.active) {
                            selChild.destroy();
                        }
                    }
                }
            }
        }
    },
    checkIsReborn:function () {
        if (G.LIFE > 0 && !this._ship.active) {
            // ship
            this._ship = new Ship();
            this.addChild(this._ship, this._ship.zOrder, G.UNIT_TAG.PLAYER);
        }
        else if (G.LIFE <= 0 && !this._ship.active) {
            this._state = STATE_GAMEOVER;
            // XXX: needed for JS bindings.
            this._ship = null;
            this.runAction(cc.Sequence.create(
                cc.DelayTime.create(0.2),
                cc.CallFunc.create(this, this.onGameOver)));
        }
    },
    updateUI:function () {
        if (this._tmpScore < G.SCORE) {
            this._tmpScore += 5;
        }
        this._lbLife.setString(G.LIFE);
        this.lbScore.setString("Score: " + this._tmpScore);
    },
    collide:function (a, b) {
        var aRect = a.collideRect();
        var bRect = b.collideRect();
        if (cc.rectIntersectsRect(aRect, bRect)) {
            return true;
        }
    },
    initBackground:function () {
        //tilemap
        this._backTileMap = cc.TMXTiledMap.create(s_level01);
        this.addChild(this._backTileMap, -9);

        // set game tilemap properties
        G.MAP.TILESIZE = this._backTileMap.getTileSize().width;
        G.MAP.WIDTH = this._backTileMap.getMapSize().width*G.MAP.TILESIZE;
        G.MAP.HEIGHT = this._backTileMap.getMapSize().height*G.MAP.TILESIZE;
    },
    onGameOver:function () {
        var scene = cc.Scene.create();
        scene.addChild(GameOver.create());
        cc.Director.getInstance().replaceScene(cc.TransitionFade.create(1.2, scene));
    }
});

GameLayer.create = function () {
    var sg = new GameLayer();
    if (sg && sg.init()) {
        return sg;
    }
    return null;
};

GameLayer.scene = function () {
    var scene = cc.Scene.create();
    var layer = GameLayer.create();
    scene.addChild(layer, 1);
    return scene;
};
