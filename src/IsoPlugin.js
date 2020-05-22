/**
* The MIT License (MIT)

* Copyright (c) 2015 Lewis Lane

* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/

/**
 * @author       Lewis Lane <lew@rotates.org>
 * @copyright    2015 Lewis Lane (Rotates.org)
 * @license      {@link http://opensource.org/licenses/MIT|MIT License}
 */

import Projector from './Projector';
import IsoSprite from './IsoSprite';
import IsoParticleEmitterManager from './particles/IsoParticleEmitterManager';

/**
 * @class IsometricPlugin
 * 
 * @classdesc
 * Isometric is a comprehensive axonometric plugin for Phaser which provides an API for handling axonometric projection of assets in 3D space to the screen.
 * The goal has been to mimic as closely as possible the existing APIs provided by Phaser for standard orthogonal 2D projection, but add a third dimension.
 * Also included is an Arcade-based 3D AABB physics engine, which again is closely equivalent in functionality and its API.
 */
class IsoPlugin {
  /**
   * @constructor
   * @param {Phaser.Scene} scene The current scene instance
   */
  constructor(scene) {
    this.scene = scene;
    this.systems = scene.sys;

    if (!scene.sys.settings.isBooted) {
      scene.sys.events.once('boot', this.boot, this);
    }

    this.projector = new Projector(scene, scene.isometricType);

    /**
     * Create a new IsoSprite with specific position and sprite sheet key.
     *
     * @method Phaser.GameObjectFactory#isoSprite
     * @param {number} x - X position of the new IsoSprite.
     * @param {number} y - Y position of the new IsoSprite.
     * @param {number} z - Z position of the new IsoSprite.
     * @param {string|Phaser.RenderTexture|PIXI.Texture} key - This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture or PIXI.Texture.
     * @param {string|number} [frame] - If the sprite uses an image from a texture atlas or sprite sheet you can pass the frame here. Either a number for a frame ID or a string for a frame name.
     * @returns {IsoSprite} the newly created IsoSprite object.
     */
    Phaser.GameObjects.GameObjectFactory.register('isoSprite', function (x, y, z, key, frame) {
      const sprite = new IsoSprite(this.scene, x, y, z, key, frame);

      this.systems.displayList.add(sprite);
      this.systems.updateList.add(sprite);

      return sprite;
    });

    /**
     * Create a new IsoParticleEmitterManager with specific position and sprite sheet key.
     *
     * @method Phaser.GameObjectFactory#isoParticleEmitterManager
     * @param {Point3|number} isoPosition - Necessary to compute the depth of the GameObject. If a number is given instead, it is the depth.
     * @param {string|Phaser.RenderTexture|PIXI.Texture} key - This is the image or texture used by the Manager during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture or PIXI.Texture.
     * @param {string|number} [frame] - If the Manager uses an image from a texture atlas or sprite sheet you can pass the frame here. Either a number for a frame ID or a string for a frame name.
     * @param {Phaser.Types.GameObjects.Particles.ParticleEmitterConfig|Phaser.Types.GameObjects.Particles.ParticleEmitterConfig[]} [emitters] - Configuration settings for one or more emitters to create.
     * @returns {IsoParticleEmitterManager} the newly created IsoParticleEmitterManager object.
     */
    Phaser.GameObjects.GameObjectFactory.register('isoParticles', function (isoPosition, key, frame, emitters) {
      const particles = new IsoParticleEmitterManager(this.scene, isoPosition, key, frame, emitters);

      this.systems.displayList.add(particles);
      this.systems.updateList.add(particles);

      return particles;
    });
  }

  boot() {
  }

  static register(PluginManager) {
    PluginManager.register('IsoPlugin', IsoPlugin, 'isoPlugin');
  }
}

/**
 * Export everything in the IsoPlugin scope
 */
IsoPlugin.Cube = require('./Cube')
IsoPlugin.IsoSprites = require('./IsoSprite')
IsoPlugin.Octree = require('./Octree')
IsoPlugin.Particles = require('./particles')
IsoPlugin.Physics = require('./physics')
IsoPlugin.Point3 = require('./Point3')
IsoPlugin.Projector = require('./Projector')

module.exports = IsoPlugin
