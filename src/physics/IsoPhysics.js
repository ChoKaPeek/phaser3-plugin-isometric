import Point3 from '../Point3';
import World from './World';

/**
 * IsoPhysics Physics constructor.
 *
 * @class IsoPhysics
 * @classdesc IsoPhysics Physics
 */
export default class IsoPhysics {
  /**
   * @constructor
   * @param {Phaser.Scene} scene - Reference to the current scene instance.
   */
  constructor(scene) {
    /**
     * @property {Phaser.Scene} scene - Local reference to scene.
     */
    this.scene = scene;

    /**
     * @property {Projector} projector - Local reference to the current projector.
     */
    const pluginKey = this.scene.sys.settings.map.isoPlugin;
    this.projector = this.scene[pluginKey].projector;

    /**
     * @property {World} world - The physics World that gets created on start.
     */
    this.world = new World(this.scene);
  }

  /**
   * Find the distance between two display objects (like Sprites).
   *
   * @method Isometric.IsoPhysics#distanceBetween
   * @param {any} source - The Display Object to test from.
   * @param {any} target - The Display Object to test to.
   * @return {number} The distance between the source and target objects.
   */
  distanceBetween(source, target) {
    this._dx = source.x - target.x;
    this._dy = source.y - target.y;
    this._dz = source.z - target.z;

    return Math.sqrt(this._dx * this._dx + this._dy * this._dy + this._dz * this._dz);
  }

  /**
   * Find the distance between a display object (like a Sprite) and the given x/y coordinates only (ignore z).
   * The calculation is made from the display objects x/y coordinate. This may be the top-left if its anchor hasn't been changed.
   * If you need to calculate from the center of a display object instead use the method distanceBetweenCenters()
   *
   * @method IsoPhysics#distanceToXY
   * @param {any} displayObject - The Display Object to test from.
   * @param {number} x - The x coordinate to test to.
   * @param {number} y - The y coordinate to test to.
   * @return {number} The distance between the object and the x/y coordinates.
   */
  distanceToXY(displayObject, x, y) {
    this._dx = displayObject.x - x;
    this._dy = displayObject.y - y;

    return Math.sqrt(this._dx * this._dx + this._dy * this._dy);
  }

  /**
   * Find the distance between a display object (like a Sprite) and the given x/y/z coordinates.
   * The calculation is made from the display objects x/y/z coordinate. This may be the top-left if its anchor hasn't been changed.
   * If you need to calculate from the center of a display object instead use the method distanceBetweenCenters()
   *
   * @method IsoPhysics#distanceToXYZ
   * @param {any} displayObjectBody - The Display Object to test from.
   * @param {number} x - The x coordinate to test to.
   * @param {number} y - The y coordinate to test to.
   * @param {number} z - The y coordinate to test to
   * @return {number} The distance between the object and the x/y coordinates.
   */
  distanceToXYZ(displayObjectBody, x, y, z) {
    this._dx = displayObjectBody.x - x;
    this._dy = displayObjectBody.y - y;
    this._dz = displayObjectBody.z - z;

    return Math.sqrt(this._dx * this._dx + this._dy * this._dy + this._dz * this._dz);
  }

  /**
   * Find the distance between a display object (like a Sprite) and a Pointer. If no Pointer is given the Input.activePointer is used.
   * The calculation is made from the display objects x/y coordinate. This may be the top-left if its anchor hasn't been changed.
   * If you need to calculate from the center of a display object instead use the method distanceBetweenCenters()
   * The distance to the Pointer is returned in isometric distance.
   *
   * @method IsoPhysics#distanceToPointer
   * @param {any} displayObjectBody - The Display Object to test from.
   * @param {Phaser.Pointer} [pointer] - The Phaser.Pointer to test to. If none is given then Input.activePointer is used.
   * @return {number} The distance between the object and the Pointer.
   */
  distanceToPointer(displayObjectBody, pointer) {
    pointer = pointer || this.scene.input.activePointer;
    var isoPointer = this.projector.unproject(pointer.position, undefined, displayObjectBody.z);
    isoPointer.z = displayObjectBody.z;
    var a = this.anglesToXYZ(displayObjectBody, isoPointer.x, isoPointer.y, isoPointer.z);

    return a.r;
  }

