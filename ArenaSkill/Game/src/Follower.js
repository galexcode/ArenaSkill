var Follower = cc.Sprite.extend({
    _speed:150,
    _collidingSpeedFactor:0.8,
    _correctSpeedFactor:1,
    _laggingSpeedFactor:1.2,
    HP:5,
    canBeAttack:true,
    zOrder:3000,
    actionTo:null,
    actionSequence:null,
    animAction:null,
    turnPointIndex:0,
    currentFrameSetID:0,
    baseImageName:'whiteWizard',
    walkUpFrameSetID:0,
    walkDownFrameSetID:2,
    walkLeftFrameSetID:3,
    walkRightFrameSetID:1,
    active:true,

    ctor:function () {
        this._super();

        G.SNAKE.push(this);

        var leader = this.getLeader();

        // cache sprite frames and texture
        cc.SpriteFrameCache.getInstance().addSpriteFrames(s_whiteWizard_plist);

        // set initial frame
        var spriteFrame = cc.SpriteFrameCache.getInstance().getSpriteFrame(this.baseImageName+"-1-"+this.walkDownFrameSetID+".png");
        this.initWithSpriteFrame(spriteFrame);
        this.setScale(G.SPRITE_SCALE);
        this.setTag(this.zOrder);
        var spawnPosition = cc.p(G.MAP.WIDTH/2, G.MAP.HEIGHT/2);

        if(leader) {
            this.defaultSpeed = G.SNAKE[0].speed;
            this._speed = this.defaultSpeed;
            this.zOrder = leader.zOrder - 1;
            var leaderPos = leader.getPosition();
            var posX = leaderPos.x;
            var posY = leaderPos.y;

            //this._contentSize.width = leader.getBoundingBox().width;
            //this._contentSize.height = leader.getBoundingBox().height;

            //cc.log(leader.getBoundingBox().height);
            //cc.log(leader.getBoundingBox().width);

            switch(leader.currentFrameSetID)
            {
                case leader.walkUpFrameSetID:
                    posY = leaderPos.y - leader.getBoundingBox().height/2 - this.getBoundingBox().height/2;
                    break;
                case leader.walkDownFrameSetID:
                    posY = leaderPos.y + leader.getBoundingBox().height/2 + this.getBoundingBox().height/2;
                    break;
                case leader.walkRightFrameSetID:
                    posX = leaderPos.x - leader.getBoundingBox().width/2 - this.getBoundingBox().width/2;
                    break;
                case leader.walkLeftFrameSetID:
                    posX = leaderPos.x + leader.getBoundingBox().height/2 + this.getBoundingBox().width/2;
                    break;
            }

            spawnPosition = cc.p(posX,posY);
        }
        this.setPosition(spawnPosition);

        // start running
        this.moveWithFrameSetID(this.walkDownFrameSetID, spawnPosition);
    },
    update:function (dt) {
        var leader = this.getLeader();

        if(this.actionSequence === null || this.actionSequence.isDone() === true)
        {
            if(typeof G.TURNING_PTS[this.turnPointIndex] != 'undefined')
            {
                turnPoint = G.TURNING_PTS[this.turnPointIndex];
                if(turnPoint) {
                    var turnPoint, deltaPos, distanceToMove, moveDuration, frameSetID;
                    var pos = this.getPosition();

                    // stop current actionTo
                    this.stopAction(this.actionTo);

                    // calculate the diff to get to turn point
                    deltaPos = cc.pSub(turnPoint, pos);
                    if(Math.abs(deltaPos.x) > Math.abs(deltaPos.y)) {
                        // left / right
                        if(deltaPos.x > 0) {
                            frameSetID = this.walkRightFrameSetID;
                            distanceToMove = deltaPos.x;
                        } else {
                            frameSetID = this.walkLeftFrameSetID;
                            distanceToMove = deltaPos.x;
                        }
                    } else {
                        // up / down
                        if(deltaPos.y > 0) {
                            frameSetID = this.walkUpFrameSetID;
                            distanceToMove = deltaPos.y;
                        } else {
                            frameSetID = this.walkDownFrameSetID;
                            distanceToMove = deltaPos.y;
                        }
                    }

                    // change animation
                    if(this.currentFrameSetID != frameSetID)
                        this.runAnimWithFrameSetID(frameSetID);

                    // create actionTo turning pt
                    moveDuration = Math.abs(distanceToMove) / this._speed;
                    this.actionSequence = cc.Speed.create( cc.MoveTo.create(moveDuration, turnPoint), 1);

                    // run actionTo turning pt
                    this.runAction(this.actionSequence);

                    this.turnPointIndex++;
                }
            } else if(this.currentFrameSetID != leader.currentFrameSetID) {
                this.moveWithFrameSetID(leader.currentFrameSetID);

                // last resets turning pts
                if(!this.getFollower()) {
                    var snakeMember;
                    for(var i in G.SNAKE) {
                        snakeMember = G.SNAKE[i];
                        if(snakeMember) snakeMember.turnPointIndex = 0;
                    }

                    G.TURNING_PTS = [];
                }

            }

        } // endif actionSequence is null or finished

        // adjust speed
        this.adjustSpeedWithLeader(leader);

        if (this.HP <= 0) {
            this.active = false;
        }
    },
    /*
    Snake Helpers
    */
    getLeader:function()
    {
        var leader = null;
        var snakeIndex = this.ArrayGetIndexOfObject(G.SNAKE,this);
        if(typeof G.SNAKE[snakeIndex-1] != 'undefined')
            leader = G.SNAKE[snakeIndex-1];

        return leader;
    },
    getFollower:function()
    {
        var follower = null;
        var snakeIndex = this.ArrayGetIndexOfObject(G.SNAKE,this);
        if(typeof G.SNAKE[snakeIndex + 1] != 'undefined')
            follower = G.SNAKE[snakeIndex + 1];

        return follower;
    },
    ArrayGetIndexOfObject:function (arr, findObj) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == findObj)
                return i;
        }
        return -1;
    },
    /*
    Collision and Positioning
    */
    collide:function (a, b) {
        var aRect = a.collideRect();
        var bRect = b.collideRect();
        if (cc.rectIntersectsRect(aRect, bRect)) {
            return true;
        }
    },
    collideRect:function(p){
        if(!p)
            p = this.getPosition();

        var a = this.getBoundingBox();
        var r = new cc.rect(p.x - a.width/2, p.y - a.height/2, a.width, a.height/2);
        return r;
    },
    isAtTurnPoint:function(turnPoint)
    {
        p = this.getPosition();
        var a = this.getBoundingBox();
        var r;

        // find where the sprite is facing
        switch(this.currentFrameSetID)
        {
            case this.walkUpFrameSetID:
                r = new cc.rect(p.x - a.width/2, p.y - a.height/2, a.width, a.height/2);
                break;
            case this.walkDownFrameSetID:
                r = new cc.rect(p.x - a.width/2, p.y, a.width, a.height/2);
                break;
            case this.walkLeftFrameSetID:
                r = new cc.rect(p.x, p.y - a.height/2, a.width/2, a.height);
                break;
            case this.walkRightFrameSetID:
                r = new cc.rect(p.x - a.width/2, p.y - a.height/2, a.width/2, a.height);
                break;
        }

        if(cc.rectContainsPoint(r, turnPoint))
            return true;
        else
            return false;
    },
    isOnLeader:function(leader)
    {
        if(!leader)
            leader = this.getLeader();

        var collide = false;
        //if(this.currentFrameSetID == leader.currentFrameSetID && this.collide(this,leader)) {
        if(this.collide(this,leader)) {
            collide = true;
        }

        return collide;
    },
    isBehindItsLeader:function(leader)
    {
        if(!leader)
            leader = this.getLeader();

        var size = this.getBoundingBox();
        var leaderSize = leader.getBoundingBox();
        var leaderPos = leader.getPosition();
        var targetPos = leaderPos;
        var rv = false;

        // find where the sprite is facing
        switch(leader.currentFrameSetID)
        {
            case leader.walkUpFrameSetID:
                targetPos.y = leaderPos.y - leaderSize.height/2 - size.height/10;
                break;
            case leader.walkDownFrameSetID:
                targetPos.y = leaderPos.y + leaderSize.height/2 + size.height/10;
                break;
            case leader.walkLeftFrameSetID:
                targetPos.x = leaderPos.x + leaderSize.width/2 + size.width/10;
                break;
            case leader.walkRightFrameSetID:
                targetPos.x = leaderPos.x - leaderSize.width/2 - size.width/10;
                break;
        }

        if(cc.rectContainsPoint(this.collideRect(), targetPos))
            rv = true;

        return rv;
    },
    adjustSpeedWithLeader:function(leader)
    {
        var speedFactor = 1;

        // Adjust speed
        if(this.isOnLeader(leader)) {
            speedFactor = this._collidingSpeedFactor;
        } else if(this.isBehindItsLeader(leader)) {
            speedFactor = this._correctSpeedFactor;
        } else {
            speedFactor = this._laggingSpeedFactor;
        }

        if(this.actionSequence && typeof this.actionSequence.setSpeed == 'function')
            this.actionSequence.setSpeed(speedFactor);
        else if(this.actionTo && typeof this.actionTo.setSpeed == 'function')
            this.actionTo.setSpeed(speedFactor);
    },
    /*
    Run Action Helpers
    */
    moveToWithDistance:function(distanceToMove, pos, frameSetID)
    {
        moveDuration = distanceToMove / this._speed;
        var moveTo = cc.MoveTo.create(moveDuration, pos);
        this.actionTo = cc.Speed.create(moveTo, 1);
        this.runAction(this.actionTo);
    },
    runAnimWithFrameSetID:function(frameSetID)
    {
        if(this.animAction)
            this.stopAction(this.animAction);
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

        var animDelay = 0.1;
        var animation = cc.Animation.create(walkDownAnimFrames, animDelay);
        var animate = cc.Animate.create(animation);
        this.animAction = this.runAction(cc.RepeatForever.create(animate));
        return this.animAction;
    },
    moveWithFrameSetID:function(frameSetID, pos)
    {
        if(!pos) pos = this.getPosition();
        var distanceToMove = 0;
        var moveDuration = 0;

        // stop current movement
        if(this.actionTo)
            this.stopAction(this.actionTo);
        // run animation
        this.runAnimWithFrameSetID(frameSetID);

        // move this
        switch(frameSetID)
        {
            case this.walkUpFrameSetID:
                distanceToMove = G.MAP.HEIGHT - pos.y;
                this.moveToWithDistance(distanceToMove, cc.p(pos.x, G.MAP.HEIGHT));
                break;
            case this.walkDownFrameSetID:
                distanceToMove = pos.y;
                this.moveToWithDistance(distanceToMove, cc.p(pos.x, 0));
                break;
            case this.walkRightFrameSetID:
                distanceToMove = G.MAP.WIDTH - pos.x;
                this.moveToWithDistance(distanceToMove, cc.p(G.MAP.WIDTH, pos.y));
                break;
            case this.walkLeftFrameSetID:
                distanceToMove = pos.x;
                this.moveToWithDistance(distanceToMove, cc.p(0, pos.y));
                break;
        }
    }
});
