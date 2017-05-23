window.addEventListener("load",function() {

	var Q = Quintus({audioSupported: [ 'mp3','ogg' ]})
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
        .setup({
            width: 800,
            height: 467,
    }).controls().touch().enableSound();

    Q.Sprite.extend("Ball",{

        init: function(p) {
            this._super(p, {
                sheet: "Ball",
                scale: 2,
                jumpSpeed: -8000,
                speed: 1200
            });

            this.add('2d, platformerControls, aiBounce');
        },

        step: function(dt){
            
        }

    });

    Q.Sprite.extend("WallsTopBot",{

        init: function(p) {
            this._super(p, {
                sheet: "Walls1",
            });            
        },

        step: function(dt){
            this.y = this.p.y;
            this.x = this.p.x;
        }

    });

    Q.Sprite.extend("WallsLeftRight",{

        init: function(p) {
            this._super(p, {
                sheet: "Walls2",
            });            
        },

        step: function(dt){
            this.y = this.p.y;
            this.x = this.p.x;
        }

    });

   	Q.scene("level1",function(stage) {
        Q.stageTMX("level1.tmx",stage);

        stage.add("viewport");

        Q.stage().viewport.scale = 0.261;  
	});

    Q.loadTMX("level1.tmx", function() {
        Q.stageScene("level1");
    });   

});