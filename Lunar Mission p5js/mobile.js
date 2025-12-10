// ==========================================
// 1. VARIABEL GLOBAL (Di p5.js pakai 'let')
// ==========================================
let moon = []; 
let landingX = 0; 
let ship; 
// --- GAMBAR BINTANG BARU ---
let imgStarItem, imgStarGold, imgStarGray;

let shipX, shipY; // Posisi dinamis
let angle = 0.0;
let vX = 0.0; 
let vY = 0.0; 

// --- SCALE RATIO (RAHASIA FULL SCREEN) ---
let s = 1.0; // Faktor pengali ukuran

// Fisika & Level
let gravity = 0.005; 
let fuelRate = 0.1;  
let maxFuel = 100.0; 
let fuel = maxFuel;      

// Status Game & Skor
let gameMode = 0; 
let loadingStartTime = 0;      
let loadingDuration = 3000;    
let pendingLevelConfig = 0;    
let rocketLoadingY = 0;
let finalStarRating = 0; 
let ratingText = "";  

// Input
let keyLeft = false;
let keyRight = false;
let keyUp = false;

// Audio (SoundFile di p5.sound)
let sfxGas;
let sfxLedakan;
let sfxMenang;
let bgmMenu;
let sfxPoint; 
let lastPointSoundTime = 0;

// Obstacle Planet
let numPlanets = 4; 
let activePlanets = 0; 
let planetX = [];
let planetY = [];
let planetSize = []; 
let planets = []; 
let planetFiles = ["Venus.png", "Saturnus.png", "Mercury.png", "Earth.png"];

// Bintang Poin
let maxStars = 0; 
let starItemX = [];
let starItemY = [];
let starActive = []; 
let starsCollected = 0; 

// Visual Background
let numBgStars = 150;
let bgStarX = [];
let bgStarY = [];

// ==========================================
// KHUSUS P5.JS: PRELOAD ASSETS
// (Aset dimuat di sini agar siap sebelum setup)
// ==========================================
function preload() {
  // Load Gambar
  imgStarItem = loadImage("star_item.png");
  imgStarGold = loadImage("star_gold.png");
  imgStarGray = loadImage("star_gray.png");
  ship = loadImage("ship.png");
  
  for (let i = 0; i < numPlanets; i++) {
    planets[i] = loadImage(planetFiles[i]);
  }

  // Load Audio
  soundFormats('mp3'); // Pastikan formatnya mp3
  sfxGas = loadSound("gas.mp3");
  sfxLedakan = loadSound("ledakan.mp3");
  sfxMenang = loadSound("menang.mp3");
  bgmMenu = loadSound("bgm.mp3");
  sfxPoint = loadSound("point.mp3");
}
// ==========================================
// 2. SETUP
// ==========================================
// ==========================================
// 2. SETUP (REVISI: TAJAM & SKALA PINTAR)
// ==========================================
function setup() {
  // Pengganti fullScreen() di p5.js:
  createCanvas(windowWidth, windowHeight); 
  
  // --- [SOLUSI 1: BAGIAN INI SAYA HAPUS/MATIKAN] ---
  // pixelDensity(1);  <-- Baris ini biang kerok yang bikin burem di Mac/HP
  // Sekarang p5.js akan otomatis pakai resolusi tajam (Retina Display).
  // --------------------------------------------------
  
  imageMode(CENTER); 
  textAlign(CENTER, CENTER); 
  
  // --- [SOLUSI TAMBAHAN: SKALA RESPONSIF] ---
  // Kita pakai rumus 'min' supaya tombol tidak raksasa di HP Portrait
  s = min(windowWidth / 800.0, windowHeight / 600.0);
  console.log("Scale Factor: " + s); 
  
  // --- RESIZE GAMBAR ---
  if (imgStarItem) imgStarItem.resize(int(35 * s), 0); 
  if (ship) ship.resize(int(60 * s), 0); 
  
  // 1. Hiasan Bintang Background
  for (let i = 0; i < numBgStars; i++) {
    bgStarX[i] = random(width);
    bgStarY[i] = random(height);
  } 
  
  // 2. Audio Setup
  if (bgmMenu) {
    bgmMenu.loop(); 
  }

  // 5. Default Level
  gravity = 0.005 * s; 
  fuelRate = 0.05;
  maxStars = 3; 
  activePlanets = 1; 
}

