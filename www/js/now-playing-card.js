class NowPlayingPoster extends HTMLElement {

	processEntity(hass, entityId) {
		const state = hass.states[entityId];
		const stateStr = state ? state.state : 'unavailable';

		if (state) {

			const moviePoster = state.attributes.entity_picture;

			if (["playing", "on", "paused"].indexOf(stateStr) > -1 && moviePoster) {	// Poster is available
				return moviePoster;
			}
			else	// Poster is unavailable
			{
				return -1;
			}
		}
		else
		{
			this.content.innerHTML = `
			<!-- now playing card ${entityId} not playing -->
			`;
		}
	}

	
	processEntites(hass, entites, idleDevice = false) {
		const entity = entites.shift();
		const processedValue = this.processEntity(hass, entity);
		let posterUrl;

		if(processedValue === -1) {	// No poster but the device is on
			idleDevice = true
			posterUrl = null;
		}

		if(!posterUrl && entites.length)	// No poster but there are still some more entites to check
			return this.processEntites(hass, entites, idleDevice);

		// You get here if the current device has poster or all of entites were checked and one of them was on

		if(!posterUrl)
			posterUrl = this.config.off_image;

		if(posterUrl) {
			const objectFit = this.config.obejctFit ?? "contain";
			this.content.innerHTML = `
			<img src="${posterUrl}" width=100% align="center" style="width: 100%; object-fit: ${objectFit}">
			`;
		}
	}

	set hass(hass) {
		if (!this.content) {
			const card = document.createElement('ha-card');
			const div = document.createElement('div');
			div.style = "width: 100%; height: 100%";
			this.content = div;
			card.appendChild(this.content);
			card.style = "background: none;";
			this.appendChild(card);
		}

		this.processEntites(hass, this.config.entities);
	}

	setConfig(config) {
		if (!config.entities) {
			throw new Error('You need to define an entity');
		}
		this.config = config;
	}

	// The height of your card. Home Assistant uses this to automatically
	// distribute all cards over the available columns.
	getCardSize() {
		return 3;
	}
}

customElements.define('now-playing-poster', NowPlayingPoster);