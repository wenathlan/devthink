// # vmcore.ts — the real machine core of the vm lane: an rv64im
// interpreter in typescript, the honest node-first implementation of the
// qemu-style seats (the tcg seat, the microvm seats and the machine
// seats execute real risc-v 64 machine code in-process when the host
// carries no qemu — the engine never pretends a boot it cannot run).
//
// THE REAL CORE LAW: this file decodes and executes real machine code —
// every fetch reads the memory image, every decode resolves the opcode
// the silicon resolves (rvc is out: the plain 32-bit encoding only),
// every execute writes the architectural state the isa pins (x0 hard
// wired to zero, 64-bit registers carried as bigint so the full
// rv64 arithmetic stays exact past the js number precision wall, the
// w instructions wrap at 32 bits the way the isa wraps them). no step
// is skipped, no result is canned: an illegal instruction traps with
// the honest code, an unsupported ecall refuses with the honest code,
// and the run answers the real exit code the program asked for.
//
// THE EXIT CONVENTION (the linux risc-v convention): the ecall
// instruction with a7 (x17) = 93 terminates the machine and the exit
// code is a0 (x10) — the same convention the linux risc-v kernel pins;
// every other ecall number answers the honest refusal (the core
// implements the exit door alone, never a pretend syscall surface).
// ebreak traps with the break code (exit -7, the sigtrap convention).
//
// THE LOADER LAW: a payload that sniffs elf loads for real — the
// elf64 little-endian header is parsed, every p_load segment maps at
// its p_vaddr (filesz bytes copied, memsz zero-filled), the entry
// point answers e_entry; a payload that is not elf maps raw at base
// zero with entry zero (the bare-metal convention); both loads bounds
// check against the memory image and refuse an out-of-image mapping.
//
// Pure typescript, zero host imports at load: the sha256 the run
// digest rides lazy node:crypto inside the executor (the browser-pure
// bundle keeps carrying the table).
//
// @module saddle/vmcore
// @family wave/saddlepr15
// @token vmcore
// @token rv64im
// @flag real-machine-code
// @flag node-first

/** The architectural state digest of one finished run. */
export interface Rv64RunResult {
  /** The exit code the program asked the exit door for (a0 at ecall 93),
   * or the negative trap code when the machine trapped. */
  exitcode: number;
  /** The count of retired instructions — the real step meter. */
  steps: number;
  /** The entry the loader answered (the e_entry of the elf, or zero). */
  entry: number;
  /** The pc the machine stopped at. */
  finalpc: number;
  /** The sha256 of the final architectural state (all 32 registers, the
   * pc and the step count) — the deterministic proof of the run. */
  statedigest: string;
  /** The first retired pcs (max 64) — the deterministic trace head. */
  trace: readonly number[];
  /** The load map the loader answered (the elf segments or the raw map). */
  loads: readonly { vaddr: number; filesz: number; memsz: number }[];
}

/** The default memory image size of one machine (2 mi b). */
const DEFAULTMEMORYBYTES = 0x200000;

/** The linux risc-v exit syscall number (the only ecall the core owns). */
const EXITSYSCALL = 93;

/** The bigint mask of one 64-bit word. */
const MASK64 = (1n << 64n) - 1n;

/** The bigint mask of one 32-bit word. */
const MASK32 = (1n << 32n) - 1n;

/** Sign-extends a 32-bit value into the 64-bit two's complement form. */
function sign32(value: bigint): bigint {
  const low = value & MASK32;
  return low & 0x80000000n ? (low - (1n << 32n)) & MASK64 : low;
}

/** Sign-extends an 8-bit value into the 64-bit two's complement form. */
function sign8(value: number): bigint {
  return (value & 0x80) !== 0 ? BigInt((value & 0xff) - 0x100) & MASK64 : BigInt(value & 0xff);
}

/** Sign-extends a 16-bit value into the 64-bit two's complement form. */
function sign16(value: number): bigint {
  return (value & 0x8000) !== 0 ? BigInt((value & 0xffff) - 0x10000) & MASK64 : BigInt(value & 0xffff);
}

/** Reads the little-endian n-byte word at offset (n <= 8). */
function readle(memory: Uint8Array, offset: number, n: number): bigint {
  let value = 0n;
  for (let index = n - 1; index >= 0; index -= 1) {
    value = (value << 8n) | BigInt(memory[offset + index] ?? 0);
  }
  return value;
}

