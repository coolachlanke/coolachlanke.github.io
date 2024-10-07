// Variables to store current and previous value
let time = 0;
let distance = 0;
let pace = 0;

let previousTime = null;
let previousDistance = null;
let previousPace = null;

// Main function that handles form submission and determines which field is empty
document.getElementById('calculate-btn').addEventListener('click', function() {
// Get data from input fields
    time = (Math.round(time) !== getTime()) ? getTime() : time;
    pace = (Math.round(pace) !== getPace()) ? getPace() : pace;
    distance = (distance.toFixed(2) !== getDistance()) ? getDistance() : distance;
    const unit = document.querySelector('input[name="distanceUnit"]:checked').value;

    // If there's already data in all three inputs (i.e. the user is trying different combinations), then apply rules to null one of the fields and recalculate
    if (time && distance && pace) {
        // Detect which value was changed
        if (time !== previousTime) {
            // Time has changed, recalculate pace
            pace = null;
            document.getElementById('pace-minutes').value = null;
            document.getElementById('pace-seconds').value = null;
        } else if (distance !== previousDistance) {
            // Distance has changed, recalculate time
            time = null;
            document.getElementById('hours').value = null;
            document.getElementById('minutes').value = null;
            document.getElementById('seconds').value = null;
        } else if (pace !== previousPace) {
            // Pace has changed, recalculate time
            time = null;
            document.getElementById('hours').value = null;
            document.getElementById('minutes').value = null;
            document.getElementById('seconds').value = null;
        }
    }

    // Now, solve for the single missing value
    if (distance && pace && !time) {
        // Calculate missing time
        time = distance * pace;
        document.getElementById('hours').value = Math.floor((time / 3600));
        document.getElementById('minutes').value = Math.floor(((time % 3600) / 60));
        document.getElementById('seconds').value = Math.round((time % 60));
    } else if (!distance && pace && time) {
        // Calculate missing distance
        distance = time / pace;
        document.getElementById('distance').value = distance.toFixed(2);
    } else if (distance && !pace && time) {
        // Calculate missing pace and update the pace input boxes
        pace = time / distance;
        document.getElementById('pace-minutes').value = Math.floor(pace / 60);
        document.getElementById('pace-seconds').value = Math.round((pace % 60));
    } else if (!(distance && pace && time)){
        alert("Underdetermined! Please enter more data.");
        return;
    }

    // Store the current values for comparison on next change
    previousTime = time;
    previousDistance = distance;
    previousPace = pace;

    // Update the results table
    updateResultsTable(time, distance, pace, unit);
});


document.querySelectorAll('input[name="distanceUnit"]').forEach((radio) => {
    radio.addEventListener('change', function() {
        const selectedUnit = document.querySelector('input[name="distanceUnit"]:checked').value;
        
        // Update the distance unit (e.g., km, mi, nm)
        document.getElementById('distance-unit').innerText = selectedUnit;

        // Update the pace unit (e.g., min/km, min/mi, min/nm)
        document.getElementById('pace-unit').innerText = `/ ${selectedUnit}`;
    });
});


function getTime() {
    const timeHours = parseInt(document.getElementById('hours').value) || 0;
    const timeMinutes = parseInt(document.getElementById('minutes').value) || 0;
    const timeSeconds = parseInt(document.getElementById('seconds').value) || 0;

    if (timeHours || timeMinutes || timeSeconds) {
        document.getElementById('hours').value = timeHours ? timeHours : 0;
        document.getElementById('minutes').value = timeMinutes ? timeMinutes : 0;
        document.getElementById('seconds').value = timeSeconds ? timeSeconds : 0;
    }

    return (timeHours * 3600) + (timeMinutes * 60) + timeSeconds;
}

function getPace() {
    let paceMinutes = parseInt(document.getElementById('pace-minutes').value) || 0;
    let paceSeconds = parseInt(document.getElementById('pace-seconds').value) || 0;

    if (paceMinutes || paceSeconds) {
        document.getElementById('pace-minutes').value = paceMinutes ? paceMinutes : 0;
        document.getElementById('pace-seconds').value = paceSeconds ? paceSeconds : 0;
    }

    return (paceMinutes * 60) + paceSeconds;
}

