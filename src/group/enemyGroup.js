import Phaser from "phaser";
import EnemyData from './../data/enemyData';

class EnemyGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene, area) {
        // 親クラスを呼び出す
        super(scene.physics.world, scene);
        // シーンをプロパティとして代入
        this.scene = scene;
        // 作成するランダムな領域のオブジェクト
        this.area = area;
        // 作成する敵の最大数
        this.maxCount = 10;
        // 現在作成した敵の数
        this.count = 0;
        
        // タイマーの起動
        this.timer = this.scene.time.addEvent({
            delay : 2000,
            callback : this.createEnemy,
            loop: true,
            callbackScope : this,
        });
    }
    
    createEnemy() {
        // 現在の敵の数が最大数と同数の場合
        if( this.count >= this.maxCount ) {
            // 敵を作成しない
            return;
        }
        const data = JSON.parse(JSON.stringify(Phaser.Math.RND.pick(EnemyData)));
        // 敵の作成
        const enemy = this.create(this.area.x, this.area.y, data.image);
        // 表示サイズの変更
        enemy.setDisplaySize(48, 48);
        // 敵がゲーム空間と衝突
        enemy.setCollideWorldBounds(true);
        // ランダムな位置に移動
        enemy.setRandomPosition(this.area.x, this.area.y, this.area.widht, this.area.height);
        // 敵の名前設定
        enemy.name = data.name;
        // 艇のHP設定
        enemy.hp = data.hp;
        // 敵の数をカウントアップ
        this.count++;
    }
    
    stopTimer() {
        this.timer.remove();
    }
}

export default EnemyGroup;
