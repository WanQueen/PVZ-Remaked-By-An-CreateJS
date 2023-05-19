var game = 0;                       //用于设置Interval结束
var whetherGameStart = false;       //用于保证开始游戏前植物卡片、铲子不可点击

var plantArray = new Array();       //是否种植植物
var zombieArray = new Array();      //僵尸数组

var gridHeight = 97;                //格子高度
var gridWidth = 81.5;               //格子宽度
var borderTop = 80;                 //所有格子离顶端的距离
var borderLeft = 160;               //所有格子离左侧的距离
var cardHeight = 60;                //植物卡片的高度
var cardWidth = 100;                //植物卡片的宽度
var xWhetherZombieVisible = 882;    //僵尸是否可以被植物看见（用于判断是否开始攻击）（进入场景）
var plantVariety = 5;               //植物种类

var sunContainer = new cjs.Container();                 //阳光容器
var sunFromSunFlowerContainer = new cjs.Container();    //阳光生成自向日葵
var sunCollectedContainer = new cjs.Container();        //已被收集的阳光
var plantContainer = new cjs.Container();               //植物容器
var bulletContainer = new cjs.Container();              //子弹容器
var bulletEffectContainer = new cjs.Container();        //子弹效果容器
var zombieContainer = new cjs.Container();              //僵尸容器
var eatingZombieContainer = new cjs.Container();        //吃植物的僵尸的容器
var dyingZombieBodyContainer = new cjs.Container();     //死亡僵尸的身体
var dyingZombieHeadContainer = new cjs.Container();     //死亡僵尸的头
var zombieBoomContainer = new cjs.Container();          //爆炸僵尸动画
var lawnMowerContainer = new cjs.Container();           //小推车容器
var cardContainer = new cjs.Container();                //植物卡片容器
var loadingCardContainer = new cjs.Container();         //加载中的植物卡片容器
var cardTextContainer = new cjs.Container();            //植物卡片加载时的文字（string）
var cardRealTextArray = new Array();                    //int的文字
var overlayContainer = new cjs.Container();             //其他容器
var startPageContainer = new cjs.Container();           //开始场景容器
var gameWinContainer = new cjs.Container();             //胜利场景容器
var gameLoseContainer = new cjs.Container();            //失败场景容器

var movingPlant;                    //移动的植物（跟着鼠标走的）
var selector;                       //暂时显示在格子上的植物
var movingIsPlant = false;          //移动的是植物

var shovel;                         //铲子
var movingShovel;                   //移动的铲子
var movingIsShovel = false;         //移动的是铲子

var sunshine = 100;                                                         //阳光总量
var sunshineText = new cjs.Text(sunshine, "50px Times", "#000000");         //显示阳光总量的文字
var whetherPlayerMoving = false;                                            //玩家是否在移动植物
var totalZombie = 0;                                                        //僵尸总量，用于计算
var deadZombie = 0;                                                         //僵尸死亡总量，用于计算游戏结束

//游戏区域设置，初始化格子内的植物种植状态数组与僵尸数组
function setField()
{
	for (var i = 0; i < 5; i++)
	{
		plantArray[i] = new Array();		//构建二维数组（用于储存每个格子的状态）
		zombieArray[i] = new Array();		//构建二维数组（每排的僵尸）
		for (var j = 0; j < 9; j++)
		{
			plantArray[i][j] = 0;           //每格的种植状态完成初始化
		}
	}
}

//Container放入stage，以及一些初始化
function drawField()
{
    stage.addChild(plantContainer);
    stage.addChild(bulletContainer);
    stage.addChild(zombieContainer);
    stage.addChild(eatingZombieContainer);
    stage.addChild(dyingZombieBodyContainer);
    stage.addChild(dyingZombieHeadContainer);
    stage.addChild(zombieBoomContainer);
    stage.addChild(bulletEffectContainer);
    stage.addChild(lawnMowerContainer);
    stage.addChild(cardContainer);
    stage.addChild(loadingCardContainer);
    stage.addChild(cardTextContainer);
    stage.addChild(overlayContainer);
    stage.addChild(sunContainer);
    stage.addChild(sunFromSunFlowerContainer);
    stage.addChild(sunCollectedContainer);

    overlayContainer.addChild(sunshineText);
    updateSunshine();
    sunshineText.textColor = 0x000000;
    sunshineText.height = 15;
    sunshineText.x = 100;
    sunshineText.y = 15;

    var prepareGrowPlant = new lib.prepareGrowPlantMC();
    overlayContainer.addChild(prepareGrowPlant);
    prepareGrowPlant.x = 450;
    prepareGrowPlant.y = 300;
    prepareGrowPlant.recharge = 0;
    prepareGrowPlant.timer = 149;
    prepareGrowPlant.name = "prepareGrowPlant";
}

//阳光显示更新
function updateSunshine()
{
    sunshineText.text = sunshine.toString();
}

//僵尸初始化
function addZombie()
{
    var zombieTimer = setInterval(function(){
        if (game == 0)
            createZombie();
        else
        {
            clearInterval(zombieTimer);
            return;
        }
    }, 9000);
}

//增加僵尸
function createZombie(TimeEvent)
{
    var randomSpawn = Math.random() * 100;
    var zombie;
    var eatingZombie;
    if (randomSpawn <= 90)
    {
        zombie = new lib.zombieMC();
        zombie.blood = 100;
        zombie.type = "zombie";
        eatingZombie = new lib.eatingZombieMC();
        
    }

    if (randomSpawn > 90)
    {
        var zombie = new lib.coneHeadZombieMC();
        zombie.blood = 200;
        zombie.type = "coneHeadZombie";
        eatingZombie = new lib.eatingConeHeadZombieMC();
    }

    totalZombie++;
    zombieContainer.addChild(zombie);
    zombie.zombieRow = Math.floor(Math.random() * 5);
    zombie.name = "zombie_" + totalZombie;
    zombie.x = 1000;
    zombie.y = zombie.zombieRow * gridHeight + borderTop;
    zombieArray[zombie.zombieRow].push(zombie.name);

    eatingZombie.x = zombie.x;
    eatingZombie.y = zombie.y;
    eatingZombie.name = zombie.name;
    eatingZombie.alpha = 0;
    eatingZombieContainer.addChild(eatingZombie);
}

//初始化阳光
function fallingSun()
{
    var fallingSunTimer = setInterval(function(){
        if (game == 0)
            createSun();
        else
        {
            clearInterval(fallingSunTimer);
            return;
        }
    }, 10000);
}

//增加一个新阳光
function createSun()
{
    var sunRow = Math.floor(Math.random() * 5);
    var sunCol = Math.floor(Math.random() * 9);
    var sun = new lib.sunMC();
    sun.mouseChildren = false;
    sun.buttonMode = true;
    sunContainer.addChild(sun);
    sun.x = borderLeft + sunCol * gridWidth;
    sun.destinationY = borderTop + sunRow * gridHeight;
    sun.y = 20;
    sun.addEventListener("click",sunClicked);
}