function getDistance() {
    return parseFloat(document.getElementById('distance').value);
}

// Convert distance to kilometers
function convertToKm(distance, unit) {
    if (unit === 'mi') return distance * 1.60934; // Miles to km
    if (unit === 'nm') return distance * 1.852; // Nautical miles to km
    return distance; // If km, no conversion needed
}

// Convert distance from kilometers to the original unit
function convertFromKm(distanceKm, unit) {
    if (unit === 'mi') return distanceKm / 1.60934; // Km to miles
    if (unit === 'nm') return distanceKm / 1.852; // Km to nautical miles
    return distanceKm; // If km, no conversion needed
}

// Format time from seconds to hh:mm:ss or mm:ss
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const sec = Math.floor(seconds % 60);
    if (hours > 0) {
        return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${sec < 10 ? '0' : ''}${sec}`;
    } else {
        return `${minutes}:${sec < 10 ? '0' : ''}${sec}`;
    }
}

// Convert time from hh:mm:ss format to total seconds
function timeToSeconds(time) {
    time = String(time);
    const parts = time.split(':');
    return (+parts[0] * 3600) + (+parts[1] * 60) + (+parts[2]);
}

// Update the table with results
function updateResultsTable(time, distance, pace, unit) {
    const resultTable = document.querySelector('table'); // Ensure you are targeting the correct table
    let thead = resultTable.querySelector('thead');
    let tbody = resultTable.querySelector('tbody');

    // Ensure thead and tbody exist
    if (!thead) {
        thead = document.createElement('thead');
        resultTable.prepend(thead);
    }
    if (!tbody) {
        tbody = document.createElement('tbody');
        resultTable.appendChild(tbody);
    }

    tbody.innerHTML = ''; // Clear previous results

    // Define alternate unit based on the selected unit
    const alternateUnit = unit === 'km' ? 'mi' : unit === 'mi' ? 'mi' : 'nm';

    // Update table header
    thead.innerHTML = `
        <tr>
            <th>Distance</th>
            <th>Time</th>
            <th>Pace (min/km)</th>
            <th>Pace (min/${alternateUnit})</th>
            <th>Speed (km/h)</th>
            <th>Speed (${unit === 'nm' ? 'knots' : 'mi/h'})</th>
        </tr>`;

    const distanceInKm = convertToKm(distance, unit);
    const paceInKm = time / distanceInKm;
    const speedInKm = 3600 / paceInKm;

    // Loop through each split unit and add a new row
    for (let i = 1; i <= Math.floor(distance); i++) {
        const rowDistance = i;
        const rowTime = formatTime((pace * i));
        const rowPaceAlt = formatTime((paceInKm * (alternateUnit === 'mi' ? 1.60934 : 1.852)));
        const rowSpeedAlt = speedInKm * (unit === 'nm' ? 0.539957 : 0.621371);

        tbody.innerHTML += `
            <tr>
                <td>${rowDistance.toFixed(2)} ${unit}</td>
                <td>${rowTime}</td>
                <td>${formatTime(paceInKm)}</td>
                <td>${rowPaceAlt}</td>
                <td>${speedInKm.toFixed(2)}</td>
                <td>${rowSpeedAlt.toFixed(2)}</td>
            </tr>`;
    }

    // Handle the remaining part of the distance (non-integer distance)
    const remainingDistance = distance - Math.floor(distance);
    if (remainingDistance > 0) {
        const rowDistance = distance;
        const rowTime = formatTime(time); // total time
        const rowPaceAlt = formatTime((paceInKm * (alternateUnit === 'mi' ? 1.60934 : 1.852)));
        const rowSpeedAlt = speedInKm * (unit === 'nm' ? 0.539957 : 0.621371);

        tbody.innerHTML += `
            <tr>
                <td>${rowDistance.toFixed(2)} ${unit}</td>
                <td>${rowTime}</td>
                <td>${formatTime(paceInKm)}</td>
                <td>${rowPaceAlt}</td>
                <td>${speedInKm.toFixed(2)}</td>
                <td>${rowSpeedAlt.toFixed(2)}</td>
            </tr>`;
    }
}
