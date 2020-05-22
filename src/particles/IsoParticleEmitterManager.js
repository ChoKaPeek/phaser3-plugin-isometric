import IsoParticleEmitter from "./IsoParticleEmitter";

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
     * @param {Point3|number} isoPosition - Necessary to compute the depth of the GameObject. If a number is given instead, it is the depth.
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

        if (typeof isoPosition === 'number') {
            this.depth = isoPosition
        } else {
            this.depth = isoPosition.x + isoPosition.y + isoPosition.z * 1.25
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
    }
}