//向日葵生成的阳光
function createSunBySunFlower(sunFlower)
{
    var sun = new lib.sunMC();
    sun.x = sunFlower.x;
    sun.y = sunFlower.y;
    sun.sunTime = 1200;
    sun.sunTimer = 0;
    sun.mouseChildren = false;
    sun.buttonMode = true;
    sunFromSunFlowerContainer.addChild(sun);
    sun.addEventListener("click", sunClicked);
}

//点击阳光
function sunClicked(event)
{
    var sunToRemove = event.currentTarget;
    sunToRemove.removeEventListener("click",sunClicked);
    sunshine += 25;
    updateSunshine();

    var sunCollected = new lib.sunMC();
    sunCollected.x = sunToRemove.x;
    sunCollected.y = sunToRemove.y;
    sunCollected.destinationX = 45;
    sunCollected.destinationY = 35;
    sunCollected.dx = (sunCollected.x - sunCollected.destinationX) / 100;
    sunCollected.dy = (sunCollected.y - sunCollected.destinationY) / 100;

    sunCollectedContainer.addChild(sunCollected);

    if (sunToRemove.sunTime == 1200)
    {
        sunFromSunFlowerContainer.removeChild(sunToRemove);
    }
    else
    {
        sunContainer.removeChild(sunToRemove);
    }
}

//创建小推车
function addLawnMower()
{
    var i;
    for (i = 0; i < 5; i++)
    {
        var lawnMower = new lib.lawnMowerMC();
        lawnMower.x = 90;
        lawnMower.y = 100 + gridHeight * i;
        lawnMower.name = "lawnMower_" + i;
        lawnMower.whetherStartup = false;
        lawnMower.lawnMowerRow = i;
        lawnMowerContainer.addChild(lawnMower);
    }
}

//创建铲子
function addShovel()
{
    shovel = new lib.shovelMC();
    shovel.x = 286;
    shovel.y = 18.8;
    overlayContainer.addChild(shovel);
    shovel.addEventListener("click", onShovelClicked);
}

//点击铲子
function onShovelClicked()
{
    if (whetherPlayerMoving == false && whetherGameStart == true)
    {
        shovel.visible = false;
        movingShovel = new lib.movingShovelMC();
        movingShovel.mouseChildren = false;
        movingShovel.addEventListener("click", useShovel);
        overlayContainer.addChild(movingShovel);

        whetherPlayerMoving = true;
        movingIsShovel = true;
    }
}

//使用铲子
function useShovel()
{
    var shovelRow = Math.floor((stage.mouseY / stage.scaleY - borderTop) / gridHeight);
    var shovelCol = Math.floor((stage.mouseX / stage.scaleX - borderLeft) / gridWidth);
    if (shovelRow >= 0 && shovelRow < 5 && shovelCol >= 0 && shovelCol < 9 && plantArray[shovelRow][shovelCol] == 1)
    {
        shoveledPlant = plantContainer.getChildByName("plant_" + shovelRow + "_" + shovelCol);
        plantContainer.removeChild(shoveledPlant);
        plantArray[shovelRow][shovelCol] = 0;
    } 

    whetherPlayerMoving = false;
    movingIsShovel = false;

    shovel.visible = true;

    movingShovel.removeEventListener("click", useShovel);
    overlayContainer.removeChild(movingShovel);
}