// --- TAMBAHAN KHUSUS P5.JS ---
// Supaya kalau ukuran browser diubah, canvas game ikut berubah
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  s = height / 600.0; // Hitung ulang skala jika layar berubah
}

// ==========================================
// 3. DRAW LOOP
// ==========================================
// ==========================================
// 3. DRAW LOOP (LENGKAP: BINTANG + GAME + KONTROL)
// ==========================================
function draw() {
  background(0); // Layar Hitam
  
  // --- 1. MENGGAMBAR BINTANG BACKGROUND (YANG HILANG TADI) ---
  // Kita set warna putih dulu
  if (gameMode == 4) { stroke(255); strokeWeight(random(1,3)); } 
  else { stroke(255); strokeWeight(2); }
  
  for (let i = 0; i < numBgStars; i++) {
      // Efek Warp Speed saat loading
      if (gameMode == 4) bgStarY[i] += (10 * s); 
      
      // Gambar titik bintangnya
      point(bgStarX[i], bgStarY[i]);
      
      // Reset bintang kalau lewat bawah layar (biar muncul lagi di atas)
      if (bgStarY[i] > height) bgStarY[i] = 0; 
  }
  
  // --- 2. GRID / GARIS BANTU (Hanya kalau main game) ---
  if (gameMode != 4 && gameMode != 0) {
    stroke(50, 50, 100); strokeWeight(1);
    let gridSize = 40 * s;
    for (let i = 0; i < height/gridSize; i++) { line(0, i*gridSize, width, i*gridSize); }
    for (let i = 0; i < width/gridSize; i++) { line(i*gridSize, 0, i*gridSize, height); }
  }
  
  // --- 3. STATE MANAGER (PENGATUR HALAMAN) ---
  if (gameMode == 0) {
    drawMenu(); 
  } else if (gameMode == 4) {
    drawLoading(); 
  } else {
    // === GAMEPLAY ===
    drawPlanets();       
    drawMoon();          
    drawLandingZone();   
    drawCollectibles(); 
    
    if (ship) {
      if (gameMode == 1) updateShip(); 
      drawShip();         
      drawFuelBar();      
    }
    drawMessage();       
    
    // PANGGIL FUNGSI TOMBOL ANDROID DISINI
    drawMobileControls(); 
  }
}
// ==========================================
// 4. LOGIKA GERAK
// ==========================================
function updateShip() {
  vY += gravity; 
  if (keyLeft) angle -= 0.05; 
  if (keyRight) angle += 0.05; 
  
  if (keyUp && fuel > 0) { 
    // Dorongan disesuaikan skala biar kerasa responsif
    vX += sin(angle) * (0.04 * s); 
    vY -= cos(angle) * (0.04 * s);
    fuel -= fuelRate; 
    
    // Di p5.js, kita cek isPlaying() dulu agar suara tidak numpuk parah
    if (sfxGas && !sfxGas.isPlaying()) sfxGas.play();
  }
  
  shipX += vX;
  shipY += vY;
  
  checkCollisions(); 
}

