import {BugControllerOptions} from './BugController'

type Pos = {left: number; top: number}

interface BugOptions extends BugControllerOptions {
  wingsOpen?: boolean
  walkSpeed?: number
  flySpeed?: number
  edge_resistance?: number
}

enum Direction {
  NEAR_TOP_EDGE = 1,
  NEAR_BOTTOM_EDGE = 2,
  NEAR_LEFT_EDGE = 4,
  NEAR_RIGHT_EDGE = 8
}

interface Directions {
  [direction: number]: number
}

export default class Bug {
  options: Required<BugOptions>
  defaultOptions = {
    wingsOpen: false,
    walkSpeed: 2,
    flySpeed: 40,
    edge_resistance: 50,
    zoom: 10
  }

  directions: Directions = {
    [Direction.NEAR_TOP_EDGE]: 270,
    [Direction.NEAR_BOTTOM_EDGE]: 90,
    [Direction.NEAR_LEFT_EDGE]: 0,
    [Direction.NEAR_RIGHT_EDGE]: 180,
    [Direction.NEAR_TOP_EDGE + Direction.NEAR_LEFT_EDGE]: 315,
    [Direction.NEAR_TOP_EDGE + Direction.NEAR_RIGHT_EDGE]: 225,
    [Direction.NEAR_BOTTOM_EDGE + Direction.NEAR_LEFT_EDGE]: 45,
    [Direction.NEAR_BOTTOM_EDGE + Direction.NEAR_RIGHT_EDGE]: 135
  }
  animating = false
  angle_deg = 0
  angle_rad = 0
  going: number | undefined | null
  flyperiodical: number | undefined | null
  dropTimer: number | undefined
  large_turn_angle_deg = 0
  near_edge = 0
  edge_test_counter = 10
  small_turn_counter = 0
  large_turn_counter = 0
  fly_counter = 0
  toggle_stationary_counter = Math.random() * 50
  stationary = false
  inserted = false
  bug = (null as unknown) as HTMLDivElement & {top?: number; left?: number}
  active = true
  walkIndex = 0
  flyIndex = 0
  alive = true
  twitchTimer: number | null = null
  rad2deg_k = 180 / Math.PI
  deg2rad_k = Math.PI / 180
  wingsOpen: boolean
  zoom: BugControllerOptions['zoom']
  _lastTimestamp: number | undefined
  /* helper methods: */
  rad2deg = (rad: number) => {
    return rad * this.rad2deg_k
  }
  deg2rad = (deg: number) => {
    return deg * this.deg2rad_k
  }
  random = (min: number, max: number, plusminus?: boolean) => {
    if (min == max) return min
    const result = Math.round(min - 0.5 + Math.random() * (max - min + 1))
    if (plusminus) return Math.random() > 0.5 ? result : -result
    return result
  }

  moveBug = (x: number, y: number, deg?: number) => {
    // keep track of where we are:
    this.bug.left = x
    this.bug.top = y

    // transform:
    let trans = 'translate(' + parseInt(String(x)) + 'px,' + parseInt(String(y)) + 'px)'
    if (deg) {
      trans += ' rotate(' + deg + 'deg)'
    }
    trans += ' scale(' + this.zoom + ')'
    this.bug.style.transform = trans
  }

  setPos = (top?: number, left?: number) => {
    this.bug.top =
      top ||
      this.random(
        this.options.edge_resistance,
        document.documentElement.clientHeight - this.options.edge_resistance
      )

    this.bug.left =
      left ||
      this.random(
        this.options.edge_resistance,
        document.documentElement.clientWidth - this.options.edge_resistance
      )

    this.moveBug(this.bug.left, this.bug.top, 90 - this.angle_deg)
  }

  makeBug = () => {
    if (!this.bug && this.active) {
      console.log('making')
      const row = this.wingsOpen ? '0' : '-' + this.options.bugHeight + 'px'
      const bug = document.createElement('div')
      bug.className = 'bug'
      bug.style.background = 'transparent url(' + this.options.imageSprite + ') no-repeat 0 ' + row
      bug.style.width = this.options.bugWidth + 'px'
      bug.style.height = this.options.bugHeight + 'px'
      bug.style.position = 'fixed'
      bug.style.top = '0'
      bug.style.left = '0'
      bug.style.zIndex = '9999999'
      this.bug = bug
      this.setPos()
    }
  }

