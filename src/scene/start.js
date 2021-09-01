import Phaser from "phaser";

class StartScene extends Phaser.Scene {
    constructor() {
        // シーンの名前を設定
        super({key : "StartScene"});
    }
    
    create(data) {
        // 背景色を設定
        this.cameras.main.setBackgroundColor("#FFDBAE");
        // 画面の中央座標を取得
        const cameraPositionX = this.cameras.main.midPoint.x;
        const cameraPositionY = this.cameras.main.midPoint.y;
        // メッセージを表示
        this.add.text(cameraPositionX-350, cameraPositionY-300, "ゲームタイトル", {
            font: "100px Open Sans",
            fill: "#0000ff",
        });
        // スタート画像を画面中央に表示
        const startImage = this.add.image(cameraPositionX, cameraPositionY, "button_start");
        // スタート画像サイズの変更
        startImage.setDisplaySize(400, 150);
        startImage.setInteractive({
            useHandCursor: true,
        });
        startImage.on("pointerdown",function() {
            this.scene.start("Map1Scene", {
                "from" : "StartScene",
            });
        }, this);
    }
}

export default StartScene;