// ==========================================
// 5. LOGIKA TABRAKAN & SKOR (REVISI: SKOR KETAT ⭐️)
// ==========================================
function checkCollisions() {
  
  // A. AMBIL BINTANG
  for (let i = 0; i < maxStars; i++) {
    if (starActive[i] && dist(shipX, shipY, starItemX[i], starItemY[i]) < (40 * s)) { 
      starActive[i] = false; 
      starsCollected++;        
      if (millis() - lastPointSoundTime > 150) {
          if (sfxPoint) sfxPoint.play();
          lastPointSoundTime = millis(); 
      }
    }
  }
  
  // B. TABRAK PLANET
  for (let i = 0; i < numPlanets; i++) {
    if (planetX[i] < 0) continue; 
    if (dist(shipX, shipY, planetX[i], planetY[i]) < (planetSize[i]/2 - (5*s))) { 
      crashRocket(); return;
    }
  }

  // --- LOGIKA PENDARATAN ---
  let safeZoneW = 70 * s; 
  let distanceToPad = abs(shipX - landingX); 
  let padSurfaceY = height - (50 * s);

  // 1. Cek Posisi Horizontal (Harus di atas Pad)
  if (distanceToPad < safeZoneW) {
      
      // 2. Cek Ketinggian (Kaki nyentuh pad)
      if (shipY > height - (80 * s)) { 
          
          let speedOK = vY < (6.0 * s); 
          let angleOK = abs(angle) < 1.0; 
          
          if (speedOK && angleOK) {
            // --- [PERBAIKAN RUMUS SKOR] ---
            
            // 1. Skor Bintang (Bobot 60%) - Paling Penting!
            // Kalau tidak ambil bintang, skor maksimal cuma 40.
            let collectionRatio = (maxStars > 0) ? starsCollected / maxStars : 0;
            let starScore = collectionRatio * 60.0; 

            // 2. Skor Bensin (Bobot 20%)
            let fuelScore = (fuel / maxFuel) * 20.0;

            // 3. Skor Landing (Bobot 20%)
            // Kalau mendarat kasar (di atas 2.0), cuma dapat 5 poin.
            let landingScore = 0;
            if (vY < (2.0 * s)) landingScore = 20; // Mulus banget
            else landingScore = 5;                 // Agak kasar
            
            let totalScore = starScore + fuelScore + landingScore;
            
            // --- PENENTUAN RATING ---
            if (totalScore >= 90) { 
                finalStarRating = 5; 
                ratingText = "SEMPURNA! (Calon Astronaut)"; 
            }
            else if (totalScore >= 75) { 
                finalStarRating = 4; 
                ratingText = "MANTAP! (Jago Juga)"; 
            }
            else if (totalScore >= 50) { 
                finalStarRating = 3; 
                ratingText = "LUMAYAN (Cari Bintang Lagi Dong)"; 
            }
            else if (totalScore >= 30) { 
                finalStarRating = 2; 
                ratingText = "KURANG (Bintangnya Mana?)"; 
            }
            else { 
                finalStarRating = 1; 
                ratingText = "MENDARAT AJAIB (Beruntung Doang)"; 
            }
            
            // Tempelkan roket ke pad biar visualnya bagus
            shipY = padSurfaceY - (30 * s); 
            winGame(); 
            return;    
          } 
          // Kalau jatuh TERLALU CEPAT (> 8.0), meledak
          else if (vY > (8.0 * s)) {
             crashRocket(); return;
          }
          // Kalau kecepatan nanggung, tetap menang tapi skor landing kecil
          else {
             // Paksa hitung skor dengan penalti landing kasar
             let collectionRatio = (maxStars > 0) ? starsCollected / maxStars : 0;
             let totalScore = (collectionRatio * 60) + ((fuel / maxFuel) * 20) + 5; // Cuma dpt 5 poin landing
             
             // Copy logika rating di atas (versi singkat)
             if (totalScore >= 50) finalStarRating = 3; else finalStarRating = 1;
             ratingText = "MENDARAT KASAR! (Untung Slamet)";
             
             shipY = padSurfaceY - (30 * s);
             winGame(); return; 
          }
      }
      return; 
  }

  // C. TABRAK TANAH (Luar Pad)
  let index = int(shipX / (10 * s)); 
  if (index >= 0 && index < moon.length) {
      if (shipY > (height - (20*s) - moon[index])) {
        crashRocket();
      }
  } else {
      if (shipY > height || shipX < 0 || shipX > width) crashRocket();
  }
}
// ==========================================
// 6. GENERATE LEVEL (POSISI MENYESUAIKAN LAYAR)
// ==========================================
function generateLevel() {
  // A. Reset Tanah (Lebar ubin dikali s)
  let ubinSize = int(10 * s);
  
  // Hitung jumlah ubin yang dibutuhkan selebar layar
  let moonLength = int(width / ubinSize) + 1;
  moon = []; // Reset array moon
  
  for (let i = 0; i < moonLength; i++) { 
    moon[i] = int(random(15 * s)); 
  } 
  
  // Lokasi landing
  landingX = int(random(5, moon.length - 5)) * ubinSize;
  
  // Posisi Start Roket
  shipX = width * 0.5; 
  shipY = height * 0.15; 
  vX = 0; vY = 0; angle = 0; fuel = maxFuel;
  
  // B. Planet
  for (let i = 0; i < numPlanets; i++) {
    if (i >= activePlanets) { planetX[i] = -1000; continue; } 

    planetX[i] = random(width * 0.1, width * 0.9); 
    planetY[i] = random(height * 0.2, height * 0.6); 
    
    // Ukuran Planet diperbesar sesuai skala
    planetSize[i] = random(40 * s, 80 * s); 
    
    // Safety (Jangan muncul di dekat roket)
    if (dist(planetX[i], planetY[i], shipX, shipY) < (200 * s)) planetX[i] = -500; 
    
    // Resize gambar planet
    // (Note: Di p5.js resize mengubah gambar asli, tapi karena ukuran relatif tetap, aman)
    if (planets[i]) planets[i].resize(int(planetSize[i]), 0);
  }
  
  // ==========================================
  // C. BINTANG POIN (LOGIKA BARU: ANTI-NUMPUK)
  // ==========================================
  // Reset Array
  starItemX = [];
  starItemY = [];
  starActive = [];
  starsCollected = 0;
  
  for (let i = 0; i < maxStars; i++) {
    let posisiAman = false; 
    let percobaan = 0; 
    
    // Inisialisasi default agar tidak error jika loop gagal
    starItemX[i] = -100;
    starItemY[i] = -100;
    starActive[i] = false;

    // Coba cari posisi random sampai 100x percobaan
    while (!posisiAman && percobaan < 100) {
      let calonX = random(width * 0.1, width * 0.9);
      let calonY = random(height * 0.2, height * 0.7);
      let nabrak = false;
      
      // 1. Cek Tabrakan dengan Planet
      for (let p = 0; p < numPlanets; p++) {
        if (planetX[p] > 0) {
           if (dist(calonX, calonY, planetX[p], planetY[p]) < (planetSize[p]/2 + (60*s))) {
             nabrak = true; break; 
           }
        }
      }
      
      // 2. Cek Tabrakan dengan Bintang Lainnya
      if (!nabrak) {
          for (let j = 0; j < i; j++) { 
              if (dist(calonX, calonY, starItemX[j], starItemY[j]) < (80 * s)) {
                  nabrak = true; break; 
              }
          }
      }
      
      // Jika lolos semua cek
      if (!nabrak) { 
        starItemX[i] = calonX; starItemY[i] = calonY; 
        starActive[i] = true; posisiAman = true;
      }
      percobaan++;
    }
  }
}
// ==========================================
// 7. VISUAL & UI
// ==========================================
function drawCollectibles() {
  imageMode(CENTER); 
  
  for (let i = 0; i < maxStars; i++) {
    if (starActive[i]) {
      // Efek denyut (Pulse)
      let currentSize = (35 * s) + sin(frameCount * 0.1) * (5 * s); 
      
      if (imgStarItem) {
        image(imgStarItem, starItemX[i], starItemY[i], currentSize, currentSize);
      }
    }
  }
}