//创建植物卡片
function addPlantCard()
{
    //豌豆射手卡片
    var peaShooter = new lib.peaShooterCard();
    cardContainer.addChild(peaShooter);
    peaShooter.buttonMode = true;
    peaShooter.x = 18;
    peaShooter.y = 67;
    peaShooter.addEventListener("click", onPeaShooterCardClicked);

    var peaShooterLoading = new lib.peaShooterLoadingCard();
    loadingCardContainer.addChild(peaShooterLoading);
    peaShooterLoading.name = "peaShooterLoading";
    peaShooterLoading.alpha = 0;
    peaShooterLoading.x = peaShooter.x;
    peaShooterLoading.y = peaShooter.y;

    var peaShooterLoadingText = new cjs.Text("0%", "30px Times", "#000000");
    peaShooterLoadingText.x = peaShooterLoading.x + 25;
    peaShooterLoadingText.y = peaShooterLoading.y + 20;
    peaShooterLoadingText.alpha = 0;
    cardTextContainer.addChild(peaShooterLoadingText);
    cardRealTextArray[0] = 0;

    var peaShooterNeededSunshine = new cjs.Text(100, "15px Times", "#000000");
    peaShooterNeededSunshine.x = 80;
    peaShooterNeededSunshine.y = 110;
    overlayContainer.addChild(peaShooterNeededSunshine);

    //向日葵卡片
    var sunFlower = new lib.sunFlowerCard();
    cardContainer.addChild(sunFlower);
    sunFlower.buttonMode = true;
    sunFlower.x = 18;
    sunFlower.y = 67 + 1 * cardHeight;
    sunFlower.addEventListener("click", onSunFlowerCardClicked);

    var sunFlowerLoading = new lib.sunFlowerLoadingCard();
    loadingCardContainer.addChild(sunFlowerLoading);
    sunFlowerLoading.name = "sunFlowerLoading";
    sunFlowerLoading.alpha = 0;
    sunFlowerLoading.x = sunFlower.x;
    sunFlowerLoading.y = sunFlower.y;

    var sunFlowerLoadingText = new cjs.Text("0%", "30px Times", "#000000");
    sunFlowerLoadingText.x = sunFlowerLoading.x + 25;
    sunFlowerLoadingText.y = sunFlowerLoading.y + 20;
    sunFlowerLoadingText.alpha = 0;
    cardTextContainer.addChild(sunFlowerLoadingText);
    cardRealTextArray[1] = 0;

    var sunFlowerNeededSunshine = new cjs.Text(50, "15px Times", "#000000");
    sunFlowerNeededSunshine.x = 80;
    sunFlowerNeededSunshine.y = 110 + 1 * cardHeight;
    overlayContainer.addChild(sunFlowerNeededSunshine);

    //樱桃炸弹卡片
    var cherryBomb = new lib.cherryBombCard();
    cardContainer.addChild(cherryBomb);
    cherryBomb.buttonMode = true;
    cherryBomb.x = 18;
    cherryBomb.y = 67 + 2 * cardHeight;
    cherryBomb.addEventListener("click", onCherryBombCardClicked);

    var cherryBombLoading = new lib.cherryBombLoadingCard();
    loadingCardContainer.addChild(cherryBombLoading);
    cherryBombLoading.name = "cherryBombLoading";
    cherryBombLoading.alpha = 0;
    cherryBombLoading.x = cherryBomb.x;
    cherryBombLoading.y = cherryBomb.y;

    var cherryBombLoadingText = new cjs.Text("0%", "30px Times", "#000000");
    cherryBombLoadingText.x = cherryBombLoading.x + 25;
    cherryBombLoadingText.y = cherryBombLoading.y + 20;
    cherryBombLoadingText.alpha = 0;
    cardTextContainer.addChild(cherryBombLoadingText);
    cardRealTextArray[2] = 0;

    var cherryBombNeededSunshine = new cjs.Text(150, "15px Times", "#000000");
    cherryBombNeededSunshine.x = 80;
    cherryBombNeededSunshine.y = 110 + 2 * cardHeight;
    overlayContainer.addChild(cherryBombNeededSunshine);

    //坚果墙卡片
    var wallNut = new lib.wallNutCard();
    cardContainer.addChild(wallNut);
    wallNut.buttonMode = true;
    wallNut.x = 18;
    wallNut.y = 67 + 3 * cardHeight;
    wallNut.addEventListener("click", onWallNutCardClicked);

    var wallNutLoading = new lib.wallNutLoadingCard();
    loadingCardContainer.addChild(wallNutLoading);
    wallNutLoading.name = "wallNutLoading";
    wallNutLoading.alpha = 0;
    wallNutLoading.x = wallNut.x;
    wallNutLoading.y = wallNut.y;

    var wallNutLoadingText = new cjs.Text("0%", "30px Times", "#000000");
    wallNutLoadingText.x = wallNutLoading.x + 25;
    wallNutLoadingText.y = wallNutLoading.y + 20;
    wallNutLoadingText.alpha = 0;
    cardTextContainer.addChild(wallNutLoadingText);
    cardRealTextArray[3] = 0;

    var wallNutNeededSunshine = new cjs.Text("50", "15px Times", "#000000");
    wallNutNeededSunshine.x = 80;
    wallNutNeededSunshine.y = 110 + 3 * cardHeight;
    overlayContainer.addChild(wallNutNeededSunshine);

    //土豆雷卡片
    var potatoMine = new lib.potatoMineCard();
    cardContainer.addChild(potatoMine);
    potatoMine.x = 18;
    potatoMine.y = 67 + 4 * cardHeight;
    potatoMine.addEventListener("click", onPotatoMineCardClicked);

    var potatoMineLoading = new lib. potatoMineLoadingCard();
    loadingCardContainer.addChild(potatoMineLoading);
    potatoMineLoading.name = "potatoMineLoading";
    potatoMineLoading.alpha = 0;
    potatoMineLoading.x = potatoMine.x;
    potatoMineLoading.y = potatoMine.y;

    var potatoMineLoadingText = new cjs.Text("0%", "30px Times", "#000000");
    potatoMineLoadingText.x = potatoMineLoading.x + 25;
    potatoMineLoadingText.y = potatoMineLoading.y + 20;
    potatoMineLoadingText.alpha = 0;
    cardTextContainer.addChild(potatoMineLoadingText);
    cardRealTextArray[4] = 0;

    var potatoMineNeededSunshine = new cjs.Text("25", "15px Times", "#000000");
    potatoMineNeededSunshine.x = 80;
    potatoMineNeededSunshine.y = 110 + 4 * cardHeight;
    overlayContainer.addChild(potatoMineNeededSunshine);


    for (var i = 0; i < plantVariety; i++)
    {
        var sunSign = new lib.sunSignMC();
        sunSign.x = 102;
        sunSign.y = 110 + i * cardHeight;
        overlayContainer.addChild(sunSign);
    }
}

//选择卡片：豌豆射手
function onPeaShooterCardClicked(e)
{
    if (sunshine >= 100 && !whetherPlayerMoving && whetherGameStart == true)
    {
        var peaShooterCard = cardContainer.getChildAt(0);
        var peaShooterLoading = loadingCardContainer.getChildByName("peaShooterLoading");
        var peaShooterLoadingText = cardTextContainer.getChildAt(0);

        peaShooterCard.alpha = 0;
        peaShooterLoading.alpha = 100;
        peaShooterLoadingText.alpha = 100;

        sunshine -= 100;
        updateSunshine();
        selector = new lib.peaShooterSelectorMC();
        selector.visible = false;
        selector.alpha = 0.5;
        selector.type = "peaShooter";
        overlayContainer.addChild(selector);
        movingPlant = new lib.peaShooterMovingMC();
        movingPlant.mouseChildren = false;
        movingPlant.addEventListener("click", placePeaShooter);
        overlayContainer.addChild(movingPlant);

        whetherPlayerMoving = true;
        movingIsPlant = true;
    }
}

//种植：豌豆射手
function placePeaShooter()
{
    var peaShooterRow = Math.floor((stage.mouseY / stage.scaleY - borderTop) / gridHeight);
    var peaShooterCol = Math.floor((stage.mouseX / stage.scaleX - borderLeft) / gridWidth);
    if (peaShooterRow >= 0 && peaShooterRow < 5 && peaShooterCol >= 0 && peaShooterCol < 9 && plantArray[peaShooterRow][peaShooterCol] == 0)
    {
        placedPeaShooter = new lib.peaShooterMC();
        placedPeaShooter.name = "plant_" + peaShooterRow + "_" + peaShooterCol;
        placedPeaShooter.type = "peaShooter";
        placedPeaShooter.fireRate = 120;
        placedPeaShooter.recharge = 60;
        placedPeaShooter.blood = 300;
        placedPeaShooter.plantRow = peaShooterRow;
        plantContainer.addChild(placedPeaShooter);
        placedPeaShooter.x = peaShooterCol * gridWidth + borderLeft + 10;
        placedPeaShooter.y = peaShooterRow * gridHeight + borderTop + 15;

        whetherPlayerMoving = false;
        movingIsPlant = false;

        movingPlant.removeEventListener("click", placePeaShooter);
        overlayContainer.removeChild(selector);
        overlayContainer.removeChild(movingPlant);
        plantArray[peaShooterRow][peaShooterCol] = 1;
    }
}

//选择卡片：向日葵
function onSunFlowerCardClicked(e)
{
    if (sunshine >= 50 && !whetherPlayerMoving && whetherGameStart == true)
    {
        var sunFlowerCard = cardContainer.getChildAt(1);
        var sunFlowerLoading = loadingCardContainer.getChildByName("sunFlowerLoading");
        var sunFlowerLoadingText = cardTextContainer.getChildAt(1);

        sunFlowerCard.alpha = 0;
        sunFlowerLoading.alpha = 100;
        sunFlowerLoadingText.alpha = 100;

        sunshine -= 50;
        updateSunshine();
        selector = new lib.sunFlowerSelectorMC();
        selector.visible = false;
        selector.alpha = 0.5;
        selector.type = "sunFlower";
        overlayContainer.addChild(selector);
        movingPlant = new lib.sunFlowerMovingMC();
        movingPlant.mouseChildren =false;
        movingPlant.addEventListener("click", placeSunFlower);
        overlayContainer.addChild(movingPlant);

        whetherPlayerMoving = true;
        movingIsPlant = true;
    }
}

