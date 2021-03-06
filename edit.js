const config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 640,
    height: 520,
    physics: {
        default: 'arcade'
    },
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let path;
let path2;
let path3;
let path4;
let path5;
let turrets;
let enemies;

let ENEMY_SPEED = 1/10000;

let BULLET_DAMAGE = 50;
let TOWER_HEALTH = 250;

let map =  [[ 0, 0, 0, 0, 0, 0, 0, 0, -1, -1],
            [ 0, 0, 0, 0, 0, 0, 0, 0, -1, -1],
            [ 0, 0, 0, 0, 0, 0, 0, 0, -1, -1],
            [ 0, 0, 0, 0, 0, 0, 0, 0, -1, -1],
            [ 0, 0, 0, 0, 0, 0, 0, 0, -1, -1],
            [ 0, 0, 0, 0, 0, 0, 0, 0, -1, -1],
            [ 0, 0, 0, 0, 0, 0, 0, 0, -1, -1],];

function preload() {    
    this.load.atlas('sprites', 'assets/spritesheet.png', 'assets/spritesheet.json');
    this.load.image('bullet', 'assets/bullet.png');
}

let Enemy = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Enemy (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'sprites', 'enemy');

          let line1 = this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
          let line2 = this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
          let line3 = this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
          let line4 = this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
          let line5 = this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
        
            this.hp = 0;
        },

        startOnPath: function ()
        {
            this.follower.t = 0;
            this.hp = 1000;
            
            path.getPoint(this.follower.t, this.follower.vec);
            path2.getPoint(this.follower.t, this.follower.vec)
            path3.getPoint(this.follower.t, this.follower.vec)
            path4.getPoint(this.follower.t, this.follower.vec)
            path5.getPoint(this.follower.t, this.follower.vec)
            
            this.setPosition(this.follower.vec.x, this.follower.vec.y);            
        },
        receiveDamage: function(damage) {
            this.hp -= damage;           
            
            // if hp drops below 0 we deactivate this enemy
            if(this.hp <= 0) {
                this.setActive(false);
                this.setVisible(false);      
            }
        },
        update: function (time, delta)
        {
            this.follower.t += ENEMY_SPEED * delta;
            path.getPoint(this.follower.t, this.follower.vec);
            path2.getPoint(this.follower.t, this.follower.vec);
            path3.getPoint(this.follower.t, this.follower.vec);
            path4.getPoint(this.follower.t, this.follower.vec);
            path5.getPoint(this.follower.t, this.follower.vec);
            this.setPosition(this.follower.vec.x, this.follower.vec.y);

            if (this.follower.t >= 1)
            {
                this.setActive(false);
                this.setVisible(false);
            }
        }

});

function getEnemy(x, y, distance) {
    var enemyUnits = enemies.getChildren();
    for(var i = 0; i < enemyUnits.length; i++) {       
        if(enemyUnits[i].active && Phaser.Math.Distance.Between(x, y, enemyUnits[i].x, enemyUnits[i].y) < distance)
            return enemyUnits[i];
    }
    return false;
} 

let Turret = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Turret (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'sprites', 'turret');
            this.nextTic = 0;
        },
        place: function(i, j) {            
            this.y = i * 64 + 64/2;
            this.x = j * 64 + 64/2;
            map[i][j] = 1;            
        },
        fire: function() {
            var enemy = getEnemy(this.x, this.y, 200);
            if(enemy) {
                var angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
                addBullet(this.x, this.y, angle);
                this.angle = (angle + Math.PI/2) * Phaser.Math.RAD_TO_DEG;
            }
        },
        update: function (time, delta)
        {
            if(time > this.nextTic) {
                this.fire();
                this.nextTic = time + 1000;
            }
        },

        upgrade: function(){
            //while(this.waveFinished === ++){
                this.towerUpgraded = true;
                this.towerHealthUpgrade = TOWER_HEALTH + 250
                this.towerDamageUpgrade = TOWER_HEALTHBULLET_DAMAGE + 500
            }

        }
});
    
let Bullet = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Bullet (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');

            this.incX = 0;
            this.incY = 0;
            this.lifespan = 0;

            this.speed = Phaser.Math.GetSpeed(600, 1);
        },

        fire: function (x, y, angle)
        {
            this.setActive(true);
            this.setVisible(true);
            //  Bullets fire from the middle of the screen to the given x/y
            this.setPosition(x, y);
            
        //  we don't need to rotate the bullets as they are round

            this.dx = Math.cos(angle);
            this.dy = Math.sin(angle);

            this.lifespan = 1000;
        },

        update: function (time, delta)
        {
            this.lifespan -= delta;

            this.x += this.dx * (this.speed * delta);
            this.y += this.dy * (this.speed * delta);

            if (this.lifespan <= 0)
            {
                this.setActive(false);
                this.setVisible(false);
            }
        }

    });
 
function create() {
    let graphics = this.add.graphics();    
    drawLines(graphics);
    path = this.add.path(600, 100);
    path.lineTo(0, 100);
    path2 = this.add.path(600, 160)
    path2.lineTo(0, 160);
    path3 = this.add.path(600, 220)
    path3.lineTo(0, 220);
    path4 = this.add.path(600, 290)
    path4.lineTo(0, 290);
    path5 = this.add.path(600, 350)
    path5.lineTo(0, 350);
    
    graphics.lineStyle(2, 0xffffff, 1);
    path.draw(graphics);
    path2.draw(graphics);
    path3.draw(graphics);
    path4.draw(graphics)
    path5.draw(graphics)

    
    enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
    
    turrets = this.add.group({ classType: Turret, runChildUpdate: true });
    
    bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    
    this.nextEnemy = 0;
    
    this.physics.add.overlap(enemies, bullets, damageEnemy);
    
    this.input.on('pointerdown', placeTurret);
}

function damageEnemy(enemy, bullet) {  
    // only if both enemy and bullet are alive
    if (enemy.active === true && bullet.active === true) {
        // we remove the bullet right away
        bullet.setActive(false);
        bullet.setVisible(false);    
        
        // decrease the enemy hp with BULLET_DAMAGE
        enemy.receiveDamage(BULLET_DAMAGE);
    }
}

function drawLines(graphics) {
    graphics.lineStyle(1, 0x0000ff, 0.8);
    for(let i = 0; i < 8; i++) {
        graphics.moveTo(0, i * 64);
        graphics.lineTo(640, i * 64);
    }
    for(let j = 0; j < 10; j++) {
        graphics.moveTo(j * 64, 0);
        graphics.lineTo(j * 64, 512);
    }
    graphics.strokePath();
}

function update(time, delta) {  

    if (time > this.nextEnemy)
    {
        let enemy = enemies.get();
        if (enemy)
        {
            enemy.setActive(true);
            enemy.setVisible(true);
            enemy.startOnPath();

            this.nextEnemy = time + 2000;
        }       
    }
}

function canPlaceTurret(i, j) {
    return map[i][j] === 0;
}

function placeTurret(pointer) {
    let i = Math.floor(pointer.y/64);
    let j = Math.floor(pointer.x/64);
    if(canPlaceTurret(i, j)) {
        var turret = turrets.get();
        if (turret)
        {
            turret.setActive(true);
            turret.setVisible(true);
            turret.place(i, j);
        }   
    }
}

function addBullet(x, y, angle) {
    let bullet = bullets.get();
    if (bullet)
    {
        bullet.fire(x, y, angle);
    }
}