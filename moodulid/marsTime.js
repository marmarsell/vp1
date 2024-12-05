const monthNamesEt = ["Jaanuar","Veebruar","Märts","Aprill","Mai","Juuni","Juuli","August","September","Oktoober","November","Oktoober"];
const weekDayNamesEt = ["Pühapäev","Esmaspäev","Teisipäev","Kolmapäev","Neljapäev","Reede","Laupäev"];


//eesti kuupäev
const dateEt = function(){
	
	let timeNow = new Date();
	//let specDate = new Date("12-27-1939")
	let dateNow = timeNow.getDate();
	let monthNow = timeNow.getMonth();
	let yearNow = timeNow.getFullYear();
	let dateNowEt = dateNow + ". " + monthNamesEt[monthNow] + " " + yearNow;
	return dateNowEt;
}

//kuupäeva formaatormasin
const givenDateFormatted = function(gDate){
	
	let specDate = new Date(gDate);
	return specDate.getDate() + ". " + monthNamesEt[specDate.getMonth()] + " " + specDate.getFullYear();
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

const deltaTime = function(start, end){
	let date1 = new Date(start);
	let date2 = new Date(end);
	let delta = date2.getTime() - date1.getTime();
	let deltaDays = Math.round(delta / (1000 * 3600 * 24));
	return deltaDays;
}

module.exports = {monthNamesEt:monthNamesEt, weekDayNamesEt:weekDayNamesEt, dateEt:dateEt, weekDayEt:weekDayEt, partOfDay:partOfDay, givenDateFormatted: givenDateFormatted, deltaTime: deltaTime};