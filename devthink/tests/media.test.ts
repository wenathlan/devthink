// # media.test — the media pipeline and transcode battery the saddle
// ownership law moved to devthink (wave a, actions 108-112: the master
// virtualization engine keeps only the sandbox/vm/runner/vgpu/vcpu/
// ports/hardware-virtual modalities, and the media pipeline and
// transcode domain rides its new owner — the battery answers the same
// contracts the engine suite once pinned: the 24 stage catalog, the 30
// mode taxonomy, the nvenc preset ladder, the ffmpeg command synthesis,
// the createoptimal encoder policy, the pipeline skip rules and
// fail-fast walks and the passage secure channel roundtrip with tamper
// rejection). runnable with vitest: pnpm vitest run tests/media.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  buildffmpegcommand,
  createoptimal,
  defaultpassagechannel,
  type mediajob,
  mediapipeline,
  mediapipelineerror,
  type mediaprobe,
  nvencpresets,
  passagesecurechannel,
  probefromname,
  recommendpreset,
  stagecatalog,
  stageorderv5,
  transcodemodecatalog,
  validatestagecatalog,
} from "../media.js";

/** the demo transcode job the battery walks (the hevc hdr to av1 sdr
 * tonemap path with the p4 preset). */
const demojob: mediajob = {
  id: "test-job",
  inputpath: "/data/in/demo_4k_hdr10plus_interlaced.mp4",
  outputpath: "/data/out/demo_1080p_av1_p4.mp4",
  mode: "hevc_hdr_to_av1_sdr_tonemap",
  outputprofile: {
    videocodec: "av1",
    audiocodec: "aac",
    resolution: { w: 1920, h: 1080 },
    bitratekbps: 8000,
    preset: "p4",
    tonemap: true,
    vmaftarget: 93,
    bframes: 3,
    gopsec: 4,
  },
  priority: 1,
};

/** resolves one stage name from the live catalog by its index. */
function stagename(index: number): string {
  const entry = stagecatalog.find((stage) => stage.index === index);
  assert.ok(entry !== undefined, `the stage catalog must carry index ${index}`);
  return entry.name;
}