  constructor(options: BugOptions) {
    this.options = {
      ...this.defaultOptions,
      ...options
    }
    this.zoom = (this.random(this.options.zoom, 10) / 10) as BugControllerOptions['zoom']
    this.wingsOpen = this.options.wingsOpen
    this.makeBug()
    this.angle_rad = this.deg2rad(this.angle_deg)
    this.angle_deg = this.random(0, 360, true)
  }

  go = () => {
    this.drawBug()
    this.animating = true
    this.going = requestAnimationFrame((t) => {
      this.animate(t)
    })
  }

  stop = () => {
    this.animating = false
    if (this.going) {
      clearTimeout(this.going)
      this.going = null
    }
    if (this.flyperiodical) {
      clearTimeout(this.flyperiodical)
      this.flyperiodical = null
    }
    if (this.twitchTimer) {
      clearTimeout(this.twitchTimer)
      this.twitchTimer = null
    }
  }

  remove = () => {
    this.active = false
    if (this.inserted && this.bug.parentNode) {
      this.bug.parentNode.removeChild(this.bug)
      this.inserted = false
    }
  }

  reset = () => {
    this.alive = true
    this.active = true
    this.bug.style.bottom = ''
    this.bug.style.top = '0'
    this.bug.style.left = '0'
    this.bug.classList.remove('bug-dead')
  }

  animate = (t) => {
    if (!this.animating || !this.alive || !this.active) return
    this.going = requestAnimationFrame((t) => {
      this.animate(t)
    })

    if (this._lastTimestamp === undefined) {
      this._lastTimestamp = t
    }

    let delta = t - this._lastTimestamp!

    if (delta < 40) return // don't animate too frequently

    // sometimes if the browser doesnt have focus, or the delta in request animation
    // frame can be very large. We set a sensible max so that the bugs dont spaz out.

    if (delta > 200) delta = 200

    this._lastTimestamp = t

    if (--this.toggle_stationary_counter <= 0) {
      this.toggleStationary()
    }

    if (this.stationary) {
      return
    }

    if (--this.edge_test_counter <= 0 && this.bug_near_window_edge()) {
      // if near edge, go away from edge
      this.angle_deg %= 360
      if (this.angle_deg < 0) this.angle_deg += 360

      if (Math.abs(this.directions[this.near_edge] - this.angle_deg) > 15) {
        const angle1 = this.directions[this.near_edge] - this.angle_deg
        const angle2 = 360 - this.angle_deg + this.directions[this.near_edge]
        this.large_turn_angle_deg = Math.abs(angle1) < Math.abs(angle2) ? angle1 : angle2

        this.edge_test_counter = 10
        this.large_turn_counter = 100
        this.small_turn_counter = 30
      }
    }
    if (--this.large_turn_counter <= 0) {
      this.large_turn_angle_deg = this.random(1, this.options.maxLargeTurnDeg, true)
      this.next_large_turn()
    }
    if (--this.small_turn_counter <= 0) {
      this.angle_deg += this.random(1, this.options.maxSmallTurnDeg)
      this.next_small_turn()
    } else {
      let dangle = this.random(1, this.options.maxWiggleDeg, true)
      if (
        (this.large_turn_angle_deg > 0 && dangle < 0) ||
        (this.large_turn_angle_deg < 0 && dangle > 0)
      ) {
        dangle = -dangle // ensures both values either + or -
      }
      this.large_turn_angle_deg -= dangle
      this.angle_deg += dangle
    }

    this.angle_rad = this.deg2rad(this.angle_deg)

    const dx = Math.cos(this.angle_rad) * this.options.walkSpeed * (delta / 100)
    const dy = -Math.sin(this.angle_rad) * this.options.walkSpeed * (delta / 100)
    const left = this.bug.left || 0
    const top = this.bug.top || 0
    this.moveBug(left + dx, top + dy, 90 - this.angle_deg)
    this.walkFrame()
  }
  drawBug = (top?: number, left?: number) => {
    if (!this.bug) {
      this.makeBug()
    }
    if (!this.bug) return

    if (top && left) {
      this.setPos(top, left)
    } else {
      this.setPos(this.bug.top, this.bug.left)
    }
    if (!this.inserted) {
      this.inserted = true
      document.body.appendChild(this.bug)
    }
  }

