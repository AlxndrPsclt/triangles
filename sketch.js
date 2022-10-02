function setup() {

  BACKGROUND_FADE = '0.2';
  ENERGY = 5;

  frame=0;
  MAX_FRAME=2000;

  P5_SAVE_FRAMES_HIDE_UI=true

  // Library setup
  createCanvas( window.screen.width * window.devicePixelRatio, window.screen.height* window.devicePixelRatio);
  noCursor();
  frameRate(25);
  colorMode(HSB);

  // Global image setup
  WIDTH = window.screen.width * window.devicePixelRatio;
  HEIGHT = window.screen.height * window.devicePixelRatio;
  CENTER_X = WIDTH / 2;
  CENTER_Y = HEIGHT / 2;

  NUMBER_OF_TRIANGLES = 10;
  DISPLACEMENT = 4;

  // Default config; can be overrided later by a named, or custom config
  refreshColor = `rgba(10,20,40,0.1)`;

  background(refreshColor);

  triangles=[];
  for (let i = 0, len = NUMBER_OF_TRIANGLES; i < len; i++) {
    triangles.push(createTriangle());
  }

  stars=[];
}

function p(x,y,radius=0,free=true) {
  return {
    x: x + randval(radius),
    y: y + randval(radius),
    free: free,
  }
}

function t(p1,p2,p3) {
  A=distance(p1,p2);
  B=distance(p2,p3);
  C=distance(p3,p1);
  eq=equilateralityCoeficient({A,B,C});
  return {
    p1: p1,
    p2: p2,
    p3: p3,
    A: A,
    B: B,
    C: C,
    eq: eq
  };
}

function createTriangle(maxsize=500, minsize=100) {
  p1 = p(int(random(maxsize, WIDTH - maxsize)), int(random(maxsize, height - maxsize)), 0, false);
  p2 = p(p1.x, p1.y, maxsize, false);
  p3 = p(p2.x, p2.y, maxsize, false);
  return t(p1, p2, p3);
}

function distance(p1, p2) {
  return Math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2);
}

function randval(energy) {
  return int(random(-energy-0.5, energy+0.5));
}

function movePoint(point, energy) {
  newPoint = p(point.x + randval(energy), point.y + randval(energy), 0, point.free);
  return newPoint;
}

function moveTriangle(tri, energy) {
  newP1= movePoint(tri.p1, energy);
  newP2= movePoint(tri.p2, energy);
  newP3= movePoint(tri.p3, energy);

  return t(newP1, newP2, newP3);
}

function equilateralityCoeficient(tri) {
  ratioP = tri.A + tri.B + tri.C;
  s = ratioP/2;
  e = ratioP/3;
  return Math.sqrt((s-tri.A)*(s-tri.B)*(s-tri.C)/(s-e)**3)
}

function calculateDistancesWithIndex(idx, star1, star2) {
  return { 'starId': idx, 'dst': distance(star1, star2) }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function draw() {

  frame+=1;
  if (frame <MAX_FRAME) {

    // strokeColor = `rgba(${cellHue},${cellSaturation},${cellBrightness},${BACKGROUND_FADE})`;
    background(refreshColor);
    strokeColor = `rgba(40,80,160,${BACKGROUND_FADE})`;
    stroke(strokeColor);
    fill(`rgba(10,20,40,${BACKGROUND_FADE})`);
    strokeWeight(4);

    trianglesToRemoveIndexes=[];

    triangles.forEach( (tri, index) => {
  //        console.log(tri);

      if (tri.eq < 0.99) {
        triangle(tri.p1.x, tri.p1.y, tri.p2.x, tri.p2.y, tri.p3.x, tri.p3.y);

        c1 = moveTriangle(tri, ENERGY);
        c2 = moveTriangle(tri, ENERGY);

        triangles[index] = (c1.eq > c2.eq) ? c1 : c2;
      } else {
        tri.p1.free = true;
        stars.push(tri.p1);
        tri.p2.free = true;
        stars.push(tri.p2);
        tri.p3.free = true;
        stars.push(tri.p3);
        trianglesToRemoveIndexes.push(index);
      }
    });

    trianglesToRemoveIndexes.reverse()
    trianglesToRemoveIndexes.forEach(indexToRemove => {
      triangles.splice(indexToRemove, 1);
    });

    console.log(stars.length);
    if (stars.length > 50) {
      frame=6000;
    }

    for (let index = 0, len = stars.length; index < len; index++) {
      star = stars[index];

      if (star.free) {
        circle(star.x, star.y, 5);

        voisins=stars.filter(elt => elt.free).map((otherStar, idx) => calculateDistancesWithIndex(idx, star, otherStar)).filter(x => (x.dst>5*ENERGY && x.dst < 110));

        if (voisins.length >=2) {
          shuffleArray(voisins)
          console.log(stars);
          console.log(index);
          console.log(star);
          console.log(voisins);
          newTri = t(star, stars[voisins[0].starId], stars[voisins[1].starId]);
          if (newTri.eq < 0.6) {
            triangles.push(newTri);
            stars[voisins[0].starId].free=false;
            stars[voisins[1].starId].free=false;
            stars[index].free = false;
            console.log(stars)
          }
        } else {
          movedStar = movePoint(star, ENERGY);
          stars[index] = movedStar;
        }
      }
    }
    stars = stars.filter(x => x.free);
  }
}