function drawPlanets() {
  for (let i = 0; i < numPlanets; i++) {
    if (planets[i] && planetX[i] > 0) image(planets[i], planetX[i], planetY[i]);
  }
}

function drawMoon() {
  stroke(0); fill(200, 200); 
  let ubinSize = 10 * s;
  
  beginShape(); vertex(0, height); 
  for (let i = 0; i < moon.length; i++) {
      // Pastikan moon[i] ada isinya biar ga error
      let hTanah = moon[i] ? moon[i] : 0;
      vertex(i * ubinSize, height - (20*s) - hTanah); 
  }
  vertex(width, height); endShape(CLOSE); 
}

function drawLandingZone() {
  let padW = 70 * s; 
  let padH = 15 * s;
  
  fill(255); rect(landingX - padW/2, height - (20*s) - 30*s, padW, padH);
  // Kaki Pad
  line(landingX - padW/2, height - (50*s), landingX - padW/3, height - (20*s));
  line(landingX + padW/2, height - (50*s), landingX + padW/3, height - (20*s));
}

function drawShip() {
  push();             // Simpan sistem koordinat saat ini
  translate(shipX, shipY); // Pindahkan titik pusat ke badan roket
  rotate(angle);      // Putar roket sesuai input keyboard
  if(ship) image(ship, 0, 0); // Gambar sprite roket
  pop();              // Kembalikan sistem koordinat normal
}

