'use strict';

// // prettier-ignore
// const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// const form = document.querySelector('.form');
// const containerWorkouts = document.querySelector('.workouts');
// const inputType = document.querySelector('.form__input--type');
// const inputDistance = document.querySelector('.form__input--distance');
// const inputDuration = document.querySelector('.form__input--duration');
// const inputCadence = document.querySelector('.form__input--cadence');
// const inputElevation = document.querySelector('.form__input--elevation');

// // get position:
// if (navigator.geolocation) {
//   navigator.geolocation.getCurrentPosition(
//     // Load map:
//     function (position) {
//       console.log(position);
//       const { latitude, longitude } = position.coords;
//       console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

//       const coords = [latitude, longitude];

//       map = L.map('map').setView(coords, 13);

//       L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution:
//           '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//       }).addTo(map);

//       // clickable the map to show marker whenever we click:
//       // prettier-ignore
//       map.on('click', function (mapE) { // mapE gives us data(coorde and other things)
//         mapEvent = mapE;
//         // render the form
//         form.classList.remove('hidden');
//         inputDistance.focus();
//       });
//     },
//     function () {
//       alert('Could not get your position');
//     }
//   );
// }

// // render form
// form.addEventListener('submit', function (e) {
//   e.preventDefault();

//   // clear fields:
//   inputDistance.value =
//     inputDuration.value =
//     inputCadence.value =
//     inputElevation.value =
//       '';

//   // display marker:
//   // console.log(mapEvent);
//   const { lat, lng } = mapEvent.latlng;

//   L.marker([lat, lng])
//     .addTo(map)
//     .bindPopup(
//       L.popup({
//         maxWith: 250,
//         minWith: 100,
//         autoClose: false,
//         closeOnClick: false,
//         className: 'running-popup',
//       })
//     )
//     .setPopupContent('Workout')
//     .openPopup();
// });

// // change the input form by change the select Type
// inputType.addEventListener('change', function () {
//   inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
//   inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
// });

////////////////////////////////////////////////////////////////////////////
// Refactoring with OOP

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, duration, distance) {
    this.coords = coords;
    this.duration = duration;
    this.distance = distance;
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // example: Running on April 14
    this.description = `${this.type[0].toUpperCase() + this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Runnig extends Workout {
  type = 'running';

  constructor(coords, duration, distance, cadence) {
    super(coords, duration, distance);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, duration, distance, elevationGain) {
    super(coords, duration, distance);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// just for check if class and child classes work correctly:
const run1 = new Runnig([12, -5], 34, 532, 254);
const cycle1 = new Cycling([32, -75], 56, 625, 125);
console.log(run1, cycle1);

///////////////////////////////////////
// APPLICATION ARCHITECTURE

// elements:
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  constructor() {
    // get user's position:
    this._getPosition();

    // get data from localStorage:
    this._getLocalStorage();

    // attach event handlers:
    inputType.addEventListener('change', this._toggleElevationFeild);
    form.addEventListener('submit', this._newWorkout.bind(this)); // beacuse you remmeber that "this" keyword in addEventListener indicate to the element that is attached to addEventListener
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this), // beacuse loadMap here is as a callback fucntion, and callback function is basically a regular function which has not "this" keyword-it's undefind. so we bind to the this(the object)
        function () {
          alert('Could not get your position');
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work => this._renderWorkoutMarker(work));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    // clear fields:
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    // hide form:
    form.style.display = 'none'; // 2. so fist immedietly hide it,
    form.classList.add('hidden'); // 1. beacuse hidden class has animation with itself...
    setTimeout(() => (form.style.display = 'grid'), 1000); // 3. and beacuse animiation duration is 1000ms, we wait for it to finish, then bring the display back to grid.
  }

  _toggleElevationFeild() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();

    // small helper functions:
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);
    const allNumbers = (...inputs) => inputs.every(inp => Number.isFinite(inp));

    // get data from form:
    let workout;
    const type = inputType.value;
    const duration = +inputDuration.value;
    const distance = +inputDistance.value;
    const { lat, lng } = this.#mapEvent.latlng;

    // if workout runnig, create a new Running object:
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // check if data is valid:
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !allNumbers(duration, distance, cadence) ||
        !allPositive(duration, distance, cadence)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Runnig([lat, lng], distance, duration, cadence);
    }

    // if workout cycling, create a new Cycling object:
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      // check if data is valid:
      if (
        !allNumbers(duration, distance, elevation) ||
        !allPositive(duration, distance)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // add new object to workout array:
    this.#workouts.push(workout);
    // console.log(this.#workouts);

    // render workout on map as marker:
    this._renderWorkoutMarker(workout);

    // render workout on list:
    this._renderWorkoutBox(workout);

    // hide form + clear fields:
    this._hideForm();

    // set local storage to all workouts:
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWith: 250,
          minWith: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkoutBox(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id=${workout.id}>
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.type === 'running') {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
      `;
    }

    if (workout.type === 'cycling') {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🏔️</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
      `;
    }

    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    console.log(workoutEl);

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animiation: true,
      pan: {
        duration: 1,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    // console.log(data);

    if (!data) return;

    this.#workouts = data;

    // show workout boxes: (in _loadMap method, we will show workout markers)
    this.#workouts.forEach(work => this._renderWorkoutBox(work));
  }

  // it works in inspect(app.reset())
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
