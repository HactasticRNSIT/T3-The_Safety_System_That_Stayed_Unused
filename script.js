let currentLocation = "";
let batteryLevel = "Unknown";
let recognition;
let emergencyTriggered = false;
let emergencyContacts = [];

if(navigator.getBattery){

navigator.getBattery().then((battery)=>{

batteryLevel =
Math.round(battery.level * 100) + "%";

document.getElementById("batteryStatus")
.innerHTML =
"🔋 Battery: " + batteryLevel;

});
}

function activateSOS(){

if(!navigator.geolocation){

alert("Location not supported");

return;
}

navigator.geolocation.watchPosition(

(position)=>{

const lat =
position.coords.latitude;

const lng =
position.coords.longitude;

currentLocation =
`https://maps.google.com/?q=${lat},${lng}`;

document.getElementById("location")
.innerHTML =

`
Latitude: ${lat}<br>
Longitude: ${lng}<br><br>

<a href="${currentLocation}" target="_blank">
Open Live Location
</a>
`;

},

(error)=>{

alert("Unable to fetch location");

},

{
enableHighAccuracy:true
}

);

alert("🚨 SafeNest SOS Activated");

shareAlert();
}

function shareAlert(){

const message =

`🚨 SAFENEST EMERGENCY ALERT

📍 Live Location:
${currentLocation}

🔋 Battery:
${batteryLevel}`;

const whatsappURL =
`https://wa.me/?text=${encodeURIComponent(message)}`;

window.open(
whatsappURL,
"_blank"
);
}

function openPolice(){

window.open(
"https://www.google.com/maps/search/police+station+near+me",
"_blank"
);

}

function openHospital(){

window.open(
"https://www.google.com/maps/search/hospital+near+me",
"_blank"
);

}

async function saveContact(){

const name =
document.getElementById("contactName").value;

const number =
document.getElementById("contactNumber").value;

if(name === "" || number === ""){

alert("Please fill all fields");

return;
}

const response = await fetch("/api/contacts",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
name,
number
})

});

const data = await response.json();

emergencyContacts = data.contacts;

renderContacts();

alert("Emergency contact saved");
}

function renderContacts(){

const container =
document.getElementById("savedContacts");

container.innerHTML = "";

emergencyContacts.forEach((contact)=>{

container.innerHTML +=

`
<p style="margin-top:10px;">
📞 ${contact.name} - ${contact.number}
</p>
`;

});
}

document.getElementById("voiceToggle")
.addEventListener("change",function(){

const micStatus =
document.getElementById("micStatus");

if(this.checked){

micStatus.innerHTML =
"🎙️ Microphone active - Listening for emergencies";

startVoiceDetection();

}else{

micStatus.innerHTML =
"🎙️ Microphone inactive";

stopVoiceDetection();
}

});

async function startVoiceDetection(){

try{

await navigator.mediaDevices
.getUserMedia({
audio:true
});

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

if(!SpeechRecognition){

alert("Speech recognition not supported");

return;
}

recognition =
new SpeechRecognition();

recognition.continuous = true;

recognition.interimResults = true;

recognition.lang = "en-US";

recognition.onresult =
function(event){

const transcript =

event.results[
event.results.length - 1
][0]
.transcript
.toLowerCase();

const panicWords = [
"help",
"danger",
"save me",
"emergency",
"stop"
];

for(let word of panicWords){

if(
transcript.includes(word)
&&
!emergencyTriggered
){

emergencyTriggered = true;

showEmergencyWarning(word);

setTimeout(()=>{

activateSOS();

window.location.href =
"tel:+919876543210";

},3000);

break;
}
}

};

recognition.start();

}catch(error){

alert("Microphone permission denied");

}

}

function stopVoiceDetection(){

if(recognition){

recognition.stop();
}

}

function showEmergencyWarning(reason){

const overlay =
document.createElement("div");

overlay.id = "warningOverlay";

overlay.innerHTML =

`
<div style="
background:white;
padding:40px;
border-radius:25px;
width:90%;
max-width:450px;
text-align:center;
position:fixed;
top:50%;
left:50%;
transform:translate(-50%,-50%);
z-index:9999;
">

<h1>⚠️ Possible Emergency Detected</h1>

<p>
Detected distress signal:
<strong>${reason}</strong>
</p>

<p>
SafeNest activating emergency flow...
</p>

<button onclick="cancelEmergency()"
style="
background:#EF4444;
color:white;
border:none;
padding:14px 28px;
border-radius:14px;
margin-top:20px;
cursor:pointer;
">

Cancel Alert

</button>

</div>
`;

document.body.appendChild(overlay);

}

function cancelEmergency(){

const overlay =
document.getElementById("warningOverlay");

if(overlay){

overlay.remove();
}

emergencyTriggered = false;

}
