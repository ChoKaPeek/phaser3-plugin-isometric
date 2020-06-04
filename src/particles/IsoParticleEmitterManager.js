import IsoParticleEmitter from "./IsoParticleEmitter";
import Point3 from "../Point3";

export const ISOPARTICLEEMITTERMANAGER = 'IsoParticleEmitterManager';

const ParticleEmitterManager = Phaser.GameObjects.Particles.ParticleEmitterManager;
const GetFastValue = Phaser.Utils.Objects.GetFastValue;
const HasValue = Phaser.Utils.Objects.HasValue;

/**
 * @class IsoParticles
 *
 * @classdesc
 * Create a new `IsoParticleEmitterManager` object. This object is a ParticleEmitterManager suitable for axonometric positioning.
 */
export default class IsoParticleEmitterManager extends ParticleEmitterManager {
    /**
     * @constructor
     * @extends Phaser.GameObjects.Particles.ParticleEmitterManager
     * @param {Phaser.Scene} scene - A reference to the current scene.
     * @param {Point3} isoPosition - Anchor, necessary to compute the depth of the GameObject.
     * @param {string} texture - The key of the Texture this Emitter Manager will use to render particles, as stored in the Texture Manager.
     * @param {(string|integer)} [frame] - An optional frame from the Texture this Emitter Manager will use to render particles.
     * @param {Phaser.Types.GameObjects.Particles.ParticleEmitterConfig|Phaser.Types.GameObjects.Particles.ParticleEmitterConfig[]} [emitters] - Configuration settings for one or more emitters to create.
     */
    constructor(scene, isoPosition, texture, frame, emitters) {
        super(scene, texture, frame, emitters);

        /**
         * @property {string} type - The const type of this object.
         * @readonly
         */
        this.type = ISOPARTICLEEMITTERMANAGER;

        this._isoPosition = new Point3(isoPosition)
        this._isoPositionChanged = false

        this.depth = this._isoPosition.x + this._isoPosition.y + (this._isoPosition.z * 1.25);
        this.originDepth = this.depth // If depth is dynamic, keep origin depth available
    }

    get isoX() {
        return this._isoPosition.x;
    }

    set isoX(value) {
        this._isoPosition.x = value;
        this._isoPositionChanged = true;
    }

    get isoY() {
        return this._isoPosition.y;
    }

    set isoY(value) {
        this._isoPosition.y = value;
        this._isoPositionChanged = true;
    }

    get isoZ() {
        return this._isoPosition.z;
    }

    set isoZ(value) {
        this._isoPosition.z = value;
        this._isoPositionChanged = true;
    }

    get isoPosition() {
        return this._isoPosition;
    }

    _project() {
        if (this._isoPositionChanged) {
            const pluginKey = this.scene.sys.settings.map.isoPlugin;
            const sceneProjector = this.scene[pluginKey].projector;
            const { x, y } = sceneProjector.project(this._isoPosition);

            this.x = x;
            this.y = y;
            this.depth = this._isoPosition.x + this._isoPosition.y + (this._isoPosition.z * 1.25);
            this.originDepth = this.depth;

            this._isoPositionChanged = true;
        }
    }

    /**
     * Creates a new ParticleEmitter object, adds it to this EmitterManager and returns a reference to it.
     *
     * @method Phaser.GameObjects.Particles.ParticleEmitterManager#createEmitter
     * @since 3.0.0
     *
     * @param {Phaser.Types.GameObjects.Particles.ParticleEmitterConfig} config - Configuration settings for the ParticleEmitter to create.
     *
     * @return {Phaser.GameObjects.Particles.ParticleEmitter} The Particle Emitter that was created.
     */
    createEmitter(config) {
        if (HasValue(config, 'emitZone')) {
            const type = GetFastValue(config.emitZone, 'type', 'random');
            if (type === 'iso') {
                return this.addEmitter(new IsoParticleEmitter(this, config));
            }
        }
        console.error("Iso: No emitZone of type 'iso' found, using Phaser emitter")
        return ParticleEmitterManager.prototype.createEmitter.call(this, config)
    }

    /**
     * Internal function called by the World update cycle.
     *
     * @method Phaser.Plugin.Isometric.Particles.IsoParticleEmitterManager#preUpdate
     * @memberof Phaser.Plugin.Isometric.Particles.IsoParticleEmitterManager
     */
    preUpdate(time, delta) {
        ParticleEmitterManager.prototype.preUpdate.call(this, time, delta);

        this._project();
    }
}