/** Writes the little-endian n-byte word at offset (n <= 8). */
function writele(memory: Uint8Array, offset: number, n: number, value: bigint): void {
  for (let index = 0; index < n; index += 1) {
    memory[offset + index] = Number((value >> BigInt(index * 8)) & 0xffn);
  }
}

/** Decodes the payload into bytes: an elf payload is the base64 body,
 * a raw payload maps as the bare-metal image (base64 first, utf8
 * otherwise — the same body the runners stage). */
function payloadbytes(payload: string | Uint8Array): Uint8Array {
  if (payload instanceof Uint8Array) return payload;
  const compact = payload.replace(/\s/g, "");
  if (/^[A-Za-z0-9+/=]+$/.test(compact) && compact.length >= 8) {
    try {
      return Uint8Array.from(atob(compact), (byte) => byte.charCodeAt(0));
    } catch {
      /* fall through to the utf8 read — the honest decode failure */
    }
  }
  return new TextEncoder().encode(payload);
}

/** Answers true when the bytes carry the elf64 magic. */
function iself(bytes: Uint8Array): boolean {
  return bytes.length >= 64 && bytes[0] === 0x7f && bytes[1] === 0x45 && bytes[2] === 0x4c && bytes[3] === 0x46;
}

/** One load map entry of the loader. */
interface LoadEntry {
  vaddr: number;
  filesz: number;
  memsz: number;
}

/** Loads the payload into a fresh memory image — the elf segments map
 * at their p_vaddr, a raw payload maps at base zero; out-of-image
 * mappings refuse with the typed error (the loader never truncates). */
function loadimage(
  bytes: Uint8Array,
  memorybytes: number,
): { memory: Uint8Array; entry: number; loads: LoadEntry[] } {
  const memory = new Uint8Array(memorybytes);
  const loads: LoadEntry[] = [];
  if (iself(bytes)) {
    if (bytes[4] !== 2 || bytes[5] !== 1) {
      throw Object.assign(new Error("the vm core loads elf64 little-endian images alone (the class/data bytes disagree)"), {
        code: "RV64_ELF_ENCODING_REFUSED",
      });
    }
    const phoff = Number(readle(bytes, 32, 8));
    const phentsize = Number(readle(bytes, 54, 2));
    const phnum = Number(readle(bytes, 56, 2));
    const entry = Number(readle(bytes, 24, 8));
    for (let index = 0; index < phnum; index += 1) {
      const at = phoff + index * phentsize;
      const ptype = Number(readle(bytes, at, 4));
      if (ptype !== 1) continue;
      const offset = Number(readle(bytes, at + 8, 8));
      const vaddr = Number(readle(bytes, at + 16, 8));
      const filesz = Number(readle(bytes, at + 32, 8));
      const memsz = Number(readle(bytes, at + 40, 8));
      if (vaddr + memsz > memorybytes || offset + filesz > bytes.length) {
        throw Object.assign(
          new Error(`the p_load segment at ${vaddr} (${memsz} bytes) does not fit the ${memorybytes}-byte image`),
          { code: "RV64_SEGMENT_OUT_OF_IMAGE" },
        );
      }
      memory.set(bytes.subarray(offset, offset + filesz), vaddr);
      loads.push({ vaddr, filesz, memsz });
    }
    return { memory, entry, loads };
  }
  if (bytes.length > memorybytes) {
    throw Object.assign(new Error(`the raw image (${bytes.length} bytes) does not fit the ${memorybytes}-byte memory`), {
      code: "RV64_SEGMENT_OUT_OF_IMAGE",
    });
  }
  memory.set(bytes, 0);
  loads.push({ vaddr: 0, filesz: bytes.length, memsz: bytes.length });
  return { memory, entry: 0, loads };
}

/** Extracts the u-type immediate (lui/auipc) of one instruction. */
function immu(instruction: number): number {
  return instruction & 0xfffff000;
}

/** Extracts the i-type immediate of one instruction (sign-extended). */
function immi(instruction: number): number {
  const raw = (instruction >>> 20) & 0xfff;
  return (raw & 0x800) !== 0 ? raw - 0x1000 : raw;
}

/** Extracts the s-type immediate (stores) of one instruction. */
function imms(instruction: number): number {
  const low = (instruction >>> 7) & 0x1f;
  const high = (instruction >>> 25) & 0x7f;
  const raw = (high << 5) | low;
  return (raw & 0x800) !== 0 ? raw - 0x1000 : raw;
}

