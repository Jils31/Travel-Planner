class MapService {
    static async getApiKey() {
        try {
            const response = await fetch('/api/maps-key');
            if (!response.ok) {
                throw new Error('Failed to fetch API key');
            }
            const data = await response.json();
            return data.apiKey;
        } catch (error) {
            console.error('Error fetching API key:', error);
            throw error;
        }
    }

    static async loadGoogleMaps() {
        try {
            const apiKey = await this.getApiKey();
            return new Promise((resolve, reject) => {
                if (window.google && window.google.maps) {
                    // If already loaded, resolve immediately
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
                script.async = true;
                script.defer = true;

                script.onload = () => {
                    console.log('Google Maps loaded successfully.');
                    resolve();
                };
                script.onerror = () => reject(new Error('Failed to load Google Maps'));

                document.head.appendChild(script);
            });
        } catch (error) {
            console.error('Error loading Google Maps:', error);
        }
    }
}

// Initialize the CityMap class after Google Maps is loaded
function initMap() {
    new CityMap();
}

class CityMap {
    constructor() {
        this.map = null;
        this.geocoder = null;
        this.marker = null;

        // DOM elements
        this.searchInput = document.querySelector('#mapsearch');
        this.searchButton = document.getElementById('search-button');
        this.errorDiv = document.getElementById('error-message');

        // Initialize the map
        this.initMap();
        
        // Bind event listeners
        this.bindEvents();
    }

    initMap() {
        // Default center (New York)
        const defaultLocation = { lat: 40.7128, lng: -74.0060 };

        // Ensure Google Maps is loaded before creating map instance
        if (!window.google || !window.google.maps) {
            console.error('Google Maps library is not loaded.');
            return;
        }

        // Create map instance
        this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: defaultLocation,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true
        });

        // Initialize geocoder
        this.geocoder = new google.maps.Geocoder();
    }

    bindEvents() {
        // Add click event listener to search button
        this.searchButton.addEventListener('click', () => this.searchCity());
        
        // Add enter key event listener to input
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchCity();
            }
        });
    }

    searchCity() {
        const address = this.searchInput.value;
        
        if (!address) {
            this.showError('Please enter a city name');
            return;
        }

        this.geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK') {
                this.hideError();
                
                // Get the location
                const location = results[0].geometry.location;
                
                // Center map
                this.map.setCenter(location);
                
                // Remove existing marker if any
                if (this.marker) {
                    this.marker.setMap(null);
                }
                
                // Add new marker
                this.marker = new google.maps.Marker({
                    map: this.map,
                    position: location,
                    animation: google.maps.Animation.DROP
                });

                // Set appropriate zoom level
                this.map.setZoom(12);
            } else {
                this.showError('City not found. Please try again.');
            }
        });
    }

    showError(message) {
        this.errorDiv.textContent = message;
        this.errorDiv.style.display = 'block';
    }

    hideError() {
        this.errorDiv.style.display = 'none';
    }
}

// Load Google Maps dynamically before initializing the map
window.addEventListener("load", async () => {
    await MapService.loadGoogleMaps();
});
