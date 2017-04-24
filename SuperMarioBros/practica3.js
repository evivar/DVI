window.addEventListener("load",function() {

		var Q = Quintus({audioSupported: [ 'mp3','ogg' ]})
            .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
            .setup({
                width: 320,
                height: 480,
        }).controls().touch().enableSound();

        Q.animations("mario anim", {
					"marioR":{frames: [1,2,3], rate: 1/10},
					"marioL":{frames: [15,16,17], rate: 1/10},
					"stand_right":{frames: [0], rate: 1/10, loop: false},
					"stand_left":{frames: [14], rate: 1/10, loop: false},
					"jumping_right":{frames: [4], rate: 1/10, loop: false},
					"jumping_left":{frames: [18], rate: 1/10, loop: false},
					"mario_die":{frames: [12], rate: 1/10, loop: false}
		});

        Q.Sprite.extend("Mario",{

        	init: function(p) {
        		this._super(p, {
        			sprite: "mario anim",
        			sheet: "mario",
        			jumpSpeed: -420,
        			speed: 200,
        			x: 160,
        			y: 480,
        			vy: 10,
        			direction: "right",
        			moverse: true,
        			muerto: false
        		});

        		this.add('2d, platformerControls, animation, tween');

        		this.on("die", this, "die");
        		this.on("win", this, "win");
        	},    

        	die: function(){
        		this.p.muerto = true;
        		var callDestroy = function(){        			
        			this.destroy();
        		} 
        		var caeHaciaAbajo = function(){     
        			this.animate({ x: this.p.x, y: this.p.y + (620 - this.p.y), angle: 0},0.6,{callback: callDestroy}); 
        		} 
        		this.animate({ x: this.p.x, y: this.p.y - 75, angle: 0},0.3,{callback: caeHaciaAbajo}); 
        	}, 	

        	win: function(){
        		this.p.moverse = false;
        	},

        	step: function(dt) {

        		if(this.p.muerto){
        			this.play("mario_die");
        		} else {
	        		if(this.p.moverse){
	        			if(this.p.jumping && this.p.landed < 0) {
							this.play("jumping_" + this.p.direction);
						} else if (this.p.landed > 0){    
							if(this.p.vx > 0) {
							 	this.play("marioR");
							 } else if(this.p.vx < 0) {
								this.play("marioL");
							 } else {
							 	this.play("stand_" + this.p.direction);
							 }
						}
	        		}
	        		else{
	        			this.play("stand_" + this.p.direction);
	        			this.p.speed = 0;
	        			this.p.jumpSpeed = 0;
	        		}

	        		if(this.p.y > 580){
	        			this.trigger("die");
	   					Q.stageScene("looseGame", 1);
					}
        		}

        		
				
        	}

        });

        Q.component("defaultEnemy", {
        	added: function() {
        		var collisioned = false;
        		this.entity.add('2d, aiBounce, animation');
        		this.entity.play("walk");
        		this.entity.on("died",this,"die");
				this.entity.on('bump.top',this,'top');
				this.entity.on('bump.left,bump.right,bump.bottom',this,'coll');
			},

			top: function(collision) {
				if(collision.obj.isA("Mario")) {
    				this.entity.play("die");
    				collision.obj.p.vy = -200;
    			}
			 },

			 coll: function(collision){
			 	if(collision.obj.isA("Mario")) {
    				if(!this.collisioned){
    					Q.stageScene("looseGame", 1);
    					collision.obj.trigger("die");
    					this.collisioned = true;
    				}
    			}
			 },

			die: function() {
        		this.entity.destroy();
        	},
		});

        Q.animations("goomba anim", {
					"walk":{frames: [0,1], rate: 1/5},
					"die":{frames: [2], rate: 1/5, loop: false, trigger: "died"}
		});

        Q.Sprite.extend("Goomba",{
        	
        	init: function(p) {
        		this._super(p, {
        			sprite: "goomba anim",
        			sheet: "goomba",
        			speed: 180,
        			frame: 0,
        			vx: 100,
        			x: 1000,
        			y: 380,
        		});

        		this.add("defaultEnemy");
        	},

        	step: function(dt) {
        		
        	}
        });

        Q.animations("bloopa anim", {
					"walk":{frames: [0,1], rate: 1/3},
					"die":{frames: [2], rate: 1/3, loop: false, trigger: "died"}
		});

        Q.Sprite.extend("Bloopa",{
        	
        	init: function(p) {
        		this._super(p, {
        			sprite: "bloopa anim",
        			sheet: "bloopa",
        			gravity: 0,
        			frame: 0,
        			vy: 100,
        			x: 500,
        			y: 380,
        		});

        		this.add("defaultEnemy");
        	},

        	step: function(dt) {
        		
        		this.timeJump += dt;

				if(this.p.vy == 0){
					this.p.vy = -50;
					this.timeJump = 0;
				}

				if (this.timeJump >= 2)
					this.p.vy = 120;
	        	}
        });

        Q.Sprite.extend("Coin",{
        	
        	init: function(p) {
        		this._super(p, {
        			sprite: "coin",
        			sheet: "coin",
        			frame: 2,
        			x: 350,
        			y: 470,
        			sensor: true,
        			puntuado: false
        		});

				this.add("tween");

        		this.on("sensor");		
        	},

        	sensor: function() {
        		var callDestroy = function(){        			
        			this.destroy();
        		}        		
        		this.animate({ x: this.p.x, y: this.p.y - 50, angle: 0},0.3,{callback: callDestroy}); 
        		if(!this.p.puntuado){
        			Q.audio.play('coin.mp3');
    				Q.state.inc("score",50);
    				this.p.puntuado = true;
    			}        		
        	},

        	step: function(dt) {
        		
        	}

        });	

        Q.Sprite.extend("Princess",{
        	
        	init: function(p) {
        		this._super(p, {
        			asset: "princess.png",
        			frame: 0,
        			x: 3000,
        			y: 520,
        			sensor: true,
        		});

        		this.on("sensor");
        	},

        	sensor: function() {
        		Q.stageScene("winGame", 1);
        		this.p.sensor = false;
        		//Bloquear a Mario para que no se mueva
        		Q("Mario").trigger("win");
        	} 

        });	
	

        Q.scene("looseGame",function(stage) {
        	Q.audio.stop("music_main.mp3");

        	Q.audio.play('music_die.mp3');
			var container = stage.insert(new Q.UI.Container({
			   	x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
			}));

			var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
			                                                  label: "Play Again" }));         
			var label = container.insert(new Q.UI.Text({x: 0, y: -10 - button.p.h, 
			                                                   label: "Game over" }));
			button.on("click",function() {
			   	Q.clearStages();
			    Q.stageScene("mainTitle");
			});

			container.fit(20);
		});

		Q.scene("winGame",function(stage) {
        	Q.audio.stop("music_main.mp3");

        	Q.audio.play('music_level_complete.mp3');
			var container = stage.insert(new Q.UI.Container({
			   	x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
			}));

			var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
			                                                  label: "Play Again" }));         
			var label = container.insert(new Q.UI.Text({x: 0, y: -10 - button.p.h, 
			                                                   label: "Mario wins" }));
			button.on("click",function() {
			   	Q.clearStages();
			    Q.stageScene("mainTitle");
			});

			container.fit(20);
		});

		Q.scene("mainTitle",function(stage) {
			var container = stage.insert(new Q.UI.Container({
			   	x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
			}));

			var button = container.insert(new Q.UI.Button({asset: "mainTitle.png", x: 0, y: 0}))         
			button.on("click",function() {
				Q.clearStages();
				Q.stageScene("level1");				
			});

			Q.audio.stop();
			Q.audio.play('music_main.mp3',{ loop: true });

			container.fit(20);
		});

        Q.scene("level1",function(stage) {
            Q.stageTMX("level.tmx",stage);

		   	var player = stage.insert(new Q.Mario());

            stage.insert(new Q.Goomba());
            stage.insert(new Q.Bloopa());
            stage.insert(new Q.Princess());
            stage.insert(new Q.Coin());
            //stage.insert(new Q.Coin({x:500, y: 470}));

            Q.state.reset({ score: 0, lives: 2 });   

            stage.add("viewport").follow(player, {x: true, y: true}, {minX: -200, maxX: 256*16, minY: 125, maxY: 32*16});

            Q.stageScene("scoreLabel", 1);
            
        }); 

        Q.scene("scoreLabel",function(stage) {
			var container = stage.insert(new Q.UI.Container({
			   	x: Q.width/2, y: 0, fill: "rgba(0,0,0,0.0)"
			}));

			Q.UI.Text.extend("Score",{
				init: function(p) {
					this._super({
						label: "Score: 0",
						x: 0,
						y: 0
					});

					Q.state.on("change.score",this,"score");

				},

				score: function(score) {
					this.p.label = "Score: " + score;
				}
			});

			var label = container.insert(new Q.Score());

			container.fit(20);	
		});

        ;  

        Q.loadTMX("level.tmx, mainTitle.png, mario_small.png, mario_small.json, goomba.png, goomba.json, bloopa.png, bloopa.json, princess.png, coin.png, coin.json, music_main.mp3, music_die.mp3, music_level_complete.mp3, coin.mp3", function() {
        	Q.compileSheets("mario_small.png", "mario_small.json");
        	Q.compileSheets("goomba.png", "goomba.json");
        	Q.compileSheets("bloopa.png", "bloopa.json");
        	Q.compileSheets("coin.png", "coin.json");
            Q.stageScene("mainTitle");
        });   

});