/** Extracts the b-type immediate (branches) of one instruction. */
function immb(instruction: number): number {
  const bit12 = (instruction >>> 31) & 0x1;
  const bits105 = (instruction >>> 25) & 0x3f;
  const bits41 = (instruction >>> 8) & 0xf;
  const bit11 = (instruction >>> 7) & 0x1;
  const raw = (bit12 << 12) | (bit11 << 11) | (bits105 << 5) | (bits41 << 1);
  return (raw & 0x1000) !== 0 ? raw - 0x2000 : raw;
}

/** Extracts the j-type immediate (jal) of one instruction. */
function immj(instruction: number): number {
  const bit20 = (instruction >>> 31) & 0x1;
  const bits109 = (instruction >>> 21) & 0x3ff;
  const bit11 = (instruction >>> 20) & 0x1;
  const bits1912 = (instruction >>> 12) & 0xff;
  const raw = (bit20 << 20) | (bits1912 << 12) | (bit11 << 11) | (bits109 << 1);
  return (raw & 0x100000) !== 0 ? raw - 0x200000 : raw;
}

/** Runs the rv64im machine over one memory image — the real
 * fetch/decode/execute loop. the trap codes answer negative (the
 * sigill and sigtrap conventions) and the step meter counts every
 * retired instruction, so two runs of one image answer identical
 * state digests (the deterministic proof). */
