const destinations = {
  paris: {
      title: 'Paris, France',
      keywords: 'paris france eiffel tower louvre notre dame champs elysées arc de triomphe montmartre sacré coeur seine river versailles latin quarter musée d'
  },
  tokyo: {
      title: 'Tokyo, Japan',
      keywords: 'tokyo japan shibuya shinjuku landmarks'
  },
  dubai: {
      title: 'Dubai, UAE',
      keywords: 'dubai uae burj khalifa burj al arab'
  },
  vancouver: {
      title: 'Vancouver, Canada',
      keywords: 'vancouver canada nature mountains cityscape'
  },
  zermatt: {
      title: 'Zermatt, Switzerland',
      keywords: 'zermatt switzerland matterhorn gornergrat glacier paradise schwarzsee riffelsee sunnegga rotthorn matterhorn museum bahnhofstrasse hike zermatt gorner glacier stellisee ski resort matterhorn express findeln kirchbrücke bridge'
  },
  maldives: {
      title: 'Maldives, South Asia',
      keywords: 'Maldives Landscape Beach Sea'
  },
  bali: {
      title: 'Bali, Indonesia',
      keywords: 'Bali Indonesia Coast Ocean Waves Building'
  },
  santorini: {
      title: 'Santorini, Greece',
      keywords: 'Architectural Dome Cityscape Greece'
  },
  edinburgh: {
      title: 'Edinburgh, Scotland',
      keywords: 'Edinburgh Cityscape Scotland'
  },
  italy: {
      title: 'Italy, Europe',
      keywords: 'Italy Roman Empire Skyline'
  }
};

const DestinationService = {
  async fetchDestinationImages(keywords) {
      try {
          const response = await fetch(`/api/destination-images?query=${encodeURIComponent(keywords)}`);
          if (!response.ok) {
              throw new Error('Failed to fetch images');
          }
          return await response.json();
      } catch (error) {
          console.error('Error fetching images:', error);
          throw error;
      }
  }
};

const ModalUI = {
  elements: {
      modal: document.getElementById('imageModal'),
      spinner: document.getElementById('loadingSpinner'),
      title: document.getElementById('modalTitle'),
      imagesContainer: document.getElementById('modalImages')
  },

  show() {
      this.elements.modal.classList.remove('hidden');
  },

  hide() {
      this.elements.modal.classList.add('hidden');
  },

  showSpinner() {
      this.elements.spinner.classList.remove('hidden');
  },

  hideSpinner() {
      this.elements.spinner.classList.add('hidden');
  },

  setTitle(title) {
      this.elements.title.textContent = title;
  },

  renderImages(images, destination) {
      this.elements.imagesContainer.innerHTML = images.map(image => `
          <div class="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg">
              <img 
                  src="${image.urls.regular}" 
                  alt="${image.alt_description || destinations[destination].title}"
                  class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  loading="lazy"
              >
          </div>
      `).join('');
  },

  showError() {
      this.elements.imagesContainer.innerHTML = 
          '<p class="text-red-500">Error loading images. Please try again later.</p>';
  }
};

async function openModal(destination) {
  ModalUI.show();
  ModalUI.showSpinner();
  ModalUI.setTitle(destinations[destination].title);

  try {
      const images = await DestinationService.fetchDestinationImages(
          destinations[destination].keywords
      );
      ModalUI.renderImages(images, destination);
  } catch (error) {
      console.error('Error:', error);
      ModalUI.showError();
  } finally {
      ModalUI.hideSpinner();
  }
}

function closeModal() {
  ModalUI.hide();
}

// Event Listeners
document.getElementById('imageModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
      closeModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
      closeModal();
  }
});