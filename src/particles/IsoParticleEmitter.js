import IsoZone from './IsoZone'

export const ISOPARTICLEEMITTER = 'IsoParticleEmitter';

const ParticleEmitter = Phaser.GameObjects.Particles.ParticleEmitter;
const HasValue = Phaser.Utils.Objects.HasValue;
const GetFastValue = Phaser.Utils.Objects.GetFastValue;

/**
 * @class IsoParticleEmitter
 *
 * @classdesc
 * Create a new `IsoParticleEmitter` object. This object is a ParticleEmitter suitable for axonometric positioning.
 */
export default class IsoParticleEmitter extends ParticleEmitter {
    /**
     * @constructor
     * @extends Phaser.GameObjects.Particles.ParticleEmitter
     * @param {IsoParticles} manager - The Emitter Manager this Emitter belongs to.
     * @param {Phaser.Types.GameObjects.Particles.ParticleEmitterConfig} config - Settings for this emitter. To be iso, must contain an emitZone augmented with an optional z parameter
     */
    constructor(manager, config) {
        // We want to construct the emitZone ourselves, so we remove it from the config before calling super().
        let emitZone;
        if (HasValue(config, 'emitZone')) {
            emitZone = config.emitZone
            delete config.emitZone
        }

        // Setup the object without an emitZone
        super(manager, config);

        /**
         * @property {string} type - The const type of this object.
         * @readonly
         */
        this.type = ISOPARTICLEEMITTER;

        // Do we need to dynamically update the depth of the associated manager?
        if (HasValue(config, 'dynamicDepth')) {
            this.dynamicDepth = !!config.dynamicDepth
            this.dynamicBound = GetFastValue(config.dynamicDepth, 'bound', 0); // abs, 0 means no bound
            this.dynamicType = GetFastValue(config.dynamicDepth, 'type', 'mean');
        }

        // Add an IsoZone
        this._setIsoEmitZone(emitZone)
    }

    /**
     * Checks for an emitZone parameter of type 'iso' to use IsoZone as an emitZone to replace Phaser zones.
     * @param emitZone
     */
    _setIsoEmitZone(emitZone) {
        if (emitZone === undefined) {
            this.emitZone = null
            return // emitZone empty
        }

        const type = GetFastValue(emitZone, 'type', 'random');
        if (type !== 'iso') {
            return // not of iso type
        }

        const z = GetFastValue(emitZone, 'z', null);
        const source = GetFastValue(emitZone, 'source', null);
        const quantity = GetFastValue(emitZone, 'quantity', 1);
        const stepRate = GetFastValue(emitZone, 'stepRate', 0);
        const yoyo = GetFastValue(emitZone, 'yoyo', false);
        const seamless = GetFastValue(emitZone, 'seamless', true);

        // this.manager.scene is defined in Phaser's manager implementation
        this.emitZone = new IsoZone(this.manager.scene, z, source, quantity, stepRate, yoyo, seamless);
    }

    _dynamicParticlesDepth() {
        if (!this.alive.length) {
            return this.manager.originDepth
        }

        switch (this.dynamicType) {
            case 'mean':
                let mean = 0
                for (let i = 0; i < this.alive.length; ++i) {
                    mean += this.alive[i].depth
                }
                mean /= this.alive.length

                return mean

            case 'first':
                return this.alive[0].depth

            case 'last':
                return this.alive[this.alive.length - 1].depth

            default:
                console.error("Iso: unrecognized dynamicDepth type")
                return this.manager.originDepth
        }

    }

    /**
     * For sorting particles by depth.
     *
     * @param {object} a - The first particle.
     * @param {object} b - The second particle.
     *
     * @return {number} The difference of a and b's depth coordinates.
     */
    depthSortCallback(a, b) {
        return a.depth - b.depth
    }

    /**
     * Internal function called by the World update cycle.
     *
     * @method Phaser.Plugin.Isometric.Particles.IsoParticleEmitter#preUpdate
     * @memberof Phaser.Plugin.Isometric.Particles.IsoParticleEmitter
     */
    preUpdate(time, delta) {
        ParticleEmitter.prototype.preUpdate.call(this, time, delta);

        // Update manager's depth dynamically if wanted
        if (this.dynamicDepth) {
            let depth = this._dynamicParticlesDepth()
            if (this.dynamicBound) {
                if (depth >= this.manager.originDepth) {
                    depth = Math.min(this.manager.originDepth + this.dynamicBound, depth)
                } else {
                    depth = Math.max(this.manager.originDepth - this.dynamicBound, depth)
                }
            }
            this.manager.depth = depth
        }
    }
}