function drawFuelBar() {
  if (gameMode == 1) { 
    let barW = 150 * s;
    let barH = 15 * s;
    let pad = 20 * s;
    
    // 1. Gambar Bar Bensin
    stroke(0); noFill(); rect(pad, pad, barW, barH); 
    noStroke(); if (fuel < 30) fill(255, 0, 0); else fill(0, 255, 0); 
    rect(pad, pad, (fuel / maxFuel) * barW, barH);
    
    // UI Bintang
    let iconX = barW + (pad * 2.0); 
    let iconY = pad + (barH / 2);    
    let iconSize = 25 * s;           
    
    // A. Gambar Ikon Bintangnya
    if (imgStarItem) {
      imageMode(CENTER);
      image(imgStarItem, iconX, iconY, iconSize, iconSize);
    }
    
    // B. Tulis Angkanya
    fill(255, 255, 0); 
    textSize(18 * s); 
    textAlign(LEFT, CENTER);
    text(starsCollected + "/" + maxStars, iconX + (15 * s), iconY);
    
    // UI Speedometer (Kanan Atas)
    textAlign(RIGHT, CENTER); textSize(14 * s);
    if (vY < (2.5*s) && abs(angle) < 0.5) fill(0, 255, 0); else fill(255, 0, 0);
    
    // nf() di p5.js bekerja mirip processing
    text("Kec: " + nf(vY, 0, 1), width-pad, pad);
    text("Sudut: " + nf(degrees(angle), 0, 0)+"°", width-pad, pad + (20*s));
  }
}
// ==========================================
// UI MENU UTAMA (FIX AUDIO MOBILE 🔊)
// ==========================================
function drawMenu() {
  rectMode(CENTER); textAlign(CENTER, CENTER);
  noStroke(); 

  // --- CEK ORIENTASI LAYAR ---
  let isLandscape = width > height;
  let startY, rocketY, menuStartY, spacingScale;

  if (isLandscape) {
      startY = height * 0.15;       
      rocketY = height * 0.5;       
      menuStartY = height * 0.65;   
      spacingScale = 0.8;           
  } else {
      startY = height * 0.12; 
      rocketY = height * 0.48; 
      menuStartY = height * 0.68; 
      spacingScale = 1.0;
  }

  // --- 1. BLOK JUDUL ---
  textSize(45 * s * spacingScale); textStyle(BOLD);
  fill(0, 100, 200, 100); text("LUNAR MISSION", width/2 + (3*s), startY + (3*s)); 
  fill(0, 255, 255);      text("LUNAR MISSION", width/2, startY);
  
  let subTitleY = startY + (50 * s * spacingScale); 
  textSize(16 * s * spacingScale); textStyle(NORMAL); fill(150, 200, 255);
  text("PRESENTASI KELOMPOK 6", width/2, subTitleY);
  
  let memberY = subTitleY + (25 * s * spacingScale); 
  let memberGap = 18 * s * spacingScale; 
  textSize(14 * s * spacingScale); fill(200);
  text("Dimas Eka Maulana (2407411017)", width/2, memberY);
  text("Darwin Alesandro Kefaz (2407411006)", width/2, memberY + memberGap);
  text("Nabilla Puti Jasmien (2407411012)", width/2, memberY + (memberGap * 2));
  
  // --- 2. BLOK DEKORASI ROKET ---
  let floatOffset = sin(frameCount * 0.05) * (8 * s); 
  let rocketScale = isLandscape ? 0.7 : 1.0;

  push(); 
  translate(width/2, rocketY + floatOffset);
  fill(0, 0, 0, 100);
  ellipse(0, (50*s*rocketScale), (50*s*rocketScale), (10*s*rocketScale)); 
  if (ship) image(ship, 0, 0, 80*s*rocketScale, 80*s*rocketScale); 
  pop(); 
  
  // --- 3. BLOK TOMBOL MENU ---
  let buttonSpacing = 50 * s * spacingScale; 
  let titleGap = isLandscape ? 25*s : 40*s;
  fill(255, 255, 255, 200); textSize(18 * s * spacingScale); textStyle(BOLD);
  text("- PILIH TANTANGAN -", width/2, menuStartY - titleGap);
  
  function drawBtn(label, index, colorText) {
      let btnY = menuStartY + (index * buttonSpacing);
      let btnW = 320 * s * spacingScale; 
      let btnH = 35 * s * spacingScale;  
      
      let isTouched = false;
      if (mouseX > width/2 - btnW/2 && mouseX < width/2 + btnW/2 && 
          mouseY > btnY - btnH/2 && mouseY < btnY + btnH/2) isTouched = true;
      for (let i = 0; i < touches.length; i++) {
        if (touches[i].x > width/2 - btnW/2 && touches[i].x < width/2 + btnW/2 &&
            touches[i].y > btnY - btnH/2 && touches[i].y < btnY + btnH/2) isTouched = true;
      }

      noStroke(); 
      if (isTouched) fill(255, 255, 255, 40); 
      else fill(0, 0, 0, 100); 
      rect(width/2, btnY, btnW, btnH, 10); 

      textSize(20 * s * spacingScale); fill(colorText);
      text(label, width/2, btnY);

      if (isTouched && (mouseIsPressed || touches.length > 0)) {
         // --- [FIX AUDIO KHUSUS HP] ---
         // Ini perintah wajib: "Nyalakan Audio Engine saat user menyentuh layar"
         userStartAudio(); 
         // -----------------------------

         if (bgmMenu) bgmMenu.stop();
         pendingLevelConfig = index + 1; 
         loadingStartTime = millis();        
         gameMode = 4; 
         if (sfxGas) { sfxGas.play(); sfxGas.setVolume(0.5); }
         touches = [];
      }
  }

  drawBtn("[ 1 ]  PEMULA", 0, color(100, 255, 100));
  drawBtn("[ 2 ]  MAYAN SUSAH", 1, color(255, 255, 100));
  drawBtn("[ 3 ]  MUSTAHIL", 2, color(255, 100, 100));
  
  if (height > 350) {
      fill(120); textSize(12 * s * spacingScale); textStyle(NORMAL);
      text("Versi v1.0 | Kelompok 6", width/2, height - (15*s));
  }
}
// ==========================================
// UI HASIL (REVISI: HAPUS ROKET SAAT KALAH ❌🚀)
// ==========================================
function drawMessage() {
  // 1. CEGAH BOCOR
  if (gameMode == 1 && fuel > 0) return;

  rectMode(CENTER); textAlign(CENTER, CENTER);
  
  // --- SETUP VARIABEL ---
  let title = "";
  let subTitle = "";
  let hint = "[ Ketuk Layar Untuk Main Lagi ]";
  let boxColor = color(0);
  let titleColor = color(255);

  if (gameMode == 2) { // KALAH
    boxColor = color(50, 0, 0, 240); 
    title = "YAH, MELEDAK :(";
    subTitle = "Roketnya Jadi Rongsokan Deh...";
    titleColor = color(255, 80, 80);
  } 
  else if (gameMode == 3) { // MENANG
    boxColor = color(0, 30, 60, 250); 
    title = "MENDARAT MULUS!";
    subTitle = ratingText;
    titleColor = color(80, 255, 120);
  }
  else if (gameMode == 1 && fuel <= 0) { 
     fill(255, 50, 50); textSize(24 * s); 
     text("BENSIN HABIS!", width/2, 80 * s); 
     return; 
  }

  // --- MENGGAMBAR KOTAK ---
  let boxW = 550 * s;
  let boxH = 400 * s;
  let cX = width / 2;     
  let cY = height / 2;    

  noStroke(); fill(boxColor); 
  rect(cX, cY, boxW, boxH, 25); 

  // ==========================================
  // MENYUSUN ELEMEN TEKS
  // ==========================================
  
  // 1. JUDUL UTAMA
  fill(titleColor); textStyle(BOLD); textSize(38 * s); 
  text(title, cX, cY - (80 * s)); // Saya turunkan sedikit biar pas di tengah
  
  // 2. SUB-JUDUL
  fill(220); textStyle(NORMAL); textSize(20 * s);
  text(subTitle, cX, cY - (20 * s)); // Saya turunkan sedikit
  
  // 3. BINTANG RATING (Hanya Muncul Kalau MENANG)
  if (gameMode == 3) {
    let starSize = 55 * s;   
    let starGap = 15 * s;    
    let totalStarWidth = (5 * starSize) + (4 * starGap);
    
    let startStarX = cX - (totalStarWidth / 2) + (starSize / 2); 
    let starPosY = cY + (50 * s); 

    imageMode(CENTER);
    for (let i = 0; i < 5; i++) {
       let x = startStarX + (i * (starSize + starGap));
       if (i < finalStarRating) {
           if (imgStarGold) image(imgStarGold, x, starPosY, starSize, starSize);
       } else {
           if (imgStarGray) image(imgStarGray, x, starPosY, starSize, starSize);
       }
    }
  } 
  // [REVISI] Bagian "else if (gameMode == 2)" yang gambar roket SAYA HAPUS.
  // Jadi kalau kalah, area tengahnya kosong bersih.

  // 4. FOOTER (Hint Main Lagi)
  let pulse = 150 + sin(frameCount * 0.1) * 105; 
  fill(255, 255, 255, pulse); 
  textSize(16 * s); textStyle(NORMAL);
  text(hint, cX, cY + (130 * s));

  // --- LOGIKA TOMBOL RESTART ---
  if (gameMode == 2 || gameMode == 3) {
      if (touches.length > 0 || mouseIsPressed) {
          if (sfxMenang) sfxMenang.stop();    
          if (sfxLedakan) sfxLedakan.stop(); 
          
          gameMode = 0; // KEMBALI KE MENU
          if (bgmMenu) bgmMenu.loop();
          
          touches = []; 
      }
  }
}
// ==========================================
// 8. INPUT & STATUS GAME
// ==========================================

