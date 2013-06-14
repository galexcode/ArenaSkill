var Leader = cc.Sprite.extend({
    speed:130,
    HP:5,
    canBeAttack:true,
    zOrder:3000,
    actionTo:null,
    animAction:null,
    currentFrameSetID:0,
    baseImageName:'redKnight',
    walkUpFrameSetID:0,
    walkDownFrameSetID:2,
    walkLeftFrameSetID:3,
    walkRightFrameSetID:1,
    _isAcceptingInput:true,
    _hurtColorLife:0,
    active:true,

    ctor:function () {
        this._super();

        // cache sprite frames and texture
        cc.SpriteFrameCache.getInstance().addSpriteFrames(s_redKnight_plist);

        // set initial frame
        var spriteFrame = cc.SpriteFrameCache.getInstance().getSpriteFrame(this.baseImageName+"-1-"+this.walkDownFrameSetID+".png");
        this.initWithSpriteFrame(spriteFrame);
        this.setScale(G.SPRITE_SCALE);
        this.setTag(this.zOrder);
        var spawnPosition = cc.p(G.MAP.WIDTH/2, G.MAP.HEIGHT/2);
        this.setPosition(spawnPosition);
        // start running
        this.moveWithFrameSetID(this.walkDownFrameSetID, spawnPosition);
    },
    update:function (dt) {
        var newAction = null;

        // Keys are only enabled on the browser
        if( this._isAcceptingInput && sys.platform == 'browser' ) {
            var pos = this.getPosition();

            // move up
            if ((G.KEYS[cc.KEY.w] || G.KEYS[cc.KEY.up]) &&
                this.currentFrameSetID != this.walkUpFrameSetID &&
                this.currentFrameSetID != this.walkDownFrameSetID &&
                pos.y <= G.MAP.HEIGHT) {

                newAction = this.moveWithFrameSetID(this.walkUpFrameSetID, pos);
                G.TURNING_PTS.push(pos);
            }
            // move down
            else if ((G.KEYS[cc.KEY.s] || G.KEYS[cc.KEY.down]) &&
                this.currentFrameSetID != this.walkDownFrameSetID &&
                this.currentFrameSetID != this.walkUpFrameSetID &&
                pos.y >= 0) {

                newAction = this.moveWithFrameSetID(this.walkDownFrameSetID, pos);
                G.TURNING_PTS.push(pos);
            }
            // move left
            else if ((G.KEYS[cc.KEY.a] || G.KEYS[cc.KEY.left]) &&
                this.currentFrameSetID != this.walkLeftFrameSetID &&
                this.currentFrameSetID != this.walkRightFrameSetID &&
                pos.x >= 0) {

                newAction = this.moveWithFrameSetID(this.walkLeftFrameSetID, pos);
                G.TURNING_PTS.push(pos);
            }
            // move right
            else if ((G.KEYS[cc.KEY.d] || G.KEYS[cc.KEY.right]) &&
                this.currentFrameSetID != this.walkRightFrameSetID &&
                this.currentFrameSetID != this.walkLeftFrameSetID &&
                pos.x <= G.MAP.WIDTH) {

                newAction = this.moveWithFrameSetID(this.walkRightFrameSetID, pos);
                G.TURNING_PTS.push(pos);
            }
        }

        // delay input to prevent flickering from input overload
        if(newAction !== null) this.delayInputs();

        if (this.HP <= 0) {
            this.active = false;
        }
    },
    setAcceptingInput:function(bool) {
        this._isAcceptingInput = bool;
    },
    delayInputs:function() {
        this._isAcceptingInput = false;
        var delay = cc.DelayTime.create(G.INPUT_DELAY_TIME);
        var finish = cc.CallFunc.create(this.setAcceptingInput, this, true);
        var seq = cc.Sequence.create(delay,finish);
        return this.runAction(seq);
    },
    collideRect:function(){
        var p = this.getPosition();
        var a = this.getBoundingBox();
        var r = new cc.rect(p.x - a.width/2, p.y - a.height/2, a.width, a.height/2);
        return r;
    },
    runAnimWithFrameSetID:function(frameSetID)
    {
        this.currentFrameSetID = frameSetID;
        var walkDownAnimFrames = [];
        var frameID = 0;
        var frameName = this.baseImageName+"-"+frameID+"-"+frameSetID+".png";
        var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(frameName);

        while(frame) {
            walkDownAnimFrames.push(frame);
            frameID++;
            frameName = this.baseImageName+"-"+frameID+"-"+frameSetID+".png";
            frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(frameName);
        }

        var animation = cc.Animation.create(walkDownAnimFrames, 0.1);
        var animate = cc.Animate.create(animation);
        return this.runAction(cc.RepeatForever.create(animate));
    },
    moveWithFrameSetID:function(frameSetID, pos)
    {
        if(!pos) pos = this.getPosition();

        var distanceToMove = 0;
        var moveDuration = 0;

        // stop current movement
        if(this.actionTo)
            this.stopAction(this.actionTo);
        // stop current animation
        if(this.animAction)
            this.stopAction(this.animAction);
        // run animation
        this.animAction = this.runAnimWithFrameSetID(frameSetID);

        // move this
        switch(frameSetID)
        {
            case this.walkUpFrameSetID:
                distanceToMove = G.MAP.HEIGHT - pos.y;
                moveDuration = distanceToMove / this.speed;
                this.actionTo = cc.MoveTo.create(moveDuration, cc.p(pos.x, G.MAP.HEIGHT));
                break;
            case this.walkDownFrameSetID:
                distanceToMove = pos.y;
                moveDuration = distanceToMove / this.speed;
                this.actionTo = cc.MoveTo.create(moveDuration, cc.p(pos.x, 0));
                break;
            case this.walkRightFrameSetID:
                distanceToMove = G.MAP.WIDTH - pos.x;
                moveDuration = distanceToMove / this.speed;
                this.actionTo = cc.MoveTo.create(moveDuration, cc.p(G.MAP.WIDTH, pos.y));
                break;
            case this.walkLeftFrameSetID:
                distanceToMove = pos.x;
                moveDuration = distanceToMove / this.speed;
                this.actionTo = cc.MoveTo.create(moveDuration, cc.p(0, pos.y));
                break;
        }

        return this.runAction(this.actionTo);
    }
});
