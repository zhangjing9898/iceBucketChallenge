class Game extends eui.Component implements  eui.UIComponent {
	
	private stageHeight;
	private stageWidth;
	private group: eui.Group;
	private tongNumTXT: eui.Label;
	public tongNum = 0;

	public timeDownTXT: eui.Label;
	private time = 120;

	public constructor() {
		super();
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();
		this.init();
	}
	
	private init() {
		egret.startTick(this.update, this);

		// timer
		let s = setInterval(() => {
			if(this.time > 0) {
				this.time --;
				this.timeDownTXT.text = this.time.toString();
			} else {
				clearInterval(s);
			}
		}, 1000)
		this.stageHeight = this.stage.stageHeight;
		this.stageWidth = this.stage.stageWidth;
		this.height = this.stageHeight;
	}

	// 出现的速度
	private speed = 1;
	private count = 0;

	// update函数
	// 控制人物出现速度 + 判断游戏是否结束
	private update(): boolean {
		this.count++;
		if(this.count === Math.floor(this.time / this.speed)) {
			this.peopleChange();
			this.count = 0;
			this.speed += 0.05;
		}

		// 判断游戏是否结束
		if (this.time <= 0) {
			// TODO: new gameover
			egret.startTick(this.update, this);
			this.parent.removeChild(this);
		}
		return false;
	}

	// 人物换脸函数
	private peopleChange() {
		// 随机 in 9groups
		let ran = Math.floor(Math.random() * this.group.numChildren);
		let g: eui.Group = <eui.Group>this.group.getChildAt(ran);
		console.log('peopleChange g', g);
		for (let i = 0; i < this.group.numChildren; i++) {
			// 如果随机到的group中，没有人物image，那么就创建一个
			if (g.numChildren < 4) {
				if (ran === i) {
					// 在三张人物图片中随机一张
					let random = Math.floor(Math.random() * 3);
					this.group.getChildAt(i).visible = true;
					// 创建人物图片
					let img: egret.Bitmap = new egret.Bitmap(RES.getRes(GameUtil.peopleEnemy[random]));
					g.addChild(img);
					// 设置遮罩
					img.mask = g.getChildAt(0);
					console.log('peopleImg', img);
					// 将人物图片放到遮罩图片下方，然后让其缓动到上方
					img.y += img.height;
					// 缓动
					let tw = egret.Tween.get(img)
										.to({
											y:img.y - img.height
										}, 500)
										.to({
											y: img.y
										}, 500)
										.call(() => {
											// 缓动完，将group 隐藏
											this.group.getChildAt(i).visible = false;
											// 人物图片复位
											img.y -= img.height;
											// 从group中delete人物img
											g.removeChild(img);
											// remove 监听
											img.removeEventListener(egret.TouchEvent.TOUCH_TAP, () => {}, this);
											egret.Tween.removeTweens(img);
											// 将图片隐藏
											g.getChildAt(2).visible = false;
											g.getChildAt(3).visible = false;
										});
					// 人物图片click处理
					img.touchEnabled = true;
					img.addEventListener(egret.TouchEvent.TOUCH_TAP,() => {
						// 暂停动画
						tw.setPaused(true);
						// 防多次点击
						img.touchEnabled = false;
						this.tongNum++;
						GameUtil.Constant.score++;
						g.getChildAt(2).visible = true;
						g.getChildAt(3).visible = true;
						this.tongNumTXT.text = this.tongNum.toString();
						// 替换为对应被浇水后的img
						img.texture = RES.getRes(GameUtil.peopleEnemyWet[random]);
						// 动画继续播放 after 200ms
						setTimeout(() => {
							tw.setPaused(false);
						}, 200);
					}, this);
				}
			}
		}
	}
}