// Main function that handles form submission and determines which field is empty
document.getElementById('calculate-btn').addEventListener('click', function() {
    // Get values from the new time inputs
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;

    // Combine hours, minutes, and seconds into a single formatted time string
    let targetTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    let distance = parseFloat(document.getElementById('distance').value);
    let pace = document.getElementById('pace').value;
    const unit = document.querySelector('input[name="distanceUnit"]:checked').value;

    let calculatedValue = null;

    // Determine which input is empty and calculate the missing value
    if (!hours && !minutes && !seconds) {
        // If all time inputs are empty, calculate the time
        targetTime = calculateTime(distance, pace, unit);
        document.getElementById('hours').value = targetTime.split(':')[0];
        document.getElementById('minutes').value = targetTime.split(':')[1];
        document.getElementById('seconds').value = targetTime.split(':')[2];
    } else if (!distance) {
        // Calculate missing distance and update the distance input
        distance = calculateDistance(targetTime, pace, unit);
        document.getElementById('distance').value = distance.toFixed(2);
    } else if (!pace) {
        // Calculate missing pace and update the pace input
        pace = calculatePace(targetTime, distance, unit);
        document.getElementById('pace').value = formatTime(pace);
    } else {
        alert("Leave one field blank to calculate.");
        return;
    }

    // Update the results table
    updateResultsTable(targetTime, distance, pace, unit);
});

// Function to calculate the missing time
function calculateTime(distance, pace, unit) {
    const paceSeconds = timeToSeconds(pace);
    const distanceInKm = convertToKm(distance, unit);
    const totalSeconds = paceSeconds * distanceInKm;
    return formatTime(totalSeconds);
}

// Function to calculate the missing distance
function calculateDistance(targetTime, pace, unit) {
    const totalSeconds = timeToSeconds(targetTime);
    const paceSeconds = timeToSeconds(pace);
    const distanceKm = totalSeconds / paceSeconds;
    return convertFromKm(distanceKm, unit);
}

// Function to calculate the missing pace
function calculatePace(targetTime, distance, unit) {
    const totalSeconds = timeToSeconds(targetTime);
    const distanceInKm = convertToKm(distance, unit);
    const pacePerKm = totalSeconds / distanceInKm;
    return pacePerKm;
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
    const speedKmh = 3600 / pace; // Speed in km/h

    // Loop through each split unit and add a new row
    for (let i = 1; i <= Math.floor(distance); i++) {
        const rowDistance = i;
        const rowTime = formatTime(((unit === 'km' ? pace : unit === 'mi' ? (1.60934 * pace) : (1.852 * pace)) * i));
        const rowPaceAlt = formatTime((pace * (alternateUnit === 'mi' ? 1.60934 : 1.852)));
        const rowSpeedAlt = speedKmh * (unit === 'mi' ? 0.621371 : 0.539957);

        tbody.innerHTML += `
            <tr>
                <td>${rowDistance.toFixed(2)} ${unit}</td>
                <td>${rowTime}</td>
                <td>${formatTime(pace)}</td>
                <td>${rowPaceAlt}</td>
                <td>${speedKmh.toFixed(2)}</td>
                <td>${rowSpeedAlt.toFixed(2)}</td>
            </tr>`;
    }

    // Handle the remaining part of the distance (non-integer distance)
    const remainingDistance = distance - Math.floor(distance);
    if (remainingDistance > 0) {
        const rowDistance = distance;
        const rowTime = time; // total time
        const rowPaceAlt = formatTime((pace * (alternateUnit === 'mi' ? 1.60934 : 1.852)));
        const rowSpeedAlt = speedKmh * (unit === 'mi' ? 0.621371 : 0.539957);

        tbody.innerHTML += `
            <tr>
                <td>${rowDistance.toFixed(2)} ${unit}</td>
                <td>${rowTime}</td>
                <td>${formatTime(pace)}</td>
                <td>${rowPaceAlt}</td>
                <td>${speedKmh.toFixed(2)}</td>
                <td>${rowSpeedAlt.toFixed(2)}</td>
            </tr>`;
    }
}
