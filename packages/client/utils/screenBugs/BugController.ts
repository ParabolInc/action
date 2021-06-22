/**
 * @preserve Bug.js - https://github.com/Auz/Bug
 * Released under MIT-style license.
 * Original Screen Bug http://screen-bug.googlecode.com/git/index.html
 */
/**
 * Bug.js - Add bugs to your page
 *
 * https://github.com/Auz/Bug
 *
 * license: MIT-style license.
 * copyright: Copyright (c) 2016 Graham McNicoll
 *
 *
 * Created for an aprils fool joke at Education.com 2013. I knew there was probably a script
 * that did it already, and there was: http://screen-bug.googlecode.com/git/index.html.
 * I used this as the starting point and heavily modified it, used sprite image animation,
 * and added many new features.
 *
 *
 * Original Screen Bug http://screen-bug.googlecode.com/git/index.html
 * Copyright ©2011 Kernc (kerncece ^_^ gmail)
 * Released under WTFPL license.
 *
 */

import {Range} from '../../types/generics'
import Bug from './Bug'
import flySprite from './fly-sprite.png'
import spiderSprite from './spider-sprite.png'

type Mode = 'multiply' | 'nothing' | 'fly' | 'flyoff' | 'die' | 'random'
type Zoom = Range<1, 11>

export interface BugControllerOptions {
  minDelay: number
  maxDelay: number
  minBugs: number
  maxBugs: number
  minSpeed: number
  maxSpeed: number
  maxLargeTurnDeg: number
  maxSmallTurnDeg: number
  maxWiggleDeg: number
  imageSprite: string
  bugWidth: number
  bugHeight: number
  num_frames: number
  zoom: Zoom
  canFly: boolean
  canDie: boolean
  numDeathTypes: number
  monitorMouseMovement: boolean
  eventDistanceToBug: number
  minTimeBetweenMultipy: number
  mouseOver: Mode
}

class BugDispatch {
  options: BugControllerOptions = {
    minDelay: 2000,
    maxDelay: 10000,
    minBugs: 2,
    maxBugs: 20,
    minSpeed: 5,
    maxSpeed: 10,
    maxLargeTurnDeg: 150,
    maxSmallTurnDeg: 10,
    maxWiggleDeg: 5,
    imageSprite: flySprite,
    bugWidth: 13,
    bugHeight: 14,
    num_frames: 5,
    zoom: 10,
    canFly: true,
    canDie: true,
    numDeathTypes: 3,
    monitorMouseMovement: false,
    eventDistanceToBug: 40,
    minTimeBetweenMultipy: 1000,
    mouseOver: 'random'
  }

  modes = ['multiply', 'nothing'] as Mode[]
  bugs = [] as Bug[]
  spawnDelay: number[]
  multiplyDelay = false
  random = (min: number, max: number, round?: boolean) => {
    const num = Math.random() * (max - min) + min
    return round ? Math.round(num) : num
  }

  constructor(options: Partial<BugControllerOptions>) {
    this.options = {
      ...this.options,
      ...options
    }

    // sanity check:
    if (this.options.minBugs > this.options.maxBugs) {
      this.options.minBugs = this.options.maxBugs
    }

    if (this.options.canFly) {
      this.modes.push('fly', 'flyoff')
    }
    if (this.options.canDie) {
      this.modes.push('die')
    }

    if (this.modes.indexOf(this.options.mouseOver) === -1) {
      // invalid mode: use random:
      this.options.mouseOver = 'random'
    }

    const numBugs =
      this.options.mouseOver === 'multiply'
        ? this.options.minBugs
        : this.random(this.options.minBugs, this.options.maxBugs, true)

    for (let i = 0; i < numBugs; i++) {
      const options = {
        ...this.options,
        wingsOpen: this.options.canFly ? (Math.random() > 0.5 ? true : false) : true,
        walkSpeed: this.random(this.options.minSpeed, this.options.maxSpeed)
      }
      this.bugs.push(new Bug(options))
    }

    // fly them in staggered:
    this.spawnDelay = []
    for (let i = 0; i < numBugs; i++) {
      const delay = this.random(this.options.minDelay, this.options.maxDelay, true)
      const thebug = this.bugs[i]
      // fly the bug onto the page:
      this.spawnDelay[i] = window.setTimeout(() => {
        this.options.canFly ? thebug.flyIn() : thebug.walkIn()
      }, delay)

      // add mouse over events:
      this.add_events_to_bug(thebug)
    }

    // add window event if required:
    if (this.options.monitorMouseMovement) {
      window.onmousemove = () => {
        this.check_if_mouse_close_to_bug()
      }
    }
  }