  /**
   * Find the angles in radians between a display object (like a IsoSprite) and the given x/y/z coordinate.
   *
   * @method Phaser.Physics.Isometric.Isometric.IsoPhysics#anglesToXYZ
   * @param {any} displayObjectBody - The Display Object to test from.
   * @param {number} x - The x coordinate to get the angle to.
   * @param {number} y - The y coordinate to get the angle to.
   * @param {number} z - The z coordinate to get the angle to.
   * @return {number} The angle in radians between displayObjectBody.x/y to Pointer.x/y
   */
  anglesToXYZ(displayObjectBody, x, y, z) {
    // Spherical polar coordinates
    var r = this.distanceToXYZ(displayObjectBody, x, y, z);
    var theta = Math.atan2(y - displayObjectBody.y, x - displayObjectBody.x);
    var phi   = Math.acos((z - displayObjectBody.z)/ r);

    return {r:r,theta:theta,phi:phi};
  }

  /**
   * Find the angle in radians between a display object (like a Sprite) and a Pointer, taking their x/y and center into account.
   * This is not the visual angle but the angle in the isometric co-ordinate system.
   *
   * @method Phaser.Physics.Isometric.IsoPhysics#angleToPointer
   * @param {any} displayObjectBody - The Display Object to test from.
   * @param {Phaser.Pointer} [pointer] - The Phaser.Pointer to test to. If none is given then Input.activePointer is used.
   * @return {number} The (isometric) angle in radians between displayObjectBody.x/y to Pointer.x/y.
   */
  angleToPointer(displayObjectBody, pointer) {
    pointer = pointer || this.scene.input.activePointer;
    var isoPointer = this.projector.unproject(pointer.position, undefined, displayObjectBody.z);
    isoPointer.z = displayObjectBody.z;
    var a = this.anglesToXYZ(displayObjectBody, isoPointer.x, isoPointer.y, isoPointer.z);

    return a.theta;
  }

  /**
   * Given the angle (in degrees) and speed calculate the velocity and return it as a Point object, or set it to the given point object.
   * One way to use this is: velocityFromAngle(angle, 200, sprite.velocity) which will set the values directly to the sprites velocity and not create a new Point object.
   *
   * @method Phaser.Physics.IsoPhysics#velocityFromAngle
   * @param {number} theta - The angle in radians for x,y in the isometric co-ordinate system
   * @param {number} [phi=Math.PI/2] - The angle in radians for z in the isometric co-ordinate system
   * @param {number} [speed=60] - The speed it will move, in pixels per second sq.
   * @return {Point3} - A Point where point.x contains the velocity x value and so on for y and z.
   */
  velocityFromAngles(theta, phi, speed) {
    if (phi === undefined) { phi = Math.sin(Math.PI/2); }
    if (speed === undefined) { speed = 60; }

    return new Point3(
      Math.cos(theta) * Math.sin(phi) * speed,
      Math.sin(theta) * Math.sin(phi) * speed,
      Math.cos(phi) * speed
    );
  }

  /**
   * Sets the acceleration.x/y property on the display object so it will move towards the x/y coordinates at the given speed (in pixels per second sq.)
   * You must give a maximum speed value, beyond which the display object won't go any faster.
   * Note: The display object does not continuously track the target. If the target changes location during transit the display object will not modify its course.
   * Note: The display object doesn't stop moving once it reaches the destination coordinates.
   *
   * @method Phaser.Physics.Isometric.IsoPhysics#accelerateToXYZ
   * @param {any} displayObject - The display object to move.
   * @param {number} x - The x coordinate to accelerate towards.
   * @param {number} y - The y coordinate to accelerate towards.
   * @param {number} z - The z coordinate to accelerate towards.
   * @param {number} [speed=60] - The speed it will accelerate in pixels per second.
   * @param {number} [xSpeedMax=500] - The maximum x velocity the display object can reach.
   * @param {number} [ySpeedMax=500] - The maximum y velocity the display object can reach.
   * @param {number} [zSpeedMax=500] - The maximum z velocity the display object can reach.
   * @return {number} The angle (in radians).
   */
  accelerateToXYZ(displayObject, x, y, z, speed, xSpeedMax, ySpeedMax, zSpeedMax) {
    if (speed === undefined) { speed = 60; }
    if (xSpeedMax === undefined) { xSpeedMax = 500; }
    if (ySpeedMax === undefined) { ySpeedMax = 500; }
    if (zSpeedMax === undefined) { zSpeedMax = 500; }

    var a = this.anglesToXYZ(displayObject.body, x, y,z);
    var v = this.velocityFromAngles(a.theta,a.phi,speed);

    displayObject.body.acceleration.setTo(v.x,v.y,v.z);
    displayObject.body.maxVelocity.setTo(xSpeedMax, ySpeedMax, zSpeedMax);

    return a.theta;
  }