function startGame(config) {
   // Mengatur kesulitan
   if (config == 1) { gravity = 0.003 * s; fuelRate = 0.05; maxStars = 3; activePlanets=1; }
   else if (config == 2) { gravity = 0.005 * s; fuelRate = 0.1; maxStars = 5; activePlanets=2; }
   else if (config == 3) { gravity = 0.008 * s; fuelRate = 0.3; maxStars = 8; activePlanets=4; }
   
   generateLevel(); // Buat level baru
   gameMode = 1;    // Mulai Main
}

function crashRocket() {
  gameMode = 2; 
  if (sfxGas) sfxGas.stop();
  if (sfxLedakan) sfxLedakan.play();
}

function winGame() {
  gameMode = 3; 
  if (sfxGas) sfxGas.stop();
  if (sfxMenang) sfxMenang.play();
}

function keyPressed() {
  // Ganti konstanta tombol Processing ke p5.js
  if (keyCode === LEFT_ARROW) keyLeft = true;
  if (keyCode === RIGHT_ARROW) keyRight = true;
  if (keyCode === UP_ARROW) keyUp = true;
  
  // --- MENU INPUT (MEMICU LOADING) ---
  if (gameMode == 0) {
    if (key === '1' || key === '2' || key === '3') {
        
       // Matikan lagu menu saat masuk game
       if (bgmMenu) bgmMenu.stop();
       
       pendingLevelConfig = int(key); // Simpan pilihan level
       loadingStartTime = millis();        
       gameMode = 4;                       // MASUK MODE LOADING
       
       // Efek suara mesin
       if (sfxGas) { sfxGas.play(); sfxGas.setVolume(0.5); } // .amp() diganti setVolume di beberapa versi p5, tapi amp() juga oke
    }
  }
  
  // RESET (ENTER)
  if (keyCode === ENTER && (gameMode == 2 || gameMode == 3)) {
      if (sfxMenang) sfxMenang.stop();    
      if (sfxLedakan) sfxLedakan.stop(); 
      
      gameMode = 0; // KEMBALI KE MENU
      
      // Nyalakan lagu menu lagi
      if (bgmMenu) bgmMenu.loop();
  }
}  

