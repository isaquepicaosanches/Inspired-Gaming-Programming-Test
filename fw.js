//
// OBJECTS BELOW
//
  function Firework(t,b,c,d,p,v){
  //the firework object

   this.rocket = t;
   this.begin = b;
   this.colour = c;
   this.duration = d;
   this.position = p;
   this.velocity = v;
  }

  function Projectile (p, x, y, s, c, t, tM, tE){
  //the projectile object

    this.type = p; // the projectile type
    //there's 3 types of projectiles:
    // "rocketlike"
    // "fountainlike"
    // "trail"
    this.pos = [x, y]; //the coordinates of the projectile
    this.size = s; // the size of the projectile
    this.colour = c; // the color of the projectile
    this.time = t; // the state relative to the projectile lifespan
    this.lifespan = tM; // the projectile lifespan
    this.explosionTime = tE;
  }

  function Frame (t, p, c){ 
  // the frame object
  
    this.time = t; //the timemark of the frame
    this.projectiles = p; //an array of projectiles to be drawn of the screen
    this.backgroundColor = c;
  }

//
// XML FUNCTIONS BELOW
//

  function ReadXML(filename){// reads the XML and saves it as a firework array
  	var Connect = new XMLHttpRequest();
  	Connect.open("GET", filename, false);
  	Connect.send();

    var xml = Connect.responseXML;
    var xmlFireworks = xml.getElementsByTagName("Firework");

    for (n = 0; n < xmlFireworks.length; n++){
      var f = xmlFireworks[n];
      var isRocket = (f.getAttribute('type')) == "Rocket"; //if the firework is a rocket
      var begin = f.getAttribute('begin'); //starting time
      var col = f.getAttribute('colour'); //the colour of the firework
      var dur = f.getAttribute('duration'); //lifespan

      var pos = new Array(); // the starting position of the firework
      pos[0] = f.getElementsByTagName("Position")[0].getAttribute('x');
      pos[1] = f.getElementsByTagName("Position")[0].getAttribute('y');
     
     var vel = new Array(); // the speed of the firework
      if (isRocket){
        vel[0] = f.getElementsByTagName("Velocity")[0].getAttribute('x');
        vel[1] = f.getElementsByTagName("Velocity")[0].getAttribute('y');
      }
      else
        vel = [0,0];

      fireworks[n] = new Firework (isRocket,begin,col,dur,pos,vel);
    }
  }

//
//CANVAS FUNCTIONS BELOW
//

function clearCanvas(){ //turns the canvas black
  canvas.beginPath();
  canvas.rect(0, 0, width, height);
  canvas.fillStyle = frames[frameCount].backgroundColor;
  canvas.fill();
}

function drawLights (x, y, margin, blockSize, blockNr, hex){ // spawns a cluster of matrixes of 9 pixels
  var randX, randY;
  for (n = 0; n < blockNr; n++){
    randX = Math.random();
    randX = (randX*margin) - (margin/2); //a random number between -1/2 margin and 1/2 margin
    randY = Math.random();
    randY = (randY*margin) - (margin/2); //a random number between -1/2 margin and 1/2 margin
    drawGradient(x+randX,y+randY,blockSize,hex);
  }
}

function spawnParticles (x, y, margin, blockSize, blockNr, hex){ // spawns a rectangular cluster of matrixes of 9 pixels
  var rgb = hexToRgb(hex), //converts the color from hex to RGB
  randX, randY;
  for (n = 0; n < blockNr; n++){
    randX = Math.random();
    randX = (randX*margin) - (margin/2); //a random number between -1/2 margin and 1/2 margin
    randY = Math.random();
    randY = (randY*margin) - (margin/2); //a random number between -1/2 margin and 1/2 margin
    spawn9Pixels(blockSize,x+randX,y+randY,rgb[0],rgb[1],rgb[2]);
  }
}

function spawnParticlesCircle (x, y, radius, blockSize, blockNr, hex){ // spawns a circular cluster of matrixes of 9 pixels
  var rgb = hexToRgb(hex), //converts the color from hex to RGB
  randAngle, randRadius, randX, randY;
  for (n = 0; n < blockNr; n++){
    randAngle = Math.random()*Math.PI*2;
    randRadius = Math.random()*radius;
    randX = ((Math.cos(randAngle)*randRadius)+x)-(radius/2);
    randY = (Math.sin(randAngle)*randRadius)+y;
    spawn9Pixels(blockSize,x+randX,y+randY,rgb[0],rgb[1],rgb[2]);
  }
}

function hexToRgb(hex) { //converts hexadecimal to RGB using right shifts
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255; 
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return [r,g,b];
}

function spawn9Pixels (u, x, y, r, g, b){//spawns a matrix of 9 pixels
  spawnPixel(getPixel(r,g,b), x+(u/2),y-(u/2),u,u); // position (1,1)
  spawnPixel(getPixel(r,g,b), x,y,u,u); // position (1,2)
  spawnPixel(getPixel(r,g,b), x-(u/2),y+(u/2),u,u); //position (1,3)
  spawnPixel(getPixel(r,g,b), x+u,y,u,u); // position (2,1)
  spawnPixel(getPixel(r,g,b), x+(u/2),y+(u/2),u,u); //position (2,2)
  spawnPixel(getPixel(r,g,b), x,y+u,u,u); // position (2,3)
  spawnPixel(getPixel(r,g,b), x+u+(u/2),y+(u/2),u,u); // position (3,1)
  spawnPixel(getPixel(r,g,b), x+u,y+u,u,u); // position (3,2)
  spawnPixel(getPixel(r,g,b), x+(u/2),y+u+(u/2),u,u); // position (3,3)
}

function drawGradient(posX,posY,size,color){//draws a colored gradient
  var rgb = hexToRgb(color); //converts hexadecimal to RGB
  posX = ((width/2) +posX); //the element is centered horizontally
  posY = (height - posY); // the element is positioned bottom-up vertically
  var grd = canvas.createRadialGradient(posX, posY, 1, posX, posY, size/2);
  grd.addColorStop(0, 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',1)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  canvas.fillStyle = grd;
  canvas.fillRect(0, 0, width, height);
}

function spawnPixel(img, posX, posY, sizeX, sizeY) {//draws an instance of an image
    posX = ((width/2) +posX)-(sizeX/2); //the element is centered horizontally
    posY = (height - posY)-sizeY; // the element is positioned bottom-up vertically
    canvas.drawImage(img,posX,posY,sizeX,sizeY);
}

function getPixel(r,g,b){//returns a random red blue or green sprite based on the RGB probability 
  var rand = Math.random(); //a random number between 1 and 0
  rand *= (r+g+b); // a random number between 0 and the sum of all color values
  if (rand < r)
    return redPixel;
  if (rand >= r && rand < r+g)
    return greenPixel;
  if (rand >= r+g)
    return bluePixel;
}