//game state
G.GAME_STATE = {
    HOME:0,
    PLAY:1,
    OVER:2
};

//keys
G.KEYS = [];
G.TOUCH = [];
G.INPUT_DELAY_TIME = 0.3; // in seconds

//level
G.LEVEL = {
    STAGE1:1,
    STAGE2:2,
    STAGE3:3
};

// sprite scale
G.SPRITE_SCALE = 0.75;

//map
G.MAP = {
    TILESIZE:32,
    WIDTH:0,
    HEIGHT:0
};

//unit tag
G.UNIT_TAG = {
    ENMEY_BULLET:900,
    PLAYER_BULLET:901,
    ENEMY:1000,
    PLAYER:1000,
    FOLLOWER:1000
};

//container
G.CONTAINER = {
    ENEMIES:[],
    ENEMY_BULLETS:[],
    PLAYER_BULLETS:[],
    EXPLOSIONS:[],
    SPARKS:[],
    HITS:[]
};

//snake
G.SNAKE = [];

// Turning Points
G.TURNING_PTS = [];

var g_hideSpritePos = cc.p( -10, -10);