function keyReleased() {
  if (keyCode === LEFT_ARROW) keyLeft = false;
  if (keyCode === RIGHT_ARROW) keyRight = false;
  if (keyCode === UP_ARROW) { 
      keyUp = false; 
      if (sfxGas) sfxGas.stop(); 
  }
}

function drawLoading() {
  let progress = (millis() - loadingStartTime) / float(loadingDuration);
  
  textAlign(CENTER, CENTER);
  fill(255); textSize(20 * s);
  
  // Animasi titik
  let dots = "";
  if (frameCount % 60 < 20) dots = "."; else if (frameCount % 60 < 40) dots = ".."; else dots = "...";
  
  // GANTI TEKS LOADING
  text("MEMANASKAN MESIN ROKET" + dots, width/2, height * 0.85);
  
  // Animasi Roket Naik (Lerp)
  let currentY = lerp(height/2 + (100*s), -200 * s, progress); 
  noStroke(); fill(255, 100, 0, 200);
  ellipse(width/2, currentY + (40*s), 15*s, random(20*s, 50*s)); 
  
  if (ship) {
    imageMode(CENTER);
    image(ship, width/2, currentY, 80*s, 80*s);
  }
  
  if (progress >= 1.0) {
    startGame(pendingLevelConfig); 
  }
}