export function executerv64(
  memory: Uint8Array,
  entry: number,
  options: { maxsteps?: number } = {},
): { exitcode: number; steps: number; finalpc: number; trace: number[] } {
  const maxsteps = Math.max(1, Math.round(options.maxsteps ?? 1_000_000));
  const regs = new Array<bigint>(32).fill(0n);
  let pc = entry >>> 0;
  let steps = 0;
  const trace: number[] = [];
  const record = (at: number) => {
    if (trace.length < 64) trace.push(at);
  };
  const illegal = (at: number, word: number) =>
    Object.assign(new Error(`the instruction 0x${word.toString(16).padStart(8, "0")} at 0x${at.toString(16)} is not rv64im`), {
      code: "RV64_ILLEGAL_INSTRUCTION",
      at,
    });
  while (steps < maxsteps) {
    if (pc + 4 > memory.length) {
      throw Object.assign(new Error(`the pc 0x${pc.toString(16)} ran off the image (the machine has no fetch there)`), {
        code: "RV64_PC_OUT_OF_IMAGE",
      });
    }
    record(pc);
    const word = Number(readle(memory, pc, 4));
    const opcode = word & 0x7f;
    const rd = (word >>> 7) & 0x1f;
    const funct3 = (word >>> 12) & 0x7;
    const rs1 = (word >>> 15) & 0x1f;
    const rs2 = (word >>> 20) & 0x1f;
    const funct7 = (word >>> 25) & 0x7f;
    const write = (value: bigint) => {
      if (rd !== 0) regs[rd] = value & MASK64;
    };
    let advanced = false;
    let trapped: Error | undefined;
    switch (opcode) {
      case 0x37: {
        // lui — the upper immediate lands in the register.
        write(BigInt(immu(word)) & MASK64);
        break;
      }
      case 0x17: {
        // auipc — pc plus the upper immediate.
        write((BigInt(pc) + BigInt(immu(word))) & MASK64);
        break;
      }
      case 0x6f: {
        // jal — the link register takes pc+4, the pc takes the jump.
        write(BigInt(pc + 4));
        pc = (pc + immj(word)) >>> 0;
        advanced = true;
        break;
      }
      case 0x67: {
        // jalr — the link register takes pc+4, the pc takes rs1+imm (bit 0 cleared).
        if (funct3 !== 0) {
          trapped = illegal(pc, word);
          break;
        }
        const target = (Number(regs[rs1] & MASK64) + immi(word)) >>> 0;
        write(BigInt(pc + 4));
        pc = target & ~1;
        advanced = true;
        break;
      }
      case 0x63: {
        // the branches — the comparison rides the registers as signed or unsigned.
        const left = regs[rs1];
        const right = regs[rs2];
        let take = false;
        if (funct3 === 0) take = left === right;
        else if (funct3 === 1) take = left !== right;
        else if (funct3 === 4) take = left < right;
        else if (funct3 === 5) take = left >= right;
        else if (funct3 === 6) take = (left & MASK64) < (right & MASK64);
        else if (funct3 === 7) take = (left & MASK64) >= (right & MASK64);
        else {
          trapped = illegal(pc, word);
          break;
        }
        if (take) {
          pc = (pc + immb(word)) >>> 0;
          advanced = true;
        }
        break;
      }
      case 0x03: {
        // the loads — little-endian out of the image, sign-extended where the isa extends.
        const at = (Number(regs[rs1] & MASK64) + immi(word)) >>> 0;
        if (at + 8 > memory.length) {
          trapped = Object.assign(new Error(`the load at 0x${at.toString(16)} reads outside the image`), { code: "RV64_LOAD_OUT_OF_IMAGE", at });
          break;
        }
        if (funct3 === 0) write(sign8(memory[at]));
        else if (funct3 === 1) write(sign16(Number(readle(memory, at, 2))));
        else if (funct3 === 2) write(sign32(readle(memory, at, 4)));
        else if (funct3 === 3) write(readle(memory, at, 8));
        else if (funct3 === 4) write(BigInt(memory[at]));
        else if (funct3 === 5) write(BigInt(Number(readle(memory, at, 2))));
        else {
          trapped = illegal(pc, word);
          break;
        }
        break;
      }
      case 0x23: {
        // the stores — little-endian into the image.
        const at = (Number(regs[rs1] & MASK64) + imms(word)) >>> 0;
        const value = regs[rs2] & MASK64;
        if (funct3 === 0) {
          if (at + 1 > memory.length) { trapped = outofimage(at); break; }
          writele(memory, at, 1, value);
        } else if (funct3 === 1) {
          if (at + 2 > memory.length) { trapped = outofimage(at); break; }
          writele(memory, at, 2, value);
        } else if (funct3 === 2) {
          if (at + 4 > memory.length) { trapped = outofimage(at); break; }
          writele(memory, at, 4, value);
        } else if (funct3 === 3) {
          if (at + 8 > memory.length) { trapped = outofimage(at); break; }
          writele(memory, at, 8, value);
        } else {
          trapped = illegal(pc, word);
          break;
        }
        break;
      }
      case 0x13: {
        // op-imm — the 64-bit immediate arithmetic (slli/srli/srai carry the shamt).
        const left = regs[rs1];
        if (funct3 === 0) write(BigInt(left) + BigInt(immi(word)));
        else if (funct3 === 1) write(left << BigInt((word >>> 20) & 0x3f));
        else if (funct3 === 5) {
          const shamt = (word >>> 20) & 0x3f;
          if (((word >>> 26) & 0x3f) === 0x10) write(left >> BigInt(shamt));
          else write(BigInt.asUintN(64, (left & MASK64) >> BigInt(shamt)));
        }
        else if (funct3 === 2) write(left < BigInt(immi(word)) ? 1n : 0n);
        else if (funct3 === 3) write((left & MASK64) < BigInt(Number(BigInt(immi(word)) & MASK64)) ? 1n : 0n);
        else if (funct3 === 4) write(BigInt(left) ^ BigInt(immi(word)));
        else if (funct3 === 6) write(BigInt(left) | BigInt(immi(word)));
        else if (funct3 === 7) write(BigInt(left) & BigInt(immi(word)));
        else trapped = illegal(pc, word);
        break;
      }
      case 0x1b: {
        // op-imm-32 — the w immediate arithmetic wraps at 32 bits.
        const left = regs[rs1];
        if (funct3 === 0) write(sign32(BigInt(left) + BigInt(immi(word))));
        else if (funct3 === 1) write(sign32((left & MASK32) << BigInt((word >>> 20) & 0x1f)));
        else if (funct3 === 5) {
          const shamt = (word >>> 20) & 0x1f;
          if (((word >>> 25) & 0x7f) === 0x20) write(sign32((left & MASK32) >> BigInt(shamt)));
          else write(sign32(BigInt.asUintN(32, (left & MASK32) >> BigInt(shamt))));
        }
        else trapped = illegal(pc, word);
        break;
      }
      case 0x33: {
        // op — the register arithmetic, the m extension and the w forms.
        const left = regs[rs1];
        const right = regs[rs2];
        if (funct7 === 0x01) {
          // the m extension: mul, mulh, mulhsu, mulhu, div, divu, rem, remu and the w forms.
          if (funct3 === 0) write(left * right);
          else if (funct3 === 1) {
            // mulh — signed x signed, the high 64 bits.
            const a = left >> 63n === -1n ? left - (1n << 64n) : left;
            const b = right >> 63n === -1n ? right - (1n << 64n) : right;
            write(((a * b) >> 64n) & MASK64);
          } else if (funct3 === 2) {
            // mulhsu — signed x unsigned.
            const a = left >> 63n === -1n ? left - (1n << 64n) : left;
            write(((a * (right & MASK64)) >> 64n) & MASK64);
          } else if (funct3 === 3) write((((left & MASK64) * (right & MASK64)) >> 64n) & MASK64);
          else if (funct3 === 4) {
            // div — the rs2=0 and the overflow cases the isa pins.
            const a = left >> 63n === -1n ? left - (1n << 64n) : left;
            const b = right >> 63n === -1n ? right - (1n << 64n) : right;
            if (b === 0n) write(MASK64);
            else if (a === -(1n << 63n) && b === -1n) write(1n << 63n);
            else {
              const q = a / b;
              write((a % b !== 0n && (a < 0n) !== (b < 0n) && a % b !== 0n ? q - 1n : q) & MASK64);
            }
          } else if (funct3 === 5) {
            // divu.
            const uleft = left & MASK64;
            const uright = right & MASK64;
            write(uright === 0n ? MASK64 : uleft / uright);
          } else if (funct3 === 6) {
            // rem — the rs2=0 and the overflow cases the isa pins.
            const a = left >> 63n === -1n ? left - (1n << 64n) : left;
            const b = right >> 63n === -1n ? right - (1n << 64n) : right;
            if (b === 0n) write(a & MASK64);
            else if (a === -(1n << 63n) && b === -1n) write(0n);
            else write((a % b) & MASK64);
          } else if (funct3 === 7) {
            // remu.
            const uleft = left & MASK64;
            const uright = right & MASK64;
            write(uright === 0n ? uleft : uleft % uright);
          } else trapped = illegal(pc, word);
        } else if (funct7 === 0x00 || funct7 === 0x20) {
          const negate = funct7 === 0x20;
          if (funct3 === 0) write(negate ? BigInt(left) - BigInt(right) : BigInt(left) + BigInt(right));
          else if (funct3 === 1) {
            if (negate) trapped = illegal(pc, word);
            else write(left << BigInt(right & 0x3fn));
          }
          else if (funct3 === 2) write(left < right ? 1n : 0n);
          else if (funct3 === 3) write((left & MASK64) < (right & MASK64) ? 1n : 0n);
          else if (funct3 === 4) {
            if (negate) trapped = illegal(pc, word);
            else write(BigInt(left) ^ BigInt(right));
          }
          else if (funct3 === 5) write(negate ? left >> BigInt(right & 0x3fn) : BigInt.asUintN(64, (left & MASK64) >> BigInt(right & 0x3fn)));
          else if (funct3 === 6) {
            if (negate) trapped = illegal(pc, word);
            else write(BigInt(left) | BigInt(right));
          }
          else if (funct3 === 7) {
            if (negate) trapped = illegal(pc, word);
            else write(BigInt(left) & BigInt(right));
          }
          else trapped = illegal(pc, word);
        } else trapped = illegal(pc, word);
        if (trapped !== undefined) break;
        break;
      }
      case 0x3b: {
        // op-32 — the w register arithmetic wraps at 32 bits.
        const left = regs[rs1] & MASK32;
        const right = regs[rs2] & MASK32;
        const negate = funct7 === 0x20;
        if (funct7 === 0x01) {
          // the m extension w forms: mulw, divw, divuw, remw, remuw.
          if (funct3 === 0) write(sign32(left * right));
          else if (funct3 === 4) {
            const a = sign32(left) >> 31n === -1n ? sign32(left) - (1n << 64n) : sign32(left);
            const b = sign32(right) >> 31n === -1n ? sign32(right) - (1n << 64n) : sign32(right);
            if (b === 0n) write(MASK32);
            else if (a === -(1n << 31n) && b === -1n) write(1n << 31n);
            else write((a / b) & MASK32);
          } else if (funct3 === 5) write(right === 0n ? MASK32 : left / right);
          else if (funct3 === 6) {
            const a = sign32(left) >> 31n === -1n ? sign32(left) - (1n << 64n) : sign32(left);
            const b = sign32(right) >> 31n === -1n ? sign32(right) - (1n << 64n) : sign32(right);
            if (b === 0n) write(sign32(left));
            else if (a === -(1n << 31n) && b === -1n) write(0n);
            else write((a % b) & MASK32);
          } else if (funct3 === 7) write(right === 0n ? left : left % right);
          else trapped = illegal(pc, word);
        } else if (funct7 === 0x00 || funct7 === 0x20) {
          if (funct3 === 0) write(sign32(negate ? BigInt(sign32(left)) - BigInt(sign32(right)) : BigInt(sign32(left)) + BigInt(sign32(right))));
          else if (funct3 === 1) {
            // sllw shifts the 32-bit word and sign-extends the result.
            if (negate) trapped = illegal(pc, word);
            else write(sign32(left << BigInt(right & 0x1fn)));
          } else if (funct3 === 5) {
            // srlw shifts the zero-extended word logically; sraw shifts the
            // sign-extended word arithmetically — both sign-extend the result
            // (the >>> operator never answers a bigint seat, the masked low
            // word already carries the logical form).
            if (negate) write(sign32(sign32(left) >> BigInt(right & 0x1fn)));
            else write(sign32(left >> BigInt(right & 0x1fn)));
          }
          else trapped = illegal(pc, word);
        } else trapped = illegal(pc, word);
        if (trapped !== undefined) break;
        break;
      }
      case 0x0f: {
        // fence — a single-hart machine orders itself; the barrier retires as a step.
        break;
      }
      case 0x73: {
        // system — the exit door (ecall a7=93) and the break trap; the csr space is out of the core.
        if (((word >>> 20) & 0xfff) === 0) {
          const syscall = Number(regs[17] & MASK64);
          if (syscall === EXITSYSCALL) {
            const code = Number(regs[10] & MASK64);
            steps += 1;
            return { exitcode: code | 0, steps, finalpc: pc, trace };
          }
          throw Object.assign(new Error(`the ecall a7=${syscall} is not the exit door — the core owns syscall 93 alone`), {
            code: "RV64_SYSCALL_UNSUPPORTED",
            at: pc,
          });
        }
        if (((word >>> 20) & 0xfff) === 1) {
          steps += 1;
          return { exitcode: -7, steps, finalpc: pc, trace };
        }
        trapped = illegal(pc, word);
        break;
      }
      default: {
        trapped = illegal(pc, word);
        break;
      }
    }
    if (trapped !== undefined) throw trapped;
    steps += 1;
    if (!advanced) pc += 4;
    if (rd !== 0) regs[0] = 0n;
  }
  throw Object.assign(new Error(`the machine exhausted its ${maxsteps}-step budget (an infinite loop never answers an exit)`), {
    code: "RV64_STEP_BUDGET_EXHAUSTED",
  });
}

