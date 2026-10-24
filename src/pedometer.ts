// 휴대폰 가속도 센서로 걸음을 센다.
// 중력을 빼고 남은 흔들림에서 봉우리를 찾고, 일정한 박자로 몇 번 이어질 때만
// 걸음으로 인정한다. 폰을 한 번 흔들거나 내려놓는 움직임은 세지 않는다.

const PEAK = 0.8 // 걸음 봉우리로 볼 흔들림 (m/s²)
const RESET = 0.2 // 이 아래로 내려와야 다음 봉우리를 찾는다
const MIN_GAP = 250 // 걸음 사이 최소 간격 (ms), 초당 4걸음
const MAX_GAP = 2000 // 이보다 길게 멈추면 걷기가 끊긴 것으로 본다
const START_RUN = 5 // 이만큼 연달아 걸어야 세기 시작한다

export class Pedometer {
  private gravity = 9.81
  private smooth = 0
  private armed = true
  private lastPeak = -Infinity
  private pending = 0
  private counting = false

  // 가속도(중력 포함) 한 번을 넣으면 새로 센 걸음 수를 돌려준다.
  push(x: number, y: number, z: number, time: number) {
    const mag = Math.hypot(x, y, z)
    this.gravity = this.gravity * 0.9 + mag * 0.1
    this.smooth = this.smooth * 0.6 + (mag - this.gravity) * 0.4

    if (!this.armed) {
      if (this.smooth < RESET) this.armed = true
      return 0
    }
    if (this.smooth < PEAK) return 0
    this.armed = false

    const gap = time - this.lastPeak
    if (gap < MIN_GAP) return 0
    this.lastPeak = time

    if (gap > MAX_GAP) {
      this.counting = false
      this.pending = 1
      return 0
    }
    if (this.counting) return 1
    this.pending += 1
    if (this.pending < START_RUN) return 0
    this.counting = true
    const flushed = this.pending
    this.pending = 0
    return flushed
  }
}
