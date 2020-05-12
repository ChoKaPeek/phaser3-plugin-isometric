/**
 * @namespace Phaser3Isometric
 */

var Phaser3Isometric = {
    Cube: require('./Cube'),
    IsoParticles: require('./IsoParticles'),
    IsoPlugin: require('./IsoPlugin'),
    IsoSprites: require('./IsoSprite'),
    Octree: require('./Octree'),
    Point3: require('./Point3'),
    Projector: require('./Projector'),
    Physics: require('./physics'),
};

module.exports = Phaser3Isometric;

global.Phaser3Isometric = Phaser3Isometric;