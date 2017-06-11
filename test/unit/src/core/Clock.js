/**
 * @author simonThiele / https://github.com/simonThiele
 */

QUnit.module( "Clock" );

function mockPerformance() {
	self.performance = {
		deltaTime: 0,

		next: function( delta ) {
			this.deltaTime += delta;
		},

		now: function() {
			return this.deltaTime;
		}
	};
}

QUnit.test( "clock with performance", function( assert ) {
	mockPerformance();

	var clock = new THREE.Clock( true );

	clock.start();

	self.performance.next( 123 );
	assert.numEqual( clock.getElapsedTime(), 0.123, "okay" );

	self.performance.next( 100 );
	assert.numEqual( clock.getElapsedTime(), 0.223, "okay" );

	clock.pause();

	self.performance.next( 1000 );
	assert.numEqual( clock.getElapsedTime(), 0.223, "Don't update time if the clock is paused" );
});
