/**
 * @author alteredq / http://alteredqualia.com/
 * @author Lewy Blue https://github.com/looeee
 */

THREE.Car = function () {

	this.maxSpeed = 2200;
	this.maxSpeedReverse = - 1500;

	this.maxSteeringRotation = 0.6;

	this.accelerationForwards = 1500;
	this.accelerationReverse = 1100;

	this.steeringWheelSpeed = 1.5;

	this.deceleration = 750;

	this.turningRadiusRatio = 0.0023;

	// ket used to control car - by default the arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	var speed = 0;
	var acceleration = 0;

	var wheelOrientation = 0;
	var carOrientation = 0;

	var root = null;

	var frontLeftWheel = null;
	var frontRightWheel = null;
	var backLeftWheel = null;
	var backRightWheel = null;

	var wheelDiameter = 1;

	var loaded = false;

	var controls = {

		moveForward: false,
		moveBackward: false,
		moveLeft: false,
		moveRight: false

	};

	var self = this;

	function onKeyDown( event ) {

		switch ( event.keyCode ) {

			case self.keys.UP: controls.moveForward = true; break;

			case self.keys.DOWN: controls.moveBackward = true; break;

			case self.keys.LEFT: controls.moveLeft = true; break;

			case self.keys.RIGHT: controls.moveRight = true; break;

		}

	}

	function onKeyUp( event ) {

		switch ( event.keyCode ) {

			case self.keys.UP: controls.moveForward = false; break;

			case self.keys.DOWN: controls.moveBackward = false; break;

			case self.keys.LEFT: controls.moveLeft = false; break;

			case self.keys.RIGHT: controls.moveRight = false; break;

		}

	}

	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	this.dispose = function () {

		document.removeEventListener( 'keydown', onKeyDown, false );
		document.removeEventListener( 'keyup', onKeyUp, false );

	}

	this.update = function ( delta ) {

		if ( ! loaded ) return;

		if ( controls.moveForward ) {

			speed = THREE.Math.clamp( speed + delta * this.accelerationForwards, this.maxSpeedReverse, this.maxSpeed );
			acceleration = THREE.Math.clamp( acceleration + delta, - 1, 1 );

		}

		if ( controls.moveBackward ) {


			speed = THREE.Math.clamp( speed - delta * this.accelerationReverse, this.maxSpeedReverse, this.maxSpeed );
			acceleration = THREE.Math.clamp( acceleration - delta, - 1, 1 );

		}

		if ( controls.moveLeft ) {

			wheelOrientation = THREE.Math.clamp( wheelOrientation + delta * this.steeringWheelSpeed, - this.maxSteeringRotation, this.maxSteeringRotation );

		}

		if ( controls.moveRight ) {

			wheelOrientation = THREE.Math.clamp( wheelOrientation - delta * this.steeringWheelSpeed, - this.maxSteeringRotation, this.maxSteeringRotation );

		}

		// speed decay

		if ( ! ( controls.moveForward || controls.moveBackward ) ) {

			if ( speed > 0 ) {

				var k = exponentialEaseOut( speed / this.maxSpeed );

				speed = THREE.Math.clamp( speed - k * delta * this.deceleration, 0, this.maxSpeed );
				acceleration = THREE.Math.clamp( acceleration - k * delta, 0, 1 );

			} else {

				var k = exponentialEaseOut( speed / this.maxSpeedReverse );

				speed = THREE.Math.clamp( speed + k * delta * this.accelerationReverse, this.maxSpeedReverse, 0 );
				acceleration = THREE.Math.clamp( acceleration + k * delta, - 1, 0 );

			}

		}

		// steering decay

		if ( ! ( controls.moveLeft || controls.moveRight ) ) {

			if ( wheelOrientation > 0 ) {

				wheelOrientation = THREE.Math.clamp( wheelOrientation - delta * this.steeringWheelSpeed, 0, this.maxSteeringRotation );

			} else {

				wheelOrientation = THREE.Math.clamp( wheelOrientation + delta * this.steeringWheelSpeed, - this.maxSteeringRotation, 0 );

			}

		}

		var forwardDelta = speed * delta;

		carOrientation += ( forwardDelta * this.turningRadiusRatio ) * wheelOrientation;

		// movement of car

		root.position.x += Math.sin( carOrientation ) * forwardDelta;
		root.position.z += Math.cos( carOrientation ) * forwardDelta;

		// angle of car

		root.rotation.y = carOrientation;

		// wheels rolling

		var angularSpeedRatio = 2 / wheelDiameter;

		var wheelDelta = forwardDelta * angularSpeedRatio;

		frontLeftWheel.rotation.x += wheelDelta;
		frontRightWheel.rotation.x += wheelDelta;
		backLeftWheel.rotation.x += wheelDelta;
		backRightWheel.rotation.x += wheelDelta;

		// front wheels steering

		frontLeftWheel.rotation.y = wheelOrientation;
		frontRightWheel.rotation.y = wheelOrientation;

	};

	this.setModel = function ( model ) {

		root = model;
		loaded = true;

		frontLeftWheel = model.getObjectByName( 'wheelFrontLeft' );
		frontRightWheel = model.getObjectByName( 'wheelFrontRight' );
		backLeftWheel = model.getObjectByName( 'wheelRearLeft' );
		backRightWheel = model.getObjectByName( 'wheelRearRight' );

		computeWheelDiameter();

	};

	function computeWheelDiameter() {

		var bb = new THREE.Box3().setFromObject( frontLeftWheel );

		var size = bb.getSize();

		// assumes wheel are taller than they are wide, and that the model has
		// been scaled uniformly, if at all
		wheelDiameter = Math.max( size.x, size.y, size.z ) * root.scale.x;

	}

	function exponentialEaseOut( k ) {

		return k === 1 ? 1 : - Math.pow( 2, - 10 * k ) + 1;

	}

};