  toggleStationary = () => {
    this.stationary = !this.stationary
    this.next_stationary()
    const ypos = this.wingsOpen ? '0' : '-' + this.options.bugHeight + 'px'
    if (this.stationary) {
      this.bug.style.backgroundPosition = '0 ' + ypos
    } else {
      this.bug.style.backgroundPosition = '-' + this.options.bugWidth + 'px ' + ypos
    }
  }

  walkFrame = () => {
    const xpos = -1 * (this.walkIndex * this.options.bugWidth) + 'px',
      ypos = this.wingsOpen ? '0' : '-' + this.options.bugHeight + 'px'
    this.bug.style.backgroundPosition = xpos + ' ' + ypos
    this.walkIndex++
    if (this.walkIndex >= this.options.num_frames) this.walkIndex = 0
  }

  fly = (landingPosition: Pos) => {
    const currentTop = this.bug.top || 0
    const currentLeft = this.bug.left || 0
    const diffx = currentLeft - landingPosition.left
    const diffy = currentTop - landingPosition.top
    const angle = Math.atan(diffy / diffx)

    if (Math.abs(diffx) + Math.abs(diffy) < 50) {
      this.bug.style.backgroundPosition =
        -2 * this.options.bugWidth + 'px -' + 2 * this.options.bugHeight + 'px'
    }
    if (Math.abs(diffx) + Math.abs(diffy) < 30) {
      this.bug.style.backgroundPosition =
        -1 * this.options.bugWidth + 'px -' + 2 * this.options.bugHeight + 'px'
    }
    if (Math.abs(diffx) + Math.abs(diffy) < 10) {
      // close enough:
      this.bug.style.backgroundPosition = '0 0' //+row+'px'));
      this.stop()
      this.go()
      return
    }

    // make it wiggle: disabled becuase its just too fast to see... better would be to make its path wiggly.
    //angle = angle - (this.deg2rad(this.random(0,10)));
    //console.log('angle: ',this.rad2deg(angle));

    let dx = Math.cos(angle) * this.options.flySpeed
    let dy = Math.sin(angle) * this.options.flySpeed

    if (
      (currentLeft > landingPosition.left && dx > 0) ||
      (currentLeft > landingPosition.left && dx < 0)
    ) {
      // make sure angle is right way
      dx = -1 * dx
      if (Math.abs(diffx) < Math.abs(dx)) {
        dx = dx / 4
      }
    }
    if (
      (currentTop < landingPosition.top && dy < 0) ||
      (currentTop > landingPosition.top && dy > 0)
    ) {
      dy = -1 * dy
      if (Math.abs(diffy) < Math.abs(dy)) {
        dy = dy / 4
      }
    }

    this.moveBug(currentLeft + dx, currentTop + dy)
  }

  flyRand = () => {
    this.stop()
    const landingPosition = {
      top: this.random(
        this.options.edge_resistance,
        document.documentElement.clientHeight - this.options.edge_resistance
      ),
      left: this.random(
        this.options.edge_resistance,
        document.documentElement.clientWidth - this.options.edge_resistance
      )
    }
    this.startFlying(landingPosition)
  }

  startFlying = (landingPosition: Pos) => {
    const currentTop = this.bug.top!
    const currentLeft = this.bug.left!
    const diffx = landingPosition.left - currentLeft
    const diffy = landingPosition.top - currentTop

    this.bug.left = landingPosition.left
    this.bug.top = landingPosition.top

    this.angle_rad = Math.atan(diffy / diffx)
    this.angle_deg = this.rad2deg(this.angle_rad)

    if (diffx > 0) {
      // going left: quadrant 1 or 2
      this.angle_deg = 90 + this.angle_deg
    } else {
      // going right: quadrant 3 or 4
      this.angle_deg = 270 + this.angle_deg
    }

    this.moveBug(currentLeft, currentTop, this.angle_deg)

    // start animation:
    this.flyperiodical = window.setInterval(() => {
      this.fly(landingPosition)
    }, 10)
  }

