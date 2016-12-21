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
    this.type = p;
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

//converts hexadecimal to RGB using right shifts
function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255; 
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return [r,g,b];
}

//
// XML FUNCTIONS BELOW
//

// reads the XML, saves it as a firework array, calls "setFrames()" and "engine functions"
function readXML(filename){

  var XMLHttpR = new XMLHttpRequest();
  XMLHttpR.open('GET', filename, true);
  XMLHttpR.responseType = 'document';
  XMLHttpR.overrideMimeType('text/xml');

  XMLHttpR.onload = function () {
    if (XMLHttpR.readyState == 4 && XMLHttpR.status == 200) {
      //error messages
      if (XMLHttpR.responseXML == null){
        console.log("ERROR: responseXML is null");
        return;
      }
      var xmlFireworks = XMLHttpR.responseXML.getElementsByTagName("Firework"); 
      if (xmlFireworks == null){
        console.log("ERROR: XML contains no Fireworks");
        return;
      }

      fireworkList = new Array(), //an array which contains the info of all fireworks in the XML
      canvasTime = 0; //the total duration of the animation
      for (n = 0; n < xmlFireworks.length; n++){
          var f = xmlFireworks[n],
          isRocket = (f.getAttribute('type')) == "Rocket", //can be expanded upon & changed to non-boolean if firework types are > 2
          begin = f.getAttribute('begin'),
          colour = f.getAttribute('colour'),
          duration = f.getAttribute('duration');

          if (begin + duration > canvasTime)
            canvasTime = (begin * 1) + (duration * 1);

          var pos = new Array(); // the starting position of the firework
          pos[0] = f.getElementsByTagName("Position")[0].getAttribute('x'),
          pos[1] = f.getElementsByTagName("Position")[0].getAttribute('y');
         
         var vel = new Array(); // the speed of the firework
          if (isRocket){
            vel[0] = f.getElementsByTagName("Velocity")[0].getAttribute('x'),
            vel[1] = f.getElementsByTagName("Velocity")[0].getAttribute('y');
          }
          else
            vel = [0,0];
          fireworkList[n] = new Firework (isRocket,begin,colour,duration,pos,vel);
        }

      //global variables
      totalTime = (canvasTime/1000) + 5;// note: adds a 5s delay before looping
      fireworks = fireworkList;
      console.log("animation time: "+ totalTime);

      frames = setFrames();
      setInterval(engine, period*1000);
    }
    else
      console.log("ERROR: XMLHttpRequest unsucessful"); 
  };

  XMLHttpR.send(null);
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
    var type = projectiles[i].type, 
    x = projectiles[i].pos[0], y = projectiles[i].pos[1], //the coordinates of the projectile
    size = projectiles[i].size, 
    colour = projectiles[i].colour;
    
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
  timer += period;
  frameCount++;

  //loops the animation
  if (timer > totalTime){
    frameCount = 0;
    timer = 0;
  }
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
    cosmetics = [20, 300, 15, 5, 10.5, 2.33, 14]; //hardcoded proportions for cosmetic purposes only
    
    //when explodes
    if (presentTime >= explosionTime){ 
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
  var cosmetics = [15, 2.25, 0.375]; //hardcoded proportions for cosmetic purposes only
  spawnParticles(x, y, size*cosmetics[0], size*cosmetics[1], size*cosmetics[2], colour);
}

//draws "fountainlike"-type projectiles on the canvas
function fireworkC(x, y, size, presentTime, lifespan, explosionTime, colour){
  var cosmetics = [20, 2, 3, 4, 5]; //hardcoded proportions for cosmetic purposes only
  if (presentTime <= lifespan){

    //first explosion 
    if (presentTime <= explosionTime)
        spawnParticlesCircle(x, y, cosmetics[0], cosmetics[1], cosmetics[4], colour);

    //second explosion
    if (presentTime >= explosionTime && presentTime <= explosionTime*2)
       spawnParticlesCircle(x, y, cosmetics[0]*3, cosmetics[3], cosmetics[4]*2, colour);

    //third explosion
    if (presentTime >= explosionTime*2 && presentTime <= explosionTime*3)
       spawnParticlesCircle(x, y, cosmetics[0]*9, cosmetics[2], cosmetics[4]*4, colour);

    //normal state
    if(presentTime >= explosionTime*3)
      spawnParticlesCircle(x, y, cosmetics[0]*9, cosmetics[3], cosmetics[4], colour);
      spawnParticlesCircle(x, y, cosmetics[0]*9, cosmetics[2], cosmetics[4], colour);
      spawnParticlesCircle(x, y, cosmetics[0]*9, cosmetics[1], cosmetics[4]*2, colour);
  }
  else{
    console.log("ERROR:" + colour + " Firework type C - lifespan miscalculated");
  }
}

// PARTICLES

//spawns a cluster of colored gradients
function drawLights (x, y, margin, blockSize, blockNr, hex){
  var randX, randY;
  for (n = 0; n < blockNr; n++){
    randX = Math.random();
    randX = (randX*margin) - (margin/2); //a random number between -1/2 margin and 1/2 margin
    randY = Math.random();
    randY = (randY*margin) - (margin/2); //a random number between -1/2 margin and 1/2 margin
    drawGradient(x+randX,y+randY,blockSize,hex);
  }
}

//draws a colored gradient
function drawGradient(posX, posY, size, color){
  var rgb = hexToRgb(color); //converts hexadecimal to RGB
  posX = ((width/2) +posX); //the element is centered horizontally
  posY = (height - posY); // the element is positioned bottom-up vertically
  var grd = canvas.createRadialGradient(posX, posY, 1, posX, posY, size/2);
  grd.addColorStop(0, 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',1)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  canvas.fillStyle = grd;
  canvas.fillRect(0, 0, width, height);
}

//spawns a rectangular cluster of matrixes of 9 pixels
function spawnParticles (x, y, margin, blockSize, blockNr, hex){
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

//spawns a circular cluster of matrixes of 9 pixels
function spawnParticlesCircle (x, y, radius, blockSize, blockNr, hex){
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

//spawns a matrix of 9 pixels
function spawn9Pixels (u, x, y, r, g, b){
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

//draws an instance of an image
function spawnPixel(img, posX, posY, sizeX, sizeY) {
    posX = ((width/2) +posX)-(sizeX/2); //the element is centered horizontally
    posY = (height - posY)-sizeY; // the element is positioned bottom-up vertically
    canvas.drawImage(img,posX,posY,sizeX,sizeY);
}

//returns a random red blue or green sprite based on the RGB probability 
function getPixel(r,g,b){
  var rand = Math.random();
  rand *= (r+g+b); 
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

  //this GFX solution sets every frame beforehand
  //the function returns the state of every frame (to later be rendered on a HTML5 canvas)

  var frameStates = new Array(),  explosions = new Array(),  totalFrames = parseInt(totalTime / period),
  cosmetics = [2, 1.5, 0.59, 0.77, 0.33, 0.4, 10, 30];//hardcoded movement proportions for cosmetic purposes only

  var trailDelay = 0.5, subExplosionMin = 10, subExplosionMax = 22;

  //initializes the frames array: 0 projectiles & black background
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
      var start = (fireworks[n].begin) / 1000,
      lifespan = (fireworks[n].duration) / 1000,
      magn = time - start, // the lifetime of the projectile / the magnitude travelled by the projectile
      end = start + lifespan, //the time at which the projectile ends
      isRocket = fireworks[n].rocket,
      colour = fireworks[n].colour;
      size = isRocket? 1.7 : 0.8, // projectile proportions for both firework types (hardcoded)
      explosionTime = isRocket? 0.2 : 0.25; // explosion time for both firework types (hardcoded)

      //checks when the firework should be on canvas
      if (time >= start && time <= end){

        //the x coordinate of the projectile
        var x = (1 * fireworks[n].position[0]) + ((fireworks[n].velocity[0]) * magn),

        //the y coordinate of the projectile
        //note: vertical coordinates are converted to a framework in which y = 0 is the bottom of the canvas
        y = ((1 * fireworks[n].position[1]) + (height/2) ) + ((fireworks[n].velocity[1]) * magn),

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

        //flame projectiles
        if (!isRocket && !explosions[n]){
          explosions[n] = true;

          var flameFrames = parseInt((lifespan * 0.9) / (period)); //the number of frames a flame projectile lasts
          //note: flames end 10% earlier before the rest the fountain particles

          for (k1 = 0; k1 < 10; k1++){
            var ampl = 1/5; //the amplitude of the flames as a fraction of Pi radians (hardcoded)
            angle = Math.random() * Math.PI * (ampl) + Math.PI*(1-(ampl))/2,

            //the direction and distance (in pixels) between flame particles
            sx = Math.cos(angle) * cosmetics[6] * size,
            sy = Math.sin(angle) * cosmetics[6] * size;

            //draws flame projectiles in every frame of the fountain lifespan
            for (k2 = 0; k2 < flameFrames; k2++){
              var flameSize = parseInt((0.5 + (Math.random() * 0.5)) * cosmetics[7] * size); //the number of particles of a flame projectile
              for (k3 = 0; k3 < flameSize; k3++){

              //the distance between the projectile and the firework
              var tx = sx * k3, 
              ty = sy * k3;
                  
              p = new Projectile("flame", x+tx, y+ty, size, colour, 0, 0, 0);
              frameStates[i+(k2)].projectiles.push(p);
              }
            }
          }       
        }

        //trail, subexplosions & falling projectiles
        if (isRocket){

          var trailLength = parseInt(trailDelay / period);//number of frames for trail
          for (t = 1; t <= trailLength; t++){
            p = new Projectile("trail", x, y, size, colour, 0, 0, 0);

            //draws a trail for the main rocket projectile
            frameStates[i+t].projectiles.push(p);
          }

          if (time >= end - explosionTime && !explosions[n]){
                explosions[n] = true;
                frameStates[i].backgroundColor = "white"; //sets the canvas background to white when rocket explodes

                var vMagn = Math.sqrt( Math.pow(fireworks[n].velocity[0], 2) + Math.pow(fireworks[n].velocity[1], 2) ), // magnitude of rocket velocity
                subExplosionNR = parseInt( lerp(subExplosionMin, subExplosionMax, Math.random()) ), //random number of subexplosions
                subExplosionLength = parseInt(trailLength * cosmetics[0]); // frames of subexplosion trail

                //subexplosion projectiles and their trails
                for (k1 = 0; k1 < subExplosionNR; k1++){
                    var angle = Math.PI*Math.random()*2, // note: subexplsion projectile direction is random in 360º
                    
                    //subexplosion projectiles speed
                    sx = Math.cos(angle)*vMagn*period*cosmetics[1], 
                    sy = Math.sin(angle)*vMagn*period*cosmetics[1];              
                    for (k2 = 1; k2 <= subExplosionLength; k2++){

                      //the distance between the projectile and the explosion
                      var tx = sx * k2, 
                      ty = sy * k2;

                      //subexplosions
                      p = new Projectile(type,  x+tx, y+ty, size*cosmetics[2], colour, 0, 1, 0); 
                      frameStates[i+k2].projectiles.push(p);

                      //subexplosion trail
                      p = new Projectile("trail",  x+tx, y+ty, size*cosmetics[2], colour, 0, 1, 0); 
                      for (k3 = 1; k3 <= parseInt(trailLength * cosmetics[4]); k3++)
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

                    //falling subprojectlies speed
                    sx = Math.cos(angle) * vMagn * period * cosmetics[4], 
                    sy = Math.sin(angle) * vMagn * period * cosmetics[4];                    
                    for (k2 = 1; k2 <= subExplosionLength; k2++){

                      //the distance between the projectile and the explosion
                      var tx = sx * k2,
                      ty = sy * k2;
                      p = new Projectile(type,  x+tx, y+ty, size*cosmetics[5], colour, 0, 1, 0);
                      frameStates[i+k2].projectiles.push(p);
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