// Reference: https://developers.google.com/protocol-buffers/docs/encoding#structure

export enum WireType {
  VARINT = 0,
  I64,
  LEN,
  SGROUP, // deprecated, decoding not supported
  EGROUP, // deprecated, decoding not supported
  I32,
}

export type WireTypeDefinition = {
  readonly name: string;
  readonly types: string[];
};

export interface Decoded {
  readonly type: WireType;
  readonly field: number;
  readonly object: boolean;
  readonly value: bigint | Buffer | DecodingResult;
}

export type DecodingResult = {
  readonly fields: readonly Decoded[];
  readonly unprocessed: Buffer;
};

export interface SimpleDecoded {
  readonly type: string;
  readonly field: number;
  readonly object: boolean;
  readonly value: string | SimpleDecodingResult;
}

export type SimpleDecodingResult = {
  readonly fields: readonly SimpleDecoded[];
};

class Decoder {
  readonly data: Buffer;
  idx: number;

  constructor(data: Buffer) {
    this.data = data;
    this.idx = 0;
  }

  nextByte(): number {
    return this.data.readUInt8(this.idx++);
  }

  getFieldNumber(value: bigint): number {
    return Number(value) >> 3;
  }

  getWireType(value: bigint): WireType {
    return Number(value) & 7;
  }

  nextVarInt(): bigint {
    let value = BigInt(0);
    let shift = 0;
    let b = 0;
    do {
      b = this.nextByte();
      // strip the msb
      const s = b & (0xff >> 1);
      const shifted = s * 2 ** shift;
      value = value + BigInt(shifted);
      shift += 7;
    } while ((b >> 7) & 1);

    return value;
  }

  read(length: number): Buffer {
    if (this.idx + length > this.data.length)
      throw new Error("Invalid memory access detected");

    const b = this.data.subarray(this.idx, this.idx + length);
    this.idx += length;
    return b;
  }

  remaining() {
    return this.data.length - this.idx;
  }

  decode(): DecodingResult {
    const fields: Decoded[] = [];

    let lastIdx = 0;

    try {
      while (this.remaining() > 0) {
        lastIdx = this.idx;

        const enc = this.nextVarInt();
        const field = this.getFieldNumber(enc);
        const type = this.getWireType(enc);

        let value;
        let valueDecoded = false;
        if (type === WireType.VARINT) {
          value = this.nextVarInt();
        } else if (type === WireType.LEN) {
          const length = this.nextVarInt();
          value = this.read(Number(length));
          try {
            const decoded = new Decoder(value).decode();
            // only use it if it's processed fully
            if (decoded.unprocessed.length <= 0) {
              valueDecoded = true;
              value = decoded;
            }
          } catch {
            // we failed to decode the submessage, could just be string/bytes
            // ignore the exception and move on
          }
        } else if (type === WireType.I32) {
          value = this.read(4);
        } else if (type === WireType.I64) {
          value = this.read(8);
        } else {
          throw new Error("Not supported, type: " + type);
        }

        fields.push({
          field,
          type,
          object: valueDecoded,
          value,
        });
      }
    } catch {
      // restore the index before the exception
      this.idx = lastIdx;
    }

    return {
      fields: fields,
      unprocessed: this.read(this.remaining()),
    };
  }
}

/**
 * Simplify returns a basic representation of the decoded data
 *
 * Since a field of a certain type may have multiple
 * values (e.g. i32 may be fixed32, sfixed32 or a float),
 *
 * It uses the first possble value of a field and converts it to a string
 *
 * @param result The decoded object
 * @returns SimpleDecodingResult
 */
export const simplify = (result: DecodingResult): SimpleDecodingResult => {
  const fields: SimpleDecoded[] = [];

  result.fields.forEach((f) => {
    const type = typeDefinition(f.type);

    let value: string | SimpleDecodingResult = "";
    if (f.object) {
      value = simplify(f.value as DecodingResult);
    } else {
      // take the first possible value of this field
      const values = possibleValues(f);
      value = values.length > 0 ? values[0].value.toString() : "";
    }

    fields.push({
      field: f.field,
      object: f.object,
      type: type.name,
      value: value,
    });
  });

  return {
    fields: fields,
  };
};

/**
 * Decodes the provided protobuf
 *
 * @param value A buffer containing the protobuf
 * @returns DecodingResult
 */
export const decode = (value: Buffer): DecodingResult => {
  return new Decoder(value).decode();
};

export type ValueRepresentation = {
  readonly type: string;
  readonly value: bigint | number | string;
};

// TODO: make sure that the values can be cased to the appropriate types
export function possibleValues(value: Decoded): ValueRepresentation[] {
  const def = typeDefinition(value.type);
  const res:any = [];

  def.types.forEach((t) => {
    switch (t) {
      case "uint64":
        res.push({
          type: t,
          value: value.value as bigint,
        });
        break;
      case "fixed32":
        res.push({
          type: t,
          value: (value.value as Buffer).readUInt32LE(0),
        });
        break;
      case "sfixed32":
        res.push({
          type: t,
          value: (value.value as Buffer).readInt32LE(0),
        });
        break;
      case "float":
        res.push({
          type: t,
          value: (value.value as Buffer).readFloatLE(0),
        });
        break;
      case "fixed64":
        res.push({
          type: t,
          value: (value.value as Buffer).readBigInt64LE(0),
        });
        break;
      case "double":
        res.push({
          type: t,
          value: (value.value as Buffer).readDoubleLE(0),
        });
        break;
      case "string":
        res.push({
          type: t,
          value: (value.value as Buffer).toString("utf8"),
        });
        break;
      case "bytes":
        res.push({
          type: t,
          value: (value.value as Buffer).toString("hex"),
        });
        break;
      default:
        break;
    }
  });

  return res;
}

export function typeDefinition(type: WireType): WireTypeDefinition {
  switch (type) {
    case WireType.VARINT:
      return {
        name: "varint",
        types: [
          "int32",
          "int64",
          "uint32",
          "uint64",
          "sint32",
          "sint64",
          "bool",
          "enum",
        ],
      };
    case WireType.LEN:
      return {
        name: "len",
        types: ["string", "bytes"],
      };
    case WireType.I32:
      return {
        name: "i32",
        types: ["fixed32", "sfixed32", "float"],
      };
    case WireType.I64:
      return {
        name: "i64",
        types: ["fixed64", "sfixed64", "double"],
      };
    default:
      return {
        name: "unknown",
        types: [],
      };
  }
}
