const monthNamesEt = ["Jaanuar","Veebruar","Märts","Aprill","Mai","Juuni","Juuli","August","September","Oktoober","November","Oktoober"];
const weekDayNamesEt = ["Pühapäev","Esmaspäev","Teisipäev","Kolmapäev","Neljapäev","Reede","Laupäev"];


//eesti kuupäev
const dateEt = function(){
	
	let timeNow = new Date();
	let dateNow = timeNow.getDate();
	let monthNow = timeNow.getMonth();
	let yearNow = timeNow.getFullYear();
	let dateNowEt = dateNow + ". " + monthNamesEt[monthNow] + " " + yearNow;
	return dateNowEt;
}

//eesti nädalapäev
const weekDayEt = function(){
	
	let timeNow = new Date();
	let dayNow = timeNow.getDay();
	return weekDayNamesEt[dayNow];
}


const partOfDay = function(){
	
	let timeNow = new Date();
	let weekend = timeNow.getDay();
	let hourNow = timeNow.getHours();
	let dayPart = "suvaline hetk";
	if(weekend == 0 && weekend == 6){
		dayPart = "Nädalavahetus, saan magada :3"
	}
	else{
		if(hourNow >= 8 && hourNow <= 14){
			dayPart = "kooliaeg";
		}
		else{
			dayPart = "vaba aeg";
		}
	}
	return dayPart;
}

module.exports = {monthNamesEt:monthNamesEt, weekDayNamesEt:weekDayNamesEt, dateEt:dateEt, weekDayEt:weekDayEt, partOfDay:partOfDay};