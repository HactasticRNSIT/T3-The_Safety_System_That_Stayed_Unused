const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

app.use(express.static(__dirname));

let contacts = [];

app.post("/api/contacts",(req,res)=>{

const {name, number} = req.body;

contacts.push({
name,
number
});

res.json({
success:true,
contacts
});

});

app.get("/api/contacts",(req,res)=>{

res.json({
contacts
});

});

app.listen(3000,()=>{

console.log("SafeNest server running on http://localhost:3000");

});
