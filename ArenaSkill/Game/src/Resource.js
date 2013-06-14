var dirImg = "res/";
var dirMusic = "res/Music/";

//image
var s_loading = dirImg + "loading.png";
var s_menu = dirImg + "menu.png";
var s_redKnight = dirImg + "redKnight-hd.png";
var s_whiteWizard = dirImg + "whiteWizard-hd.png";

//music
/*
var s_bgMusic = dirMusic + "bgMusic.mp3";
var s_mainMainMusic = dirMusic + "mainMainMusic.mp3";
*/

//effect
/*
var s_buttonEffect = dirMusic + "buttonEffet.mp3";
*/

//tmx
var s_level01 = dirImg + "level01.tmx";

//plist
var s_redKnight_plist = dirImg + "redKnight-hd.plist";
var s_whiteWizard_plist = dirImg + "whiteWizard-hd.plist";
/*
var s_explosion_plist = dirImg + "explosion.plist";
*/

var g_mainmenu = [
    {type:"image", src:s_loading},
    {type:"image", src:s_menu}
];

var g_maingame = [
    //image
    {type:"image", src:s_redKnight},
    {type:"image", src:s_whiteWizard},

    // plist
    {type:"plist", src:s_redKnight_plist},
    {type:"plist", src:s_whiteWizard_plist},

    //tmx
    {type:"tmx", src:s_level01}
];
