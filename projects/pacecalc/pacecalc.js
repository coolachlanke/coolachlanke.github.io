// Main function that handles form submission and determines which field is empty
document.getElementById('calculate-btn').addEventListener('click', function() {
    // Get values from the time inputs (target time)
    const timeHours = parseInt(document.getElementById('hours').value) || 0;
    const timeMinutes = parseInt(document.getElementById('minutes').value) || 0;
    const timeSeconds = parseInt(document.getElementById('seconds').value) || 0;

    if (!timeHours) {
        document.getElementById('hours').value = 0;
    }
    if (!timeMinutes) {
        document.getElementById('minutes').value = 0;
    }
    if (!timeSeconds) {
        document.getElementById('seconds').value = 0;
    }

    // Combine hours, minutes, and seconds into a single formatted time string
    let targetTime = (timeHours * 3600) + (timeMinutes * 60) + timeSeconds;

    // Get values from the new pace inputs
    const paceMinutes = parseInt(document.getElementById('pace-minutes').value) || 0;
    const paceSeconds = parseInt(document.getElementById('pace-seconds').value) || 0;

    // Convert pace to total seconds
    let pace = (paceMinutes * 60) + paceSeconds;

    let distance = parseFloat(document.getElementById('distance').value);
    const unit = document.querySelector('input[name="distanceUnit"]:checked').value;

    // Determine which input is empty and calculate the missing value
    if (!timeHours && !timeMinutes && !timeSeconds) {
        // Calculate missing time
        targetTime = calculateTime(distance, pace, unit);
        document.getElementById('hours').value = Math.floor((targetTime / 3600));
        document.getElementById('minutes').value = Math.floor((targetTime / 60));
        document.getElementById('seconds').value = Math.round((targetTime % 60));
    } else if (!distance) {
        // Calculate missing distance
        distance = calculateDistance(targetTime, pace, unit);
        console.log(distance);
        document.getElementById('distance').value = distance.toFixed(2);
    } else if (!paceMinutes && !paceSeconds) {
        // Calculate missing pace and update the pace input boxes
        pace = calculatePace(targetTime, distance, unit);
        document.getElementById('pace-minutes').value = Math.floor(pace / 60);
        document.getElementById('pace-seconds').value = Math.round((pace % 60));
    } else {
        alert("Leave one field blank to calculate.");
        return;
    }

    // Update the results table
    updateResultsTable(targetTime, distance, pace, unit);
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



// Function to calculate the missing time
function calculateTime(distance, pace, unit) {
    const targetTime = distance * pace;
    return targetTime;
}

// Function to calculate the missing distance
function calculateDistance(targetTime, pace, unit) {
    const distance = targetTime / pace;
    return distance;
}

// Function to calculate the missing pace
function calculatePace(targetTime, distance, unit) {
    const pace = targetTime / distance;
    return pace;
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
