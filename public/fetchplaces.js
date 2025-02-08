const PlacesService = {
  async getGeocode(city) {
      const response = await fetch(`/api/geocode?city=${encodeURIComponent(city)}`);
      if (!response.ok) {
          throw new Error('Failed to fetch geocoding data');
      }
      return response.json();
  },

  async getTouristPlaces(lon, lat) {
      const response = await fetch(`/api/places?lon=${lon}&lat=${lat}`);
      if (!response.ok) {
          throw new Error('Failed to fetch places data');
      }
      return response.json();
  }
};

const PlacesUI = {
  elements: {
      search: document.getElementById('search'),
      activityContainer: document.getElementById('activity-pool'),
      itineraryContainer: document.getElementById('itinerary-timeline')
  },

  showLoading() {
      this.elements.activityContainer.innerHTML = `
          <div class="flex justify-center items-center p-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
      `;
  },

  showError(message) {
      this.elements.activityContainer.innerHTML = `
          <div class="text-center p-4 text-red-400">
              <p>❌ ${message}</p>
          </div>
      `;
  },

  showNoPlaces() {
      this.elements.activityContainer.innerHTML = `
          <div class="text-center p-4 text-neutral-400">
              <p>No tourist places found in this area.</p>
          </div>
      `;
  },

  createPlaceElement(placeName, address) {
      const placeElement = document.createElement('div');
      placeElement.classList.add(
          'bg-neutral-800/50', 'p-4', 'rounded-xl', 'border', 'border-neutral-700/50',
          'backdrop-blur-sm', 'shadow-lg', 'transform', 'transition-all', 'duration-300',
          'hover:bg-neutral-700/50'
      );

      placeElement.innerHTML = `
          <div class="flex justify-between items-start gap-4">
              <div class="flex-1">
                  <h4 class="font-semibold text-lg text-neutral-100">${placeName}</h4>
                  <p class="text-neutral-400 text-sm mt-1">${address}</p>
              </div>
              <button class="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 px-3 py-1.5 rounded-lg 
                         transition-colors flex items-center gap-2 text-sm font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" 
                       fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" 
                       stroke-linejoin="round">
                      <path d="M12 5v14M5 12h14"></path>
                  </svg>
                  Add
              </button>
          </div>
      `;

      const addButton = placeElement.querySelector('button');
      addButton.addEventListener('click', () => this.addToItinerary(placeElement, placeName, address));

      return placeElement;
  },

  displayPlaces(places) {
      this.elements.activityContainer.innerHTML = '';

      if (places.length === 0) {
          this.showNoPlaces();
          return;
      }

      places.forEach(place => {
          const placeName = place.properties.name || 'Unknown Place';
          const address = place.properties.formatted || 'No address available';
          const placeElement = this.createPlaceElement(placeName, address);
          this.elements.activityContainer.appendChild(placeElement);
      });
  },

  addToItinerary(placeElement, placeName, address) {
      // Remove from activity pool with animation
      placeElement.classList.add('opacity-0', 'transform', 'translate-x-full');
      setTimeout(() => placeElement.remove(), 300);

      const itineraryItem = document.createElement('div');
      itineraryItem.classList.add(
          'bg-blue-900/40', 'p-4', 'rounded-xl', 'border', 'border-blue-500/30',
          'text-white', 'mt-3', 'backdrop-blur-sm', 'shadow-lg',
          'transform', 'opacity-0', 'scale-95', 'transition-all', 'duration-300'
      );

      itineraryItem.innerHTML = `
          <div class="flex justify-between items-start gap-4">
              <div class="flex-1">
                  <h4 class="font-semibold text-lg text-blue-100">${placeName}</h4>
                  <p class="text-blue-200/80 text-sm mt-1">${address}</p>
              </div>
              <button onclick="PlacesUI.removeFromItinerary(this.parentElement.parentElement, '${placeName}', '${address}')" 
                      class="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
              </button>
          </div>
      `;

      this.elements.itineraryContainer.appendChild(itineraryItem);

      setTimeout(() => {
          itineraryItem.classList.remove('opacity-0', 'scale-95');
          itineraryItem.classList.add('opacity-100', 'scale-100');
      }, 50);
  },

  removeFromItinerary(itineraryItem, placeName, address) {
      itineraryItem.classList.add('opacity-0', 'scale-95');

      setTimeout(() => {
          itineraryItem.remove();
          const placeElement = this.createPlaceElement(placeName, address);
          this.elements.activityContainer.appendChild(placeElement);

          setTimeout(() => {
              placeElement.classList.remove('opacity-0', 'scale-95');
              placeElement.classList.add('opacity-100', 'scale-100');
          }, 50);
      }, 300);
  }
};

async function getFamousTouristPlaces(city) {
  PlacesUI.showLoading();

  try {
      const geocodeData = await PlacesService.getGeocode(city);

      if (geocodeData.results.length > 0) {
          const { lon, lat } = geocodeData.results[0];
          const placesData = await PlacesService.getTouristPlaces(lon, lat);
          PlacesUI.displayPlaces(placesData.features);
      } else {
          throw new Error('City not found');
      }
  } catch (error) {
      console.error('Error:', error);
      PlacesUI.showError('Error finding places. Please try another city.');
  }
}

// Event Listeners
document.getElementById('search').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
      const city = this.value.trim();
      if (city) {
          getFamousTouristPlaces(city);
      }
  }
});