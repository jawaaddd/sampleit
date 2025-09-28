const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

var center = [];
var waves = {"lows": [], "mids": [], "highs": []};

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  center = [canvas.width / 2, canvas.height / 2];
  waves = { "highs": [], "mids": [], "lows": [] };
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const radius = Math.trunc((window.innerWidth * 0.7) / 2);
const pointCount = radius * Math.PI * 0.2;
const maxIntensity = 10;

var audioData = {
  "lows": 0,
  "mids": 0,
  "highs": 0,
  "peak": 0
}
let audio = null;
let audioContext = null;
let analyser = null;
let dataArray = null;
var sampleRate;
var binWidth;

function initAudio() {
  // Create audio context - this is like the "brain" that processes audio
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Create analyser node - this extracts frequency data from audio
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 128; // Higher = more frequency detail, but slower
  
  // Create array to hold frequency data (half of fftSize)
  dataArray = new Uint8Array(analyser.frequencyBinCount);
  
  // Connect analyser to audio context destination (speakers)
  analyser.connect(audioContext.destination);
}

function handleAudioFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Create AudioContext here - after user interaction!
  if (!audioContext) {
    initAudio();
  }
  
  // If AudioContext was suspended (some browsers do this), resume it
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  // Create audio element
  audio = new Audio();
  audio.src = URL.createObjectURL(file);
  audio.loop = true;
  
  // Connect audio to analyser
  const source = audioContext.createMediaElementSource(audio);
  source.connect(analyser);
  
  audio.play().then(() => {
    // Only start animating after audio successfully starts
    sampleRate = audioContext.sampleRate;
    binWidth = sampleRate / analyser.fftSize;
    isAnimating = true; // Enable animation
    animate();
  }).catch(e => console.log('Audio play failed:', e));
}

const decayRate = 0.95;
function calculatePeakWithDecay(frequencyData, startBin, endBin, currentPeak) {
  // Find current maximum in range
  let currentMax = 0;
  for (let i = startBin; i < endBin && i < frequencyData.length; i++) {
    currentMax = Math.max(currentMax, frequencyData[i] / 255);
  }
  
  // Either use new peak or decay previous peak
  return Math.max(currentMax, currentPeak * decayRate);
}

function updateAudioData() {
  // Add safety check to prevent crashes when audio isn't loaded
  if (!analyser || !dataArray) return;
  
  analyser.getByteFrequencyData(dataArray);
  
  // Calculate average values for each frequency band instead of storing arrays
  let startBin = 0;
  let endBin = Math.floor(1000 / binWidth);
  let lowsSlice = dataArray.slice(startBin, endBin + 1);
  let rawLows = lowsSlice.length > 0 ? lowsSlice.reduce((sum, val) => sum + val, 0) / lowsSlice.length / 255 : 0;
  
  startBin = Math.floor(500 / binWidth);
  endBin = Math.floor(1500 / binWidth);
  let midsSlice = dataArray.slice(startBin, endBin + 1);
  let rawMids = midsSlice.length > 0 ? midsSlice.reduce((sum, val) => sum + val, 0) / midsSlice.length / 255 : 0;
  
  startBin = Math.floor(1500 / binWidth);
  endBin = Math.floor(2000 / binWidth);
  let highsSlice = dataArray.slice(startBin, endBin + 1);
  let rawHighs = highsSlice.length > 0 ? highsSlice.reduce((sum, val) => sum + val, 0) / highsSlice.length / 255 : 0;
  
  // Apply exponential scaling to make beats more pronounced
  // Values closer to 0 stay small, values closer to 1 get amplified dramatically
  audioData["lows"] = Math.pow(rawLows, 0.5); // Square root makes more sensitive to changes
  audioData["mids"] = Math.pow(rawMids, 0.5);
  audioData["highs"] = Math.pow(rawHighs, 0.5);
  
  startBin = Math.floor(2000 / binWidth);
  endBin = Math.floor(20000 / binWidth);
  let data = dataArray.slice(startBin, endBin + 1);
  audioData["peak"] = calculatePeakWithDecay(data, startBin, endBin, audioData["peak"]);
  
  console.log(audioData);
}

const maxDisplacement = () => canvas.width / 10; // Make it a function so it updates with canvas size

class Point {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    // Offset should be between 0 and PI
    this.offset = 0;
    this.size = 4;
    
