const prisma = require('./prismaClient');
const axios = require('axios');

module.exports.getAllLocations = async function getAllLocations(userPostalCode) {
    try {
        // 1. Get user coordinates from the provided postal code
        const userCoordinates = await getCoordinatesFromPostalCode(userPostalCode);
        if (!userCoordinates) {
            throw new Error('Invalid user postal code.');
        }

        const { lat: userLat, lon: userLon } = userCoordinates;

        // 2. Fetch all collection points from the database
        const collectionPoints = await prisma.collectionPointLocations.findMany({
            select: {
                id: true,
                name: true,
                location: true,
                postalCode: true,
            },
        });

        // 3. Map collection points to include distances
        const locationsWithDistances = await Promise.all(
            collectionPoints.map(async (point) => {
                const pointCoordinates = await getCoordinatesFromPostalCode(point.postalCode);
                if (pointCoordinates) {
                    const { lat: pointLat, lon: pointLon } = pointCoordinates;
                    let distance = calculateDistance(userLat, userLon, pointLat, pointLon);
                    distance = distance.toFixed(2); 
                    return {
                        id: point.id,
                        name: point.name,
                        location: point.location,
                        postalCode: point.postalCode,
                        distance: parseFloat(distance),
                    };
                } else {
                    return null; // Ignore locations with invalid postal codes
                }
            })
        );

        // 4. Filter out null values and sort by distance
        const sortedLocations = locationsWithDistances
            .filter((location) => location !== null)
            .sort((a, b) => (a.distance - b.distance).toFixed(2));

        // 5. Return sorted locations
        return sortedLocations;
    } catch (error) {
        console.error('Error fetching locations:', error);
        throw error;
    }
};

// Fetch latitude and longitude from postal code using OpenStreetMap API
async function getCoordinatesFromPostalCode(postalCode) {
    try {
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${postalCode}&key=06b5b79b5f754f5daed0f1cf15bfd69a`;
        const response = await axios.get(url);
        const data = response.data;
    
        if (data.results && data.results.length > 0) {
            return {
                lat: parseFloat(data.results[0].geometry.lat),
                lon: parseFloat(data.results[0].geometry.lng),
            };
        }
        return null; // No results found
    } catch (error) {
        console.error('Error fetching coordinates from OpenStreetMap:', error);
        throw error;
    }
}


function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const earthRadiusKm = 6371; // Earth's radius in kilometers

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c; 
}

