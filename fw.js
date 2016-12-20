//
// OBJECTS BELOW
//

  //the firework object
  function Firework(t,b,c,d,p,v){
   this.rocket = t;
   this.begin = b;
   this.colour = c;
   this.duration = d;
   this.position = p;
   this.velocity = v;
  }

  //the projectile object
  function Projectile (p, x, y, s, c, t, tM, tE){
    this.type = p; // the projectile type
    //there's 4 types of projectiles:
    // "rocketlike"
    // "fountainlike"
    // "trail"
    // "flame"
    this.pos = [x, y]; //the coordinates of the projectile
    this.size = s; // the size of the projectile
    this.colour = c; // the color of the projectile
    this.time = t; // the state relative to the projectile lifespan
    this.lifespan = tM; // the projectile lifespan
    this.explosionTime = tE; //when the firework explodes
  }

  // the frame object
  function Frame (t, p, c){   
    this.time = t; //the timemark of the frame
    this.projectiles = p; //an array of projectiles to be drawn of the canvas
    this.backgroundColor = c; //the background color of the canvas
  }

//
// MISC UTILITIES BELOW
//

function lerp(a, b, t) {
  return (a + t * (b - a));
}

function hexToRgb(hex) { //converts hexadecimal to RGB using right shifts
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255; 
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return [r,g,b];
}

