const http  = require('http')
const mongoose = require('mongoose');

const app = require('./app');

const {loadPlanetsData} = require('./models/planets.model'); 
const {loadLaunchData} = require('./models/launches.model');

const PORT = process.env.PORT || 8000;

const MONGO_URL = 'mongodb+srv://peterodero450:M9CV4ZseableRewu@nasacluster.rt2tf.mongodb.net/?retryWrites=true&w=majority&appName=NASACluster'

const server = http.createServer(app);

mongoose.connection.once('open', ()=>{
	console.log('MongoDB connection is ready')
})

mongoose.connection.on('error', (err)=>{
	console.error(err);
})

async function startServer(){
	await mongoose.connect(MONGO_URL)
	
	await loadPlanetsData();
	await loadLaunchData();
	
	server.listen(PORT, ()=>{
		console.log(`Listening to port ${PORT}...`)
	});
}

startServer();
