import Phaser from "phaser";
import Config from './../data/config';
import PlayerFactory from './../factory/playerFactory';
import PlayerData from './../data/playerData';
import EnemyGroup from './../group/enemyGroup';
import Treasure from './../sprite/treasure';

class Map1Scene extends Phaser.Scene {
    constructor() {
        // シーンの名前を設定
        super({key : "Map1Scene"});
    }
    
    create(data) {
        this.config(data);
        // マップの作成
        this.createMap();
        // プレイヤーの作成
        this.createPlayer();
        // 敵グループの作成
        this.createEnemyGroup();
        
        this.createTreasure();
        // 各種衝突の設定
        this.setCollider();
    }
    
    update() {
        if(this.isGameOver) {
            return;
        }
        // プレイヤーの処理を呼び出す
        this.player.update();
    }
    
    config(data) {
        this.data = data;
        // ゲームオーバーフラグ
        this.isGameOver = false;
    }
    
    createMap() {
        // JSON形式のマップデータの読み込み Tilemapオブジェクトの作成
        this.map = this.make.tilemap({key: "map1"});

        // タイル画像をマップデータに反映する Tilesetオブジェクトの作成
        this.tiles = this.map.addTilesetImage("map_tiles1", "map_tiles1", Config.TILE_WIDTH, Config.TILE_HEIGTH, 0, Config.TILE_SPACING);
        
        const layerWidth = Config.TILE_WIDTH * Config.TILE_SCALE * Config.TILE_COLUMN;
        const layerHeight = Config.TILE_HEIGTH * Config.TILE_SCALE * Config.TILE_COLUMN;
        
        // Groundレイヤー
        this.groundLayer = this.map.createLayer("Ground", this.tiles, 0, 0);
        this.groundLayer.setDisplaySize(layerWidth, layerHeight);
        
        // Borderレイヤー
        this.borderLayer = this.map.createLayer("Border", this.tiles, 0, 0);
        this.borderLayer.setDisplaySize(layerWidth, layerHeight);
        this.borderLayer.setCollisionByExclusion([-1]);
        
        // Worldレイヤー
        this.worldLayer = this.map.createLayer("World", this.tiles, 0, 0);
        this.worldLayer.setDisplaySize(layerWidth, layerHeight);
        this.worldLayer.setCollisionByExclusion([-1]);

        // ゲームワールドの幅と高さの設定
        this.physics.world.bounds.width = this.groundLayer.displayWidth;
        this.physics.world.bounds.height = this.groundLayer.displayHeight;
        
        // カメラの表示サイズの設定をする。マップのサイズがカメラの表示サイズ
        this.cameras.main.setBounds(0, 0, this.physics.world.bounds.width, this.physics.world.bounds.height);
    }
    
    createPlayer() {
        // スタートシーンから移動してきた場合
        if(this.data.from == "StartScene") {
            this.map.findObject('Player', function(object) {
                if (object.name == "FromStartScene") {
                    PlayerData.x = object.x * Config.TILE_SCALE;
                    PlayerData.y = object.y * Config.TILE_SCALE;
                    // 設定基づいてプレイヤーを作成
                    this.player = PlayerFactory.create(this, PlayerData);
                }
            }, this);
        }
        
        // プレイヤーをシーンに追加
        this.add.existing(this.player);
        // プレイヤーを物理エンジンの対象に追加
        this.physics.add.existing(this.player);
        // カメラはプレイヤーを追跡
        this.cameras.main.startFollow(this.player);
    }
    
    createEnemyGroup() {
        this.map.findObject("EnemyArea", function(object) {
            // 敵を作成するエリアを取り出す
            if(object.name == "CreateArea") {
                object.x *= Config.TILE_SCALE;
                object.y *= Config.TILE_SCALE;
                object.width *= Config.TILE_SCALE;
                object.height *= Config.TILE_SCALE;
                this.enemyGroup = new EnemyGroup(this, object);
            }
        }, this);
    }
    
    createTreasure() {
        // 宝箱作成
        this.treasure = new Treasure(this, 1000, 1000, 'treasure02');
        this.add.existing(this.treasure);
        this.physics.add.existing(this.treasure);
    }
    
    setCollider() {
        // プレイヤーはゲーム空間と衝突
        this.player.setCollideWorldBounds(true);
        // プレイヤーはborderレイヤーと衝突
        this.physics.add.collider(this.player, this.borderLayer);
        // プレイヤーはworldレイヤーと衝突
        this.physics.add.collider(this.player, this.worldLayer);
        // プレイヤーは敵と衝突
        this.physics.add.overlap(this.player, this.enemyGroup, this.hitEnemy, null, this);
        // プレイヤーと宝箱の衝突
        this.physics.add.overlap(this.player, this.treasure, this.hitTreasure, null, this);
    }
    
    hitEnemy(player, enemy) {
        // プレイヤーと敵が衝突したときの処理
        if(this.isGameOver) {
            return;
        }
        // 敵の削除
        enemy.destroy();
        // メインカメラのフラッシュ
        this.cameras.main.flash(200, 255, 0, 0);
        // プレイヤーのHP減算
        this.player.hp--;
        // プレイヤーのHPが0になったら
        if(player.hp <= 0) {
            // 終了処理
            this.stopGame();
        }
    }
    
    stopGame() {
        // 終了処理
        // ゲームオーバーフラグをtrue
        this.isGameOver = true;
        // 物理エンジン停止
        this.physics.pause();
        // プレイヤーの終了処理
        this.player.die();
        // 敵作成タイマーの停止
        this.enemyGroup.stopTimer();
        // ゲームオーバーのタイマー起動
        this.gameOverTimer = this.time.addEvent({
            delay: 1000,
            callback : this.gameOver,
            loop : false,
            callbackScope: this,
        });
    }
    
    hitTreasure(player, treasure) {
        // ゲームオーバーフラグをtrue
        this.isGameOver = true;
        // 物理エンジン停止
        this.physics.pause();
        // プレイヤーの勝利処理
        this.player.win();
        // 敵作成タイマーの停止
        this.enemyGroup.stopTimer();
        // ゲームオーバーのタイマー起動
        this.gameOverTimer = this.time.addEvent({
            delay: 1000,
            callback : this.gameClear,
            loop : false,
            callbackScope: this,
        });
    }
    
    gameClear() {
        // ゲームクリアシーンへ移動
        this.scene.start("GameClearScene", {
            from : "Map1Scene",
        });
    }
    
    gameOver() {
        // ゲームオーバーシーンへ移動
        this.scene.start("GameOverScene",{
            from : "Map1Scene",
        });
    }
}

export default Map1Scene;