  /**
   * Move the given display object towards the x/y coordinates at a steady velocity.
   * If you specify a maxTime then it will adjust the speed (over-writing what you set) so it arrives at the destination in that number of seconds.
   * Timings are approximate due to the way browser timers work. Allow for a variance of +- 50ms.
   * Note: The display object does not continuously track the target. If the target changes location during transit the display object will not modify its course.
   * Note: The display object doesn't stop moving once it reaches the destination coordinates.
   * Note: Doesn't take into account acceleration, maxVelocity or drag (if you've set drag or acceleration too high this object may not move at all)
   *
   * @method Phaser.Physics.Isometric.IsoPhysics#moveToXYZ
   * @param {any} displayObject - The display object to move, must have an isoArcade body.
   * @param {number} x - The x coordinate to move towards.
   * @param {number} y - The y coordinate to move towards.
   * @param {number} z - The z coordinate to move towards.
   * @param {number} [speed=60] - The speed it will move, in pixels per second (default is 60 pixels/sec)
   * @param {number} [maxTime=0] - Time given in milliseconds (1000 = 1 sec). If set the speed is adjusted so the object will arrive at destination in the given number of ms.
   * @return {number} The angle (in radians).
   */
  moveToXYZ(displayObject, x, y, z, speed, maxTime) {
    if (typeof speed === 'undefined') {
      speed = 60;
    }
    if (typeof maxTime === 'undefined') {
      maxTime = 0;
    }

    if (maxTime > 0) {
      //  We know how many pixels we need to move, but how fast?
      speed = this.distanceToXYZ(displayObject.body, x, y ,z) / (maxTime / 1000);
    }
    var a = this.anglesToXYZ(displayObject.body, x, y,z);
    var v = this.velocityFromAngles(a.theta,a.phi,speed);

    displayObject.body.velocity.copyFrom(v);

    return a.theta;
  }

  /**
   * Move the given display object towards the destination object at a steady velocity.
   * If you specify a maxTime then it will adjust the speed (overwriting what you set) so it arrives at the destination in that number of seconds.
   * Timings are approximate due to the way browser timers work. Allow for a variance of +- 50ms.
   * Note: The display object does not continuously track the target. If the target changes location during transit the display object will not modify its course.
   * Note: The display object doesn't stop moving once it reaches the destination coordinates.
   * Note: Doesn't take into account acceleration, maxVelocity or drag (if you've set drag or acceleration too high this object may not move at all)
   *
   * @method Phaser.Physics.Isometric.IsoPhysics#moveToObject
   * @param {any} displayObject - The display object to move.
   * @param {any} destination - The display object to move towards. Can be any object but must have visible x/y/z properties.
   * @param {number} [speed=60] - The speed it will move, in pixels per second (default is 60 pixels/sec)
   * @param {number} [maxTime=0] - Time given in milliseconds (1000 = 1 sec). If set the speed is adjusted so the object will arrive at destination in the given number of ms.
   * @return {number} The angle (in radians).
   */
  moveToObject(displayObject, destination, speed, maxTime) {
    return this.moveToXYZ(displayObject, destination.x, destination.y, destination.z, speed, maxTime);
  }

