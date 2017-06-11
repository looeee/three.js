function Clock( autostart ) {

  // Keep track of time when pause() was called
	let _pauseTime;

  // Keep track of time when delta was last checked
	let _lastDelta = 0;

  // Hold the time when start() was called
  // There is no point in exposing this as it's essentially a random number
  // and will be different depending on whether performance.now or Date.now is used
	let _startTime = 0;

	this.running = false;
	this.paused = false;

  // The scale at which the time is passing. This can be used for slow motion effects.
	let _timeScale = 1.0;
  // Keep track of scaled time across scale changes
	let _totalTimeAtLastScaleChange = 0;
	let _timeAtLastScaleChange = 0;

	Object.defineProperties( this, {

		now: {

			get() {

				return ( performance || Date ).now() / 1000;

			}

		},

		timeScale: {

			get() {

				return _timeScale;

			},

			set( value ) {

				_totalTimeAtLastScaleChange = this.totalTime;

				// this may need to be changed
				_timeAtLastScaleChange = ( this.running ) ? this.now : 0;

				_timeScale = value;

			},

		},

		unscaledTotalTime: {

			get() {

				if ( ! this.running && autostart ) this.start();

				return ( this.running ) ? this.now - _startTime : 0;

			},

		},

		totalTime: {

			get() {

				if ( ! this.running && autostart ) this.start();

				const diff = ( this.now - _timeAtLastScaleChange ) * this.timeScale;

				return ( this.running ) ? _totalTimeAtLastScaleChange + diff : 0;

			},

		},

    // Unscaled time since delta was last checked
		unscaledDelta: {

			get() {
				if ( ! this.running && autostart ) this.start();

				const diff = ( this.running ) ? this.now - _lastDelta : 0;
				_lastDelta = ( this.running ) ? this.now : 0;
				return diff;

			},

		},

    // Scaled time since delta was last checked
		delta: {

			get() {

				return this.unscaledDelta * this.timeScale;

			},

		},

	} );

	this.start = function () {

		if ( this.paused ) {

			const diff = ( this.now - _pauseTime );

			_startTime += diff;
			_lastDelta += diff;
			_timeAtLastScaleChange += diff;

		} else if ( ! this.running ) {

			_startTime = _lastDelta = _timeAtLastScaleChange = this.now;

			_totalTimeAtLastScaleChange = 0;

		}

		this.running = true;
		this.paused = false;

	};

  // Reset and stop clock
	this.stop = function () {

		_startTime = 0;
		_totalTimeAtLastScaleChange = 0;

		this.running = false;

	};

	this.pause = function () {

		_pauseTime = this.now;

		this.paused = true;

	};


  // Backwards compatibility with old Clock

	this.getElapsedTime = function () {

		return this.totalTime;

	};

	this.getDelta = function () {

		return this.delta;

	};

}

export { Clock };
