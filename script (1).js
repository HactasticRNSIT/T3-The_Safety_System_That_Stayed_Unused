let currentLocation = "";
let emergencyContacts = [];
let emergencyActive = false;
let recognition;

/* 🔋 BATTERY AUTO SOS */
if(navigator.getBattery){
navigator.getBattery().then(battery=>{

function check(){

let level = battery.level * 100;

document.getElementById("batteryStatus").innerText =
"🔋 Battery: " + level.toFixed(0) + "%";

if(level <= 20 && !emergencyActive){
activateSOS("Low Battery");
}
}

check();
battery.addEventListener("levelchange",check);

});
}

/* 🚨 SOS */
function activateSOS(reason="Manual SOS"){

emergencyActive = true;

/* siren */
let siren = document.getElementById("siren");
siren.loop = true;
siren.play();

/* vibration */
if(navigator.vibrate){
navigator.vibrate([500,300,500]);
}

/* location tracking */
navigator.geolocation.watchPosition(pos=>{

const lat = pos.coords.latitude;
const lng = pos.coords.longitude;

currentLocation = `https://maps.google.com/?q=${lat},${lng}`;

document.getElementById("location").innerHTML =
`📍 ${lat}, ${lng}`;

/* MAP */
let map = document.getElementById("mapFrame");
map.style.display = "block";
map.src = `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;

});

/* alert system */
sendAlert(reason);
}

/* 📩 ALERT */
function sendAlert(reason){

setTimeout(()=>{

let msg = `
🚨 EMERGENCY ALERT
Type: ${reason}
Location: ${currentLocation}
Time: ${new Date().toLocaleTimeString()}
`;

emergencyContacts.forEach(c=>{
window.open(
`https://wa.me/${c.number}?text=${encodeURIComponent(msg)}`
);
});

/* fake SMS */
document.getElementById("smsBox").innerHTML =
"📩 SMS SENT<br><br>" + msg;

},1000);
}

/* 👨‍👩‍👧 SAVE CONTACT */
function saveContact(){

let n = document.getElementById("contactName").value;
let num = document.getElementById("contactNumber").value;

if(!n || !num) return;

emergencyContacts.push({name:n,number:num});

document.getElementById("savedContacts").innerHTML +=
`<p>📞 ${n} - ${num}</p>`;
}

/* 🚓 POLICE */
function openPolice(){
window.open("https://www.google.com/maps/search/police+near+me");
}

/* 🏥 HOSPITAL */
function openHospital(){
window.open("https://www.google.com/maps/search/hospital+near+me");
}

/* 🎤 VOICE */
function startVoiceDetection(){

const SpeechRecognition =
window.SpeechRecognition || window.webkitSpeechRecognition;

if(!SpeechRecognition) return;

recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = "en-US";

const words = [
"help","emergency","sos","save me","call police"
];

recognition.onresult = e=>{

let text =
e.results[e.results.length-1][0].transcript.toLowerCase();

if(words.some(w=>text.includes(w))){
activateSOS("Voice Trigger");
}
};

recognition.start();
}

/* ✅ SAFE BUTTON */
function sendSafeMessage(){

let msg = `
✅ USER SAFE NOW

Location:
${currentLocation}

Time:
${new Date().toLocaleTimeString()}
`;

emergencyContacts.forEach(c=>{
window.open(
`https://wa.me/${c.number}?text=${encodeURIComponent(msg)}`
);
});

alert("Safety message sent");
}

/* INIT */
window.onload=()=>{
startVoiceDetection();
};