  /**
   * Move the given display object towards the pointer at a steady x & y velocity. If no pointer is given it will use Phaser.Input.activePointer.
   * If you specify a maxTime then it will adjust the speed (over-writing what you set) so it arrives at the destination in that number of seconds.
   * Timings are approximate due to the way browser timers work. Allow for a variance of +- 50ms.
   * Note: The display object does not continuously track the target. If the target changes location during transit the display object will not modify its course.
   * Note: The display object doesn't stop moving once it reaches the destination coordinates.
   *
   * @method Phaser.Physics.Isometric.IsoPhysics#moveToPointer
   * @param {any} displayObject - The display object to move.
   * @param {number} [speed=60] - The speed it will move, in pixels per second (default is 60 pixels/sec)
   * @param {Phaser.Pointer} [pointer] - The pointer to move towards. Defaults to Phaser.Input.activePointer.
   * @param {number} [maxTime=0] - Time given in milliseconds (1000 = 1 sec). If set the speed is adjusted so the object will arrive at destination in the given number of ms.
   * @return {number} The angle (in radians).
   */
  moveToPointer(displayObject, speed, pointer, maxTime) {
    pointer = pointer || this.game.input.activePointer;
    var isoPointer = this.game.iso.unproject(pointer.position,undefined,displayObject.body.z);
    isoPointer.z = displayObject.body.z;

    if (typeof speed === 'undefined') {
      speed = 60;
    }
    if (typeof maxTime === 'undefined') {
      maxTime = 0;
    }

    if (maxTime > 0) {
      //  We know how many pixels we need to move, but how fast?
      speed = this.distanceToXYZ(displayObject.body, isoPointer.x, isoPointer.y ,isoPointer.z) / (maxTime / 1000);
    }
    var a = this.anglesToXYZ(displayObject.body, isoPointer.x, isoPointer.y,isoPointer.z);
    var v = this.velocityFromAngles(a.theta,a.phi,speed);

    displayObject.body.velocity.x=v.x;
    displayObject.body.velocity.y=v.y;

    return a.theta;
  }

  boot() {
    const eventEmitter = this.scene.sys.events;

    eventEmitter.on('update', this.world.update, this.world);
    eventEmitter.on('postupdate', this.world.postUpdate, this.world);
  }

  static register(PluginManager) {
    PluginManager.register('IsoPhysics', IsoPhysics, 'isoPhysics');
  }
}

//
// Phaser.Physics.prototype.parseConfig = (function (_super) {
//
//     return function () {
//         if (this.config.hasOwnProperty('isoArcade') && this.config['isoArcade'] === true && hasOwnProperty('IsoPhysics')) {
//             this.isoArcade = new Phaser.Plugin.Isometric(this.game, this.config);
//         }
//         return _super.call(this);
//     };
//
// })(Phaser.Physics.prototype.parseConfig);
//
// Phaser.Physics.prototype.startSystem = (function (_super) {
//
//     return function (system) {
//         if (system === ISOARCADE && this.isoArcade === null) {
//             this.isoArcade = new IsoPhysics(this.game);
//             this.setBoundsToWorld();
//         }
//         return _super.call(this, system);
//     };
//
// })(Phaser.Physics.prototype.startSystem);
//
// Phaser.Physics.prototype.enable = (function (_super) {
//
//     return function (sprite, system) {
//         if (system === ISOARCADE && this.isoArcade) {
//             this.isoArcade.enable(sprite);
//         }
//         return _super.call(this, sprite, system);
//     };
//
// })(Phaser.Physics.prototype.enable);
//
// Phaser.Physics.prototype.setBoundsToWorld = (function (_super) {
//
//     return function () {
//         if (this.isoArcade) {
//             this.isoArcade.setBoundsToWorld();
//         }
//         return _super.call(this);
//     };
//
// })(Phaser.Physics.prototype.setBoundsToWorld);
//
// Phaser.Physics.prototype.destroy = (function (_super) {
//
//     return function () {
//         this.isoArcade = null;
//
//         return _super.call(this);
//     };
//
// })(Phaser.Physics.prototype.destroy);