  flyIn = () => {
    if (!this.bug) {
      this.makeBug()
    }

    if (!this.bug) return

    this.stop()
    // pick a random side:
    let side = Math.round(Math.random() * 4 - 0.5)
    const d = document
    const e = d.documentElement
    const g = d.getElementsByTagName('body')[0]
    const windowX = window.innerWidth || e.clientWidth || g.clientWidth
    const windowY = window.innerHeight || e.clientHeight || g.clientHeight
    if (side > 3) side = 3
    if (side < 0) side = 0
    const style = {} as Pos
    if (side === 0) {
      // top:
      style.top = -2 * this.options.bugHeight
      style.left = Math.random() * windowX
    } else if (side === 1) {
      // right:
      style.top = Math.random() * windowY
      style.left = windowX + 2 * this.options.bugWidth
    } else if (side === 2) {
      // bottom:
      style.top = windowY + 2 * this.options.bugHeight
      style.left = Math.random() * windowX
    } else {
      // left:
      style.top = Math.random() * windowY
      style.left = -3 * this.options.bugWidth
    }
    const row = this.wingsOpen ? '0' : '-' + this.options.bugHeight + 'px'
    this.bug.style.backgroundPosition = -3 * this.options.bugWidth + 'px ' + row
    this.bug.top = style.top
    this.bug.left = style.left

    this.drawBug()

    // landing position:
    const landingPosition = {
      top: this.random(
        this.options.edge_resistance,
        document.documentElement.clientHeight - this.options.edge_resistance
      ),
      left: this.random(
        this.options.edge_resistance,
        document.documentElement.clientWidth - this.options.edge_resistance
      )
    }
    this.startFlying(landingPosition)
  }

  walkIn = () => {
    if (!this.bug) {
      this.makeBug()
    }

    if (!this.bug) return

    this.stop()
    // pick a random side:
    let side = Math.round(Math.random() * 4 - 0.5)
    const d = document
    const e = d.documentElement
    const g = d.getElementsByTagName('body')[0]
    const windowX = window.innerWidth || e.clientWidth || g.clientWidth
    const windowY = window.innerHeight || e.clientHeight || g.clientHeight
    if (side > 3) side = 3
    if (side < 0) side = 0
    const style = {} as Pos
    if (side === 0) {
      // top:
      style.top = -1.3 * this.options.bugHeight
      style.left = Math.random() * windowX
    } else if (side === 1) {
      // right:
      style.top = Math.random() * windowY
      style.left = windowX + 0.3 * this.options.bugWidth
    } else if (side === 2) {
      // bottom:
      style.top = windowY + 0.3 * this.options.bugHeight
      style.left = Math.random() * windowX
    } else {
      // left:
      style.top = Math.random() * windowY
      style.left = -1.3 * this.options.bugWidth
    }
    const row = this.wingsOpen ? '0' : '-' + this.options.bugHeight + 'px'
    this.bug.style.backgroundPosition = -3 * this.options.bugWidth + 'px ' + row
    this.bug.top = style.top
    this.bug.left = style.left

    this.drawBug()

    // start walking:
    this.go()
  }

  flyOff = () => {
    this.stop()
    // pick a random side to fly off to, where 0 is top and continuing clockwise.
    const side = this.random(0, 3)
    const style = {} as Pos
    const d = document
    const e = d.documentElement
    const g = d.getElementsByTagName('body')[0]
    const windowX = window.innerWidth || e.clientWidth || g.clientWidth
    const windowY = window.innerHeight || e.clientHeight || g.clientHeight

    if (side === 0) {
      // top:
      style.top = -200
      style.left = Math.random() * windowX
    } else if (side === 1) {
      // right:
      style.top = Math.random() * windowY
      style.left = windowX + 200
    } else if (side === 2) {
      //bottom:
      style.top = windowY + 200
      style.left = Math.random() * windowX
    } else {
      // left:
      style.top = Math.random() * windowY
      style.left = -200
    }
    this.startFlying(style)
  }

  die = () => {
    this.stop()
    //pick death style:
    const deathType = this.random(0, this.options.numDeathTypes - 1)

    this.alive = false
    this.drop(deathType)
  }

