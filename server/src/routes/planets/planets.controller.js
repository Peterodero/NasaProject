const {getAllPlanets} = require("../../models/planets.model");

async function httpGetAllPlanets(req,res){
	
	res.status(200).json(await getAllPlanets()); // express returns 200 by default
}

module.exports = {
	httpGetAllPlanets
}