//种植：向日葵
function placeSunFlower()
{
    var sunFlowerRow = Math.floor((stage.mouseY / stage.scaleY - borderTop) / gridHeight);
    var sunFlowerCol = Math.floor((stage.mouseX / stage.scaleX - borderLeft) / gridWidth);
    if (sunFlowerRow >= 0 && sunFlowerRow < 5 && sunFlowerCol >= 0 && sunFlowerCol < 9 && plantArray[sunFlowerRow][sunFlowerCol] == 0)
    {
        placedSunFlower = new lib.sunFlowerMC();
        placedSunFlower.name = "plant_" + sunFlowerRow + "_" + sunFlowerCol;
        placedSunFlower.type = "sunFlower";
        placedSunFlower.sunGenerateRate = 600;
        placedSunFlower.recharge = 0;
        placedSunFlower.blood = 250;
        placedSunFlower.plantRow = sunFlowerRow;
        plantContainer.addChild(placedSunFlower);
        placedSunFlower.x = sunFlowerCol * gridWidth + borderLeft + 40;
        placedSunFlower.y = sunFlowerRow * gridHeight + borderTop + 40;

        whetherPlayerMoving = false;
        movingIsPlant = false;

        movingPlant.removeEventListener("click", placeSunFlower);
        overlayContainer.removeChild(selector);
        overlayContainer.removeChild(movingPlant);
        plantArray[sunFlowerRow][sunFlowerCol] = 1;
    }
}

//选择卡片：樱桃炸弹
function onCherryBombCardClicked()
{
    if (sunshine >= 150 && !whetherPlayerMoving && whetherGameStart == true)
    {
        var cherryBombCard = cardContainer.getChildAt(2);
        var cherryBombLoading = loadingCardContainer.getChildByName("cherryBombLoading");
        var cherryBombLoadingText = cardTextContainer.getChildAt(2);

        cherryBombCard.alpha = 0;
        cherryBombLoading.alpha = 100;
        cherryBombLoadingText.alpha = 100;

        sunshine -= 150;
        updateSunshine();
        selector = new lib.cherryBombSelectorMC();
        selector.visible = false;
        selector.alpha = 0.5;
        selector.type = "cherryBomb";
        overlayContainer.addChild(selector);
        movingPlant = new lib.cherryBombMovingMC();
        movingPlant.mouseChildren = false;
        movingPlant.addEventListener("click", placeCherryBomb);
        overlayContainer.addChild(movingPlant);

        whetherPlayerMoving = true;
        movingIsPlant = true;
    }
}

//种植：樱桃炸弹
function placeCherryBomb()
{
    var cherryBombRow = Math.floor((stage.mouseY / stage.scaleY - borderTop) / gridHeight);
    var cherryBombCol = Math.floor((stage.mouseX / stage.scaleX- borderLeft) / gridWidth);
    if (cherryBombRow >= 0 && cherryBombRow < 5 && cherryBombCol >= 0 && cherryBombCol < 9 && plantArray[cherryBombRow][cherryBombCol] == 0)
    {
        placedCherryBomb = new lib.cherryBombMC();
        placedCherryBomb.name = "plant_" + cherryBombRow + "_" + cherryBombCol;
        placedCherryBomb.type = "cherryBomb";
        placedCherryBomb.timer = 35;
        placedCherryBomb.recharge = 0;
        placedCherryBomb.blood = 500;
        placedCherryBomb.plantRow = cherryBombRow;
        placedCherryBomb.plantCol = cherryBombCol;
        plantContainer.addChild(placedCherryBomb);
        placedCherryBomb.x = cherryBombCol * gridWidth + borderLeft + 30;
        placedCherryBomb.y = cherryBombRow * gridHeight + borderTop + 50;

        whetherPlayerMoving = false;
        movingIsPlant = false;

        movingPlant.removeEventListener("click", placeCherryBomb);
        overlayContainer.removeChild(selector);
        overlayContainer.removeChild(movingPlant);
        plantArray[cherryBombRow][cherryBombCol] = 1;
    }
}

//选择卡片：坚果墙
function onWallNutCardClicked()
{
    if (sunshine >= 50 && !whetherPlayerMoving && whetherGameStart == true)
    {
        var wallNutCard = cardContainer.getChildAt(3);
        var wallNutLoading = loadingCardContainer.getChildByName("wallNutLoading");
        var wallNutLoadingText = cardTextContainer.getChildAt(3);

        wallNutCard.alpha = 0;
        wallNutLoading.alpha = 1;
        wallNutLoadingText.alpha = 1;

        sunshine -= 50;
        updateSunshine();
        selector = new lib.wallNutMC();
        selector.visible = false;
        selector.alpha = 0.5;
        selector.type = "wallNut";
        overlayContainer.addChild(selector);
        movingPlant = new lib.wallNutMC();
        movingPlant.mouseChildren = false;
        movingPlant.addEventListener("click", placeWallNut);
        overlayContainer.addChild(movingPlant);

        whetherPlayerMoving = true;
        movingIsPlant = true;
    }
}

//种植：坚果墙
function placeWallNut()
{
    var wallNutRow = Math.floor((stage.mouseY / stage.scaleY - borderTop) / gridHeight);
    var wallNutCol = Math.floor((stage.mouseX / stage.scaleX - borderLeft) / gridWidth);
    if (wallNutRow >= 0 && wallNutRow < 5 && wallNutCol >= 0 && wallNutCol < 9 && plantArray[wallNutRow][wallNutCol] == 0)
    {
        var wallNutContainer = new cjs.Container();
        wallNutContainer.name = "plant_" + wallNutRow + "_" + wallNutCol;
        wallNutContainer.type = "wallNut";
        wallNutContainer.blood = 30000;
        wallNutContainer.plantRow = wallNutRow;
        plantContainer.addChild(wallNutContainer);

        placedWallNut = new lib.wallNutMC();
        wallNutContainer.addChild(placedWallNut);
        placedWallNut.x = wallNutCol * gridWidth + borderLeft + 30;
        placedWallNut.y = wallNutRow * gridHeight + borderTop + 40;

        wallNutStat2 = new lib.wallNutMC2();
        wallNutContainer.addChild(wallNutStat2);
        wallNutStat2.x = placedWallNut.x;
        wallNutStat2.y = placedWallNut.y;
        wallNutStat2.alpha = 0;

        wallNutStat3 = new lib.wallNutMC3();
        wallNutContainer.addChild(wallNutStat3);
        wallNutStat3.x = placedWallNut.x;
        wallNutStat3.y = placedWallNut.y;
        wallNutStat3.alpha = 0;

        whetherPlayerMoving = false;
        movingIsPlant = false;

        movingPlant.removeEventListener("click", placeWallNut);
        overlayContainer.removeChild(selector);
        overlayContainer.removeChild(movingPlant);
        plantArray[wallNutRow][wallNutCol] = 1;
    }
}

