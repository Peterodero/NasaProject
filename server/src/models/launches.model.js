//M9CV4ZseableRewu
const axios = require('axios');

const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;



const launch = {
	flightNumber: 100, // flight_number
	mission: 'Kepler Exploration X', //name
	rocket: 'Explorer ISI', //rocket.name
	launchDate: new Date('December 27, 2030'), //date_local
	target: 'Kepler-442 b', //not applicable
	customers: ['ZTM','NASA'], //payload.cust
	upcoming: true, //upcoming
	success: true //success
};

saveLaunch(launch)

const SPACE_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function loadLaunchData() {
	console.log('Downloading')
	const response = await axios.post(SPACE_API_URL, {
		query:{},
		options:{
			pagination: false,
			populate: [
				{
					path:'rocket',
					select: {
						name: 1
					}
				},
				{
					path:'payloads',
					select: {
						'customers': 1
					}
				}
			]
		}
	});
	
	const launchDocs = response.data.docs;
	for(const launchDoc of launchDocs){
		const payloads = launchDoc['payloads'];
		const customers = payloads.flatMap((payload)=> {
			return payload['customers'];
		})
		const launch = {
			flightNumber: launchDoc['flight_number'],
			mission: launchDoc['name'],
			rocket: launchDoc['rocket']['name'],
			launchDate: launchDoc['date_local'],
			upcoming: launchDoc['upcoming'],
			success: launchDoc['success'],
			customers,
		};
		
		console.log(`${launch.flightNumber} ${launch.mission}`)
	}
}

// launches.set(launch.flightNumber, launch)

async function existLaunchWithId(launchId){
	// return launches.has(launchId);
	return await launchesDatabase.findOne({
		flightNumber: launchId
	})
}

async function getLatestFlightNumber(){
	const latestLaunch = await launchesDatabase
		.findOne()
		.sort('-flightNumber');
	if (!latestLaunch){
		return DEFAULT_FLIGHT_NUMBER;
	}
	
	return latestLaunch.flightNumber;
}

async function getAllLaunches(){
	//return Array.from(launches.values());
	
	return await launchesDatabase.find({},{
		'_id':0,'__v':0
	})
	
}

async function saveLaunch(launch){
	
	const planet = await planets.findOne({
		keplerName:launch.target
	});
	
	if(!planet){
		throw new Error('No matching planet was found')
	}
	
	await launchesDatabase.findOneAndUpdate({
		flightNumber:launch.flightNumber,
	}, launch, {
		upsert:true
	})
}

async function addNewLaunch(launch){
	
	const newFlightNumber = await getLatestFlightNumber() + 1;
	
	const newLaunch = Object.assign(launch, {
		 		upcoming: true,
				success:true,
		 		customers: ['ZTM','NASA'],
				flightNumber: newFlightNumber
			});
			
	await saveLaunch(newLaunch);
}

// function addNewLaunch(launch){
// 	latestFlightNumber++;
// 	launches.set(latestFlightNumber, Object.assign(launch, {
// 		flightNumber:latestFlightNumber,
// 		upcoming: true,
// 		success:true,
// 		customers: ['ZTM','NASA']
// 	}))
// }

async function abortLaunchById(launchId){
	
	const aborted = await launchesDatabase.updateOne({
		flightNumber: launchId
	}, {
		upcoming:false,
		success:false
	})
	
	return aborted.ok === 1 && aborted.nModified === 1;
	
	// const aborted = launches.get(launchId);
	// aborted.upcoming = false
	// aborted.success  = false
	// return aborted;
}

module.exports = {
	loadLaunchData,
	existLaunchWithId,
	getAllLaunches,
	addNewLaunch,
	abortLaunchById
}