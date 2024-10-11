// Variables to store current and previous value
let time = 0;
let distance = 0;
let pace = 0;

let previousTime = null;
let previousDistance = null;
let previousPace = null;

// Main function that handles form submission and determines which field is empty
document.getElementById('calculate-btn').addEventListener('click', function() {
    // Determine if Advanced Mode is on
    const isAdvancedMode = document.getElementById('advancedMode').checked;

    // Get data from input fields
    time = (Math.round(time) !== getTime()) ? getTime() : time;
    const unit = document.querySelector('input[name="distanceUnit"]:checked').value;

    if (isAdvancedMode) {
        document.getElementById('advanced-section').style.display = 'block';
        // Advanced Mode: Perform advanced calculation
        advancedCalculation(time, unit);
    } else { 
        pace = (Math.round(pace) !== getPace()) ? getPace() : pace;
        distance = (distance.toFixed(2) !== getDistance()) ? getDistance() : distance;

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
    }
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
    seconds = Math.round(seconds);
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
    const alternateUnit = unit === 'km' ? 'mi' : unit === 'mi' ? 'km' : 'nm';

    // Update table header
    thead.innerHTML = `
        <tr>
            <th>Distance</th>
            <th>Time</th>
            <th>Pace (min/${unit})</th>
            <th>Pace (min/${alternateUnit})</th>
            <th>Speed (${unit}/h)</th>
            <th>Speed (${alternateUnit}/h)</th>
        </tr>`;

    const distanceInKm = convertToKm(distance, unit);
    const paceInKm = time / distanceInKm; // Pace in s/km
    const speedInKm = 3600 / paceInKm; // Speed in km/h

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


function updateResultsTableAdv(time, unit, averagePace, splits) {
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
    const alternateUnit = unit === 'km' ? 'mi' : unit === 'mi' ? 'km' : 'nm';

    // Update table header
    thead.innerHTML = `
        <tr>
            <th>Distance</th>
            <th>Time</th>
            <th>Pace (min/${unit})</th>
            <th>Mean Pace (min/${unit})</th>
            <th>Diff (min)</th>
            <th>Speed (${unit}/h)</th>
        </tr>`;

    const distanceInKm = convertToKm(distance, unit);
    const paceInKm = time / distanceInKm; // Pace in min/km
    const speedInKm = 60 / paceInKm; // Speed in km/h

    // **Advanced Mode**: Use splitTimes to display elevation-dependent splits
    let cumulativeDistance = 0;
    let cumulativeTime = 0;
    let splitPace, splitSpeed, spitPaceAlt, splitSpeedAlt, diff;

    splits.forEach(split => {
        const { splitNumber, splitDistance, splitTime } = split;

        cumulativeTime += splitTime;

        if (splitDistance >= 0.99) {
            cumulativeDistance += 1.00;
            splitPace = 60 * splitTime / 1.00; // Pace in min/km
            splitSpeed = 60 * 1.00 / splitTime; // Speed inlet 
            splitPaceAlt = splitPace * (alternateUnit === 'mi' ? 1.60934 : 1.852);
            splitSpeedAlt = splitSpeed * (unit === 'nm' ? 0.539957 : 0.621371);
        } else {
            cumulativeDistance += splitDistance;
            splitPace = 60 * splitTime / splitDistance; // Pace in min/km
            splitSpeed = 60 * splitDistance / splitTime; // Speed inlet 
            splitPaceAlt = splitPace * (alternateUnit === 'mi' ? 1.60934 : 1.852);
            splitSpeedAlt = splitSpeed * (unit === 'nm' ? 0.539957 : 0.621371);
        }

        if ((splitPace - averagePace) < 0) {
            diff = "-" + formatTime(Math.round(averagePace) - Math.round(splitPace));
        } else {
            diff = formatTime(Math.round(splitPace) - Math.round(averagePace));
        }

        tbody.innerHTML += `
            <tr>
                <td>${cumulativeDistance.toFixed(2)} ${unit}</td>
                <td>${formatTime(cumulativeTime * 60)}</td>
                <td>${formatTime(splitPace)}</td>
                <td>${formatTime(averagePace)}</td>
                <td>${diff}</td>
                <td>${splitSpeed.toFixed(2)}</td>
            </tr>`;
        // Access other properties if needed
    });
}


////////////////////////////   ADVANCED MODE   ////////////////////////////

// Toggle Advanced Mode
document.getElementById('advancedMode').addEventListener('change', function () {
    if (this.checked) {
        document.getElementById('fileUploadGroup').style.display = 'block';  // Show file upload
        document.getElementById('distanceGroup').style.display = 'none';     // Hide distance input
        document.getElementById('paceGroup').style.display = 'none';     // Hide pace input
    } else {
        document.getElementById('fileUploadGroup').style.display = 'none';   // Hide file upload
        document.getElementById('distanceGroup').style.display = 'block';    // Show distance input
        document.getElementById('paceGroup').style.display = 'block';     // Hide pace input
    }
});


function advancedCalculation(time, unit) {
    const fileInput = document.getElementById('activity-file');
    if (fileInput.files.length === 0) {
        alert('Please select a GPX file to upload.');
        return;
    }

    const file = fileInput.files[0];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'gpx') {
        // Parse the GPX file and proceed with calculations in the callback
        parseGPXFile(file, function(data) {
            const { totalDistance, rawDistanceData, rawElevationData } = data;

            // Perform calculations and plotting here

            // Smooth the elevation data
            const windowSizeElevation = 5;
            const smoothedElevationData = smoothData(rawElevationData, windowSizeElevation);

            // Resample the data
            const resampleInterval = 10; // every 10 meters
            const { resampledDistanceData, resampledElevationData } = resampleData(
                rawDistanceData,
                smoothedElevationData,
                resampleInterval
            );

            // Calculate grade
            const gradeData = [];
            for (let i = 1; i < resampledDistanceData.length; i++) {
                const deltaElevation = resampledElevationData[i] - resampledElevationData[i - 1];
                const deltaDistance = resampledDistanceData[i] - resampledDistanceData[i - 1];

                if (deltaDistance < 1e-5) {
                    gradeData.push(0);
                } else {
                    const grade = (deltaElevation / deltaDistance) * 100; // Grade in %
                    gradeData.push(grade);
                }
            }

            // Adjust arrays to match lengths
            const adjustedDistanceData = resampledDistanceData.slice(1);

            // Smooth the grade data
            const windowSizeGrade = 5;
            const smoothedGradeData = smoothData(gradeData, windowSizeGrade);

            // Cap unrealistic grade values
            const cappedGradeData = smoothedGradeData.map(grade => {
                if (grade > 30) return 30;
                if (grade < -30) return -30;
                return grade;
            });

            // Compute Δx_i (distance intervals in km)
            const deltaDistances = [];
            for (let i = 1; i < adjustedDistanceData.length; i++) {
                const deltaX = (adjustedDistanceData[i] - adjustedDistanceData[i - 1]) / 1000; // Convert to km
                deltaDistances.push(deltaX);
            }

            // Convert distance to kilometers
            const distanceDataKm = adjustedDistanceData.map(dist => dist / 1000);

            // Display charts
            displayElevationChart(distanceDataKm, resampledElevationData.slice(1));
            displayGradeChart(distanceDataKm, cappedGradeData);

            // Calculate p_f Numerically
            const k = 3.81; // Grade adjustment constant (adjust as needed)

            let denominatorSum = 0;
            for (let i = 0; i < deltaDistances.length; i++) {
                const grade = cappedGradeData[i];
                const denominator = 1 - k * (grade / 100);

                // Avoid division by zero or negative denominator
                if (denominator <= 0) {
                    console.warn(`Denominator is zero or negative at index ${i}. Adjusting to a small positive number.`);
                    denominatorSum += deltaDistances[i] / 1e-6; // Use a very small number
                } else {
                    denominatorSum += deltaDistances[i] / denominator;
                }
            }

            let pFlat = time / denominatorSum; // p_f in s per km
            pFlat = pFlat / 60; // Convert to min/km

            // console.log(`Total Time: ${time.toFixed(4)} hours`);
            // console.log(`Flat Ground Pace (p_f): ${pFlat.toFixed(2)} min/km`);

            // **Calculate Grade-Adjusted Pace p_g(x)**
            const pgData = [];
            for (let i = 0; i < cappedGradeData.length; i++) {
                const grade = cappedGradeData[i];
                const denominator = 1 - k * (grade / 100);

                // Avoid division by zero or negative denominator
                if (denominator <= 0) {
                    pgData.push(999); // Assign a high pace value
                } else {
                    pgData.push(pFlat / denominator);
                }
            }

            // Plot the grade-adjusted pace chart
            displayGapChart(distanceDataKm.slice(1), pgData);

            // Calculate split times using the separate function
            const splits = calculateSplits(distanceDataKm, pgData, 1); // Split length = 1 km

            // **Plot the Split Histogram**
            displaySplitHistogram(splits, unit);

            const totalTimeInSeconds = time;
            const totalDistanceKm = distanceDataKm[distanceDataKm.length - 1];
            const averagePace = totalTimeInSeconds / totalDistanceKm;

            // Show the reset zoom button
            document.getElementById('reset-zoom-container').style.display = 'block';

            updateResultsTableAdv(time, unit, averagePace, splits);
        });
    } else {
        alert('Unsupported file type. Please upload a GPX file.');
    }
}


function calculateSplits(distanceDataKm, pgData, splitLength = 1) {
    // Define the total number of splits
    const totalSplits = Math.ceil(distanceDataKm[distanceDataKm.length - 1] / splitLength);

    // Initialize array to store split times and distances
    const splits = [];

    // Loop over each split
    for (let splitIndex = 0; splitIndex < totalSplits; splitIndex++) {
        const splitStart = splitIndex * splitLength;
        const splitEnd = (splitIndex + 1) * splitLength;

        let splitTime = 0; // Time for the current split in minutes
        let splitDistance = 0; // Distance for the current split in km

        // Loop over the data points and sum up time intervals within the split
        for (let i = 0; i < distanceDataKm.length - 1; i++) {
            const x0 = distanceDataKm[i];
            const x1 = distanceDataKm[i + 1];

            // Check if the interval [x0, x1] overlaps with the split range
            if (x1 <= splitStart || x0 >= splitEnd) {
                continue; // No overlap
            }

            // Calculate the overlapping segment
            const segmentStart = Math.max(x0, splitStart);
            const segmentEnd = Math.min(x1, splitEnd);
            const deltaX = segmentEnd - segmentStart; // Distance in km

            // Corresponding pace for this interval
            const pace = pgData[i]; // Pace in min/km

            // Time for this segment
            const deltaT = pace * deltaX; // Time in minutes

            splitTime += deltaT;
            splitDistance += deltaX;
        }

        // Store the split time and distance
        splits.push({
            splitNumber: splitIndex + 1,
            splitDistance: splitDistance, // e.g., 1 km or 0.2 km
            splitTime: splitTime // Time in minutes
        });
    }

    return splits;
}


function parseGPXFile(file, callback) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const gpxText = event.target.result;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(gpxText, "application/xml");

        const trackpoints = xmlDoc.getElementsByTagName('trkpt');
        const rawElevationData = [];
        const rawDistanceData = [];

        let totalDistance = 0;
        let prevLat = null;
        let prevLon = null;

        // Extract raw elevation and distance data
        for (let i = 0; i < trackpoints.length; i++) {
            const lat = parseFloat(trackpoints[i].getAttribute('lat'));
            const lon = parseFloat(trackpoints[i].getAttribute('lon'));
            const ele = parseFloat(trackpoints[i].getElementsByTagName('ele')[0].textContent);

            if (prevLat !== null && prevLon !== null) {
                const segmentDistance = calculateDistance(prevLat, prevLon, lat, lon);
                totalDistance += segmentDistance;
                rawDistanceData.push(totalDistance); // In meters
            } else {
                rawDistanceData.push(0); // Start at distance 0 meters
            }

            rawElevationData.push(ele); // In meters

            prevLat = lat;
            prevLon = lon;
        }

        // Return the extracted data via callback
        callback({
            totalDistance,
            rawDistanceData,
            rawElevationData
        });
    };
    reader.readAsText(file);
}


function calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula
    const R = 6371e3; // Earth radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return distance; // in meters
}


function calculateGrade(distanceData, elevationData, segmentLength) {
    const gradeData = [];
    const segmentDistances = [];
    const segmentElevations = [];

    for (let i = 0; i < distanceData.length; i++) {
        if (i === 0 || distanceData[i] - segmentDistances[segmentDistances.length - 1] >= segmentLength / 1000) {
            segmentDistances.push(distanceData[i]);
            segmentElevations.push(elevationData[i]);

            if (segmentDistances.length > 1) {
                const deltaElevation = segmentElevations[segmentElevations.length - 1] - segmentElevations[segmentElevations.length - 2];
                const deltaDistance = (segmentDistances[segmentDistances.length - 1] - segmentDistances[segmentDistances.length - 2]) * 1000; // km to m

                const grade = (deltaElevation / deltaDistance) * 100;
                gradeData.push(grade);
            }
        }
    }

    return { segmentDistances: segmentDistances.slice(1), gradeData }; // Exclude the first point
}


function smoothData(data, windowSize) {
    const smoothedData = [];
    const halfWindow = Math.floor(windowSize / 2);

    for (let i = 0; i < data.length; i++) {
        let sum = 0;
        let count = 0;

        for (let j = i - halfWindow; j <= i + halfWindow; j++) {
            if (j >= 0 && j < data.length) {
                sum += data[j];
                count++;
            }
        }

        smoothedData.push(sum / count);
    }

    return smoothedData;
}