//选择卡片：土豆雷
function onPotatoMineCardClicked()
{
    if (sunshine >= 25 && !whetherPlayerMoving && whetherGameStart == true)
    {
        var potatoMineCard = cardContainer.getChildAt(4);
        var potatoMineLoading = loadingCardContainer.getChildByName("potatoMineLoading");
        var potatoMineLoadingText = cardTextContainer.getChildAt(4);

        potatoMineCard.alpha = 0;
        potatoMineLoading.alpha = 1;
        potatoMineLoadingText.alpha = 1;

        sunshine -= 25;
        updateSunshine();
        selector = new lib.potatoMineMC();
        selector.visible = false;
        selector.alpha = 0.5;
        selector.type = "potatoMine";
        overlayContainer.addChild(selector);
        movingPlant = new lib.potatoMineMC();
        movingPlant.mouseChildren = false;
        movingPlant.addEventListener("click", placePotatoMine);
        overlayContainer.addChild(movingPlant);

        whetherPlayerMoving = true;
        movingIsPlant = true;
    }
}

//种植：土豆雷
function placePotatoMine()
{
    var potatoMineRow = Math.floor((stage.mouseY / stage.scaleY - borderTop) / gridHeight);
    var potatoMineCol = Math.floor((stage.mouseX / stage.scaleX - borderLeft) / gridWidth);
    if (potatoMineRow >= 0 && potatoMineRow < 5 && potatoMineCol >= 0 && potatoMineCol < 9 && plantArray[potatoMineRow][potatoMineCol] == 0)
    {
        var potatoMineContainer = new cjs.Container();
        potatoMineContainer.name = "plant_" + potatoMineRow + "_" + potatoMineCol;
        potatoMineContainer.type = "potatoMine";
        potatoMineContainer.blood = 250;
        potatoMineContainer.timer = 1250;
        potatoMineContainer.recharge = 0;
        potatoMineContainer.stat = 0;
        potatoMineContainer.plantRow = potatoMineRow;
        potatoMineContainer.plantCol = potatoMineCol;
        plantContainer.addChild(potatoMineContainer);

        placedPotatoMine = new lib.potatoMineMC1();
        potatoMineContainer.addChild(placedPotatoMine);
        placedPotatoMine.x = potatoMineCol * gridWidth + borderLeft + 30;
        placedPotatoMine.y = potatoMineRow * gridHeight + borderTop + 50;

        potatoMineStat2 = new lib.potatoMineMC();
        potatoMineContainer.addChild(potatoMineStat2);
        potatoMineStat2.x = placedPotatoMine.x;
        potatoMineStat2.y = placedPotatoMine.y;
        potatoMineStat2.alpha = 0;

        whetherPlayerMoving = false;
        movingIsPlant = false;

        movingPlant.removeEventListener("click", placedPotatoMine);
        overlayContainer.removeChild(selector);
        overlayContainer.removeChild(movingPlant);
        plantArray[potatoMineRow][potatoMineCol] = 1;
    } 
}

