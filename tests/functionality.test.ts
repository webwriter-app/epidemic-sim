import "mocha/mocha.js"
import "mocha/mocha.css"
import {getMochaConfig} from "@webwriter/build/test"
import {assert} from "chai"
import "../widgets/webwriter-epidemic-sim"
import {
  readPersistedState,
  writePersistedState,
  STATE_ATTRIBUTE,
  STATE_SCRIPT_TYPE,
  encodePersistedState,
  parsePersistedState,
} from "../widgets/orchestration/persisted-state"
import type {Hotspot, SimulationConfig, SimulationSnapshot} from "../widgets/simulation/types"

mocha.setup(getMochaConfig())

const sampleConfig: SimulationConfig = {
  modelType: "sir",
  incubationDuration: 120,
  immunityDuration: 240,
  mortalityProbability: 0.01,
  population: 100,
  speed: 1,
  infectionRadius: 10,
  infectionProbability: 0.1,
  recoveryDuration: 240,
  quarantineEnabled: false,
  quarantineProbability: 0.5,
  quarantineDuration: 120,
  hotspotsEnabled: true,
  hotspotCount: 0,
  hotspotVisitProbability: 0.01,
  hotspotStayDuration: 48,
  hotspotMaxAgents: 5,
  hotspotSize: 40,
  communitiesEnabled: false,
  communityLeaveProbability: 0.01,
}

function sampleHotspot(): Hotspot {
  return {
    id: 0,
    communityId: null,
    rect: {x: 10, y: 20, width: 40, height: 40},
  }
}

function sampleSnapshot(hotspot: Hotspot): SimulationSnapshot {
  return {
    id: "snapshot-1",
    label: "Snapshot 1",
    createdAt: 1_700_000_000_000,
    chartImageJpeg: "data:image/jpeg;base64,dGVzdA==",
    estimatedR0: 2.5,
    config: {...sampleConfig},
    frameIndex: 48,
    epidemicEnded: false,
    susceptibleCount: 80,
    exposedCount: 0,
    infectedCount: 10,
    recoveredCount: 10,
    deadCount: 0,
    susceptibleHistory: [100, 90, 80],
    exposedHistory: [0, 0, 0],
    infectedHistory: [0, 10, 10],
    recoveredHistory: [0, 0, 10],
    deadHistory: [0, 0, 0],
    userHotspots: [hotspot],
  }
}

describe("<webwriter-epidemic-sim>", function () {
  before(function () {
    document.body.insertAdjacentHTML("beforeend", `<webwriter-epidemic-sim></webwriter-epidemic-sim>`)
  })

  describe("initialize", function () {
    it("is defined", async function () {
      const el = document.querySelector("webwriter-epidemic-sim:defined")
      assert.isNotNull(el)
    })
  })

  describe("persisted state", function () {
    it("roundtrips hotspots via widget-state attribute and script child", function () {
      const host = document.createElement("div")
      const hotspot = sampleHotspot()

      writePersistedState(host, {
        version: 1,
        hotspots: [hotspot],
        nextHotspotId: 1,
        snapshots: [],
        nextSnapshotId: 1,
      })

      assert.isNotNull(host.getAttribute(STATE_ATTRIBUTE))
      assert.isNotNull(host.querySelector(`:scope > script[type="${STATE_SCRIPT_TYPE}"]`))

      const restored = readPersistedState(host)
      assert.isNotNull(restored)
      assert.lengthOf(restored!.hotspots, 1)
      assert.strictEqual(restored!.hotspots[0].id, 0)
      assert.deepEqual(restored!.hotspots[0].rect, hotspot.rect)
      assert.strictEqual(restored!.nextHotspotId, 1)
      assert.lengthOf(restored!.snapshots, 0)
    })

    it("roundtrips snapshots including chart image", function () {
      const host = document.createElement("div")
      const hotspot = sampleHotspot()
      const snapshot = sampleSnapshot(hotspot)

      writePersistedState(host, {
        version: 1,
        hotspots: [hotspot],
        nextHotspotId: 1,
        snapshots: [snapshot],
        nextSnapshotId: 2,
      })

      const restored = readPersistedState(host)
      assert.isNotNull(restored)
      assert.lengthOf(restored!.snapshots, 1)
      assert.strictEqual(restored!.nextSnapshotId, 2)

      const restoredSnapshot = restored!.snapshots[0]
      assert.strictEqual(restoredSnapshot.id, "snapshot-1")
      assert.strictEqual(restoredSnapshot.label, "Snapshot 1")
      assert.strictEqual(restoredSnapshot.chartImageJpeg, snapshot.chartImageJpeg)
      assert.strictEqual(restoredSnapshot.estimatedR0, 2.5)
      assert.strictEqual(restoredSnapshot.frameIndex, 48)
      assert.deepEqual(restoredSnapshot.infectedHistory, [0, 10, 10])
      assert.lengthOf(restoredSnapshot.userHotspots, 1)
      assert.strictEqual(restoredSnapshot.userHotspots[0].id, 0)

      const reparsed = parsePersistedState(encodePersistedState(restored!))
      assert.isNotNull(reparsed)
      assert.strictEqual(reparsed!.snapshots[0].chartImageJpeg, snapshot.chartImageJpeg)
    })
  })
})

mocha.run()