function resampleData(distanceData, elevationData, interval) {
    const resampledDistanceData = [];
    const resampledElevationData = [];

    const totalDistance = distanceData[distanceData.length - 1];

    for (let d = 0; d <= totalDistance; d += interval) {
        // Find the index of the first distance greater than or equal to d
        let index = distanceData.findIndex(dist => dist >= d);
        if (index === -1) {
            index = distanceData.length - 1;
        }

        resampledDistanceData.push(d);
        resampledElevationData.push(elevationData[index]);
    }

    return { resampledDistanceData, resampledElevationData };
}


function displayElevationChart(distanceData, elevationData, gradeData) {
    const ctx = document.getElementById('elevation-chart').getContext('2d');

    // Destroy existing chart instance if it exists
    if (window.elevationChart) {
        window.elevationChart.destroy();
    }

    const initialMin = 0; // Starting distance (usually 0 km)
    const initialMax = distanceData[distanceData.length - 1]; // Ending distance based on your data

    window.elevationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: distanceData,
            datasets: [
                {
                    label: 'Elevation (m)',
                    data: elevationData,
                    borderColor: '#3e95cd',
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 2,
                    tension: 0.1,
                    yAxisID: 'y',
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    min: initialMin,
                    max: initialMax,
                    title: {
                        display: true,
                        text: 'Distance (km)',
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10,
                    },
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Elevation (m)',
                    },
                },
            },
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,       // Enable panning
                        mode: 'x',           // Allow panning in the x-direction
                        modifierKey: null,   // No modifier key required
                        threshold: 0,        // Minimum distance for panning to start
                        rangeMin: {
                            x: null,         // No minimum limit
                        },
                        rangeMax: {
                            x: null,         // No maximum limit
                        },
                    },
                    zoom: {
                        wheel: {
                            enabled: true,
                            speed: 0.05,
                        },
                        pinch: {
                            enabled: true,
                            speed: 0.05,
                        },
                        mode: 'x',
                        limits: {
                            x: {
                                min: 'original',
                                max: 'original',
                                minRange: 0.1,
                            },
                        },
                    },
                },
            }, 
        },
    });
}