//每一帧需要执行的操作
function onEnterFrame()
{
    var i;
    var j;
    var k;

    //开始三段文字管理
    if (whetherGameStart == false)
    {
        prepareGrowPlant = overlayContainer.getChildByName("prepareGrowPlant");
        if (prepareGrowPlant.recharge < prepareGrowPlant.timer)
            prepareGrowPlant.recharge += 1;
        else
        {
            whetherGameStart = true;
            overlayContainer.removeChild(prepareGrowPlant);
        }
    }
    
    


    //植物管理
    for (i = 0; i < plantContainer.numChildren; i++)
    {
        var currentPlant = plantContainer.getChildAt(i);

        //当植物是豌豆射手时
        if (currentPlant.type == "peaShooter")
        {
            if (currentPlant.recharge == currentPlant.fireRate)
            {
                if (zombieArray[currentPlant.plantRow].length > 0)
                {
                    for (j = 0; j < zombieArray[currentPlant.plantRow].length; j++)
                    {
                        var targetZombie = zombieContainer.getChildByName(zombieArray[currentPlant.plantRow][j])
                        if (targetZombie.x > currentPlant.x && targetZombie.x <= xWhetherZombieVisible)
                        {
                            var bullet = new lib.bulletMC();
                            bulletContainer.addChild(bullet);
                            bullet.x = currentPlant.x + 80;
                            bullet.y = currentPlant.y;
                            bullet.sonOf = currentPlant;
                            currentPlant.recharge = 0;
                            break;
                        }
                    }
                }
            }
        }
        //子弹装填
        if (currentPlant.type == "peaShooter")
        {
            if (currentPlant.recharge < currentPlant.fireRate)
            {
                currentPlant.recharge ++;
            }
        }

        //当植物是向日葵时
        if (currentPlant.type == "sunFlower")
        {
            if (currentPlant.recharge >= 500)
            {
                var filter = new createjs.ColorMatrix().adjustColor(10, 10, 30, 0);
                currentPlant.filters = [new createjs.ColorMatrixFilter(filter)];
                currentPlant.cache(-35, -30, 73, 74);
            } 

            if (currentPlant.recharge == currentPlant.sunGenerateRate)
            {
                createSunBySunFlower(currentPlant);
                currentPlant.recharge = 0;
                currentPlant.uncache();
            }
            //阳光装填
            else if (currentPlant.recharge < currentPlant.sunGenerateRate)
            {
                currentPlant.recharge ++;
            }
        }

        //当植物是樱桃炸弹时
        if (currentPlant.type == "cherryBomb")
        {
            if (currentPlant.recharge == currentPlant.timer)
            {
                var cherryBombEffect = new lib.cherryBombEffectMC();
                cherryBombEffect.x = currentPlant.x;
                cherryBombEffect.y = currentPlant.y;
                cherryBombEffect.timer = 50;
                cherryBombEffect.recharge = 0;
                cherryBombEffect.name = "cherryBombEffect";
                overlayContainer.addChild(cherryBombEffect);

                var plantRow = currentPlant.plantRow;
                var plantCol = currentPlant.plantCol;
                var t = zombieContainer.numChildren;

                for (j = 0; j < t; j++)
                {
                    var movingZombie = zombieContainer.getChildAt(j);
                    var eatingZombie = eatingZombieContainer.getChildAt(j);
                    var zombieCol = Math.floor((movingZombie.x - borderLeft) / gridWidth);
                    console.log(movingZombie.name);
                    if (movingZombie.zombieRow != plantRow - 1 && movingZombie.zombieRow != plantRow && movingZombie.zombieRow != plantRow + 1)
                    {
                        continue;
                    }
                    else if (zombieCol != plantCol - 1 && zombieCol != plantCol && zombieCol != plantCol + 1)
                    {
                        continue;
                    }
                    else
                    {
                        var zombieBoom = new lib.zombieBoomMC();
                        zombieBoom.x = movingZombie.x;
                        zombieBoom.y = movingZombie.y;
                        zombieBoom.timer = 123;
                        zombieBoom.recharge = 0;
                        zombieBoomContainer.addChild(zombieBoom);
                        console.log("dead zombie:" + movingZombie.name);

                        movingZombie.blood = 0;
                    }

                    if (movingZombie.blood == 0)
                    {
                        zombieArray[movingZombie.zombieRow].splice(zombieArray[movingZombie.zombieRow].indexOf(movingZombie.name), 1);
                        zombieContainer.removeChild(movingZombie);
                        eatingZombieContainer.removeChild(eatingZombie);

                        deadZombie += 1;
                    }
                }

                plantContainer.removeChild(currentPlant);
                plantArray[plantRow][plantCol] = 0;
            }
            else
            {
                currentPlant.recharge += 1;
            }
        }

        //当植物是坚果墙时
        if (currentPlant.type == "wallNut")
        {
            if (currentPlant.blood <= 2000 && currentPlant.blood > 1000)
            {
                wallNut = currentPlant.getChildAt(0);
                wallNutStat = currentPlant.getChildAt(1);

                wallNut.alpha = 0;
                wallNutStat.alpha = 1;
            }
            else if (currentPlant.blood <= 1000)
            {
                wallNut = currentPlant.getChildAt(1);
                wallNutStat = currentPlant.getChildAt(2);

                wallNut.alpha = 0;
                wallNutStat.alpha = 1;
            }
        }

        //当植物是土豆雷时
        if (currentPlant.type == "potatoMine")
        {
            if (currentPlant.recharge < currentPlant.timer)
            {
                currentPlant.recharge += 1;
            }
            else
            {
                potatoMine = currentPlant.getChildAt(0);
                potatoMineStat = currentPlant.getChildAt(1);
                currentPlant.stat = 1;

                potatoMine.alpha = 0;
                potatoMineStat.alpha = 1;
            }
        }
    }

    //子弹管理
    for (i = 0; i < bulletContainer.numChildren; i++)
    {
        var movingBullet = bulletContainer.getChildAt(i);
        movingBullet.x += 3;
        var firingPlant = movingBullet.sonOf;

        for (j = 0; j < zombieContainer.numChildren; j++)
        {
            var movingZombie = zombieContainer.getChildAt(j);
            var eatingZombie = eatingZombieContainer.getChildAt(j);
            if (movingZombie.zombieRow != firingPlant.plantRow)
                continue;
            if (movingZombie.x < movingBullet.x && movingZombie.x > movingBullet.x - 15)
            {
                var bulletEffect = new lib.bulletEffectMC;
                bulletEffect.x = movingBullet.x;
                bulletEffect.y = movingBullet.y;
                bulletEffect.recharge = 0;
                bulletEffect.timer = 30;
                bulletEffectContainer.addChild(bulletEffect);
                bulletContainer.removeChild(movingBullet);

                movingZombie.blood -= 15;

                if (movingZombie.blood <= 0)
                {
                    var dyingZombieHead = new lib.dyingZombieHeadMC();
                    dyingZombieHead.x = movingZombie.x;
                    dyingZombieHead.y = movingZombie.y;
                    dyingZombieHead.timer = 0;
                    dyingZombieHead.alpha = 1;
                    dyingZombieHeadContainer.addChild(dyingZombieHead);

                    var dyingZombieBody = new lib.dyingZombieBodyMC();
                    dyingZombieBody.x = movingZombie.x;
                    dyingZombieBody.y = movingZombie.y;
                    dyingZombieBody.timer = 0;
                    dyingZombieBody.alpha = 1;
                    dyingZombieBodyContainer.addChild(dyingZombieBody);

                    zombieArray[movingZombie.zombieRow].splice(zombieArray[movingZombie.zombieRow].indexOf(movingZombie.name), 1);
                    zombieContainer.removeChild(movingZombie);
                    eatingZombieContainer.removeChild(eatingZombie);
                    deadZombie += 1;
                }
                break;
            }
        }
        if (movingBullet.x > 1200)
        {
            bulletContainer.removeChild(movingBullet);
        }
    }

    //小推车管理
    for (i = 0; i < lawnMowerContainer.numChildren; i++)
    {
        var lawnMower = lawnMowerContainer.getChildAt(i);
        for (j = 0; j < zombieContainer.numChildren; j++)
        {
            var movingZombie = zombieContainer.getChildAt(j);

            if (movingZombie.zombieRow != lawnMower.lawnMowerRow)
                continue;
            if (movingZombie.x - 70 <= lawnMower.x)
            {
                lawnMower.whetherStartup = true;
            }
        }

        if (lawnMower.whetherStartup == true)
        {
            lawnMower.x += 5;

            for (j = 0; j < zombieContainer.numChildren; j++)
            {
                var movingZombie = zombieContainer.getChildAt(j);
                var eatingZombie = eatingZombieContainer.getChildAt(j);

                if (lawnMower.lawnMowerRow != movingZombie.zombieRow)
                    continue;
                if (lawnMower.x + 70 >= movingZombie.x)
                {
                    var dyingZombieHead = new lib.dyingZombieHeadMC();
                    dyingZombieHead.x = movingZombie.x;
                    dyingZombieHead.y = movingZombie.y;
                    dyingZombieHead.timer = 0;
                    dyingZombieHead.alpha = 1;
                    dyingZombieHeadContainer.addChild(dyingZombieHead);

                    var dyingZombieBody = new lib.dyingZombieBodyMC();
                    dyingZombieBody.x = movingZombie.x;
                    dyingZombieBody.y = movingZombie.y;
                    dyingZombieBody.timer = 0;
                    dyingZombieBody.alpha = 1;
                    dyingZombieBodyContainer.addChild(dyingZombieBody);

                    zombieArray[movingZombie.zombieRow].splice(zombieArray[movingZombie.zombieRow].indexOf(movingZombie.name), 1);
                    zombieContainer.removeChild(movingZombie);
                    eatingZombieContainer.removeChild(eatingZombie);
                    deadZombie += 1;
                }
            }
        }

        if (lawnMower.x > 900)
        {
            lawnMowerContainer.removeChild(lawnMower);
        }
    }

    //僵尸吃菜
    var zombieColumn;
    for (i = 0; i < zombieContainer.numChildren; i++)
    {
        var movingZombie = zombieContainer.getChildAt(i);
        var eatingZombie = eatingZombieContainer.getChildAt(i);
        zombieColumn = Math.floor((movingZombie.x - borderLeft) / gridWidth);
        var attackedPlant = plantContainer.getChildByName("plant_" + movingZombie.zombieRow + "_" + zombieColumn);
        if (zombieColumn < 0 || zombieColumn > 8 || plantArray[movingZombie.zombieRow][zombieColumn] == 0)
        {
            movingZombie.x -= 0.25;
            eatingZombie.x -= 0.25;
            eatingZombie.alpha  = 0;
            movingZombie.alpha = 100;
        }
        else
        {
            if (attackedPlant.type != "potatoMine")
            {
                attackedPlant.blood -= 1;

                movingZombie.alpha = 0;
                eatingZombie.alpha = 100;
            
                if (attackedPlant.blood <= 0)
                {
                    plantArray[movingZombie.zombieRow][zombieColumn] = 0;
                    plantContainer.removeChild(attackedPlant);
                    eatingZombie.alpha  = 0;
                    movingZombie.alpha = 100;
                }
            }
            else
            {
                if (attackedPlant.stat == 1)
                {
                    var potatoMineEffect = new lib.potatoMineEffectMC();
                    potatoMineEffect.x = movingZombie.x;
                    potatoMineEffect.y = movingZombie.y + 20;
                    potatoMineEffect.timer = 80;
                    potatoMineEffect.recharge = 0;
                    potatoMineEffect.name = "potatoMineEffect";
                    overlayContainer.addChild(potatoMineEffect);

                    var potatoMineWord = new lib.potatoMineWordMC();
                    potatoMineWord.x = movingZombie.x;
                    potatoMineWord.y = movingZombie.y + 20;
                    potatoMineWord.timer = 70;
                    potatoMineWord.recharge = 0;
                    potatoMineWord.name = "potatoMineWord";
                    overlayContainer.addChild(potatoMineWord);

                    var zombieBoom = new lib.zombieBoomMC();
                    zombieBoom.x = movingZombie.x;
                    zombieBoom.y = movingZombie.y;
                    zombieBoom.timer = 123;
                    zombieBoom.recharge = 0;
                    zombieBoomContainer.addChild(zombieBoom);

                    zombieArray[movingZombie.zombieRow].splice(zombieArray[movingZombie.zombieRow].indexOf(movingZombie.name), 1);
                    zombieContainer.removeChild(movingZombie);
                    eatingZombieContainer.removeChild(eatingZombie);

                    deadZombie += 1;

                    plantContainer.removeChild(attackedPlant);
                    plantArray[attackedPlant.plantRow][attackedPlant.plantCol] = 0;
                }

                else
                {
                    attackedPlant.blood -= 1;

                    movingZombie.alpha = 0;
                    eatingZombie.alpha = 100;
            
                    if (attackedPlant.blood <= 0)
                    {
                        plantArray[movingZombie.zombieRow][zombieColumn] = 0;
                        plantContainer.removeChild(attackedPlant);
                        eatingZombie.alpha  = 0;
                        movingZombie.alpha = 100;
                    }
                }
            }
        }
    }

    //僵尸死亡动画控制
    for (i = 0; i < dyingZombieBodyContainer.numChildren; i++)
    {
        var dyingZombieBody = dyingZombieBodyContainer.getChildAt(i);
        if (dyingZombieBody.timer < 50)
        {
            dyingZombieBody.timer ++;
        }
        else if (dyingZombieBody.timer < 100)
        {
            dyingZombieBody.alpha -= 0.02;
            dyingZombieBody.timer ++;
        }
        else
        {
            dyingZombieBodyContainer.removeChild(dyingZombieBody);
        }
    }

    for (i = 0; i < dyingZombieHeadContainer.numChildren; i++)
    {
        var dyingZombieHead = dyingZombieHeadContainer.getChildAt(i);
        if (dyingZombieHead.timer < 27)
        {
            dyingZombieHead.timer ++;
        }
        else if (dyingZombieHead.timer < 49)
        {
            dyingZombieHead.alpha -= 0.02;
            dyingZombieHead.timer ++;
        }
        else
        {
            dyingZombieHeadContainer.removeChild(dyingZombieHead);
        }
    }

    //阳光管理
    for (i = 0; i < sunContainer.numChildren; i++)
    {
        var fallingSun = sunContainer.getChildAt(i);
        if (fallingSun.y < fallingSun.destinationY)
        {
            fallingSun.y ++;
        }
        else
        {
            fallingSun.alpha -= 0.005;
            if (fallingSun.alpha < 0)
            {
                fallingSun.removeEventListener("click", sunClicked);
                sunContainer.removeChild(fallingSun);
            }
        }
    }

    for (i = 0; i < sunFromSunFlowerContainer.numChildren; i++)
    {
        var sunFromSunFlower = sunFromSunFlowerContainer.getChildAt(i);
        if (sunFromSunFlower.sunTimer == sunFromSunFlower.sunTime)
        {
            sunFromSunFlower.alpha -= 0.005;
            if (sunFromSunFlower.alpha < 0)
            {
                sunFromSunFlower.removeEventListener("click", sunClicked);
                sunFromSunFlowerContainer.removeChild(sunFromSunFlower);
            }
        }
        else
        {
            sunFromSunFlower.sunTimer ++;
        }
    }

    if (sunshine >= 9990)
    {
        sunshine = 9990;
        updateSunshine();
    }

    //已收集的阳光的移动
    for (i = 0; i < sunCollectedContainer.numChildren; i++)
    {
        var sunCollected = sunCollectedContainer.getChildAt(i);
        if (sunCollected.x != sunCollected.destinationX && sunCollected.y != sunCollected.destinationY)
        {
            sunCollected.x -= sunCollected.dx;
            sunCollected.y -= sunCollected.dy;
            sunCollected.alpha -= 0.005;
        }

        if (sunCollected.alpha <= 0 || sunCollected.x <= sunCollected.destinationX || sunCollected.y <= sunCollected.destinationY)
        {
            sunCollectedContainer.removeChild(sunCollected);
        }
    }

    //植物放置
    if (whetherPlayerMoving == true && movingIsPlant == true)
    {
        movingPlant.x = stage.mouseX / stage.scaleX;
        movingPlant.y = stage.mouseY / stage.scaleY;
        var plantRow = Math.floor((stage.mouseY / stage.scaleY - borderTop) / gridHeight);
        var plantCol = Math.floor((stage.mouseX / stage.scaleX - borderLeft) / gridWidth);
        if (plantRow >= 0 && plantRow < 5 && plantCol >= 0 && plantCol < 9)
        {
            selector.visible = true;
            if (selector.type == "peaShooter")
            {
                selector.x = borderLeft + plantCol * gridWidth + 10;
                selector.y = borderTop + plantRow * gridHeight + 15;
            }
            else if (selector.type == "sunFlower")
            {
                selector.x = borderLeft + plantCol * gridWidth + 40;
                selector.y = borderTop + plantRow * gridHeight + 40;
            }
            else if (selector.type == "cherryBomb")
            {
                selector.x = borderLeft + plantCol * gridWidth + 30;
                selector.y = borderTop + plantRow * gridHeight + 50;
            }
            else if (selector.type == "wallNut")
            {
                selector.x = borderLeft + plantCol * gridWidth + 30;
                selector.y = borderTop + plantRow * gridHeight + 40;
            }
            else if (selector.type == "potatoMine")
            {
                selector.x = borderLeft + plantCol * gridWidth + 30;
                selector.y = borderTop + plantRow * gridHeight + 50;
            }
        }
        else
        {
            selector.visible = false;
        }
    }

    //铲子移动
    if (whetherPlayerMoving == true && movingIsShovel == true)
    {
        movingShovel.x = stage.mouseX / stage.scaleX;
        movingShovel.y = stage.mouseY / stage.scaleY;
    }

    //植物卡片管理
    for (i = 0; i < cardContainer.numChildren; i++)
    {
        var card = cardContainer.getChildAt(i);
        var loadingCard = loadingCardContainer.getChildAt(i);
        var cardText = cardTextContainer.getChildAt(i);
        if (card.alpha == 0)
        {
            if (cardRealTextArray[i] < 100)
            {
                switch (i)
                {
                    case 0:
                        cardRealTextArray[i] += 0.09;
                        break;
                    case 1:
                        cardRealTextArray[i] += 0.1;
                        break;
                    case 2:
                        cardRealTextArray[i] += 0.03;
                        break;
                    case 3:
                        cardRealTextArray[i] += 0.04;
                        break;
                    case 4:
                        cardRealTextArray[i] += 0.04;
                        break;
                }
                var cardRealText = Math.floor(cardRealTextArray[i]);
                cardText.text = cardRealText.toString() + "%";
            }
            else
            {
                loadingCard.alpha = 0;
                card.alpha = 100;
                cardRealTextArray[i] = 0;
                var cardRealText = Math.floor(cardRealTextArray[i]);
                cardText.text = cardRealText.toString() + "%";
                cardText.alpha = 0;
            }
        }
    }

    //樱桃炸弹爆炸效果、土豆雷爆炸效果管理
    for (i = 0; i < overlayContainer.numChildren; i++)
    {
        var BombEffect = overlayContainer.getChildAt(i);
        if (BombEffect.name == "cherryBombEffect" || BombEffect.name == "potatoMineEffect" || BombEffect.name == "potatoMineWord")
        {
            if (BombEffect.recharge != BombEffect.timer)
            {
                BombEffect.recharge += 1;
            }
            else
            {
                console.log(BombEffect.name);
                overlayContainer.removeChild(BombEffect);
            }
        }
    }

    //子弹效果管理
    for (i = 0; i < bulletEffectContainer.numChildren; i++)
    {
        var bulletEffect = bulletEffectContainer.getChildAt(i);
        if (bulletEffect.recharge < bulletEffect.timer)
            bulletEffect.recharge++;
        else
        {
            bulletEffectContainer.removeChild(bulletEffect);
        }
    }

    //爆炸僵尸动画管理
    for (i = 0; i < zombieBoomContainer.numChildren; i++)
    {
        var zombieBoom = zombieBoomContainer.getChildAt(i);
        if (zombieBoom.recharge < zombieBoom.timer)
        {
            zombieBoom.recharge += 1;
        }
        else
        {
            zombieBoomContainer.removeChild(zombieBoom);
        }
    }

    //游戏胜利判断
    if (deadZombie >= 30)
    {
        stage.removeChild(zombieContainer);
        stage.removeChild(eatingZombieContainer);
        stage.removeChild(dyingZombieBodyContainer);
        stage.removeChild(dyingZombieHeadContainer);
        stage.removeChild(zombieBoomContainer);
        stage.removeEventListener("tick", onEnterFrame);
        game = 1;
        win();
    }

    //游戏失败判断
    for (i = 0; i < zombieContainer.numChildren; i++)
    {
        zombie = zombieContainer.getChildAt(i);
        if (zombie.x + 72 <= 0)
        {
            stage.removeEventListener("tick", onEnterFrame);
            game = 1;
            lose();
            break;
        }
    }
}

