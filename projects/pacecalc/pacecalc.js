document.getElementById('calculate-btn').addEventListener('click', function() {
    // Fetch input values
    const targetTime = document.getElementById('targetTime').value;
    const distance = parseFloat(document.getElementById('distance').value);
    const pace = document.getElementById('pace').value;
    const unit = document.querySelector('input[name="distanceUnit"]:checked').value;

    const resultTable = document.getElementById('results-table');
    resultTable.innerHTML = '';

    if (!targetTime) {
        // Calculate Time
        calculateTime(distance, pace, unit);
    } else if (!distance) {
        // Calculate Distance
        calculateDistance(targetTime, pace, unit);
    } else if (!pace) {
        // Calculate Pace
        calculatePace(targetTime, distance, unit);
    } else {
        alert("Leave one field blank for the calculator to work.");
    }
});

function calculateTime(distance, pace, unit) {
    const distanceInKm = unit === 'mi' ? distance * 1.60934 : distance;
    const paceSeconds = timeToSeconds(pace);

    if (!distance || !paceSeconds) {
        alert("Please enter valid distance and pace.");
        return;
    }

    const totalSeconds = paceSeconds * distanceInKm;
    const timeFormatted = formatTime(totalSeconds);

    document.getElementById('targetTime').value = timeFormatted;
    displayResult(totalSeconds, distanceInKm, pace);
}

function calculateDistance(targetTime, pace, unit) {
    const totalSeconds = timeToSeconds(targetTime);
    const paceSeconds = timeToSeconds(pace);

    if (!totalSeconds || !paceSeconds) {
        alert("Please enter valid time and pace.");
        return;
    }

    const distanceKm = totalSeconds / paceSeconds;
    const distanceMi = distanceKm * 0.621371;

    document.getElementById('distance').value = unit === 'mi' ? distanceMi.toFixed(2) : distanceKm.toFixed(2);
    displayResult(totalSeconds, distanceKm, pace);
}

function calculatePace(targetTime, distance, unit) {
    const totalSeconds = timeToSeconds(targetTime);
    const distanceInKm = unit === 'mi' ? distance * 1.60934 : distance;

    if (!totalSeconds || !distance) {
        alert("Please enter valid time and distance.");
        return;
    }

    // Calculate pace per kilometer (min/km)
    const pacePerKm = totalSeconds / distanceInKm;

    // Calculate pace per mile (min/mi)
    const pacePerMi = pacePerKm * 1.60934;

    // Update table with one row per kilometer
    updateResultsTable(pacePerKm, pacePerMi, totalSeconds, distanceInKm, unit);
}

function updateResultsTable(pacePerKm, pacePerMi, totalSeconds, distanceInKm, unit) {
    const resultTable = document.getElementById('results-table');
    resultTable.innerHTML = ''; // Clear previous results

    let cumulativeDistanceKm = 0;
    let cumulativeTime = 0;
    
    // Loop through each full kilometer
    for (let i = 1; i <= Math.floor(distanceInKm); i++) {
        cumulativeDistanceKm = i;
        cumulativeTime = pacePerKm * i;

        const cumulativeDistanceMi = cumulativeDistanceKm * 0.621371; // Convert km to miles
        const formattedTime = formatTime(cumulativeTime);
        const speedKmh = 3600 / pacePerKm;
        const speedMph = speedKmh * 0.621371;

        // Add a new row for each full kilometer
        const row = `<tr>
                        <td>${cumulativeDistanceKm.toFixed(2)} km</td>
                        <td>${formattedTime}</td>
                        <td>${formatTime(pacePerKm)}</td>
                        <td>${formatTime(pacePerMi)}</td>
                        <td>${speedKmh.toFixed(2)}</td>
                        <td>${speedMph.toFixed(2)}</td>
                     </tr>`;
        resultTable.innerHTML += row;
    }

    // Add a final row for the remaining distance (0.1 km for half marathon)
    const remainingDistanceKm = distanceInKm - Math.floor(distanceInKm);
    if (remainingDistanceKm > 0) {
        const remainingTime = pacePerKm * remainingDistanceKm;
        cumulativeTime += remainingTime;

        const cumulativeDistanceMi = distanceInKm * 0.621371; // Convert total km to miles
        const formattedTime = formatTime(cumulativeTime);
        const speedKmh = 3600 / pacePerKm;
        const speedMph = speedKmh * 0.621371;

        // Add the final row for 0.1 km
        const row = `<tr>
                        <td>${distanceInKm.toFixed(2)} km</td>
                        <td>${formattedTime}</td>
                        <td>${formatTime(pacePerKm)}</td>
                        <td>${formatTime(pacePerMi)}</td>
                        <td>${speedKmh.toFixed(2)}</td>
                        <td>${speedMph.toFixed(2)}</td>
                     </tr>`;
        resultTable.innerHTML += row;
    }
}


function timeToSeconds(time) {
    const parts = time.split(':');
    return (+parts[0] * 3600) + (+parts[1] * 60) + (+parts[2]);
}

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