function displayGradeChart(distanceData, gradeData) {
    const ctx = document.getElementById('grade-chart').getContext('2d');

    // Destroy existing chart instance if it exists
    if (window.gradeChart) {
        window.gradeChart.destroy();
    }

    const initialMin = 0; // Starting distance (usually 0 km)
    const initialMax = distanceData[distanceData.length - 1]; // Ending distance based on your data

    window.gradeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: distanceData,
            datasets: [
                {
                    label: 'Grade (%)',
                    data: gradeData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 2,
                    tension: 0.1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    min: initialMin,
                    max: initialMax,
                    title: {
                        display: true,
                        text: 'Distance (km)',
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10,
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Grade (%)',
                    },
                },
            },
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,       // Enable panning
                        mode: 'x',           // Allow panning in the x-direction
                        modifierKey: null,   // No modifier key required
                        threshold: 0,        // Minimum distance for panning to start
                        rangeMin: {
                            x: null,         // No minimum limit
                        },
                        rangeMax: {
                            x: null,         // No maximum limit
                        },
                    },
                    zoom: {
                        wheel: {
                            enabled: true,
                            speed: 0.05,
                        },
                        pinch: {
                            enabled: true,
                            speed: 0.05,
                        },
                        mode: 'x',
                        limits: {
                            x: {
                                min: 'original',
                                max: 'original',
                                minRange: 0.1,
                            },
                        },
                    },
                },
            },            
        },
    });
}