  stop = () => {
    for (let i = 0; i < this.bugs.length; i++) {
      if (this.spawnDelay[i]) clearTimeout(this.spawnDelay[i])
      this.bugs[i].stop()
    }
  }

  end = () => {
    for (let i = 0; i < this.bugs.length; i++) {
      if (this.spawnDelay[i]) clearTimeout(this.spawnDelay[i])
      this.bugs[i].stop()
      this.bugs[i].remove()
    }
  }

  reset = () => {
    this.stop()
    for (let i = 0; i < this.bugs.length; i++) {
      this.bugs[i].reset()
      this.bugs[i].walkIn()
    }
  }

  killAll = () => {
    for (let i = 0; i < this.bugs.length; i++) {
      if (this.spawnDelay[i]) clearTimeout(this.spawnDelay[i])
      this.bugs[i].die()
    }
  }

  add_events_to_bug = (thebug: Bug) => {
    if (!thebug.bug) return
    thebug.bug.addEventListener('mouseover', () => {
      this.on_bug(thebug)
    })
  }

  check_if_mouse_close_to_bug = (event?: any) => {
    const e = event || window.event
    if (!e) {
      return
    }

    let posx = 0
    let posy = 0
    if (e.client && e.client.x) {
      posx = e.client.x
      posy = e.client.y
    } else if (e.clientX) {
      posx = e.clientX
      posy = e.clientY
    } else if (e.page && e.page.x) {
      posx = e.page.x - (document.body.scrollLeft + document.documentElement.scrollLeft)
      posy = e.page.y - (document.body.scrollTop + document.documentElement.scrollTop)
    } else if (e.pageX) {
      posx = e.pageX - (document.body.scrollLeft + document.documentElement.scrollLeft)
      posy = e.pageY - (document.body.scrollTop + document.documentElement.scrollTop)
    }
    const numBugs = this.bugs.length
    for (let i = 0; i < numBugs; i++) {
      const pos = this.bugs[i].getPos()
      if (pos) {
        if (
          Math.abs(pos.top - posy) + Math.abs(pos.left - posx) < this.options.eventDistanceToBug &&
          !this.bugs[i].flyperiodical
        ) {
          this.near_bug(this.bugs[i])
        }
      }
    }
  }

  near_bug = (bug: Bug) => {
    this.on_bug(bug)
  }

  on_bug = (bug: Bug) => {
    if (!bug.alive) {
      return
    }

    let mode = this.options.mouseOver

    if (mode === 'random') {
      mode = this.modes[this.random(0, this.modes.length - 1, true)]
    }

    if (mode === 'fly') {
      // fly away!
      bug.stop()
      bug.flyRand()
    } else if (mode === 'nothing') {
      return
    } else if (mode === 'flyoff') {
      // fly away and off the page
      bug.stop()
      bug.flyOff()
    } else if (mode === 'die') {
      // drop dead!
      bug.die()
    } else if (mode === 'multiply') {
      if (!this.multiplyDelay && this.bugs.length < this.options.maxBugs) {
        // spawn another:
        // create new bug:
        const pos = bug.getPos()
        if (!pos) return
        const b = new Bug({
          ...this.options,
          wingsOpen: this.options.canFly ? (Math.random() > 0.5 ? true : false) : true,
          walkSpeed: this.random(this.options.minSpeed, this.options.maxSpeed)
        })

        b.drawBug(pos.top, pos.left)
        // fly them both away:
        if (this.options.canFly) {
          b.flyRand()
          bug.flyRand()
        } else {
          b.go()
          bug.go()
        }
        // store new bug:
        this.bugs.push(b)
        // watch out for spawning too quickly:
        this.multiplyDelay = true
        setTimeout(() => {
          // add event to this bug:
          this.add_events_to_bug(b)
          this.multiplyDelay = false
        }, this.options.minTimeBetweenMultipy)
      }
    }
  }
}

export default class BugController extends BugDispatch { }

export class SpiderController extends BugDispatch {
  constructor(options: Partial<BugControllerOptions>) {
    super({
      imageSprite: spiderSprite,
      bugWidth: 69,
      bugHeight: 90,
      num_frames: 7,
      canFly: false,
      canDie: true,
      numDeathTypes: 2,
      zoom: 6,
      minDelay: 200,
      maxDelay: 3000,
      minSpeed: 6,
      maxSpeed: 13,
      minBugs: 3,
      maxBugs: 10,
      ...options
    })
  }
}
