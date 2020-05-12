import Point3 from './Point3';
import Cube from './Cube';

export const ISOPARTICLES = 'IsoParticles';
const Particles = Phaser.GameObjects.Particles.ParticleEmitterManager;

/**
 * @class IsoParticles
 *
 * @classdesc
 * Create a new `IsoParticles` object. This object is a ParticleEmitterManager suitable for axonometric positioning.
 *
 * IsoParticles are simply Particles that have three new position properties (isoX, isoY and isoZ) and ask the instance of Projector what their position should be in a 2D scene whenever these properties are changed.
 * The IsoParticles retain their 2D position property to prevent any problems and allow you to interact with them as you would a normal ParticleEmitterManager. The upside of this simplicity is that things should behave predictably for those already used to Phaser.
 */
export default class IsoParticles extends Particles {
    /**
     * @constructor
     * @extends Phaser.GameObjects.Particles.ParticleEmitterManager
     * @param {Phaser.Scene} scene - A reference to the current scene.
     * @param {number} z - The z coordinate (in 3D space) to position the IsoParticles at.
     * @param {string} texture - The key of the Texture this Emitter Manager will use to render particles, as stored in the Texture Manager.
     * @param {(string|integer)} [frame] - An optional frame from the Texture this Emitter Manager will use to render particles.
     * @param {Phaser.Types.GameObjects.Particles.ParticleEmitterConfig|Phaser.Types.GameObjects.Particles.ParticleEmitterConfig[]} [emitters] - Configuration settings for one or more emitters to create.
     */
    constructor(scene, z, texture, frame, emitters) {
        super(scene, texture, frame, emitters);

        const x = 100
        const y = 100

        /**
         * @property {number} type - The const type of this object.
         * @readonly
         */
        this.type = ISOPARTICLES;

        /**
         * @property {Point3} _isoPosition - Internal 3D position.
         * @private
         */
        this._isoPosition = new Point3(x, y, z);

        /**
         * @property {number} snap - Snap this object's position to the specified value; handy for keeping pixel art snapped to whole pixels.
         * @default
         */
        this.snap = 0;

        /**
         * @property {boolean} _isoPositionChanged - Internal invalidation control for positioning.
         * @readonly
         * @private
         */
        this._isoPositionChanged = true;

        /**
         * @property {boolean} _isoBoundsChanged - Internal invalidation control for isometric bounds.
         * @readonly
         * @private
         */
        this._isoBoundsChanged = true;

        this._project();

        /**
         * @property {Cube} _isoBounds - Internal derived 3D bounds.
         * @private
         */
        this._isoBounds = this.resetIsoBounds();
    }

    /**
     * The axonometric position of the IsoParticles on the x axis. Increasing the x coordinate will move the object down and to the right on the screen.
     *
     * @name IsoParticles#isoX
     * @property {number} isoX - The axonometric position of the IsoParticles on the x axis.
     */
    get isoX() {
        return this._isoPosition.x;
    }

    set isoX(value) {
        this._isoPosition.x = value;
        this._isoPositionChanged = this._isoBoundsChanged = true;
        if (this.body) {
            this.body._reset = true;
        }
    }

    /**
     * The axonometric position of the IsoParticles on the y axis. Increasing the y coordinate will move the object down and to the left on the screen.
     *
     * @name IsoParticles#isoY
     * @property {number} isoY - The axonometric position of the IsoParticles on the y axis.
     */
    get isoY() {
        return this._isoPosition.y;
    }

    set isoY(value) {
        this._isoPosition.y = value;
        this._isoPositionChanged = this._isoBoundsChanged = true;

        if (this.body) {
            this.body._reset = true;
        }
    }

    /**
     * The axonometric position of the IsoParticles on the z axis. Increasing the z coordinate will move the object directly upwards on the screen.
     *
     * @name Phaser.Plugin.Isometric.IsoParticles#isoZ
     * @property {number} isoZ - The axonometric position of the IsoParticles on the z axis.
     */
    get isoZ() {
        return this._isoPosition.z;
    }

    set isoZ(value) {
        this._isoPosition.z = value;
        this._isoPositionChanged = this._isoBoundsChanged = true;
        if (this.body) {
            this.body._reset = true;
        }
    }

    /**
     * A Point3 object representing the axonometric position of the IsoParticles.
     *
     * @name Phaser.Plugin.Isometric.IsoParticles#isoPosition
     * @property {Point3} isoPosition - The axonometric position of the IsoParticles.
     * @readonly
     */
    get isoPosition() {
        return this._isoPosition;
    }

    /**
     * A Cube object representing the derived boundsof the IsoParticles.
     *
     * @name Phaser.Plugin.Isometric.IsoParticles#isoBounds
     * @property {Point3} isoBounds - The derived 3D bounds of the IsoParticles.
     * @readonly
     */
    get isoBounds() {
        if (this._isoBoundsChanged || !this._isoBounds) {
            this.resetIsoBounds();
            this._isoBoundsChanged = false;
        }

        return this._isoBounds;
    }

    /**
     * Internal function that performs the axonometric projection from 3D to 2D space.
     * @method Phaser.Plugin.Isometric.IsoParticles#_project
     * @memberof Phaser.Plugin.Isometric.IsoParticles
     * @private
     */
    _project() {
        if (this._isoPositionChanged) {
            const pluginKey = this.scene.sys.settings.map.isoPlugin;
            const sceneProjector = this.scene[pluginKey].projector;
            const {x, y} = sceneProjector.project(this._isoPosition);

            this.x = x;
            this.y = y;
            this.depth = (this._isoPosition.x + this._isoPosition.y) + (this._isoPosition.z * 1.25);

            if (this.snap > 0) {
                this.x = Phaser.Math.snapTo(this.x, this.snap);
                this.y = Phaser.Math.snapTo(this.y, this.snap);
            }

            this._isoPositionChanged = this._isoBoundsChanged = true;
        }
    }

    /**
     * Internal function called by the World update cycle.
     *
     * @method IsoParticles#preUpdate
     * @memberof IsoParticles
     */
    preUpdate(time, delta) {
        Particles.prototype.preUpdate.call(this, time, delta);

        this._project();
    }

    resetIsoBounds() {
        if (typeof this._isoBounds === 'undefined') {
            this._isoBounds = new Cube();
        }

        var asx = Math.abs(this.scaleX);
        var asy = Math.abs(this.scaleY);

        this._isoBounds.widthX = Math.round(Math.abs(this.width) * 0.5) * asx;
        this._isoBounds.widthY = Math.round(Math.abs(this.width) * 0.5) * asx;
        this._isoBounds.height = Math.round(Math.abs(this.height) - (Math.abs(this.width) * 0.5)) * asy;

        this._isoBounds.x = this.isoX + (this._isoBounds.widthX * -this.originX) + this._isoBounds.widthX * 0.5;
        this._isoBounds.y = this.isoY + (this._isoBounds.widthY * this.originX) - this._isoBounds.widthY * 0.5;
        this._isoBounds.z = this.isoZ - (Math.abs(this.height) * (1 - this.originY)) + (Math.abs(this.width * 0.5));

        return this._isoBounds;
    }
}