function displayGapChart(distanceData, gapData) {
    const ctx = document.getElementById('gap-chart').getContext('2d');

    if (window.gapChart) {
        window.gapChart.destroy();
    }

    const initialMin = 0; // Starting distance (usually 0 km)
    const initialMax = distanceData[distanceData.length - 1]; // Ending distance based on your data

    window.gapChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: distanceData,
            datasets: [{
                label: 'Grade-Adjusted Pace (min/km)',
                data: gapData,
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                fill: false,
                pointRadius: 0,
                borderWidth: 2,
                tension: 0.1,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    min: initialMin,
                    max: initialMax,
                    title: {
                        display: true,
                        text: 'Distance (km)',
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10,
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Grade-adjusted Pace (min/km)',
                    },
                },
            },
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,       // Enable panning
                        mode: 'x',           // Allow panning in the x-direction
                        modifierKey: null,   // No modifier key required
                        threshold: 0,        // Minimum distance for panning to start
                        rangeMin: {
                            x: null,         // No minimum limit
                        },
                        rangeMax: {
                            x: null,         // No maximum limit
                        },
                    },
                    zoom: {
                        wheel: {
                            enabled: true,
                            speed: 0.05,
                        },
                        pinch: {
                            enabled: true,
                            speed: 0.05,
                        },
                        mode: 'x',
                        limits: {
                            x: {
                                min: 'original',
                                max: 'original',
                                minRange: 0.1,
                            },
                        },
                    },
                },
            },           
        },
    });
}


function displaySplitHistogram(splits, unit) {
    // Prepare labels and data
    const labels = splits.map(split => `${split.splitNumber}`);
    const data = splits.map(split => {
        // Calculate pace: min/km
        return split.splitDistance > 0 ? split.splitTime / split.splitDistance : 0;
    });

    const ctx = document.getElementById('split-histogram-chart').getContext('2d');

    // Destroy existing chart instance if it exists to prevent duplication
    if (window.splitHistogramChart) {
        window.splitHistogramChart.destroy();
    }

    // Create the histogram chart
    window.splitHistogramChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Split Pace (min/${unit})`,
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                // Ensure bars take full width without spacing
                barPercentage: 1.0,
                categoryPercentage: 1.0,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Grade-Adjusted Splits'
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const pace = context.parsed.y;
                            return ` Pace: ${formatTime(60 * pace)} min/${unit}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Splits'
                    },
                    grid: {
                        display: false
                    },
                    // Remove padding around bars
                    offset: false,
                },
                y: {
                    title: {
                        display: true,
                        text: 'Pace (min/km)'
                    },
                    beginAtZero: true,
                    grid: {
                        display: true
                    }
                }
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            elements: {
                bar: {
                    borderSkipped: false, // Ensure borders are drawn on all sides
                }
            }
        }
    });
}


function syncZoomPan({ chart }) {
    // Get the scales of the chart that triggered the event
    const sourceChart = chart;
    const targetChart = chart === window.elevationChart ? window.gradeChart : window.elevationChart;

    if (targetChart) {
        // Get the x-axis scale limits from the source chart
        const sourceXAxis = sourceChart.scales.x;
        const newMin = sourceXAxis.min;
        const newMax = sourceXAxis.max;

        // Update the x-axis scale limits of the target chart
        targetChart.scales.x.options.min = newMin;
        targetChart.scales.x.options.max = newMax;
        targetChart.update('none'); // Update without animation
    }
}


document.getElementById('resetZoomBtn').addEventListener('click', function () {
    window.elevationChart.resetZoom();
    window.gradeChart.resetZoom();
});