//
// XML FUNCTIONS BELOW
//

  // reads the XML and saves it as a firework array
  function ReadXML(filename){
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

// PROJECTILES

function engine(){ //is called every 'period' seconds
  updateClock(); 
  clearCanvas();

  var projectiles = frames[frameCount].projectiles; //all projectiles on the frame

  //converts projectiles on a frame into particles to be drawn on the canvas
  for (i = 0; i < projectiles.length; i++){
    var type = projectiles[i].type, //the type of the projectile
    x = projectiles[i].pos[0], //the x coordinate of the projectile
    y = projectiles[i].pos[1], //the y coordinate of the projectile
    size = projectiles[i].size, //the size of the projectile
    colour = projectiles[i].colour; //the color of the projectile
    
    if (type == "rocketlike")
      fireworkA (x, y, size, projectiles[i].time, projectiles[i].lifespan, projectiles[i].explosionTime,colour);

    if (type == "trail")
      fireworkB(x, y, size, colour);

    if (type == "fountainlike"){
      fireworkC (x, y, size, projectiles[i].time, projectiles[i].lifespan, projectiles[i].explosionTime,colour);
    }
    if (type == "flame")
      fireworkB(x, y, size, colour);
  }
}

function updateClock(){
  //console.log("frame: "+frameCount+ " / time: "+timer) //for debugging
  timer += period;
  frameCount++;
}

//sets the canvas color
function clearCanvas(){
  canvas.beginPath();
  canvas.rect(0, 0, width, height);
  canvas.fillStyle = frames[frameCount].backgroundColor;
  canvas.fill();
}

//draws "rocketlike"-type projectiles on the canvas
function fireworkA(x, y, size, presentTime, lifespan, explosion, colour){
  if (presentTime <= lifespan){
    var explosionTime = lifespan - explosion, // the time checkpoint at which the explosion sets off
    cosmetics = [20, 300, 15, 5, 10.5, 2.33, 14]; //hardcoded particle proportions for cosmetic purposes only
    if (presentTime >= explosionTime){ 
    //if exploded
      var lightgrowth = lerp(cosmetics[0]*size, cosmetics[1]*size, ((presentTime - explosionTime)/(lifespan - explosionTime))); 
      drawGradient(x, y, lightgrowth, colour); //draws light halo / gradient
      drawLights(x, y, lightgrowth, cosmetics[2], cosmetics[3], colour);//draws light flares
    }
    else
      spawnParticles(x, y, cosmetics[4]*size, cosmetics[5]*size, cosmetics[6]*size, colour);
  }
  else{
    console.log("ERROR:" + colour + " Firework type A - lifespan miscalculated");
  }
}

//draws "trail"-type and "flame"-type projectiles on the canvas
function fireworkB(x, y, size, colour){
  var cosmetics = [15, 2.25, 0.375]; //hardcoded particle proportions for cosmetic purposes only
  spawnParticles(x, y, size*cosmetics[0], size*cosmetics[1], size*cosmetics[2], colour);
}

//draws "fountainlike"-type projectiles on the canvas
function fireworkC(x, y, size, presentTime, lifespan, explosionTime, colour){ 
  if (presentTime <= lifespan){
    //first explosion 
    if (presentTime <= explosionTime)
        spawnParticlesCircle(x, y, 20,2,5, colour);
    //second explosion
    if (presentTime >= explosionTime && presentTime <= explosionTime*2)
       spawnParticlesCircle(x, y, 20*3,4,10, colour);
    //third explosion
    if (presentTime >= explosionTime*2 && presentTime <= explosionTime*3)
       spawnParticlesCircle(x, y, 20*9,3,20, colour);
    //normal state
    if(presentTime >= explosionTime*3)
      spawnParticlesCircle(x, y, 20*9,4,5, colour);
      spawnParticlesCircle(x, y, 20*9,3,5, colour);
      spawnParticlesCircle(x, y, 20*9,2,10, colour);
  }
  else{
    console.log("ERROR:" + colour + " Firework type C - lifespan miscalculated");
  }
}

// PARTICLES

function drawGradient(posX, posY, size, color){//draws a colored gradient
  var rgb = hexToRgb(color); //converts hexadecimal to RGB
  posX = ((width/2) +posX); //the element is centered horizontally
  posY = (height - posY); // the element is positioned bottom-up vertically
  var grd = canvas.createRadialGradient(posX, posY, 1, posX, posY, size/2);
  grd.addColorStop(0, 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',1)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  canvas.fillStyle = grd;
  canvas.fillRect(0, 0, width, height);
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
    randX = ((Math.cos(randAngle)*randRadius)+x);
    randY = (Math.sin(randAngle)*randRadius)+y;
    spawn9Pixels(blockSize,randX,randY,rgb[0],rgb[1],rgb[2]);
  }
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

//
//FIREWORKS MOVEMENT & PARTICLES MAIN FUNCTION BELOW
//

function setFrames(){ //this function generates all frame states

  //this solution for particle GFX generates every frame beforehand
  //the function returns a description of every frame, to later be rendered on a HTML5 canvas
  //this approach is a workaround to prevent slowdown

  var frameStates = new Array(),  explosions = new Array(),  totalFrames = parseInt(totalTime / period),
  cosmetics = [2, 1.5, 0.59, 0.77, 0.33, 0.4, 10, 30];//hardcoded movement proportions for cosmetic purposes only

  var trailDelay = 0.5, subExplosionMin = 10, subExplosionMax = 22;

  //initializes the frames array to 0 projectiles and to black background
  for (i = 0; i < totalFrames; i++){
    var projectiles = new Array ();
    frameStates[i] = new Frame(null, projectiles, "black");
  }

  //sets explosion count to 0
  for (n = 0; n < fireworks.length; n++)
    explosions[n] = false;

  //reads every frame
  for (i = 0; i < totalFrames; i++){
    time = i*period; //the timemark of the frame
    for (n = 0; n < fireworks.length; n++){//checks every firwork on the fireworks object

      //firework stats
      var start = (fireworks[n].begin) / 1000, //the time at which the projectile starts
      lifespan = (fireworks[n].duration) / 1000, //the lifespan of the projectile
      magn = time - start, // the lifetime of the projectile / the magnitude travelled by the projectile
      end = start + lifespan, //the time at which the projectile ends
      isRocket = fireworks[n].rocket,
      colour = fireworks[n].colour;
      size = isRocket? 1.7 : 0.8, // the proportions the projectile on the canvas is hardcoded to 1.7 for rockets and 1 for fountains
      explosionTime = isRocket? 0.2 : 0.25; // the explosion time is hardcoded to 0.2 for rockets and 0.25 for fountains

      //checks when the firework should be on canvas
      if (time >= start && time <= end){
        var x = (1 * fireworks[n].position[0]) + ((fireworks[n].velocity[0]) * magn), //the x coordinate of the projectile
        y = ((1 * fireworks[n].position[1]) + (height/2) ) + ((fireworks[n].velocity[1]) * magn), //the y coordinate of the projectile

        //a firework is a set of projectiles.
        //a projectile is a set of particles.

        //projectiles are sorted into 4 types:
        // - "rocketlike"
        // - "fountainlike"
        // - "trail"
        // - "flame"

        //there's 6 variants of projectiles:
        // - the main rocket of a 'rocket firework' ("rocketlike")
        // - the trail of the main rocket ("trail")
        // - the subexplosions of a 'rocket firework' ("rocketlike")
        // - the trail of the subexplosions ("trail")
        // - the falling subprojectiles ("rocketlike")
        // - the source of a 'fountain firework' ("fountainlike")
        // - the flames of a 'fountain firework' ("flame")

        type = isRocket? "rocketlike" : "fountainlike",
        p = new Projectile(type, x, y, size, colour, magn, lifespan, explosionTime);
        frameStates[i].projectiles.push(p); //add projectile to frame

        if (type == "rocketlike"){

          //draws a main trail for the rocket projectile
          var trailLength = parseInt(trailDelay / period);//number of frames for trail
          for (t = 1; t <= trailLength; t++){//sets rocket trail
            p = new Projectile("trail", x, y, size, colour, 0, 0, 0);
            frameStates[i+t].projectiles.push(p); //add projectile to later frames
          }

          if (time >= end - explosionTime && !explosions[n]){
                explosions[n] = true; //rocket has exploded
                frameStates[i].backgroundColor = "white"; //sets the canvas background to white in this frame

                var vMagn = Math.sqrt( Math.pow(fireworks[n].velocity[0], 2) + Math.pow(fireworks[n].velocity[1], 2) ), // magnitude of rocket velocity
                subExplosionNR = parseInt(lerp(subExplosionMin,subExplosionMax,Math.random())); //random number of subexplosions after the rocket explodes

                var subExplosionLength = trailLength*cosmetics[0];//subexplosion variables

                //subexplosion projectiles and their trails
                for (k1 = 0; k1 < subExplosionNR; k1++){
                    var angle = Math.PI*Math.random()*2, // subexplsion projectile direction is random in 360º
                    sx = Math.cos(angle)*vMagn*period*cosmetics[1], //subexplosion projectiles horizontal speed
                    sy = Math.sin(angle)*vMagn*period*cosmetics[1]; //subexplosion projectlies vertical speed
                    
                    for (k2 = 1; k2 <= subExplosionLength; k2++){
                      var tx = sx * k2, //the horizontal distance between the projectile and the explosion
                      ty = sy * k2; //the horizontal distance between the projectile and the explosion

                      //subexplosions
                      p = new Projectile(type,  x+tx, y+ty, size*cosmetics[2], colour, 0, 1, 0); 
                      frameStates[i+k2].projectiles.push(p);

                      //subexplosion trail
                      p = new Projectile("trail",  x+tx, y+ty, size*cosmetics[2], colour, 0, 1, 0); 
                      for (k3 = 1; k3 <= trailLength/3; k3++)
                        frameStates[i+k2+k3].projectiles.push(p);

                      //cosmetic trail ray
                      p = new Projectile("trail",  x+tx, y+ty, size*cosmetics[3], colour, 0, 1, 0); 
                      frameStates[i+1].projectiles.push(p);       
                    }
                }

                //falling projectiles
                subExplosionNR = parseInt(lerp(subExplosionMin,subExplosionMax,Math.random())); //random number falling subprojectiles
                for (k1 = 0; k1 < subExplosionNR; k1++){
                    angle = -Math.PI*Math.random(), // falling subprojectiles only go downwards (180º to 360º)
                    sx = Math.cos(angle) * vMagn * period * cosmetics[4], //falling subprojectlies vertical speed
                    sy = Math.sin(angle) * vMagn * period * cosmetics[4]; //falling subprojectlies vertical speed
                    
                    for (k2 = 1; k2 <= subExplosionLength; k2++){
                      var tx = sx * k2, //the horizontal distance between the projectile and the explosion
                      ty = sy * k2; //the horizontal distance between the projectile and the explosion

                      p = new Projectile(type,  x+tx, y+ty, size*cosmetics[5], colour, 0, 1, 0);
                      frameStates[i+k2].projectiles.push(p);
                    }
                }        
          }
        }
        if (type == "fountainlike" && !explosions[n]){
            explosions[n] = true;

            //flame projectiles
            var flameFrames = parseInt(lifespan / (period)); //the number of frames a flame projectile lasts
            for (k1 = 0; k1 < 10; k1++){
              var Ampl = 1/5; //the amplitude of the flames as a fraction of Pi radians (hardcoded)
              angle = Math.random() * Math.PI * (Ampl) + Math.PI*(1-(Ampl))/2,
              sx = Math.cos(angle) * cosmetics[6] * size, //the horizontal direction and distance (in pixels) between flame particles
              sy = Math.sin(angle) * cosmetics[6] * size; //the vertical direction and distance (in pixels) between flame particles

              //draws flame projectiles in every frame of the fountain lifespan
              for (k2 = 0; k2 < flameFrames; k2++){
                var flameSize = parseInt((0.5 + (Math.random() * 0.5)) * cosmetics[7] * size); //the number of particles of a flame projectile
                for (k3 = 0; k3 < flameSize; k3++){
                  var tx = sx * k3, //the horizontal distance between the projectile and the firework
                  ty = sy * k3; //the vertical distance between the projectile and the firework
                  p = new Projectile("flame", x+tx, y+ty, size, colour, 0, 0, 0);
                  frameStates[i+(k2)].projectiles.push(p);
                }
              }
            }       
        }
      }
    }
    frameStates[i].time = time;
  }
  return frameStates;
}