  drop = (deathType) => {
    const startPos = this.bug.top
    const d = document
    const e = d.documentElement
    const g = d.getElementsByTagName('body')[0]
    const pos = window.innerHeight || e.clientHeight || g.clientHeight
    const finalPos = pos - this.options.bugHeight
    const rotationRate = this.random(0, 20, true)
    this.bug.classList.add('bug-dead')

    this.dropTimer = requestAnimationFrame((t) => {
      this._lastTimestamp = t
      this.dropping(t, startPos, finalPos, rotationRate, deathType)
    })
  }

  dropping = (t, startPos, finalPos, rotationRate, deathType) => {
    const elapsedTime = t - this._lastTimestamp!
    const deltaPos = 0.002 * (elapsedTime * elapsedTime)
    let newPos = startPos + deltaPos

    if (newPos >= finalPos) {
      newPos = finalPos
      clearTimeout(this.dropTimer)

      this.angle_deg = 0
      this.angle_rad = this.deg2rad(this.angle_deg)
      this.bug.style.transform = 'rotate(' + (90 - this.angle_deg) + 'deg) scale(' + this.zoom + ')'
      this.bug.style.top = ''
      // because it is (or might be) zoomed and rotated, we cannot just just bottom = 0. Figure out real bottom position:
      const rotationOffset =
        (this.options.bugWidth * this.zoom - this.options.bugHeight * this.zoom) / 2
      const zoomOffset = (this.options.bugHeight / 2) * (1 - this.zoom)
      this.bug.style.bottom = Math.ceil(rotationOffset - zoomOffset) + 'px' // because its rotated and zoomed.
      this.bug.style.left = this.bug.left + 'px'
      this.bug.style.backgroundPosition = '-' + deathType * 2 * this.options.bugWidth + 'px 100%'

      this.twitch(deathType)

      return
    }

    this.dropTimer = requestAnimationFrame((t) => {
      this.dropping(t, startPos, finalPos, rotationRate, deathType)
    })

    if (elapsedTime < 20) return

    this.angle_deg = (this.angle_deg + rotationRate) % 360
    this.angle_rad = this.deg2rad(this.angle_deg)

    this.moveBug(this.bug.left!, newPos, this.angle_deg)
  }

  twitch = (deathType: number, _legPos?: number) => {
    let legPos = _legPos || 0
    if (deathType === 0 || deathType === 1) {
      this.twitchTimer = window.setTimeout(() => {
        this.bug.style.backgroundPosition =
          '-' + (deathType * 2 + (legPos % 2)) * this.options.bugWidth + 'px 100%'
        this.twitchTimer = window.setTimeout(() => {
          legPos++
          this.bug.style.backgroundPosition =
            '-' + (deathType * 2 + (legPos % 2)) * this.options.bugWidth + 'px 100%'
          this.twitch(deathType, ++legPos)
        }, this.random(300, 800))
      }, this.random(1000, 10000))
    }
  }

  next_small_turn = () => {
    this.small_turn_counter = Math.round(Math.random() * 10)
  }
  next_large_turn = () => {
    this.large_turn_counter = Math.round(Math.random() * 40)
  }
  next_stationary = () => {
    this.toggle_stationary_counter = this.random(50, 300)
  }
  bug_near_window_edge = () => {
    const left = this.bug.left || 0
    const top = this.bug.top || 0
    this.near_edge = 0
    if (top < this.options.edge_resistance) this.near_edge |= Direction.NEAR_TOP_EDGE
    else if (top > document.documentElement.clientHeight - this.options.edge_resistance)
      this.near_edge |= Direction.NEAR_BOTTOM_EDGE
    if (left < this.options.edge_resistance) this.near_edge |= Direction.NEAR_LEFT_EDGE
    else if (left > document.documentElement.clientWidth - this.options.edge_resistance)
      this.near_edge |= Direction.NEAR_RIGHT_EDGE
    return this.near_edge
  }

  getPos = () => {
    if (this.inserted && this.bug && this.bug.style) {
      return {
        top: parseInt(String(this.bug.top), 10),
        left: parseInt(String(this.bug.left), 10)
      }
    }
    return null
  }
}
