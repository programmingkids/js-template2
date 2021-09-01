import Phaser from "phaser";

// プレイヤーを表すPlayerクラス
class Treasure extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, image) {
        // 親クラスを呼び出す
        super(scene, x, y, image);
        // シーンをプロパティとして代入
        this.scene = scene;
        // 表示サイズの変更
        this.setDisplaySize(48, 48);
    }
    
    update() {
    }
}

export default Treasure;