// ==========================================
// 9. KONTROL KHUSUS ANDROID (TOUCHSCREEN)
// ==========================================
// 9. KONTROL ANDROID (VERSI PEDAL GAS REALISTIS 🏎️)
// ==========================================
// ==========================================
// 9. KONTROL ANDROID (UI MODERN - TOMBOL "GAS" LINGKARAN) 🎮
// ==========================================

function drawMobileControls() {
  // Hanya tampilkan di Gameplay (Mode 1)
  if (gameMode != 1) return;

  noStroke();
  
  // --- 1. SETTING UKURAN & POSISI ---
  let btnSize = 70 * s;   
  let margin = 30 * s;    
  let gap = 20 * s;       
  let yPos = height - btnSize - margin; 

  // A. AREA TOMBOL KIRI (ROTASI)
  let btnLeftX = margin;
  let btnRightX = margin + btnSize + gap;
  
  // B. AREA TOMBOL GAS (KANAN)
  let gasSize = 90 * s; 
  let gasX = width - gasSize - margin;
  let gasY = height - gasSize - margin;

  // --- 2. LOGIKA SENTUHAN ---
  let touchLeft = false;
  let touchRight = false;
  let touchUp = false;

  for (let i = 0; i < touches.length; i++) {
    let tX = touches[i].x;
    let tY = touches[i].y;

    if (tX > btnLeftX && tX < btnLeftX + btnSize && tY > yPos && tY < yPos + btnSize) touchLeft = true;
    if (tX > btnRightX && tX < btnRightX + btnSize && tY > yPos && tY < yPos + btnSize) touchRight = true;
    if (tX > gasX && tX < gasX + gasSize && tY > gasY && tY < gasY + gasSize) touchUp = true;
  }

  keyLeft  = keyIsDown(LEFT_ARROW) || touchLeft;
  keyRight = keyIsDown(RIGHT_ARROW) || touchRight;
  keyUp    = keyIsDown(UP_ARROW) || touchUp;

  // --- 3. GAMBAR VISUAL TOMBOL ---
  
  // A. KIRI & KANAN (PANAH) - Tetap seperti sebelumnya
  // Tombol Kiri
  if (touchLeft) fill(255, 255, 255, 100); else fill(255, 255, 255, 30);
  ellipse(btnLeftX + btnSize/2, yPos + btnSize/2, btnSize);
  fill(255); 
  triangle(
    btnLeftX + btnSize * 0.7, yPos + btnSize * 0.3,
    btnLeftX + btnSize * 0.7, yPos + btnSize * 0.7,
    btnLeftX + btnSize * 0.3, yPos + btnSize * 0.5
  );

  // Tombol Kanan
  if (touchRight) fill(255, 255, 255, 100); else fill(255, 255, 255, 30);
  ellipse(btnRightX + btnSize/2, yPos + btnSize/2, btnSize);
  fill(255);
  triangle(
    btnRightX + btnSize * 0.3, yPos + btnSize * 0.3,
    btnRightX + btnSize * 0.3, yPos + btnSize * 0.7,
    btnRightX + btnSize * 0.7, yPos + btnSize * 0.5
  );

  // B. TOMBOL GAS (BARU: TEKS "GAS" DALAM LINGKARAN)
  // Background Lingkaran Merah
  if (touchUp) fill(255, 50, 50, 180); else fill(255, 50, 50, 80);
  ellipse(gasX + gasSize/2, gasY + gasSize/2, gasSize);

  // Tulisan "GAS" di tengah
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(gasSize * 0.35); // Ukuran teks menyesuaikan tombol
  text("GAS", gasX + gasSize/2, gasY + gasSize/2);
  
  // Label kecil di bawah
  fill(200); textSize(12 * s); textAlign(CENTER); textStyle(NORMAL);
  text("STEERING", margin + btnSize + (gap/2), yPos + btnSize + (15*s));
  text("ENGINE", gasX + gasSize/2, gasY + gasSize + (15*s));
}

// ==========================================
// 10. FITUR ANTI-GESER (BIAR LAYAR HP TIDAK GOYANG) 📱🚫
// ==========================================

// Fungsi ini mencegah layar HP nge-scroll atau nge-zoom saat main
function touchStarted() {
  // Kalau user menyentuh canvas game, matikan fungsi default browser
  if (gameMode > 0) {
    return false; 
  }
}

function touchMoved() {
  // Mencegah tarik-tarik layar (refresh/scroll)
  return false;
}

function touchEnded() {
  // Mencegah menu klik kanan/context menu muncul
  return false;
}
