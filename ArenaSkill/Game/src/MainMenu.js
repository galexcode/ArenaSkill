cc.dumpConfig();
//var winSize;
var MainMenu = cc.Layer.extend({
    _ship:null,

    init:function () {
        var bRet = false;
        if (this._super()) {
            winSize = cc.Director.getInstance().getWinSize();
            var sp = cc.Sprite.create(s_loading);
            sp.setAnchorPoint(cc.p(0,0));
            this.addChild(sp, 0, 1);

            var newGameNormal = cc.Sprite.create(s_menu, cc.rect(0, 0, 126, 33));
            var newGameSelected = cc.Sprite.create(s_menu, cc.rect(0, 33, 126, 33));
            var newGameDisabled = cc.Sprite.create(s_menu, cc.rect(0, 33 * 2, 126, 33));

            var newGame = cc.MenuItemSprite.create(newGameNormal, newGameSelected, newGameDisabled, function () {
                this.onButtonEffect();
                this.onNewGame();
            },this);

            var menu = cc.Menu.create(newGame);
            menu.alignItemsVerticallyWithPadding(10);
            this.addChild(menu, 1, 2);
            menu.setPosition(cc.p(winSize.width / 2, winSize.height / 2 - 80));
            this.schedule(this.update, 0.1);

            bRet = true;
        }

        return bRet;
    },
    onNewGame:function (pSender) {
    //load resources
       cc.Loader.preload(g_maingame, function () {
                         var scene = cc.Scene.create();
                         scene.addChild(GameLayer.create());
                         scene.addChild(GameControlMenu.create());
                         cc.Director.getInstance().replaceScene(cc.TransitionFade.create(1.2, scene));
                         }, this);
    },
    update:function () {

    },
    onButtonEffect:function(){
        if (G.SOUND) {
            var s = cc.AudioEngine.getInstance().playEffect(s_buttonEffect);
        }
    }
});

MainMenu.create = function () {
    var sg = new MainMenu();
    if (sg && sg.init()) {
        return sg;
    }
    return null;
};

MainMenu.scene = function () {
    var scene = cc.Scene.create();
    var layer = MainMenu.create();
    scene.addChild(layer);
    return scene;
};