    this.dx = 0;
    this.dy = 0;
  }
  
  update(s, offset, pointCount, bin) {
    var waveFreq;
    var beatMultiplier; // Different sensitivity for each frequency band
    switch (bin) {
      case "highs":
        waveFreq = 10;
        beatMultiplier = 80; // Highs get moderate amplification
        break;
      case "mids":
        waveFreq = 6;
        beatMultiplier = 100; // Mids get strong amplification
        break;
      case "lows":
        waveFreq = 2;
        beatMultiplier = 120; // Bass gets maximum amplification for punch
        break;
      default:
        waveFreq = 5;
        beatMultiplier = 60;
        break;
    }
    
    // offset should now be a normalized number (0-1)
    let offsetValue = offset || 0;
    
    // Add beat detection: if current value is much higher than recent average, amplify it more
    let beatBoost = 1;
    if (offsetValue > 0.6) { // Strong signal detected
      beatBoost = 1.5; // 50% extra amplification on strong beats
    } else if (offsetValue > 0.3) { // Medium signal
      beatBoost = 1.2; // 20% extra amplification
    }
    
    // Apply exponential scaling for more dramatic effect on loud parts
    let scaledOffset = Math.pow(offsetValue, 0.7) * beatMultiplier * beatBoost;
    
    this.offset = scaledOffset * Math.sin(waveFreq*2*Math.PI*s/pointCount);
    this.dx = this.offset * Math.cos(2*Math.PI*s/pointCount);
    this.dy = this.offset * Math.sin(2*Math.PI*s/pointCount);
  }
  
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = this.color;
    // Removed the console.log that was spamming the console
    ctx.beginPath();
    ctx.arc(this.x + this.dx, this.y + this.dy, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

var waves = {
  "highs": [],
  "mids": [],
  "lows": []
}

function initializeWaves() {
  waves = {"lows": [], "mids": [], "highs": []};
  let lowRadius = canvas.width / 4;
  for (let p = 0; p < lowRadius; p ++) {
    waves["lows"].push(new Point(
      center[0] + lowRadius * Math.cos(2*Math.PI*p/lowRadius),
      center[1] + lowRadius * Math.sin(2*Math.PI*p/lowRadius),
      "#3e6853"
    ));
  }
  
  for (let p = 0; p < (lowRadius * 1.25); p ++) {
    waves["mids"].push(new Point(
      center[0] + (lowRadius * 1.25) * Math.cos(2*Math.PI*p/(lowRadius * 1.25)),
      center[1] + (lowRadius * 1.25) * Math.sin(2*Math.PI*p/(lowRadius * 1.25)),
      "#3e6868"
    ));
  }
  
  for (let p = 0; p < (lowRadius * 1.5); p ++) {
    waves["highs"].push(new Point(
      center[0] + (lowRadius * 1.5) * Math.cos(2*Math.PI*p/(lowRadius * 1.5)),
      center[1] + (lowRadius * 1.5) * Math.sin(2*Math.PI*p/(lowRadius * 1.5)),
      "#3e5368"
    ));
  }
}

let isAnimating = false; // Track animation state

function animate() {
  if (!isAnimating) return; // Don't animate unless audio is playing
  
  updateAudioData();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  Object.entries(waves).forEach(([band, points]) => {
    points.forEach((point, index) => point.update(index, audioData[band], points.length, band));
  });
  
  Object.values(waves).forEach(points => {
    points.forEach(point => point.draw(ctx));
  });
  
  requestAnimationFrame(animate);
}

document.getElementById('audioInput').addEventListener('change', handleAudioFile);
console.log("Waves are initialized!");

ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
ctx.fillRect(0, 0, canvas.width, canvas.height);

function drawAllPoints() {
  if (waves["highs"].length <= 0 || waves["mids"].length <= 0 || waves["lows"].length <= 0) {
    initializeWaves();
  }
  let bands = ["lows", "mids", "highs"];
  // Fixed: Use 'let' instead of 'int', and properly declare 'band'
  for (let b = 0; b < bands.length; b++) {
    let band = bands[b]; // Properly declare the variable
    // console.log(waves);
    // console.log(band);
    let points = waves[band];
    for (let i = 0; i < points.length; i++) {
      points[i].draw(ctx);
    }
  }
}

drawAllPoints();