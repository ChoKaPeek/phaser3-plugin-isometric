export const ISOPARTICLE = 'IsoParticle';

const Particle = Phaser.GameObjects.Particles.Particle;
const Depth = Phaser.GameObjects.Components.Depth;

/**
 * @class IsoParticle
 *
 * @classdesc
 * Create a new `IsoParticle` object. This object is a Particle suitable for axonometric positioning.
 */
export default class IsoParticle extends Particle {
    /**
     * @constructor
     * @extends Phaser.GameObjects.Particles.ParticleEmitter
     * @param {IsoParticles} manager - The Emitter Manager this Emitter belongs to.
     * @param {Phaser.Types.GameObjects.Particles.ParticleEmitterConfig} config - Settings for this emitter. To be iso, must contain an emitZone augmented with an optional z parameter
     */
    constructor(manager, config) {
        super(manager, config);

        /**
         * @property {string} type - The const type of this object.
         * @readonly
         */
        this.type = ISOPARTICLE;

        this._depth = 0;
    }

    get depth() {
        return this._depth;
    }

    set depth(value) {
        // warning: no depth sorting is triggered
        this._depth = value;
    }

    /**
     * Internal function called by the World update cycle.
     *
     * @method Phaser.Plugin.Isometric.Particles.IsoParticle#preUpdate
     * @memberof Phaser.Plugin.Isometric.Particles.IsoParticle
     */
    preUpdate(time, delta) {
        Particle.prototype.preUpdate.call(this, time, delta);
    }
}