//胜利场景设置
function win()
{
    stage.addChild(gameWinContainer);

    var trophy = new lib.trophyMC();
    trophy.x = 450;
    trophy.y = 250;
    gameWinContainer.addChild(trophy);

    var winWord = new createjs.Text("YOU WIN", "50px Impact", "#ff7700")
    winWord.textAlign = 'center';
    winWord.textBaseline = 'middle';
    winWord.x = 450;
    winWord.y = 400;
    gameWinContainer.addChild(winWord);

    shovel.removeEventListener("click", onShovelClicked);
    whetherPlayerMoving = true;
}

//失败场景设置
function lose()
{
    stage.addChild(gameLoseContainer);

    var loseWord = new lib.loseWordMC();
    loseWord.x = 450;
    loseWord.y = 300;
    gameLoseContainer.addChild(loseWord);

    shovel.removeEventListener("click", onShovelClicked);
    whetherPlayerMoving = true;
}

//游戏开始
function main()
{
    stage.removeChild(startPageContainer);

    setField();
    drawField();
    addZombie();
    addPlantCard();
    addLawnMower();
    addShovel();
    fallingSun();
    stage.addEventListener("tick",onEnterFrame);
}

start();

//游戏开始页面设置
function start()
{
    stage.addChild(startPageContainer);

    var startPageBackground = new lib.startPage();
    startPageBackground.x = 0;
    startPageBackground.y = 0;
    startPageContainer.addChild(startPageBackground);

    var startGameButton = new lib.startPageButton();
    startGameButton.x = 100;
    startGameButton.y = 450;
    startGameButton.addEventListener("click", main);
    startPageContainer.addChild(startGameButton);

    var startText = new createjs.Text("Start Game", "40px Impact", "#ff7700");
    startText.textAlign = 'center';
    startText.textBaseline = 'middle';
    startText.x = 230;
    startText.y = 500;
    startText.addEventListener("click", main);
    startPageContainer.addChild(startText);
}