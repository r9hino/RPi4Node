// Class for storing each sensor setup.
// Constructor inputs:
//      sensorRetriever is a function whose job is to retrieve the data from the sensor.
// Properties:
//      interval set a fixed time execution of the sensorRetrieve function.
class SensorMonitor {
    constructor(sensorType, unit, retrieveTime, maxArrayElements, sensorRetriever){

        this.sensorType = sensorType;
        this.unit = unit;
        this.retrieveTime = retrieveTime;           // Interval time for retrieving sensor value.
        this.maxArrayElements = maxArrayElements;
        this.value = null;                          // Store last value from sensor.
        this.values = [];                           // Store last maxArrayElements values from sensor.

        // Values from sensor are stored in arrays.
        this.sensorRetriever = async () => {
            this.value = await sensorRetriever();
            this.value = parseFloat(this.value, 10);
            // Add new value to the beginning of the array.
            this.values.unshift(this.value);

            // Remove last elements in array if number of elements exceed maxArrayElements.
            if(this.values.length > this.maxArrayElements){
                this.values.pop();
            }
        };
        this.interval = setInterval(this.sensorRetriever, retrieveTime);
    }

    changeIntervalTime(newRetrieveTime){
        clearInterval(this.interval);
        this.interval = setInterval(this.sensorRetriever, newRetrieveTime);
    }

    average(){
        // If there aren't elements on the array, then do nothing.
        if(this.values.length == 0) return null;

        // First clean the array from undefined, null or "" values.
        let filteredValues = this.values.filter(function(x) {
            return x !== undefined && x !== null && x !== NaN && x !== "";
       });

       return filteredValues.reduce((a, b) => a + b) / filteredValues.length;
    }
}

module.exports = SensorMonitor;