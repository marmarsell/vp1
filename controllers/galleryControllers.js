const mysql = require("mysql2");

const dbInfo = require("../../../vp2024config.js");

//loon andmebaasiühendus
const conn = mysql.createConnection({
	host:dbInfo.configData.host,
	user:dbInfo.configData.user,
	password:dbInfo.configData.password,
	database:dbInfo.configData.database
});


//@desc main photos page
//@route GET /photos
//@access private

const photosHome = (req, res)=>{
	res.render("photos.ejs");
};


//@desc page for uploading photos
//@route GET /photos
//@access private

const photoUpload = (req, res)=>{
	
	res.render("photoupload.ejs");
};


//@desc gallery of photos
//@route GET /gallery
//@access public

//app.get("/photos/gallery", (req, res)=>{
const gallery = (req, res)=>{
	let sqlReq = "SELECT file_name, alt_text FROM vp1photos WHERE privacy = ? AND deleted IS NULL ORDER BY id DESC";
	const privacy = 3;
	let photoList = [];
	conn.query(sqlReq, [privacy], (err, result)=>{
		if(err){
			throw err;
		}
		else {
			console.log(result);
			for(let i = 0; i < result.length; i ++) {
				photoList.push({href: "/gallery/smol/" + result[i].file_name, alt: result[i].alt_text, fileName: result[i].file_name});
			}
			res.render("gallery", {listData: photoList});
		}
	});
};


module.exports = {
	photosHome,
	photoUpload,
	gallery
};