describe("the media contract (the saddle ownership transfer, wave a)", () => {
  it("the stage catalog carries exactly 24 ordered stages", () => {
    const check = validatestagecatalog();
    assert.equal(check.count, 24);
    assert.equal(check.ordered, true);
    assert.equal(stagecatalog[0]?.name, "01_ingest_audit");
    assert.equal(stagecatalog[23]?.name, "24_artifact_gc_finalize");
    assert.equal(stageorderv5.length, 24);
  });

  it("the transcode mode taxonomy counts 30 modes", () => {
    assert.equal(transcodemodecatalog.length, 30);
    const families = new Set(transcodemodecatalog.map((entry) => entry.family));
    assert.ok(families.size >= 6, `expected at least 6 mode families, got ${families.size}`);
  });

  it("the nvenc preset ladder walks p1..p7 with multipass grades", () => {
    assert.deepEqual(
      nvencpresets.map((entry) => entry.preset),
      ["p1", "p2", "p3", "p4", "p5", "p6", "p7"],
    );
    assert.equal(nvencpresets[6]?.multipass, "fullres");
    assert.equal(recommendpreset("av1", "quality", false), "p5");
    assert.equal(recommendpreset("h264", "ultralowlatency", true), "p1");
  });

  it("buildffmpegcommand emits the blackwell nvenc block with p4 vbr_hq b_ref_mode 2", () => {
    const probe = probefromname(demojob.inputpath);
    const cmd = buildffmpegcommand(demojob, probe, "15_nvenc_blackwell_encode");
    const line = cmd.join(" ");
    assert.ok(line.includes("-c:v av1_nvenc"));
    assert.ok(line.includes("-preset p4"));
    assert.ok(line.includes("-rc vbr_hq"));
    assert.ok(line.includes("-multipass 2"));
    assert.ok(line.includes("-b_ref_mode 2"));
    assert.ok(line.includes("-temporal_aq 1"));
    assert.ok(line.includes("-rc-lookahead 32"));
    assert.ok(line.includes("tonemap_cuda=tonemap=hable"));
    assert.ok(line.includes("colorspace_cuda=bt2020:bt709"));
    assert.ok(line.includes("bwdif_cuda=0:-1:0"));
    assert.ok(line.includes("-tier high"), "av1 must request tier high");
  });

  it("createoptimal forces nvenc for 4k av1 and qsv for low-latency h264", () => {
    const hdrprobe = probefromname(demojob.inputpath);
    const av1 = createoptimal(demojob, hdrprobe);
    assert.equal(av1.vendor, "nvidianvenc");
    const livejob: mediajob = {
      ...demojob,
      mode: "cbr_low_latency",
      outputprofile: { ...demojob.outputprofile, videocodec: "h264", preset: "p1", tonemap: false },
    };
    const live = createoptimal(livejob, probefromname("/data/in/1080p_progressive.mp4"));
    assert.equal(live.vendor, "intelqsv");
  });

  it("the pipeline executes 24 stages, honors skip rules and fail-fast", () => {
    const pipe = new mediapipeline();
    const probe = probefromname(demojob.inputpath);
    const result = pipe.executejob(demojob, probe);
    assert.equal(result.success, true);
    assert.equal(result.metrics.length, 24);
    const skipped = result.metrics.filter((record) => record.skipped).map((record) => record.stage);
    assert.ok(!skipped.includes("10DeinterlaceBwdifCuda"), "interlaced input must keep deinterlace");
    assert.ok(!skipped.includes("12TonemapBt2020Cuda"), "hdr tonemap job must keep tonemap");
    assert.ok(skipped.includes("18SubtitleBurn"), "no subtitle path must skip the burn");
    assert.ok(result.passageframes >= 1, "stage 20 must seal at least one passage frame");
    const clean = pipe.executejob(demojob, probefromname("/data/in/clean_1080p.mp4"));
    assert.ok(
      clean.metrics.some((record) => record.stage === "10DeinterlaceBwdifCuda" && record.skipped),
      "progressive input must skip deinterlace",
    );
  });

  it("non-recoverable stage failures stop the walk", () => {
    const pipe = new mediapipeline();
    const badjob: mediajob = {
      ...demojob,
      outputprofile: { ...demojob.outputprofile, videocodec: "av1", preset: "p1" },
    };
    const result = pipe.executejob(badjob, probefromname("/data/in/demo.mp4"));
    assert.equal(result.success, false);
    assert.ok(result.metrics.length < 24, "fail-fast must stop before stage 24");
    assert.ok(result.metrics.some((record) => record.error !== undefined), "the failing stage must record its error");
  });

  it("the passage channel seals, signs and reopens at MTU 65536", () => {
    assert.equal(defaultpassagechannel.mtu, 65536);
    assert.equal(defaultpassagechannel.auth, "ed25519");
    assert.equal(defaultpassagechannel.encryption, "chacha20-poly1305");
    const channel = new passagesecurechannel();
    const big = "x".repeat(70_000);
    const frames = channel.seal(big);
    assert.ok(frames.length >= 2, "payload above the MTU must split into frames");
    const reopened = Buffer.concat(frames.map((frame) => channel.open(frame)));
    assert.equal(reopened.length, 70_000);
    const tampered = { ...frames[0], signature: Buffer.from("0".repeat(64), "hex") };
    assert.throws(() => channel.open(tampered), mediapipelineerror);
  });

  it("media pipeline executes three synthetic jobs honoring skip rules and fail-fast", () => {
    /** an interlaced 4k hdr probe that keeps every gpu stage eligible. */
    const hdrprobe: mediaprobe = {
      durationsec: 135.2,
      video: {
        codec: "h264",
        width: 3840,
        height: 2160,
        fps: 29.97,
        bitdepth: 10,
        hdr: true,
        interlaced: true,
      },
      audio: [{ codec: "aac", samplerate: 48000, channels: 2 }],
      estimatedworkingsetmb: 2048,
    };
    /** a plain progressive sdr probe for 1080p material. */
    const flatprobe: mediaprobe = {
      ...hdrprobe,
      video: {
        codec: "h264",
        width: 1920,
        height: 1080,
        fps: 29.97,
        bitdepth: 8,
        hdr: false,
        interlaced: false,
      },
    };
    const healthy: mediajob = {
      id: "sim-healthy",
      inputpath: "/data/in/scene_4k_hdr_interlaced.mp4",
      outputpath: "/data/out/scene_av1_p4.mp4",
      mode: "hevc_hdr_to_av1_sdr_tonemap",
      outputprofile: {
        videocodec: "av1",
        audiocodec: "aac",
        resolution: { w: 1920, h: 1080 },
        bitratekbps: 8000,
        preset: "p4",
        tonemap: true,
        vmaftarget: 93,
        bframes: 3,
        gopsec: 4,
      },
      priority: 1,
      memoryplandigest: "sha256:simdigest",
    };
    const doomed: mediajob = {
      id: "sim-doomed",
      inputpath: "/data/in/talk_1080p_progressive.mp4",
      outputpath: "/data/out/talk_av1_p1.mp4",
      mode: "cbr_low_latency",
      outputprofile: {
        videocodec: "av1",
        audiocodec: "aac",
        resolution: { w: 1920, h: 1080 },
        bitratekbps: 4000,
        preset: "p1",
        tonemap: false,
      },
      priority: 2,
    };
    const subtitled: mediajob = {
      id: "sim-subtitled",
      inputpath: "/data/in/talk_1080p_progressive.mp4",
      outputpath: "/data/out/talk_h264_p4.mp4",
      mode: "cbr_low_latency",
      outputprofile: {
        videocodec: "h264",
        audiocodec: "aac",
        resolution: { w: 1920, h: 1080 },
        bitratekbps: 6000,
        preset: "p4",
        tonemap: false,
      },
      priority: 2,
      metadata: { subtitlepath: "/data/in/talk.srt", logopath: "/data/in/talk.png" },
    };

    const pipe = new mediapipeline({ failfast: true });
    const results = pipe.executebatch([healthy, doomed, subtitled], [hdrprobe, flatprobe, flatprobe], 2);
    assert.equal(results.length, 3, "the batch returns one result per job");

    const [healthyresult, doomedresult, subtitledresult] = results;
    assert.ok(healthyresult !== undefined && doomedresult !== undefined && subtitledresult !== undefined);

    assert.equal(healthyresult.success, true, "the healthy job finishes all 24 stages");
    assert.equal(healthyresult.metrics.length, 24);
    const skipped = healthyresult.metrics.filter((record) => record.skipped).map((record) => record.stage);
    assert.ok(!skipped.includes(stagename(10)), "interlaced input keeps deinterlace");
    assert.ok(!skipped.includes(stagename(12)), "hdr tonemap stays enabled");
    assert.ok(skipped.includes(stagename(13)), "no denoise mode skips the denoise stage");
    assert.ok(skipped.includes(stagename(18)), "no subtitle path skips the burn stage");
    const preview = healthyresult.ffmpegpreview.join(" ");
    assert.ok(preview.includes("-preset p4"), "the encode preview carries preset p4");
    assert.ok(preview.includes("-rc vbr_hq"), "the encode preview carries rc vbr_hq");
    assert.ok(preview.includes("-b_ref_mode 2"), "the encode preview carries b_ref_mode 2");
    assert.ok(preview.includes("bwdif_cuda=0:-1:0"), "the filter chain deinterlaces on cuda");
    assert.ok(healthyresult.passageframes >= 1, "stage 20 seals at least one passage frame");

    assert.equal(doomedresult.success, false, "the av1 p1 job must fail");
    const failure = doomedresult.metrics.find((record) => !record.success);
    assert.ok(failure !== undefined, "the failing stage is reported");
    assert.equal(failure.stage, stagename(15));
    assert.ok(failure.error !== undefined && /p1/.test(failure.error), "the report names the p1 rejection");
    assert.ok(doomedresult.metrics.length < 24, "fail-fast aborts the remaining stages");
    assert.ok(
      doomedresult.metrics.every((record) => record.index <= 15),
      "no record may exist beyond the aborted stage",
    );

    assert.equal(subtitledresult.success, true, "the subtitled job completes");
    assert.equal(subtitledresult.metrics.length, 24);
    assert.ok(
      !subtitledresult.metrics.filter((record) => record.stage === stagename(18)).some((record) => record.skipped),
      "a subtitle path keeps the burn stage active",
    );

    const direct = buildffmpegcommand(healthy, hdrprobe, stagename(15));
    assert.deepEqual(
      direct.filter((token) => token === "-preset" || token === "-rc"),
      ["-preset", "-rc"],
    );
    assert.equal(direct[direct.indexOf("-preset") + 1], "p4");
    assert.equal(direct[direct.indexOf("-rc") + 1], "vbr_hq");
    assert.equal(direct[direct.indexOf("-b_ref_mode") + 1], "2");
    assert.equal(direct[direct.indexOf("-multipass") + 1], "2");
  });

  it("passage secure channel seals, opens, splits at the mtu and rejects tampering", () => {
    const alice = new passagesecurechannel();
    const message = JSON.stringify({ vmid: "vm-sim", op: "migrate", phase: "cutover" });
    const frames = alice.seal(message);
    assert.equal(frames.length, 1, "a sub-mtu message seals into one frame");
    assert.equal(frames[0]?.truncated, false);
    const opened = alice.open(frames[0]);
    assert.equal(opened.toString("utf8"), message, "the roundtrip restores the plaintext");

    const flipped = Buffer.from(frames[0]?.payload ?? Buffer.alloc(0));
    flipped[0] = (flipped[0] ?? 0) ^ 0xff;
    const tampered = { frame: frames[0], payload: flipped };
    assert.throws(
      () => alice.open({ ...tampered.frame, payload: tampered.payload }),
      (error: unknown) =>
        error instanceof mediapipelineerror && error.code === "PASSAGE_OPEN" && /signature/i.test(error.message),
      "a flipped ciphertext byte must fail the ed25519 verification",
    );
    const reversed = Buffer.from(frames[0]?.signature ?? Buffer.alloc(0)).reverse();
    assert.throws(
      () => alice.open({ ...frames[0], signature: reversed }),
      (error: unknown) => error instanceof mediapipelineerror,
      "a swapped signature is rejected",
    );
    const bob = new passagesecurechannel();
    assert.throws(
      () => bob.open(frames[0]),
      (error: unknown) => error instanceof mediapipelineerror,
      "another channel key pair cannot open alice frames",
    );

    const big = Buffer.alloc(200000, 7);
    const split = alice.seal(big);
    assert.equal(split.length, Math.ceil(200000 / 65536), "the message splits at the 65536 mtu");
    assert.ok(
      split.every((frame) => frame.truncated),
      "every chunk is marked truncated",
    );
    const reassembled = Buffer.concat(split.map((frame) => alice.open(frame)));
    assert.equal(reassembled.equals(big), true, "the reassembled payload is byte identical");
  });
});
