const express = require("express");
const app = express();

app.get("/", (req, res)=>{
	res.send("Express läks täiesti tööle");
});

app.listen(5126);