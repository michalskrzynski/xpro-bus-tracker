let stop = false;

const colors = ['black','white','red','lime','blue','yellow','cyan','magenta',
              'silver','grey','maroon','olive','green','purple','teal','navy'];
let totalMarkers = 0;


const apiUrl = 'https://api-v3.mbta.com/vehicles?filter[route]=1&include=trip';
// its a bad practice to include the accessToken within the public GIT repository, however for the 
// purpose of xPro course, where the project could be easily accessible, I will leave it that way
mapboxgl.accessToken = 'pk.eyJ1IjoibWljaGFsc2tyenluc2tpIiwiYSI6ImNqOG9wZnFoMjA2OW4ycXVtbG16c2VtM24ifQ.qMYt5Ps5EBb6Na88-9P-bA';

// This is the map instance
let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-71.104081, 42.365554],
  zoom: 12,
});

let busData = null;


async function getBusLocations() {
  const response = await fetch( apiUrl );
  const json = await response.json();
  const newBusData = {};

  for( let i =0; i < json.data.length; i++ ) {
    const bd = new BusData( json.data[i] );
    newBusData[ bd.id ] = bd;
  }

  return newBusData;
}

async function run() {
  if( stop ) return;

  console.log( `Running: ${new Date()}`);

  const newBusData  = await getBusLocations();
  if( busData === null ) busData = newBusData;
  else {
    updateBusData( newBusData );
  }
  addMissingMarkers();
  moveAccordingly();

  setTimeout( run, 15000 );
}


function updateBusData( newBusData ) {
  Object.values( newBusData ).forEach( bd => {
    if( busData[ bd.id ] == null ) {
      busData[ bd.id ] = bd;
    } 
    else {
      busData[ bd.id ].update( bd );
    }
  });
}

function addMissingMarkers() {
  let busDataValues = Object.values( busData )
  busDataValues.forEach( (bd) => {
    if( bd.marker === null ) {
      bd.marker = new mapboxgl.Marker( { "color": colors[totalMarkers % busDataValues.length] } );
      bd.marker.setLngLat( [bd.longitude, bd.latitude]).addTo(map);
      totalMarkers++;
    } 
  });
};

function moveAccordingly() {
  Object.values( busData ).forEach( (bd) => {
    bd.marker.setLngLat( [bd.longitude, bd.latitude]);
  });
}



// TODO: add a marker to the map at the first coordinates in the array busStops. The marker variable should be named "marker"
//let marker = new mapboxgl.Marker().setLngLat(busStops[0]).addTo(map);

// counter here represents the index of the current bus stop
let counter = 0;
function move() {
  // TODO: move the marker on the map every 1000ms. Use the function marker.setLngLat() to update the marker coordinates
  // Use counter to access bus stops in the array busStops
  // Make sure you call move() after you increment the counter.
  counter++;
  marker.setLngLat( busStops[counter] );
  if( counter <= busStops.length ) setTimeout( move, 1000 );
}


class BusData {
  
  #id;
  #currentStatus;
  #currentStopSequence;
  #latitude;
  #longitude;
  #marker = null;


  constructor( jsonInput ) {
    this.#id = jsonInput.id;
    this.#currentStatus = jsonInput.attributes.current_status;
    this.#currentStopSequence = jsonInput.attributes.current_stop_sequence;
    this.#latitude = jsonInput.attributes.latitude;
    this.#longitude = jsonInput.attributes.longitude;
  }

  update( other ) {
    this.#currentStatus = other.currentStatus;
    this.#currentStopSequence = other.currentStatus;
    this.#latitude = other.latitude;
    this.#longitude = other.longitude;
  }

  get id() { return this.#id }
  get currentStatus() { return this.#currentStatus }
  get currentStopSequence() { return this.#currentStopSequence }
  get latitude() { return this.#latitude }
  get longitude() { return this.#longitude }
  get marker() { return this.#marker }

  set marker( m ) { this.#marker = m }

}