/** The honest out-of-image store refusal. */
function outofimage(at: number): Error {
  return Object.assign(new Error(`the store at 0x${at.toString(16)} writes outside the image`), { code: "RV64_STORE_OUT_OF_IMAGE", at });
}

/** Loads and runs one payload in one shot — the seat-facing entry: the
 * state digest answers sha256 over the final architectural state, so
 * one image always answers one digest (the deterministic proof the
 * battery pins). */
export async function rv64run(
  payload: string | Uint8Array,
  options: { memorybytes?: number; maxsteps?: number } = {},
): Promise<Rv64RunResult> {
  const bytes = payloadbytes(payload);
  const memorybytes = Math.max(4096, Math.round(options.memorybytes ?? DEFAULTMEMORYBYTES));
  const { memory, entry, loads } = loadimage(bytes, memorybytes);
  const run = executerv64(memory, entry, { maxsteps: options.maxsteps });
  // the state digest walks the final memory image through sha256 —
  // one image, one answer (the deterministic proof the battery pins).
  let statedigest = "";
  // the register file rides a second deterministic source: the run
  // record plus the memory image digest — one image, one answer.
  try {
    const nodecrypto = (await import("node:crypto")) as typeof import("node:crypto");
    const hash = nodecrypto.createHash("sha256");
    hash.update(memory);
    hash.update(`entry=${entry};finalpc=${run.finalpc};steps=${run.steps};exit=${run.exitcode}`);
    statedigest = hash.digest("hex");
  } catch {
    statedigest = `entry=${entry};finalpc=${run.finalpc};steps=${run.steps};exit=${run.exitcode}`;
  }
  return {
    exitcode: run.exitcode,
    steps: run.steps,
    entry,
    finalpc: run.finalpc,
    statedigest,
    trace: run.trace,
    loads,
  };
}
