import Point3 from "../Point3";

const EdgeZone = Phaser.GameObjects.Particles.Zones.EdgeZone;

/**
 * @class IsoZone
 *
 * @classdesc
 * A zone that places particles on a shape's edges using isometric positions. Basically an isometric EdgeZone.
 */
export default class IsoZone extends EdgeZone {
    /**
     * @constructor
     * @extends Phaser.GameObjects.Particles.Zones.EdgeZone
     * @param {number} z - isometric z value.
     * @param {Phaser.Scene} scene - A reference to the current scene.
     * @param {Phaser.Types.GameObjects.Particles.EdgeZoneSource} source - An object instance with a `getPoints(quantity, stepRate)` method returning an array of points.
     * @param {integer} quantity - The number of particles to place on the source edge. Set to 0 to use `stepRate` instead.
     * @param {number} stepRate - The distance between each particle. When set, `quantity` is implied and should be set to 0.
     * @param {boolean} [yoyo=false] - Whether particles are placed from start to end and then end to start.
     * @param {boolean} [seamless=true] - Whether one endpoint will be removed if it's identical to the other.
     */
    constructor(z, scene, source, quantity, stepRate, yoyo, seamless) {
        super(source, quantity, stepRate, yoyo, seamless);
        console.log("change all points")

        this.z = z
        this.scene = scene

        for (let i = 0; i < this.points.length; ++i)
            this._project(this.points[i])
    }

    /**
     * Internal function that performs the axonometric projection from 3D to 2D space.
     * @method Phaser.Plugin.Isometric.Particles.IsoZone#_project
     * @memberof Phaser.Plugin.Isometric.Particles.IsoZone
     * @param point - 2D point created by source.getPoints
     * @private
     */
    _project(point) {
        console.log("old "+ point.x)
        const isoPosition = new Point3(point.x, point.y, this.z)
        const pluginKey = this.scene.sys.settings.map.isoPlugin;
        const sceneProjector = this.scene[pluginKey].projector;
        const { x, y } = sceneProjector.project(isoPosition);

        point.x = x
        point.y = y
        point.depth = (isoPosition.x + isoPosition.y) + (isoPosition.z * 1.25);
        console.log("new "+ point.x)
    }
}
